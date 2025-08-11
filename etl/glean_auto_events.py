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
    file_resp = requests.get(file_list_endpoint)
    if file_resp.status_code == 404:
        logging.error("No data files found.")
        # Returns an empty list if no data files are found.
        return data
    files = file_resp.json()
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
        event_name = row.get("event_name")
        if not event_name:
            continue
        auto_event_id = event_name.split(".")[-1]
        event_template = copy.deepcopy(_auto_event_template)
        event_template["name"] = event_name
        auto_event_type_prefix = event_template["name"].split(".")[1]
        if auto_event_type_prefix.startswith("element_click"):
            event_template["description"] = (
                f"An event triggered whenever the {auto_event_id} element is clicked on a page."
            )
        elif auto_event_type_prefix.startswith("page_load"):
            page_name = auto_event_type_prefix.split("/")[1][:-1]
            event_template["description"] = (
                f"An event triggered whenever the page /{page_name} is loaded."
            )
        event_template["event_info"]["auto_event_id"] = auto_event_id
        auto_events.append(event_template)
    return auto_events
