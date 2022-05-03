from pathlib import Path

import jinja2

from .utils import dump_json

SEARCH_JS_TEMPLATE = jinja2.Template(
    open(Path(__file__).resolve().parent / "metrics_search.js.tmpl").read()
)

FOG_AND_LEGACY_SEARCH_JS_TEMPLATE = jinja2.Template(
    open(Path(__file__).resolve().parent / "fog_and_legacy.js.tmpl").read()
)

FOG_DATA_JS_TEMPLATE = jinja2.Template(open(Path(__file__).resolve().parent / "fog.js.tmpl").read())


def create_metrics_search_js(metrics, app_name=None, legacy=False):
    """
    Take a list of metrics and create a search.js file for them.
    """

    search_keys = (
        ["type", "description", "id", "active"] if legacy else ["type", "description", "expires"]
    )
    metric_data = {metric["name"]: {k: metric[k] for k in search_keys} for metric in metrics}

    # remove redundant data expires == "never" and "active" from search metric data
    for metric_val in metric_data.values():
        if metric_val.get("active"):
            del metric_val["active"]
        if metric_val.get("expires") == "never":
            del metric_val["expires"]

    # 'fog' app_name is a special case, it's holding data only
    # instead of generating a search template.
    # this is intended to be used with the combo legacy_and_fog
    # search JS file. For more context see:
    # https://github.com/mozilla/glean-dictionary/pull/1163#discussion_r824498324
    if app_name == "fog":
        for metric_val in metric_data.values():
            metric_val["glean"] = True
        return FOG_DATA_JS_TEMPLATE.render(
            metric_data=dump_json(metric_data), legacy=dump_json(legacy)
        )

    if app_name == "fog_and_legacy":
        return FOG_AND_LEGACY_SEARCH_JS_TEMPLATE.render(
            metric_data=dump_json(metric_data), legacy=dump_json(legacy)
        )

    return SEARCH_JS_TEMPLATE.render(metric_data=dump_json(metric_data), legacy=dump_json(legacy))
