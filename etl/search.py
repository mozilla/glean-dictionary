import json
from pathlib import Path

import jinja2

SEARCH_JS_TEMPLATE = jinja2.Template(
    open(Path(__file__).resolve().parent / "metrics_search.js.tmpl").read()
)


def create_metrics_search_js(metrics, legacy=False):
    search_keys = (
        ["type", "description", "active"] if legacy else ["type", "description", "expires"]
    )
    metric_data = {metric["name"]: {k: metric[k] for k in search_keys} for metric in metrics}

    # remove redundant data expires == "never" and "active" from search metric data
    for metric_val in metric_data.values():
        if metric_val.get("active"):
            del metric_val["active"]
        if metric_val.get("expires") == "never":
            del metric_val["expires"]

    return SEARCH_JS_TEMPLATE.render(metric_data=json.dumps(metric_data), legacy=json.dumps(legacy))
