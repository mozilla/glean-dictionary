#!/usr/bin/env python3

import json
import os

import glean
import stringcase

OUTPUT_DIRECTORY = os.path.join("public", "data")


def _serialize_sets(obj):
    if isinstance(obj, set):
        return list(obj)
    return obj


# First, get the apps we're using
apps = [app for app in glean.GleanApp.get_apps()]

# Write out a list of apps (for the landing page)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), "w").write(
    json.dumps(
        [
            {
                k: app.repo[k]
                for k in ["app_id", "deprecated", "description", "name", "url", "prototype"]
            }
            for app in apps
        ]
    )
)

# Write out some metadata for each app (for the app detail page)
for app in apps:
    app_name = app.repo_name
    app_dir = os.path.join(OUTPUT_DIRECTORY, app_name)
    (app_ping_dir, app_table_dir, app_metrics_dir) = (
        os.path.join(app_dir, subtype) for subtype in ("pings", "tables", "metrics")
    )
    for directory in (app_ping_dir, app_table_dir, app_metrics_dir):
        os.makedirs(directory, exist_ok=True)

    app_data = dict(app.repo, pings=[], metrics=[])

    app_id = app.app_id
    app_id_snakecase = stringcase.snakecase(app_id)
    
    # metrics data
    metrics = app.get_metrics()
    metric_pings = dict(data=[])
    for metric in metrics:  # (metric_name, metric_data) in metrics_data.items():
        # metrics with associated pings
        metric_pings["data"].append(
            {
                "name": metric.identifier,
                "description": metric.description,
                "pings": metric.definition["send_in_pings"],
            }
        )

        app_data["metrics"].append(
            {
                "name": metric.identifier,
                "description": metric.description,
            }
        )

        stable_ping_table_names = []
        for ping in metric.definition["send_in_pings"]:
            stable_ping_table_names.append([ping, f"{app_id_snakecase}.{stringcase.snakecase(ping)}"])
        
        metric_type = metric.definition["type"]
        metric_name_snakecase = stringcase.snakecase(metric.identifier)
        bigquery_names = dict(
            stable_ping_table_names = stable_ping_table_names,
            metric_table_name = f"metrics.{metric_type}.{metric_name_snakecase}"
        )

        open(os.path.join(app_metrics_dir, f"{metric.identifier}.json"), "w").write(
            json.dumps(
                dict(
                    metric.definition,
                    name=metric.identifier,
                    history=metric.definition_history,
                    bigquery_names=bigquery_names
                ),
                default=_serialize_sets,
            )
        )

    for ping in app.get_pings():
        app_data["pings"].append(
            {"name": ping.identifier, "description": ping.definition["description"]}
        )

        # write table description
        ping_name_snakecase = stringcase.snakecase(ping.identifier)
        stable_ping_table_name = f"{app_id_snakecase}.{ping_name_snakecase}"
        live_ping_table_name = f"{app_id_snakecase}_live_v1.{ping_name_snakecase}"
        bq_path = f"{app_id}/{ping.identifier}/{ping.identifier}.1.bq"
        bq_definition = (
            "https://github.com/mozilla-services/mozilla-pipeline-schemas/blob/generated-schemas/schemas/"  # noqa
            + bq_path
        )
        bq_definition_raw_json = (
            "https://raw.githubusercontent.com/mozilla-services/mozilla-pipeline-schemas/generated-schemas/schemas/"  # noqa
            + bq_path
        )
        open(os.path.join(app_table_dir, f"{ping.identifier}.json"), "w").write(
            json.dumps(
                dict(
                    bq_definition=bq_definition,
                    bq_definition_raw_json=bq_definition_raw_json,
                    live_table=live_ping_table_name,
                    name=ping.identifier,
                    stable_table=stable_ping_table_name,
                )
            )
        )

        # write ping description
        open(os.path.join(app_ping_dir, f"{ping.identifier}.json"), "w").write(
            json.dumps(
                dict(
                    ping.definition,
                    name=ping.identifier,
                    history=ping.definition_history,
                    metrics=[
                        metric
                        for metric in metric_pings["data"]
                        if ping.identifier in metric["pings"]
                    ],
                    stable_table_name=stable_ping_table_name,
                ),
                default=_serialize_sets,
            )
        )

    open(os.path.join(app_dir, "index.json"), "w").write(json.dumps(app_data))
