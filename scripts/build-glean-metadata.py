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
ANNOTATIONS_URL = "https://deploy-preview-12--glean-annotations.netlify.app/api.json"
NAMESPACES_URL = "https://raw.githubusercontent.com/mozilla/looker-hub/main/namespaces.yaml"


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
# nightly < beta < release < esr
# non-deprecated < deprecated
channel_priority = {"nightly": 1, "beta": 2, "release": 3, "esr": 4}
for app_group in app_groups.values():
    app_group["app_ids"].sort(key=lambda app_id: channel_priority[app_id["channel"]])
    app_group["app_ids"].sort(key=lambda app_id: app_id["deprecated"])

# Write out a list of app groups (for the landing page)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), "w").write(json.dumps(list(app_groups.values())))

# Write out some metadata for each app group (for the app detail page)
for (app_name, app_group) in app_groups.items():
    app_dir = os.path.join(OUTPUT_DIRECTORY, app_name)
    (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir, app_labels_dir) = (
        os.path.join(app_dir, subtype)
        for subtype in ("app_ids", "pings", "tables", "metrics", "labels")
    )
    for directory in (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir, app_labels_dir):
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

        # information about this app_id
        open(os.path.join(app_id_dir, f"{get_resource_path(app_id)}.json"), "w").write(
            json.dumps(app.app)
        )

        # metrics data
        metrics = app.get_metrics()
        for metric in metrics:
            if metric.identifier not in metric_identifiers_seen:
                metric_identifiers_seen.add(metric.identifier)

                # read the annotation, if any
                annotation = (
                    annotations_index.get(app_name, {})
                    .get("annotations", {})
                    .get("metrics", {})
                    .get(metric.identifier)
                )

                base_definition = {
                    "name": metric.identifier,
                    "description": metric.description,
                    "extra_keys": metric.definition["extra_keys"]
                    if "extra_keys" in metric.definition
                    else None,
                    "type": metric.definition["type"],
                    "expires": metric.definition["expires"],
                }
                if annotation and annotation.get("labels"):
                    base_definition.update({"labels": annotation["labels"]})
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
                    repo_url=app.app["url"],
                    variants=[],
                )

            stable_ping_table_names = []
            for ping in metric.definition["send_in_pings"]:
                stable_ping_table_names.append(
                    [ping, f"{app.app['bq_dataset_family']}.{stringcase.snakecase(ping)}"]
                )

            metric_type = metric.definition["type"]
            metric_name_snakecase = stringcase.snakecase(metric.identifier)
            metric_table_name = (
                f"{metric.bq_prefix}.{metric_name_snakecase}"
                if metric.bq_prefix
                else f"metrics.{metric_type}.{metric_name_snakecase}"
            )
            bigquery_names = dict(
                stable_ping_table_names=stable_ping_table_names,
                metric_type=metric_type,
                metric_table_name=metric_table_name,
                glam_etl_name=etl_snake_case(metric.identifier),
            )
            app_metrics[metric.identifier]["variants"].append(
                dict(
                    app_id=app.app_id,
                    app_channel=app.app.get("app_channel", "release"),
                    app_description=app.app["app_description"],
                    bigquery_names=bigquery_names,
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
                if (
                    looker_namespaces.get(app_name)
                    and looker_namespaces[app_name].get("glean_app")
                    and looker_namespaces[app_name]["explores"].get(ping.identifier)
                ):
                    ping_data.update({"looker_explore": True})
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

            app_variant_table_dir = os.path.join(app_table_dir, get_resource_path(app.app_id))
            ping_data["variants"].append(
                {
                    "app_id": app_id,
                    "app_channel": app.app.get("app_channel", "release"),
                    "table": stable_ping_table_name,
                }
            )
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

    # write ping descriptions
    for ping_data in app_data["pings"]:
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

    # write metrics
    for metric_data in app_metrics.values():
        open(
            os.path.join(app_metrics_dir, f"{_normalize_metrics(metric_data['name'])}.json"), "w"
        ).write(
            json.dumps(
                metric_data,
                default=_serialize_sets,
            )
        )

    # write labels (if any)
    labels = [
        {"name": k, **v}
        for (k, v) in annotations_index.get(app.app_name, {}).get("labels", {}).items()
    ]
    if labels:
        app_data["labels"] = labels
        for label in labels:
            label_metrics = [
                metric
                for metric in app_data["metrics"]
                if label["name"] in metric.get("labels", [])
            ]
            label["metric_count"] = len(label_metrics)
            open(os.path.join(app_labels_dir, f"{label['name']}.json"), "w").write(
                json.dumps(
                    dict(
                        label,
                        origin=app.app_name,
                        metrics=label_metrics,
                    )
                )
            )

    # sort the information in the app-level summary, then write it out
    # (we don't sort application id information, that's already handled
    # above)
    for key in ["labels", "metrics", "pings"]:
        if app_data.get(key):
            app_data[key].sort(key=lambda v: v["name"])
    open(os.path.join(app_dir, "index.json"), "w").write(json.dumps(app_data))
