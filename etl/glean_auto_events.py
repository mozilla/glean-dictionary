import logging
import requests
import copy

logger = logging.getLogger(__name__)


_auto_event_template = {
    "name": "",
    "type": "event",
    "expiration": "never",
    "description": "",
    "event_info": {
        "is_auto": True,
        "auto_event_id": "",
    },
}


def get_auto_events_names():
    """Get the automatic events names for the app"""
    data = []
    file_list_endpoint = "https://public-data.telemetry.mozilla.org/api/v1/tables/glean_auto_events_derived/apps_auto_events_metadata/v1/files"

    # Mozilla's public-data API returns a list of files for a given dataset.
    files = requests.get(file_list_endpoint).json()
    if not files:
        raise ValueError("No data files found.")
    for _, file in enumerate(files):
        logging.info(f"Extracting file: {file}")
        data.extend(requests.get(file).json())
    return data


def get_auto_events_for_app(app, auto_events):
    """Get the automatic events for the app"""
    event_names = [event for event in auto_events if event["app"] == app]
    auto_events = []
    for row in event_names:
        auto_event_id = row["name"].split(".")[-1]
        event_template = copy.deepcopy(_auto_event_template)
        event_template["name"] = row["name"]
        event_template["description"] = (
            f"An event triggered whenever the {auto_event_id} element is clicked on a page."
        )
        event_template["event_info"]["auto_event_id"] = auto_event_id
        auto_events.append(event_template)
    return auto_events
