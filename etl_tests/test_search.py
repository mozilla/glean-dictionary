import json

from etl.search import SEARCH_JS_TEMPLATE, create_metrics_search_js


def test_create_metrics_search_js():
    """
    Tests the creation of the metrics search netlify functions
    """
    metrics_input = [
        {
            "name": "fun-metric1",
            "type": "string",
            "description": "Fun Metric 1",
            "expires": "2021-01-01",
        },
        {
            "name": "fun-metric2",
            "type": "boolean",
            "description": "Fun Metric 2",
            "expires": "never",
        },
    ]
    expected_metrics_output = {
        "fun-metric1": {"type": "string", "description": "Fun Metric 1", "expires": "2021-01-01"},
        "fun-metric2": {
            "type": "boolean",
            "description": "Fun Metric 2",
        },
    }
    assert create_metrics_search_js(metrics_input) == SEARCH_JS_TEMPLATE.render(
        metric_data=json.dumps(expected_metrics_output), legacy=json.dumps(False)
    )
