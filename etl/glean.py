from __future__ import annotations

import logging
from datetime import datetime
from typing import List

import requests

logger = logging.getLogger(__name__)


GLEAN_DISTRIBUTION_TYPES = {
    "timing_distribution",
    "memory_distribution",
    "custom_distribution",
}


def _merge_latest_ping(pings, ping_name, ping_data):
    """
    Merge data for the latest `ping_name` into `pings` (by history date).
    If `pings` already contains the ping with newer data it is not overwritten.
    """
    if ping_name not in pings:
        pings[ping_name] = ping_data
        return

    latest = pings[ping_name]["history"][-1]["dates"]["last"]
    new = ping_data["history"][-1]["dates"]["last"]
    if new >= latest:
        pings[ping_name] = ping_data


class _Cache:
    """
    Simple cache manager so we can avoid refetching the same dependency data
    over and over
    """

    def __init__(self):
        self.cached_responses = {}

    def get(self, url: str):
        if self.cached_responses.get(url):
            return self.cached_responses[url]

        # pass a parameter to bypass any caching, which might give us stale
        # data (probeinfo.telemetry.mozilla.org is currently using cloudfront)
        resp = requests.get(url + f"?t={datetime.utcnow().isoformat()}")
        self.cached_responses[url] = resp
        return resp

    def get_json(self, url: str):
        return self.get(url).json()


_cache = _Cache()


class GleanObject(object):
    NAME_KEY = "name"
    ORIGIN_KEY = "origin"
    HISTORY_KEY = "history"
    IN_SOURCE_KEY = "in-source"
    SAMPLING_INFO_KEY = "sampling_info"


class GleanMetric(GleanObject):
    """
    Represents an individual Glean metric, as defined by probe scraper
    """

    ALL_PINGS_KEYWORDS = ("all-pings", "all_pings", "glean_client_info", "glean_internal_info")

    def __init__(self, identifier: str, definition: dict, *, ping_names: List[str] = None):
        self.identifier = identifier
        self._set_dates(definition)
        self._set_definition(definition)

        self.description = self.definition.get("description")
        self.tags = self.definition["metadata"].get("tags", [])

        self.bq_prefix = None
        if "glean_client_info" in self.definition["send_in_pings"]:
            self.bq_prefix = "client_info"
        elif "glean_internal_info" in self.definition["send_in_pings"]:
            self.bq_prefix = "ping_info"
        if ping_names is not None:
            self._update_all_pings(ping_names)

    def _update_all_pings(self, pings: List[str]):
        if any([kw in self.definition["send_in_pings"] for kw in self.ALL_PINGS_KEYWORDS]):
            self.definition["send_in_pings"] = set(pings)

    def _set_definition(self, full_defn: dict):
        # sort from latest to earliest
        self.definition_history = list(
            sorted(
                full_defn[self.HISTORY_KEY],
                key=lambda x: datetime.fromisoformat(x["dates"]["last"]),
                reverse=True,
            )
        )

        # The canonical definition for up-to-date schemas
        self.definition = self.definition_history[0]
        self.definition["name"] = full_defn[self.NAME_KEY]
        self.definition["origin"] = full_defn[self.ORIGIN_KEY]
        self.definition["in_source"] = full_defn[self.IN_SOURCE_KEY]
        self.definition["sampling_info"] = full_defn.get(self.SAMPLING_INFO_KEY)

        # first seen is the earliest date in the history
        self.definition["date_first_seen"] = self.definition_history[-1]["dates"]["first"]

    def _set_dates(self, definition: dict):
        vals = [datetime.fromisoformat(d["dates"]["first"]) for d in definition[self.HISTORY_KEY]]

        self.first_added = min(vals)
        self.last_change = max(vals)

    def get_first_added(self) -> datetime:
        return self.first_added

    def get_last_change(self) -> datetime:
        return self.last_change


class GleanPing(GleanObject):
    """
    Represents an individual Glean Ping, as defined by probe scraper
    """

    def __init__(self, identifier: str, definition: dict):
        self.identifier = identifier
        self._set_definition(definition)

        self.description = self.definition.get("description")
        self.tags = self.definition["metadata"].get("tags", [])

    def _set_definition(self, full_defn: dict):
        self.definition_history = list(
            sorted(
                full_defn[self.HISTORY_KEY],
                key=lambda x: datetime.fromisoformat(x["dates"]["last"]),
                reverse=True,
            )
        )

        # The canonical definition for up-to-date schemas
        self.definition = self.definition_history[0]
        self.definition["name"] = full_defn[self.NAME_KEY]
        self.definition["origin"] = full_defn[self.ORIGIN_KEY]
        self.definition["date_first_seen"] = self.definition_history[-1]["dates"]["first"]
        self.definition["in_source"] = full_defn[self.IN_SOURCE_KEY]


class GleanTag(GleanObject):
    """
    Represents an individual Glean Tag, as defined by probe scraper
    """

    def __init__(self, identifier: str, definition: dict):
        self.identifier = identifier
        self._set_definition(definition)
        self.description = self.definition_history[0].get("description")

    def _set_definition(self, full_defn: dict):
        self.definition_history = list(
            sorted(
                full_defn[self.HISTORY_KEY],
                key=lambda x: datetime.fromisoformat(x["dates"]["last"]),
                reverse=True,
            )
        )

        # The canonical definition for up-to-date schemas
        self.definition = self.definition_history[0]
        self.definition["name"] = full_defn[self.NAME_KEY]
        self.definition["date_first_seen"] = self.definition_history[-1]["dates"]["first"]


class GleanApp(object):
    """
    Represents a Glean application, provides convenience methods for getting metrics and pings
    """

    PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org"
    APPS_URL = PROBE_INFO_BASE_URL + "/v2/glean/app-listings"
    LIBRARIES_URL = PROBE_INFO_BASE_URL + "/v2/glean/library-variants"
    PINGS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"

    METRICS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/metrics"
    PING_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"
    TAGS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/tags"
    DEPENDENCIES_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/dependencies"

    DEFAULT_DEPENDENCIES = ["glean"]

    def __init__(self, app, **kwargs):
        self.app = app
        self.app_name = app["app_name"]
        self.app_id = app["app_id"]

    @staticmethod
    def get_apps() -> List[GleanApp]:
        """
        Get all non-library Glean repositories
        """
        apps = _cache.get_json(GleanApp.APPS_URL)

        return [GleanApp(app) for app in apps]

    @staticmethod
    def get_libraries() -> List[dict]:
        return _cache.get_json(GleanApp.LIBRARIES_URL)

    def get_dependencies(self):
        # Get all of the library dependencies for the application that
        # are also known about in the repositories file.

        # The dependencies are specified using dependency names, but we need to
        # map those back to the name of the repository in the repository file.
        try:
            dependencies = _cache.get_json(
                self.DEPENDENCIES_URL_TEMPLATE.format(self.app["v1_name"])
            )
        except requests.HTTPError:
            logging.info(f"For {self.app_id}, using default Glean dependencies")
            return self.DEFAULT_DEPENDENCIES

        dependency_library_names = list(dependencies.keys())

        libraries_by_dependency_name = {}
        for library in self.get_libraries():
            libraries_by_dependency_name[library["dependency_name"]] = library

        dependencies = []
        for name in dependency_library_names:
            if name in libraries_by_dependency_name:
                dependencies.append(libraries_by_dependency_name[name])

        if len(dependencies) == 0:
            logging.info(f"For {self.app_id}, using default Glean dependencies")
            return self.DEFAULT_DEPENDENCIES

        logging.info(f"For {self.app_id}, found Glean dependencies: {dependencies}")
        return dependencies

    def get_metrics(self) -> List[GleanMetric]:
        data = _cache.get_json(GleanApp.METRICS_URL_TEMPLATE.format(self.app["v1_name"]))
        metrics = [
            (key, {**metricdict, "origin": self.app["app_name"]})
            for key, metricdict in data.items()
        ]
        for dependency in self.get_dependencies():
            if "v1_name" in dependency:
                dependency_metrics = _cache.get_json(
                    GleanApp.METRICS_URL_TEMPLATE.format(dependency["v1_name"])
                )
                # augment these dependency names with the library_name where they came from
                metrics += [
                    (d[0], {**d[1], "origin": dependency["library_name"]})
                    for d in dependency_metrics.items()
                ]

        ping_names = set(self._get_ping_data().keys())
        processed = []

        # deduplicate metrics
        metric_map = {}
        for metric in metrics:
            if (
                not metric_map.get(metric[0])
                or metric_map[metric[0]][1]["history"][-1]["dates"]["last"]
                < metric[1]["history"][-1]["dates"]["last"]
            ):
                metric_map[metric[0]] = metric

        for _id, defn in metric_map.values():
            metric = GleanMetric(_id, defn, ping_names=ping_names)
            processed.append(metric)

        return processed

    def _get_ping_data(self) -> dict:
        ping_data = dict()

        for p in _cache.get_json(GleanApp.PING_URL_TEMPLATE.format(self.app["v1_name"])).items():
            _merge_latest_ping(ping_data, p[0], {**p[1], "origin": self.app["app_name"]})

        for dependency in self.get_dependencies():
            if "v1_name" in dependency:
                for p in _cache.get_json(
                    GleanApp.PING_URL_TEMPLATE.format(dependency["v1_name"])
                ).items():
                    _merge_latest_ping(
                        ping_data, p[0], {**p[1], "origin": dependency["library_name"]}
                    )

        return ping_data

    def get_pings(self) -> List[GleanPing]:
        return [
            GleanPing(ping_name, ping_data)
            for ping_name, ping_data in self._get_ping_data().items()
        ]

    def get_tags(self) -> List[GleanTag]:
        return [
            GleanTag(tag_name, tag_data)
            for tag_name, tag_data in _cache.get_json(
                GleanApp.TAGS_URL_TEMPLATE.format(self.app["v1_name"])
            ).items()
        ]
