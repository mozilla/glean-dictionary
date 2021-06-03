#!/usr/bin/env python3

import json
import os
import re
import sys

import glean
import requests
import stringcase
import yaml

OUTPUT_DIRECTORY = os.path.join("public", "data")
ANNOTATIONS_URL = "https://mozilla.github.io/glean-annotations/api.json"
NAMESPACES_URL = "https://raw.githubusercontent.com/mozilla/looker-hub/main/namespaces.yaml"

# Priority for getting metric data (use the later definitions of nightly over release)
METRIC_CHANNEL_PRIORITY = {"nightly": 1, "beta": 2, "release": 3, "esr": 4}
# Priority for sorting app ids in the UI (of anticipated relevance to the suer)
USER_CHANNEL_PRIORITY = {"release": 1, "beta": 2, "nightly": 3, "esr": 4}


GLAM_PRODUCT_MAPPINGS = {
    "org.mozilla.fenix": ("fenix", ""),
    "org.mozilla.firefox_beta": ("fenix", "beta"),
    "org.mozilla.firefox": ("fenix", "release"),
}

SUPPORTED_LOOKER_METRIC_TYPES = {
    "boolean",
    "counter",
    "datetime",
    "jwe",
    "quantity",
    "string",
    "rate",
    "timespan",
    "uuid",
}


def _serialize_sets(obj):
    if isinstance(obj, set):
        return list(obj)
    return obj


def _normalize_metrics(name):
    # replace . with _ so sirv doesn't think that
    # a metric is a file
    metric_name = name.replace(".", "_")

    # if a metric name starts with "metrics", uBlock Origin
    # will block the network call to get the JSON resource
    # See: https://github.com/mozilla/glean-dictionary/issues/550
    # To get around this, we add "data" to metric names
    return f"data_{metric_name}"


# ETL specific snakecase taken from:
# https://github.com/mozilla/bigquery-etl/blob/master/bigquery_etl/util/common.py
#
# Search for all camelCase situations in reverse with arbitrary lookaheads.
REV_WORD_BOUND_PAT = re.compile(
    r"""
    \b                                  # standard word boundary
    |(?<=[a-z][A-Z])(?=\d*[A-Z])        # A7Aa -> A7|Aa boundary
    |(?<=[a-z][A-Z])(?=\d*[a-z])        # a7Aa -> a7|Aa boundary
    |(?<=[A-Z])(?=\d*[a-z])             # a7A -> a7|A boundary
    """,
    re.VERBOSE,
)


def get_resource_path(line: str) -> str:
    return line.replace(".", "_")


def etl_snake_case(line: str) -> str:
    """Convert a string into a snake_cased string."""
    # replace non-alphanumeric characters with spaces in the reversed line
    subbed = re.sub(r"[^\w]|_", " ", line[::-1])
    # apply the regex on the reversed string
    words = REV_WORD_BOUND_PAT.split(subbed)
    # filter spaces between words and snake_case and reverse again
    return "_".join([w.lower() for w in words if w.strip()])[::-1]


def get_looker_explore_url(looker_namespaces, app_name, ping_name, table_name):
    ping_name_snakecase = stringcase.snakecase(ping_name)
    if (
        looker_namespaces.get(app_name)
        and looker_namespaces[app_name].get("glean_app")
        and looker_namespaces[app_name]["explores"].get(ping_name_snakecase)
    ):
        channel_identifier = "mozdata." + table_name.replace("_", "%5E_")

        return (
            f"https://mozilla.cloud.looker.com/explore/{app_name}/{ping_name_snakecase}"
            + f"?f[{ping_name_snakecase}.channel]={channel_identifier}"
        )
    return None


def get_app_variant_description(app):
    """
    Gets a description of app variants (intended for use inside dropdowns)
    """
    description = app.app.get("app_channel", "release")
    # Make it obvious if a variant should no longer be used.
    if app.app.get("deprecated"):
        description += " - deprecated"
    return description


# Pull down the annotations
annotations_index = requests.get(ANNOTATIONS_URL).json()
looker_namespaces = yaml.safe_load(requests.get(NAMESPACES_URL).text)

# Then, get the apps we're using
apps = [app for app in glean.GleanApp.get_apps()]

if len(sys.argv) > 1:
    apps = [app for app in apps if app.app_name in sys.argv[1:]]

app_groups = {}
for app in apps:
    if not app_groups.get(app.app_name):
        app_groups[app.app_name] = {
            "app_name": app.app_name,
            "app_description": app.app["app_description"],
            "canonical_app_name": app.app["canonical_app_name"],
            "deprecated": app.app.get("deprecated", False),
            "url": app.app["url"],
            "notification_emails": app.app["notification_emails"],
            "app_ids": [],
            "annotation": (annotations_index.get(app.app_name, {}).get("app")),
        }
    app_groups[app.app_name]["app_ids"].extend(
        [
            {
                "name": app.app_id,
                "description": app.app.get("description", app.app["app_description"]),
                "channel": app.app.get("app_channel", "release"),
                "deprecated": app.app.get("deprecated", False),
                "prototype": app.app.get("prototype", False),
            }
        ]
    )

# sort each set of app ids by the following criteria
# metric channel priority nightly < beta < release < esr
# non-deprecated < deprecated
for app_group in app_groups.values():
    app_group["app_ids"].sort(key=lambda app_id: METRIC_CHANNEL_PRIORITY[app_id["channel"]])
    app_group["app_ids"].sort(key=lambda app_id: app_id["deprecated"])

# Write out a list of app groups (for the landing page)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), "w").write(json.dumps(list(app_groups.values())))

# Write out some metadata for each app group (for the app detail page)
for (app_name, app_group) in app_groups.items():
    app_dir = os.path.join(OUTPUT_DIRECTORY, app_name)
    (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir) = (
        os.path.join(app_dir, subtype) for subtype in ("app_ids", "pings", "tables", "metrics")
    )
    for directory in (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir):
        os.makedirs(directory, exist_ok=True)

    app_data = dict(app_group, pings=[], metrics=[])
    # An application group is considered a prototype only if all its application ids are
    if all([app_id.get("prototype") for app_id in app_group["app_ids"]]):
        app_data["prototype"] = True

    app_metrics = {}
    metric_pings = dict(data=[])
    # keep track of which metric and ping identifiers we have seen so far
    metric_identifiers_seen = set()
    ping_identifiers_seen = set()

    for app_id in [app["name"] for app in app_group["app_ids"]]:
        app = next(app for app in apps if app.app_id == app_id)
        app_is_deprecated = app.app.get("deprecated")

        # information about this app_id
        open(os.path.join(app_id_dir, f"{get_resource_path(app_id)}.json"), "w").write(
            json.dumps(app.app)
        )

        # metrics data
        metrics = app.get_metrics()
        for metric in metrics:
            if metric.identifier not in metric_identifiers_seen:
                metric_identifiers_seen.add(metric.identifier)

                base_definition = {
                    "name": metric.identifier,
                    "description": metric.description,
                    "extra_keys": metric.definition["extra_keys"]
                    if "extra_keys" in metric.definition
                    else None,
                    "type": metric.definition["type"],
                    "expires": metric.definition["expires"],
                }
                if metric.definition["origin"] != app_name:
                    base_definition.update({"origin": metric.definition["origin"]})

                # metrics with associated pings
                metric_pings["data"].append(
                    dict(base_definition, pings=metric.definition["send_in_pings"])
                )

                # the summary of metrics
                app_data["metrics"].append(base_definition)

                # the full definition
                app_metrics[metric.identifier] = dict(
                    metric.definition,
                    name=metric.identifier,
                    annotation=(
                        annotations_index.get(metric.definition["origin"], {})
                        .get("metrics", {})
                        .get(metric.identifier)
                    ),
                    # convert send_in_pings to a list so we can sort (see below)
                    send_in_pings=list(metric.definition["send_in_pings"]),
                    repo_url=app.app["url"],
                    variants=[],
                )

                # sort "send in pings" alphanumerically, except that `metrics`
                # should always be first if present
                ping_priority = {"metrics": 0}
                app_metrics[metric.identifier]["send_in_pings"].sort()
                app_metrics[metric.identifier]["send_in_pings"].sort(
                    key=lambda ping: ping_priority.get(ping, 1)
                )

            metric_type = metric.definition["type"]
            metric_name_snakecase = stringcase.snakecase(metric.identifier)
            bigquery_column_name = (
                f"{metric.bq_prefix}.{metric_name_snakecase}"
                if metric.bq_prefix
                else f"metrics.{metric_type}.{metric_name_snakecase}"
            )

            # BigQuery and Looker metadata is ping based
            ping_data = {}
            bigquery_stable_ping_tables = []
            for ping in metric.definition["send_in_pings"]:
                ping_name_snakecase = stringcase.snakecase(ping)
                table_name = f"{app.app['bq_dataset_family']}.{ping_name_snakecase}"
                ping_data[ping] = {"bigquery_table": table_name}
                base_looker_explore_link = get_looker_explore_url(
                    looker_namespaces, app_name, ping, table_name
                )
                # we deliberately don't show looker information for deprecated applications
                if not app_is_deprecated and base_looker_explore_link:
                    looker_metric_link = None
                    if metric_type == "counter":
                        looker_metric_link = (
                            base_looker_explore_link
                            + "&fields="
                            + ",".join(
                                [
                                    f"{ping_name_snakecase}.submission_date",
                                    f"{ping_name_snakecase}.{metric_name_snakecase}",
                                ]
                            )
                        )
                    elif metric_type in SUPPORTED_LOOKER_METRIC_TYPES:
                        looker_dimension_name = "{}.{}".format(
                            ping_name_snakecase, bigquery_column_name.replace(".", "__")
                        )
                        looker_metric_link = (
                            base_looker_explore_link
                            + "&fields="
                            + ",".join(
                                [
                                    f"{ping_name_snakecase}.submission_date",
                                    looker_dimension_name,
                                    f"{ping_name_snakecase}.clients",
                                ]
                            )
                            + f"&pivots={looker_dimension_name}"
                        )

                    if looker_metric_link:
                        ping_data[ping]["looker"] = {
                            "base": base_looker_explore_link,
                            "metric": looker_metric_link,
                        }

            etl = dict(
                ping_data=ping_data,
                bigquery_column_name=bigquery_column_name,
            )

            # GLAM metadata is per app / app-id
            if metric_type != "event" and GLAM_PRODUCT_MAPPINGS.get(app.app_id):
                (glam_product, glam_app_id) = GLAM_PRODUCT_MAPPINGS[app.app_id]
                glam_metric_id = etl_snake_case(metric.identifier)
                etl["glam_url"] = (
                    "https://glam.telemetry.mozilla.org/"
                    + f"{glam_product}/probe/{glam_metric_id}/explore"
                    + f"?app_id={glam_app_id}"
                )

            app_metrics[metric.identifier]["variants"].append(
                dict(
                    id=app.app_id,
                    channel=app.app.get("app_channel", "release"),
                    description=get_app_variant_description(app),
                    etl=etl,
                )
            )

        for ping in app.get_pings():
            if ping.identifier not in ping_identifiers_seen:
                ping_identifiers_seen.add(ping.identifier)
                ping_data = dict(
                    ping.definition,
                    variants=[],
                    annotation=(
                        annotations_index.get(ping.definition["origin"], {})
                        .get("pings", {})
                        .get(ping.identifier)
                    ),
                )
                app_data["pings"].append(ping_data)

            ping_data = next(pd for pd in app_data["pings"] if pd["name"] == ping.identifier)

            # write table description (app variant specific)
            ping_name_snakecase = stringcase.snakecase(ping.identifier)
            stable_ping_table_name = f"{app.app['bq_dataset_family']}.{ping_name_snakecase}"
            live_ping_table_name = f"{app.app['bq_dataset_family']}_live_v1.{ping_name_snakecase}"
            bq_path = f"{app.app['document_namespace']}/{ping.identifier}/{ping.identifier}.1.bq"
            bq_definition = (
                "https://github.com/mozilla-services/mozilla-pipeline-schemas/blob/generated-schemas/schemas/"  # noqa
                + bq_path
            )
            bq_schema = requests.get(
                "https://raw.githubusercontent.com/mozilla-services/mozilla-pipeline-schemas/generated-schemas/schemas/"  # noqa
                + bq_path
            ).json()
            variant_data = dict(
                id=app_id,
                description=get_app_variant_description(app),
                table=stable_ping_table_name,
                channel=app.app.get("app_channel", "release"),
            )
            looker_url = get_looker_explore_url(
                looker_namespaces, app_name, ping.identifier, stable_ping_table_name
            )
            if not app_is_deprecated and looker_url:
                variant_data.update({"looker_url": looker_url})
            ping_data["variants"].append(variant_data)
            app_variant_table_dir = os.path.join(app_table_dir, get_resource_path(app.app_id))
            os.makedirs(app_variant_table_dir, exist_ok=True)
            open(os.path.join(app_variant_table_dir, f"{ping.identifier}.json"), "w").write(
                json.dumps(
                    dict(
                        bq_definition=bq_definition,
                        bq_schema=bq_schema,
                        live_table=live_ping_table_name,
                        name=ping.identifier,
                        stable_table=stable_ping_table_name,
                        app_id=app_id,
                    )
                )
            )

    # write ping descriptions, resorting the app-specific parts in user preference order
    for ping_data in app_data["pings"]:
        ping_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
        open(os.path.join(app_ping_dir, f"{ping_data['name']}.json"), "w").write(
            json.dumps(
                dict(
                    ping_data,
                    metrics=[
                        metric
                        for metric in metric_pings["data"]
                        if ping_data["name"] in metric["pings"]
                    ],
                ),
                default=_serialize_sets,
            )
        )

    # write metrics, resorting the app-specific parts in user preference order
    for metric_data in app_metrics.values():
        metric_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
        open(
            os.path.join(app_metrics_dir, f"{_normalize_metrics(metric_data['name'])}.json"), "w"
        ).write(
            json.dumps(
                metric_data,
                default=_serialize_sets,
            )
        )

    # sort the information in the app-level summary, then write it out
    # (we don't sort application id information, that's already handled
    # above)
    for key in ["metrics", "pings"]:
        app_data[key].sort(key=lambda v: v["name"])
    open(os.path.join(app_dir, "index.json"), "w").write(json.dumps(app_data))
