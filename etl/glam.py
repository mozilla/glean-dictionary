import re

from .glean import GLEAN_DISTRIBUTION_TYPES

GLAM_PRODUCT_MAPPINGS = {
    "org.mozilla.fenix": ("fenix", ""),
    "org.mozilla.firefox_beta": ("fenix", "beta"),
    "org.mozilla.firefox": ("fenix", "release"),
    "firefox.desktop": ("fog", ""),
}

# supported glam metric types, from:
# https://github.com/mozilla/bigquery-etl/blob/c48ab6649448cdf41191f6c24cb00fe46ca2323d/bigquery_etl/glam/clients_daily_histogram_aggregates.py#L39
# https://github.com/mozilla/bigquery-etl/blob/c48ab6649448cdf41191f6c24cb00fe46ca2323d/bigquery_etl/glam/clients_daily_scalar_aggregates.py#L95
SUPPORTED_GLAM_METRIC_TYPES = GLEAN_DISTRIBUTION_TYPES | {
    "boolean",
    "counter",
    "labeled_counter",
    "quantity",
    "timespan",
}

# ETL specific snakecase taken from:
# https://github.com/mozilla/bigquery-etl/blob/master/bigquery_etl/util/common.py
#
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

GLAM_METRICS_BLOCKLIST = {
    "regex": (
        "/search_counts|browser_search|event_counts|browser_engagement_navigation|"
        "manager_message_size|dropped_frames_proportion/"
    ),
    "confidentialMetricsFenix": [
        "characteristics.color_depth",
        "characteristics.color_gamut",
        "characteristics.color_scheme",
        "characteristics.inverted_colors",
        "characteristics.max_touch_points",
        "characteristics.missing_fonts",
        "characteristics.prefers_contrast",
        "characteristics.prefers_reduced_motion",
        "characteristics.prefers_reduced_transparency",
        "characteristics.prefs_media_eme_enabled",
        "characteristics.prefs_zoom_text_only",
        "characteristics.processor_count",
        "characteristics.screen_height",
        "characteristics.screen_width",
        "characteristics.submission_schema",
        "characteristics.target_frame_rate",
        "characteristics.video_dynamic_range",
        "pocket.shim",
        "shopping.product_page_visits",
    ],
    "confidentialMetricsFog": [
        "browser.search.ad_clicks",
        "browser.search.in_content",
        "browser.search.with_ads",
        "fx_suggest.block_id",
        "metrics.search_count",
        "nimbus_health.fetch_experiments_time",
        "shopping.product_page_visits",
        "shopping.settings.component_opted_out",
        "shopping.settings.disabled_ads",
        "shopping.settings.nimbus_disabled_shopping",
        "shopping.settings.user_has_onboarded",
        "top_sites.contile_tile_id",
    ],
}


def etl_snake_case(line: str) -> str:
    """Convert a string into a snake_cased string."""
    # replace non-alphanumeric characters with spaces in the reversed line
    subbed = re.sub(r"[^\w]|_", " ", line[::-1])
    # apply the regex on the reversed string
    words = REV_WORD_BOUND_PAT.split(subbed)
    # filter spaces between words and snake_case and reverse again
    return "_".join([w.lower() for w in words if w.strip()])[::-1]


def get_glam_metadata_for_metric(app, metric, ping_name):
    # GLAM data is per application and per ping (well,
    # only the metrics ping right now), when it exists
    metric_type = metric.definition["type"]
    if not GLAM_PRODUCT_MAPPINGS.get(app.app_id):
        return {"glam_unsupported_reason": "This application is not supported by GLAM."}
    elif metric.bq_prefix in ["client_info", "ping_info"]:
        return {"glam_unsupported_reason": "Internal Glean metrics are not supported by GLAM."}
    elif metric_type not in SUPPORTED_GLAM_METRIC_TYPES:
        return {
            "glam_unsupported_reason": "Currently GLAM does not support "
            f"`{metric_type}` metrics."
        }
    elif ping_name != "metrics":
        return {
            "glam_unsupported_reason": (
                f"Metrics sent in the `{ping_name}` ping are not supported "
                "by GLAM "
                "([mozilla/glam#1652](https://github.com/mozilla/glam/issues/1652))."
            )
        }

    (glam_product, glam_app_id) = GLAM_PRODUCT_MAPPINGS[app.app_id]
    glam_metric_id = etl_snake_case(metric.identifier)
    return {
        "glam_url": (
            "https://glam.telemetry.mozilla.org/"
            + f"{glam_product}/probe/{glam_metric_id}/explore"
            + f"?app_id={glam_app_id}"
        )
    }
