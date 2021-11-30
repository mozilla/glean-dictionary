import json
import os

import requests

from .search import create_metrics_search_js

OUTPUT_DIRECTORY = os.path.join("public", "data")
FUNCTIONS_DIRECTORY = ".netlify"
PROBES_URL = "https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes"

# a bit of a hack, we would ideally make this public data. this data is already implicitly
# public via the probe search service, so putting this here. probably best to make this
# a public data set produced by bigquery-etl in the long run though
PROBE_RECORDED_IN_PROCESSES_URL = "https://sql.telemetry.mozilla.org/api/queries/83152/results.json?api_key=Z1WhC2sRmLXmSwZyUwhIOFQQQAUK3JvGNLZgtZGW"  # noqa


def get_legacy_firefox_metric_summary():
    # pull down the recorded in process information, which we use as the
    # authoritative guide on whether a legacy probe is still "active"
    activity_mapping = {}
    recorded_in_process_data = requests.get(PROBE_RECORDED_IN_PROCESSES_URL).json()
    for row in recorded_in_process_data["query_result"]["data"]["rows"]:
        activity_mapping[row["metric"].lower()] = row["processes"]

    # get the actual probe data
    probe_data = requests.get(PROBES_URL).json()

    probe_summary = {}

    for (probe_id, probe) in probe_data.items():
        if probe["type"] == "event":
            # let's just skip legacy firefox events, since we're just doing
            # this for GLAM's benefit (which doesn't display events)
            continue
        most_recent_metadata = probe["history"]["nightly"][0]
        normalized_probe_name = probe["name"].lower().replace(".", "_")
        probe_summary[normalized_probe_name] = {
            "name": normalized_probe_name,
            "id": probe_id,
            "type": probe["type"],
            "description": most_recent_metadata["description"],
            "bug_numbers": most_recent_metadata["bug_numbers"],
            "optout": most_recent_metadata["optout"],
            "kind": most_recent_metadata["details"]["kind"],
            "versions": {
                channel: channel_data[0]["versions"]
                for (channel, channel_data) in probe["history"].items()
            },
            "active": normalized_probe_name in activity_mapping,
            "seen_in_processes": activity_mapping.get(normalized_probe_name, []),
        }

        if most_recent_metadata["details"].get("labels") is not None:
            probe_summary[normalized_probe_name]["labels"] = most_recent_metadata["details"][
                "labels"
            ]

    return probe_summary


if __name__ == "__main__":
    probe_output_directory = os.path.join(OUTPUT_DIRECTORY, "firefox_legacy", "metrics")
    os.makedirs(probe_output_directory, exist_ok=True)

    probe_summary = get_legacy_firefox_metric_summary()
    for probe_name, probe_metadata in probe_summary.items():
        with open(os.path.join(probe_output_directory, f"data_{probe_name}.json"), "w") as f:
            json.dump(probe_metadata, f)

    # write a search index for the app
    open(os.path.join(FUNCTIONS_DIRECTORY, "metrics_search_firefox_legacy.js"), "w").write(
        create_metrics_search_js(probe_summary.values(), legacy=True)
    )
