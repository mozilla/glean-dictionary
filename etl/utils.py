import json


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
