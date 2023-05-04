import json
import re

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


def snake_case(line: str) -> str:
    """Convert a string into a snake_cased string.
    Copied from github.com/mozilla/bigquery-etl/blob/main/bigquery_etl/util/common.py#L27
    """
    # replace non-alphanumeric characters with spaces in the reversed line
    subbed = re.sub(r"[^\w]|_", " ", line[::-1])
    # apply the regex on the reversed string
    words = REV_WORD_BOUND_PAT.split(subbed)
    # filter spaces between words and snake_case and reverse again
    return "_".join([w.lower() for w in words if w.strip()])[::-1]


def _serialize_sets(obj):
    if isinstance(obj, set):
        return list(obj)
    return obj


def dump_json(data):
    """
    Utility function for dumping json data

    There are two differences from a plain call to json.dumps:

    1. Sets are serialized to lists
    2. We dump the data without spaces (since we want things as small as possible)
    """
    return json.dumps(data, separators=(",", ":"), default=_serialize_sets)


def get_event_name_and_category(event_identifier: str):
    """Get the event name and category from an event identifier.

    Event names cannot contain dots, only the category, so
    splitting at the right most '.' will extract the category
    and name, i.e. the name is the last part of the event
    identifier, and the event category is everything before the
    event name.

    e.g. "newtab.search.ad.click_metric" ->
    name = "click_metric".
    category = "newtab.search.ad".
    """
    name = event_identifier.split(".")[-1]
    category = event_identifier.replace(f".{name}", "")
    return name, category
