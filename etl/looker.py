import json

import stringcase
from furl import furl

from .bigquery import get_bigquery_column_name, get_bigquery_ping_table_name
from .glean import GLEAN_DISTRIBUTION_TYPES

SUPPORTED_LOOKER_METRIC_TYPES = GLEAN_DISTRIBUTION_TYPES | {
    "boolean",
    "counter",
    "datetime",
    "jwe",
    "labeled_counter",
    "quantity",
    "string",
    "rate",
    "timespan",
    "uuid",
}


def _looker_explore_exists(looker_namespaces, app_name, explore_name):
    return (
        looker_namespaces.get(app_name)
        and looker_namespaces[app_name].get("glean_app")
        and looker_namespaces[app_name]["explores"].get(explore_name)
    )


def _get_looker_ping_explore(
    looker_namespaces, app_name, ping_name, table_name, app_channel, app_group
):
    ping_name_snakecase = stringcase.snakecase(ping_name)
    if _looker_explore_exists(looker_namespaces, app_name, ping_name_snakecase):
        url = furl(f"https://mozilla.cloud.looker.com/explore/{app_name}/{ping_name_snakecase}")
        # if there are multiple channels, we need a channel identifier
        if len(app_group["app_ids"]) > 1 and app_channel:
            channel_identifier = "mozdata." + table_name.replace("_", "^_")
            url = url.add({f"f[{ping_name_snakecase}.channel]": channel_identifier})
        return {"name": ping_name_snakecase, "url": url.url}
    return None


def _get_looker_event_explore(looker_namespaces, app_name, app_channel, app_group):
    if _looker_explore_exists(looker_namespaces, app_name, "events"):
        url = furl(f"https://mozilla.cloud.looker.com/explore/{app_name}/event_counts").add(
            {"fields": "events.event_count,events.client_count"}
        )
        if len(app_group["app_ids"]) > 1 and app_channel:
            url.add({"f[events.normalized_channel]": app_channel})
        return {"name": "event_counts", "url": url.url}
    elif _looker_explore_exists(looker_namespaces, app_name, "funnel_analysis"):
        url = furl(f"https://mozilla.cloud.looker.com/explore/{app_name}/funnel_analysis").add(
            {"fields": "funnel_analysis.count_completed_step_1"}
        )
        if len(app_group["app_ids"]) > 1 and app_channel:
            url.add({"f[funnel_analysis.app_channel]": app_channel})
        return {"name": "funnel_analysis", "url": url.url}
    return None


def get_looker_explore_metadata_for_ping(looker_namespaces, app, app_group, ping):
    if ping.identifier == "events":
        return _get_looker_event_explore(
            looker_namespaces, app.app_name, app.app.get("app_channel"), app_group
        )

    return _get_looker_ping_explore(
        looker_namespaces,
        app.app_name,
        ping.identifier,
        get_bigquery_ping_table_name(app.app["bq_dataset_family"], ping.identifier),
        app.app.get("app_channel"),
        app_group,
    )


def get_looker_explore_metadata_for_metric(
    looker_namespaces, app, app_group, metric, ping_name, ping_has_client_id
):
    metric_type = metric.definition["type"]
    metric_name_snakecase = stringcase.snakecase(metric.identifier)
    ping_name_snakecase = stringcase.snakecase(ping_name)

    base_looker_explore = (
        _get_looker_event_explore(
            looker_namespaces, app.app_name, app.app.get("app_channel"), app_group
        )
        if metric_type == "event"
        else _get_looker_ping_explore(
            looker_namespaces,
            app.app_name,
            ping_name,
            get_bigquery_ping_table_name(app.app["bq_dataset_family"], ping_name),
            app.app.get("app_channel"),
            app_group,
        )
    )

    # we deliberately don't show looker information for deprecated applications
    if not app.app.get("deprecated") and base_looker_explore:
        looker_metric_link = None
        if metric_type == "event":
            (metric_category, metric_name) = metric.identifier.split(".", 1)
            if base_looker_explore["name"] == "event_counts":
                looker_metric_link = furl(base_looker_explore["url"]).add(
                    {
                        "f[events.event_name]": f'"{metric_name}"',
                        "f[events.event_category]": f'"{metric_category}"',
                    }
                )
            elif base_looker_explore["name"] == "funnel_analysis":
                looker_metric_link = furl(base_looker_explore["url"]).add(
                    {
                        "f[step_1.event]": f'"{metric_name}"',
                        "f[step_1.category]": f'"{metric_category}"',
                    }
                )
            else:
                # this should never happen (unless we made a mistake in getting the
                # base looker explore link)
                raise Exception(f"Unexpected base looker explore {base_looker_explore['name']}")
        # for counters, we can use measures directly
        if metric_type == "counter":
            looker_metric_link = furl(base_looker_explore["url"]).add(
                {
                    "fields": ",".join(
                        [
                            f"{ping_name_snakecase}.submission_date",
                            f"{ping_name_snakecase}.{metric_name_snakecase}",
                        ]
                    )
                }
            )
        elif metric_type == "labeled_counter":
            counter_field_base = (
                f"{ping_name_snakecase}"
                + "__metrics__labeled_counter__"
                + f"{metric_name_snakecase}"
            )
            looker_metric_link = furl(base_looker_explore["url"]).add(
                {
                    "fields": ",".join(
                        [
                            f"{ping_name_snakecase}.submission_date",
                            f"{counter_field_base}.label",
                            f"{counter_field_base}.count",
                        ]
                    ),
                    "pivots": f"{counter_field_base}.label",
                }
            )
        elif metric_type == "timespan":
            # Timespans are currently implemented as a dimension rather than a metric.
            # Let's derive the median value
            looker_dimension_name = "{}.{}__value".format(
                ping_name_snakecase, get_bigquery_column_name(metric).replace(".", "__")
            )
            custom_field_name = f"median_of_{metric_name_snakecase}"
            dynamic_fields = [
                dict(
                    measure=custom_field_name,
                    label=f"Median of {metric.identifier}",
                    based_on=looker_dimension_name,
                    expression="",
                    type="median",
                )
            ]
            looker_metric_link = furl(base_looker_explore["url"]).add(
                {
                    "fields": ",".join(
                        [
                            f"{ping_name_snakecase}.submission_date",
                            custom_field_name,
                        ]
                    ),
                    "dynamic_fields": json.dumps(dynamic_fields),
                }
            )
        elif metric_type in SUPPORTED_LOOKER_METRIC_TYPES:
            base_looker_dimension_name = "{}.{}".format(
                ping_name_snakecase, get_bigquery_column_name(metric).replace(".", "__")
            )
            # For distribution types, we'll aggregate the sum of all distributions per
            # day. In most cases, this isn't super meaningful, but provides a starting
            # place for further analysis
            if metric_type in GLEAN_DISTRIBUTION_TYPES:
                looker_dimension_name = base_looker_dimension_name + "__sum"
                custom_field_name = f"sum_of_{metric_name_snakecase}"
                dynamic_fields = [
                    dict(
                        measure=custom_field_name,
                        label=f"Sum of {metric.identifier}",
                        based_on=looker_dimension_name,
                        expression="",
                        type="sum",
                    )
                ]
                looker_metric_link = furl(base_looker_explore["url"]).add(
                    {
                        "fields": ",".join(
                            [
                                f"{ping_name_snakecase}.submission_date",
                                custom_field_name,
                            ]
                        ),
                        "dynamic_fields": json.dumps(dynamic_fields),
                    }
                )
            else:
                # otherwise pivoting on the dimension is the best we can do (this works
                # well for boolean measures)
                looker_metric_link = furl(base_looker_explore["url"]).add(
                    {
                        "fields": ",".join(
                            [
                                f"{ping_name_snakecase}.submission_date",
                                base_looker_dimension_name,
                                (
                                    f"{ping_name_snakecase}.clients"
                                    if ping_has_client_id
                                    else f"{ping_name_snakecase}.ping_count"
                                ),
                            ]
                        ),
                        "pivots": base_looker_dimension_name,
                    }
                )

        if looker_metric_link:
            return {
                "base": base_looker_explore,
                "metric": {
                    "name": metric.identifier,
                    "url": looker_metric_link.add({"toggle": "vis"}).url,
                },
            }

    return None
