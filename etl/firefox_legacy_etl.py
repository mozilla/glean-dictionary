import json
import os

import requests

from .search import create_metrics_search_js
from .utils import snake_case

PROBES_URL = os.getenv(
    "PROBES_URL", "https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes"
)
PROBE_RECORDED_IN_PROCESSES_URL = os.getenv(
    "PROBE_RECORDED_IN_PROCESSES_URL",
    "https://public-data.telemetry.mozilla.org/api/v1/tables/telemetry_derived/client_probe_processes/v1/files/000000000000.json",  # noqa
)


def _get_legacy_firefox_metric_summary(probe_data, activity_mapping):
    """
    Get a summary of legacy firefox metrics, which we can use as a search index
    """
    probe_summary = {}

    for probe_id, probe in probe_data.items():
        if probe["type"] == "event":
            # let's just skip legacy firefox events, since we're just doing
            # this for GLAM's benefit (which doesn't display events)
            continue
        if probe["history"].get("nightly"):
            most_recent_metadata = probe["history"]["nightly"][0]
        else:
            most_recent_metadata = probe["history"]["beta"][0]

        normalized_probe_name = probe["name"].lower().replace(".", "_")
        if probe_id.startswith("scalar/"):
            # scalar names are camelCased, but we want snake_case
            # to match the convention used in bigquery-etl
            # see: https://github.com/mozilla/glam/issues/1956
            normalized_probe_name = snake_case(probe_id.split("/")[1]).lower().replace(".", "_")

        probe_summary[normalized_probe_name] = {
            "name": normalized_probe_name,
            "id": probe_id,
            "type": probe["type"],
            "description": most_recent_metadata["description"],
            "bug_numbers": most_recent_metadata["bug_numbers"],
            "details": most_recent_metadata["details"],
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


def write_firefox_legacy_metadata(output_dir, functions_dir):
    # pull down the recorded in process information, which we use as the
    # authoritative guide on whether a legacy probe is still "active"
    recorded_in_process_data = requests.get(PROBE_RECORDED_IN_PROCESSES_URL).json()
    activity_mapping = {row["metric"]: row["processes"] for row in recorded_in_process_data}

    # get the actual probe data
    probe_data = requests.get(PROBES_URL).json()

    # then write it out
    probe_output_directory = os.path.join(output_dir, "firefox_legacy", "metrics")
    os.makedirs(probe_output_directory, exist_ok=True)

    probe_summary = _get_legacy_firefox_metric_summary(probe_data, activity_mapping)
    for probe_name, probe_metadata in probe_summary.items():
        with open(os.path.join(probe_output_directory, f"data_{probe_name}.json"), "w") as f:
            json.dump(probe_metadata, f)

    # write a search index for legacy telemetry data
    open(os.path.join(functions_dir, "metrics_search_firefox_legacy.js"), "w").write(
        create_metrics_search_js(probe_summary.values(), legacy=True)
    )

    # write a search index for legacy telemetry + FOG data
    open(os.path.join(functions_dir, "metrics_search_fog_and_legacy.js"), "w").write(
        create_metrics_search_js(probe_summary.values(), app_name="fog_and_legacy", legacy=True)
    )
