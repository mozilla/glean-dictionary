#!/usr/bin/env python3

import json
import os

import requests
import stringcase
from mozilla_schema_generator.glean_ping import GleanPing


PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org"
REPO_URL = PROBE_INFO_BASE_URL + "/glean/repositories"
PINGS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"
METRICS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/metrics"
OUTPUT_DIRECTORY = os.path.join("public", "data")


# we get the repos ourselves instead of using GleanPing.get_repos()
# to get all the metadata associated with the repo
repo_data = requests.get(REPO_URL).json()

# filter out repos that are just libraries, not applications
repos = list(
    filter(
        lambda r: "library_names" not in r and r["app_id"] != "glean", repo_data)
)

# Write out a list of apps (for the landing page)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), "w").write(
    json.dumps(
        [
            {k: repo[k]
                for k in ["app_id", "deprecated", "description", "name", "url"]}
            for repo in repos
        ]
    )
)

# Write out some metadata for each app (for the app detail page)
for repo in list(repos):
    app_name = repo["name"]
    app_dir = os.path.join(OUTPUT_DIRECTORY, app_name)
    (app_ping_dir, app_table_dir, app_metrics_dir) = (
        os.path.join(app_dir, subtype) for subtype in ("pings", "tables", "metrics")
    )
    for directory in (app_ping_dir, app_table_dir, app_metrics_dir):
        os.makedirs(directory, exist_ok=True)

    app_data = dict(repo, pings=[], metrics=[])

    # metrics data
    metrics_data = requests.get(METRICS_URL_TEMPLATE.format(app_name)).json()
    metric_pings = dict(data=[])
    for (metric_name, metric_data) in metrics_data.items():

        # metrics with associated pings
        metric_pings["data"].append({
            "name": metric_name,
            "description": metric_data["history"][-1]["description"],
            "pings": metric_data["history"][0]["send_in_pings"]
        })

        app_data["metrics"].append(
            {
                "name": metric_name,
                "description": metric_data["history"][-1]["description"],
            }
        )
        open(os.path.join(app_metrics_dir, f"{metric_name}.json"), "w").write(
            json.dumps(
                dict(
                    metric_data["history"][-1],
                    name=metric_name,
                    history=metric_data["history"],
                )
            )
        )

    ping_data = requests.get(PINGS_URL_TEMPLATE.format(app_name)).json()
    for (ping_name, ping_data) in ping_data.items():
        app_data["pings"].append(
            {"name": ping_name,
                "description": ping_data["history"][-1]["description"]}
        )

        def filter_metrics(metric):
            return ping_name in metric['pings']

        filtered_metrics = list(filter(filter_metrics, metric_pings["data"]))

        # write ping description
        open(os.path.join(app_ping_dir, f"{ping_name}.json"), "w").write(
            json.dumps(
                dict(
                    ping_data["history"][-1],
                    name=ping_name,
                    history=ping_data["history"],
                    metrics=filtered_metrics
                )
            )
        )
        # write table description
        app_id = repo["app_id"]
        app_id_snakecase = stringcase.snakecase(app_id)
        ping_name_snakecase = stringcase.snakecase(ping_name)
        stable_ping_table_name = f"{app_id_snakecase}.{ping_name_snakecase}"
        live_ping_table_name = f"{app_id_snakecase}_live_v1.{ping_name_snakecase}"
        bq_path = f"{app_id}/{ping_name}/{ping_name}.1.bq"
        bq_definition = (
            "https://github.com/mozilla-services/mozilla-pipeline-schemas/blob/generated-schemas/schemas/"
            + bq_path
        )
        bq_definition_raw_json = (
            "https://raw.githubusercontent.com/mozilla-services/mozilla-pipeline-schemas/generated-schemas/schemas/"
            + bq_path
        )
        open(os.path.join(app_table_dir, f"{ping_name}.json"), "w").write(
            json.dumps(
                dict(
                    bq_definition=bq_definition,
                    bq_definition_raw_json=bq_definition_raw_json,
                    live_table=live_ping_table_name,
                    name=ping_name,
                    stable_table=stable_ping_table_name,
                )
            )
        )

    open(os.path.join(app_dir, "index.json"), "w").write(json.dumps(app_data))
