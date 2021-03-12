from __future__ import annotations

import logging
from datetime import datetime
from typing import List

import cachecontrol
import requests

logger = logging.getLogger(__name__)


class _Cache:
    """
    Simple cache manager so we can avoid refetching the same dependency data
    over and over
    """

    def __init__(self):
        self.sess = requests.Session()
        self.sess.mount("http://", cachecontrol.CacheControlAdapter())
        self.sess.mount("https://", cachecontrol.CacheControlAdapter())

    def get(self, url: str):
        return self.sess.get(url)

    def get_json(self, url: str):
        return self.get(url).json()


_cache = _Cache()


class GleanObject(object):
    NAME_KEY = "name"
    HISTORY_KEY = "history"


class GleanMetric(GleanObject):
    """
    Represents an individual Glean metric, as defined by probe scraper
    """

    ALL_PINGS_KEYWORDS = ("all-pings", "all_pings", "glean_client_info")

    def __init__(self, identifier: str, definition: dict, *, ping_names: List[str] = None):
        self.identifier = identifier
        self._set_dates(definition)
        self._set_definition(definition)
        self._set_description(self.definition)

        self.is_client_info = "glean_client_info" in self.definition["send_in_pings"]
        if ping_names is not None:
            self._update_all_pings(ping_names)

    def _update_all_pings(self, pings: List[str]):
        if any([kw in self.definition["send_in_pings"] for kw in self.ALL_PINGS_KEYWORDS]):
            self.definition["send_in_pings"] = set(pings)

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

    def _set_dates(self, definition: dict):
        vals = [datetime.fromisoformat(d["dates"]["first"]) for d in definition[self.HISTORY_KEY]]

        self.first_added = min(vals)
        self.last_change = max(vals)

    def _set_description(self, definition):
        if "description" in definition:
            self.description = definition["description"]
        else:
            self.description = None

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
        self._set_description(self.definition)

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

    def _set_description(self, definition: dict):
        if "description" in definition:
            self.description = definition["description"]
        else:
            self.description = None


class GleanApp(object):
    """
    Represents a Glean application, provides convenience methods for getting metrics and pings
    """

    PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org"
    APPS_URL = PROBE_INFO_BASE_URL + "/v2/glean/app-listings"
    REPOS_URL = PROBE_INFO_BASE_URL + "/glean/repositories"
    PINGS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"

    METRICS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/metrics"
    PING_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"
    DEPENDENCIES_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/dependencies"

    DEFAULT_DEPENDENCIES = ["glean"]

    def __init__(self, app, **kwargs):
        self.app = app
        self.app_name = app["app_name"]
        self.app_id = app["app_id"]

    @staticmethod
    def get_repos() -> List[dict]:
        return _cache.get_json(GleanApp.REPOS_URL)

    @staticmethod
    def get_apps() -> List[GleanApp]:
        """
        Get all non-library Glean repositories
        """
        apps = _cache.get_json(GleanApp.APPS_URL)

        return [GleanApp(app) for app in apps]

    def get_dependencies(self):
        # Get all of the library dependencies for the application that
        # are also known about in the repositories file.

        # The dependencies are specified using library names, but we need to
        # map those back to the name of the repository in the repository file.
        try:
            dependencies = _cache.get_json(
                self.DEPENDENCIES_URL_TEMPLATE.format(self.app["v1_name"])
            )
        except requests.HTTPError:
            logging.info(f"For {self.app_id}, using default Glean dependencies")
            return self.DEFAULT_DEPENDENCIES

        dependency_library_names = list(dependencies.keys())

        repos_by_dependency_name = {}
        for repo in self.get_repos():
            for library_name in repo.get("library_names", []):
                repos_by_dependency_name[library_name] = repo["name"]

        dependencies = []
        for name in dependency_library_names:
            if name in repos_by_dependency_name:
                dependencies.append(repos_by_dependency_name[name])

        if len(dependencies) == 0:
            logging.info(f"For {self.app_id}, using default Glean dependencies")
            return self.DEFAULT_DEPENDENCIES

        logging.info(f"For {self.app_id}, found Glean dependencies: {dependencies}")
        return dependencies

    def get_metrics(self) -> List[GleanMetric]:
        data = _cache.get_json(GleanApp.METRICS_URL_TEMPLATE.format(self.app["v1_name"]))
        metrics = list(data.items())

        for dependency in self.get_dependencies():
            dependency_metrics = _cache.get_json(GleanApp.METRICS_URL_TEMPLATE.format(dependency))
            metrics += list(dependency_metrics.items())

        ping_names = set(self._get_ping_data().keys())

        processed = []
        for _id, defn in metrics:
            metric = GleanMetric(_id, defn, ping_names=ping_names)
            processed.append(metric)

        return processed

    def _get_ping_data(self) -> dict:
        ping_data = _cache.get_json(GleanApp.PING_URL_TEMPLATE.format(self.app["v1_name"]))
        for dependency in self.get_dependencies():
            dependency_pings = _cache.get_json(GleanApp.PING_URL_TEMPLATE.format(dependency))
            ping_data.update(dependency_pings)
        return ping_data

    def get_pings(self) -> List[GleanPing]:
        return [
            GleanPing(ping_name, ping_data)
            for ping_name, ping_data in self._get_ping_data().items()
        ]
