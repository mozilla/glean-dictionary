from .bigquery import query_bigquery

_auto_event_template = {
    "name": "",
    "type": "event",
    "expiration": "never",
    "description": "",
    "event_info": {
        "is_auto": True,
        "auto_event_id": "",
    }
}


def _get_auto_events_names(app):
    """Get the automatic events names for the app"""
    query = f"""SELECT * FROM `moz-fx-data-shared-prod.glean_dictionary_derived.auto_events_metadata` WHERE app = '{app}' """
    return query_bigquery(query)


def get_auto_events_for_app(app):
    """Get the automatic events for the app"""
    event_names = _get_auto_events_names(app)
    auto_events = []
    for row in event_names:
        auto_event_id = row.name.split('.')[-1]
        event_template = _auto_event_template.copy()
        event_template["name"] = row.name
        event_template["description"] = f"A event triggered whenever the {auto_event_id} element is clicked on a page."
        event_template["event_info"]["auto_event_id"] = auto_event_id
        auto_events.append(event_template)
    return auto_events
