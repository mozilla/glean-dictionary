#!/usr/bin/env python3

import json
import os
import re

import glean
import requests
import stringcase

OUTPUT_DIRECTORY = os.path.join("public", "data")
ANNOTATIONS_URL = "https://mozilla.github.io/glean-annotations/api.json"
BIGQUERY_ETL_DOCS_URL = "https://deploy-preview-1949--bigquery-etl-dev.netlify.app/mozdata/api.json"


def _serialize_sets(obj):
    if isinstance(obj, set):
        return list(obj)
    return obj


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

# Dataset docs
dataset_docs = requests.get(BIGQUERY_ETL_DOCS_URL).json()

# Then, get the apps we're using
apps = [app for app in glean.GleanApp.get_apps()]
app_groups = {}
for app in apps:
    if not app_groups.get(app.app_name):
        app_groups[app.app_name] = {
            "app_name": app.app_name,
            "app_description": app.app["app_description"],
            "canonical_app_name": app.app["canonical_app_name"],
            "url": app.app["url"],
            "notification_emails": app.app["notification_emails"],
            "app_ids": [],
        }
    app_groups[app.app_name]["app_ids"].extend(
        [
            {
                "name": app.app_id,
                "description": app.app.get("description", app.app["app_description"]),
                "channel": app.app.get("app_channel", "release"),
                "deprecated": app.app.get("deprecated", False),
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
    (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir) = (
        os.path.join(app_dir, subtype) for subtype in ("app_ids", "pings", "tables", "metrics")
    )
    for directory in (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir):
        os.makedirs(directory, exist_ok=True)

    app_data = dict(app_group, pings=[], metrics=[], tables=[])

    app_metrics = {}
    metric_pings = dict(data=[])
    # keep track of which metric, ping and table identifiers we have seen so far
    metric_identifiers_seen = set()
    ping_identifiers_seen = set()
    table_identifiers_seen = set()

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

                # metrics with associated pings
                metric_pings["data"].append(
                    {
                        "name": metric.identifier,
                        "description": metric.description,
                        "pings": metric.definition["send_in_pings"],
                        "type": metric.definition["type"],
                        "expires": metric.definition["expires"],
                    }
                )

                app_data["metrics"].append(
                    {
                        "name": metric.identifier,
                        "description": metric.description,
                        "type": metric.definition["type"],
                        "expires": metric.definition["expires"],
                    }
                )

                app_metrics[metric.identifier] = dict(
                    metric.definition,
                    name=metric.identifier,
                    annotation=(
                        annotations_index.get(app_name, {})
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
                f"client_info.{metric_name_snakecase}"
                if metric.is_client_info
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

        # ping data
        for ping in app.get_pings():
            if ping.identifier not in ping_identifiers_seen:
                ping_identifiers_seen.add(ping.identifier)

                app_data["pings"].append(
                    dict(
                        ping.definition,
                        variants=[],
                        annotation=(
                            annotations_index.get(app_name, {})
                            .get("pings", {})
                            .get(ping.identifier)
                        ),
                    )
                )

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

            ping_data["variants"].append(
                {
                    "app_id": app_id,
                    "app_channel": app.app.get("app_channel", "release"),
                    "table": stable_ping_table_name,
                }
            )
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

        # generated dataset documentation
        table_docs = dataset_docs.get(get_resource_path(app.app_id), [])
        for table_doc in table_docs:
            table_name = table_doc["table_name"]
            if table_name not in table_identifiers_seen:
                table_identifiers_seen.add(table_name)
                app_data["tables"].append(
                    {
                        "name": table_name,
                        "description": table_doc["metadata"].get(
                            "friendly_name", "No description available"
                        ),
                    }
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

    for metric_data in app_metrics.values():
        open(
            os.path.join(app_metrics_dir, f"{metric_data['name'].replace('.', '_')}.json"), "w"
        ).write(
            json.dumps(
                metric_data,
                default=_serialize_sets,
            )
        )

    # sort the metadata, then write it out
    for key in ["metrics", "pings", "tables"]:
        app_data[key].sort(key=lambda v: v["name"])
    open(os.path.join(app_dir, "index.json"), "w").write(json.dumps(app_data))
