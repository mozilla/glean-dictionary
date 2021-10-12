#!/usr/bin/env python3

import json
import os
import re
import sys
import urllib.parse

import glean
import requests
import stringcase
import yaml

OUTPUT_DIRECTORY = os.path.join("public", "data")
ANNOTATIONS_URL = os.getenv(
    "ANNOTATIONS_URL", "https://mozilla.github.io/glean-annotations/api.json"
)
NAMESPACES_URL = os.getenv(
    "NAMESPACES_URL", "https://raw.githubusercontent.com/mozilla/looker-hub/main/namespaces.yaml"
)

# Priority for getting metric data (use the later definitions of nightly over release)
METRIC_CHANNEL_PRIORITY = {"nightly": 1, "beta": 2, "release": 3, "esr": 4}
# Priority for sorting app ids in the UI (of anticipated relevance to the suer)
USER_CHANNEL_PRIORITY = {"release": 1, "beta": 2, "nightly": 3, "esr": 4}


GLAM_PRODUCT_MAPPINGS = {
    "org.mozilla.fenix": ("fenix", ""),
    "org.mozilla.firefox_beta": ("fenix", "beta"),
    "org.mozilla.firefox": ("fenix", "release"),
}

GLEAN_DISTRIBUTION_TYPES = {
    "timing_distribution",
    "memory_distribution",
    "custom_distribution",
}

# supported glam metric types, from:
# https://github.com/mozilla/bigquery-etl/blob/c48ab6649448cdf41191f6c24cb00fe46ca2323d/bigquery_etl/glam/clients_daily_histogram_aggregates.py#L39
# https://github.com/mozilla/bigquery-etl/blob/c48ab6649448cdf41191f6c24cb00fe46ca2323d/bigquery_etl/glam/clients_daily_scalar_aggregates.py#L95
SUPPORTED_GLAM_METRIC_TYPES = {
    "boolean",
    "counter",
    "quantity",
    "timespan",
    "labeled_counter",
    "timing_distribution",
    "memory_distribution",
    "custom_distribution",
}

SUPPORTED_LOOKER_METRIC_TYPES = GLEAN_DISTRIBUTION_TYPES | {
    "boolean",
    "counter",
    "datetime",
    "jwe",
    "quantity",
    "string",
    "rate",
    "timespan",
    "uuid",
}


def _serialize_sets(obj):
    if isinstance(obj, set):
        return list(obj)
    return obj


def _normalize_metrics(name):
    # replace . with _ so sirv doesn't think that
    # a metric is a file
    metric_name = name.replace(".", "_")

    # if a metric name starts with "metrics", uBlock Origin
    # will block the network call to get the JSON resource
    # See: https://github.com/mozilla/glean-dictionary/issues/550
    # To get around this, we add "data" to metric names
    return f"data_{metric_name}"


def _get_annotation(annotations_index, origin, item_type, identifier=None):
    if item_type == "app":
        return annotations_index.get(origin, {})
    if not identifier:
        raise Exception("Identifier required for non-app item types")
    return annotations_index.get(origin, {}).get(item_type, {}).get(identifier, {})


def _incorporate_annotation(item, item_annotation, tag_descriptions, app=False, full=False):
    incorporated = dict(item, has_annotation=len(item_annotation) > 0)

    # handle tags, which are in a slightly different format than other types
    # of annotations (and we want to apply to both full and non-full)
    if not app:
        if full:
            # we want an extended tag definition for a full description
            incorporated.update(
                {
                    "tags": [
                        {"name": tag, "description": tag_descriptions[tag]}
                        for tag in item_annotation.get("tags", [])
                    ]
                }
            )
        else:
            # for the non-full description, we just want the names
            incorporated.update({"tags": item_annotation.get("tags", [])})

    # other annotations are only applied to the full version (not the
    # summaries we list out in various places)
    if full:
        for annotation_type in ["commentary", "warning"]:
            if item_annotation.get(annotation_type):
                incorporated[annotation_type] = item_annotation[annotation_type]

    return incorporated


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


def get_resource_path(line: str) -> str:
    return line.replace(".", "_")


def etl_snake_case(line: str) -> str:
    """Convert a string into a snake_cased string."""
    # replace non-alphanumeric characters with spaces in the reversed line
    subbed = re.sub(r"[^\w]|_", " ", line[::-1])
    # apply the regex on the reversed string
    words = REV_WORD_BOUND_PAT.split(subbed)
    # filter spaces between words and snake_case and reverse again
    return "_".join([w.lower() for w in words if w.strip()])[::-1]


def get_looker_ping_explore_url(looker_namespaces, app_name, ping_name, table_name, app_channel):
    ping_name_snakecase = stringcase.snakecase(ping_name)
    if (
        looker_namespaces.get(app_name)
        and looker_namespaces[app_name].get("glean_app")
        and looker_namespaces[app_name]["explores"].get(ping_name_snakecase)
    ):
        channel_identifier = "mozdata." + table_name.replace("_", "%5E_")
        return f"https://mozilla.cloud.looker.com/explore/{app_name}/{ping_name_snakecase}?" + (
            f"f[{ping_name_snakecase}.channel]={channel_identifier}" if app_channel else ""
        )
    return None


def get_looker_event_count_explore_url(looker_namespaces, app_name, channel_name):
    if (
        looker_namespaces.get(app_name)
        and looker_namespaces[app_name].get("glean_app")
        and looker_namespaces[app_name]["explores"].get("events")
    ):
        base_url = (
            f"https://mozilla.cloud.looker.com/explore/{app_name}/event_counts"
            + "?fields=events.event_count,events.client_count"
        )
        return (
            base_url + f"&f[events.normalized_channel]={channel_name}" if channel_name else base_url
        )

    return None


def get_app_variant_description(app):
    """
    Gets a description of app variants (intended for use inside dropdowns)
    """
    description = app.app.get("app_channel", "release")
    # Make it obvious if a variant should no longer be used.
    if app.app.get("deprecated"):
        description = f"[Deprecated] {description}"
    return description


# Pull down the annotations
annotations_index = requests.get(ANNOTATIONS_URL).json()
looker_namespaces = yaml.safe_load(requests.get(NAMESPACES_URL).text)

# Then, get the apps we're using
apps = [app for app in glean.GleanApp.get_apps()]

if len(sys.argv) > 1:
    apps = [app for app in apps if app.app_name in sys.argv[1:]]

app_groups = {}
for app in apps:
    if app.app.get("skip_documentation"):
        # respect apps that don't want to appear in the glean dictionary
        continue

    if not app_groups.get(app.app_name):
        app_groups[app.app_name] = dict(
            app_name=app.app_name,
            app_description=app.app["app_description"],
            canonical_app_name=app.app["canonical_app_name"],
            deprecated=app.app.get("deprecated", False),
            url=app.app["url"],
            notification_emails=app.app["notification_emails"],
            app_ids=[],
        )

    app_groups[app.app_name]["app_ids"].extend(
        [
            {
                "name": app.app_id,
                "description": app.app.get("description", app.app["app_description"]),
                "channel": app.app.get("app_channel", "release"),
                "deprecated": app.app.get("deprecated", False),
                "prototype": app.app.get("prototype", False),
            }
        ]
    )

# sort each set of app ids by the following criteria
# metric channel priority nightly < beta < release < esr
# non-deprecated < deprecated
for app_group in app_groups.values():
    app_group["app_ids"].sort(key=lambda app_id: METRIC_CHANNEL_PRIORITY[app_id["channel"]])
    app_group["app_ids"].sort(key=lambda app_id: app_id["deprecated"])

# Write out a list of app groups (for the landing page)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), "w").write(json.dumps(list(app_groups.values())))

# Write out some metadata for each app group (for the app detail page)
for (app_name, app_group) in app_groups.items():
    app_dir = os.path.join(OUTPUT_DIRECTORY, app_name)
    (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir) = (
        os.path.join(app_dir, subtype) for subtype in ("app_ids", "pings", "tables", "metrics")
    )
    for directory in (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir):
        os.makedirs(directory, exist_ok=True)

    app_data = dict(app_group, pings=[], metrics=[])
    # An application group is considered a prototype only if all its application ids are
    if all([app_id.get("prototype") for app_id in app_group["app_ids"]]):
        app_data["prototype"] = True

    app_annotation = _get_annotation(annotations_index, app_name, "app")
    app_tags = app_annotation.get("tags", {})

    app_metrics = {}
    metric_pings = dict(data=[])
    # keep track of which metric and ping identifiers we have seen so far
    metric_identifiers_seen = set()
    ping_identifiers_seen = set()

    for app_id in [app["name"] for app in app_group["app_ids"]]:
        app = next(app for app in apps if app.app_id == app_id)
        app_is_deprecated = app.app.get("deprecated")

        # information about this app_id
        open(os.path.join(app_id_dir, f"{get_resource_path(app_id)}.json"), "w").write(
            json.dumps(app.app)
        )

        pings_with_client_id = set()
        # ping data
        for ping in app.get_pings():
            if ping.identifier not in ping_identifiers_seen:
                ping_identifiers_seen.add(ping.identifier)
                app_data["pings"].append(
                    _incorporate_annotation(
                        dict(
                            ping.definition,
                            variants=[],
                        ),
                        _get_annotation(
                            annotations_index, ping.definition["origin"], "pings", ping.identifier
                        ),
                        app_tags,
                        full=False,
                    )
                )

            ping_data = next(pd for pd in app_data["pings"] if pd["name"] == ping.identifier)

            if ping_data["include_client_id"]:
                pings_with_client_id.add(ping_data["name"])

            # write table description (app variant specific)
            ping_name_snakecase = stringcase.snakecase(ping.identifier)
            stable_ping_table_name = f"{app.app['bq_dataset_family']}.{ping_name_snakecase}"
            live_ping_table_name = f"{app.app['bq_dataset_family']}_live.{ping_name_snakecase}_v1"
            bq_path = f"{app.app['document_namespace']}/{ping.identifier}/{ping.identifier}.1.bq"
            bq_definition = (
                "https://github.com/mozilla-services/mozilla-pipeline-schemas/blob/generated-schemas/schemas/"  # noqa
                + bq_path
            )
            bq_schema = requests.get(
                "https://raw.githubusercontent.com/mozilla-services/mozilla-pipeline-schemas/generated-schemas/schemas/"  # noqa
                + bq_path
            ).json()
            app_channel = app.app.get("app_channel")
            variant_data = dict(
                id=app_id,
                description=get_app_variant_description(app),
                table=stable_ping_table_name,
                channel=app_channel if app_channel else "release",
            )
            looker_explore = (
                {
                    "name": "event_counts",
                    "url": get_looker_event_count_explore_url(
                        looker_namespaces, app_name, app_channel
                    ),
                }
                if ping.identifier == "events"
                else {
                    "name": ping.identifier,
                    "url": get_looker_ping_explore_url(
                        looker_namespaces,
                        app_name,
                        ping.identifier,
                        stable_ping_table_name,
                        app_channel,
                    ),
                }
            )
            if not app_is_deprecated and looker_explore.get("url"):
                variant_data.update({"looker_explore": looker_explore})
            ping_data["variants"].append(variant_data)
            app_variant_table_dir = os.path.join(app_table_dir, get_resource_path(app.app_id))
            os.makedirs(app_variant_table_dir, exist_ok=True)
            open(os.path.join(app_variant_table_dir, f"{ping.identifier}.json"), "w").write(
                json.dumps(
                    dict(
                        bq_definition=bq_definition,
                        bq_schema=bq_schema,
                        live_table=live_ping_table_name,
                        name=ping.identifier,
                        stable_table=stable_ping_table_name,
                        app_id=app_id,
                    )
                )
            )

        # metrics data
        metrics = app.get_metrics()
        for metric in metrics:
            if metric.identifier not in metric_identifiers_seen:
                metric_identifiers_seen.add(metric.identifier)

                # read the annotation, if any
                metric_annotation = _get_annotation(
                    annotations_index, app_name, "metrics", metric.identifier
                )

                base_definition = _incorporate_annotation(
                    dict(
                        name=metric.identifier,
                        description=metric.description,
                        in_source=metric.definition["in_source"],
                        extra_keys=metric.definition["extra_keys"]
                        if "extra_keys" in metric.definition
                        else None,
                        type=metric.definition["type"],
                        expires=metric.definition["expires"],
                    ),
                    metric_annotation,
                    app_tags,
                    full=False,
                )

                if metric.definition["origin"] != app_name:
                    base_definition.update({"origin": metric.definition["origin"]})

                # metrics with associated pings
                metric_pings["data"].append(
                    dict(base_definition, pings=metric.definition["send_in_pings"])
                )

                # the summary of metrics
                app_data["metrics"].append(base_definition)

                # the full metric definition
                app_metrics[metric.identifier] = _incorporate_annotation(
                    dict(
                        metric.definition,
                        name=metric.identifier,
                        # convert send_in_pings to a list so we can sort (see below)
                        send_in_pings=list(metric.definition["send_in_pings"]),
                        repo_url=app.app["url"],
                        variants=[],
                    ),
                    metric_annotation,
                    app_tags,
                    full=True,
                )

                # sort "send in pings" alphanumerically, except that `metrics`
                # should always be first if present
                ping_priority = {"metrics": 0}
                app_metrics[metric.identifier]["send_in_pings"].sort()
                app_metrics[metric.identifier]["send_in_pings"].sort(
                    key=lambda ping: ping_priority.get(ping, 1)
                )

            metric_type = metric.definition["type"]
            metric_name_snakecase = stringcase.snakecase(metric.identifier)
            bigquery_column_name = (
                f"{metric.bq_prefix}.{metric_name_snakecase}"
                if metric.bq_prefix
                else f"metrics.{metric_type}.{metric_name_snakecase}"
            )

            # BigQuery and Looker metadata is ping based
            ping_data = {}
            bigquery_stable_ping_tables = []
            for ping in metric.definition["send_in_pings"]:
                ping_name_snakecase = stringcase.snakecase(ping)
                table_name = f"{app.app['bq_dataset_family']}.{ping_name_snakecase}"
                ping_data[ping] = {"bigquery_table": table_name}
                base_looker_explore_name = "event_counts" if ping == "events" else ping
                base_looker_explore_link = (
                    get_looker_event_count_explore_url(
                        looker_namespaces, app_name, app.app.get("app_channel")
                    )
                    if ping == "events"
                    else get_looker_ping_explore_url(
                        looker_namespaces, app_name, ping, table_name, app.app.get("app_channel")
                    )
                )
                # we deliberately don't show looker information for deprecated applications
                if not app_is_deprecated and base_looker_explore_link:
                    looker_metric_link = None
                    if metric_type == "event":
                        (metric_category, metric_name) = metric.identifier.split(".", 1)
                        looker_metric_link = (
                            base_looker_explore_link
                            + f"&f[events.event_name]=%22{metric_name}%22"
                            + f"&f[events.event_category]=%22{metric_category}%22"
                        )
                    # for counters, we can use measures directly
                    if metric_type == "counter":
                        looker_metric_link = (
                            base_looker_explore_link
                            + "&fields="
                            + ",".join(
                                [
                                    f"{ping_name_snakecase}.submission_date",
                                    f"{ping_name_snakecase}.{metric_name_snakecase}",
                                ]
                            )
                        )
                    elif metric_type == "labeled_counter":
                        counter_field_base = (
                            f"{ping_name_snakecase}"
                            + "__metrics__labeled_counter__"
                            + f"{metric_name_snakecase}"
                        )
                        looker_metric_link = (
                            base_looker_explore_link
                            + "&fields="
                            + ",".join(
                                [
                                    f"{ping_name_snakecase}.submission_date",
                                    f"{counter_field_base}.label",
                                    f"{counter_field_base}.count",
                                ]
                            )
                            + f"&pivots={counter_field_base}.label"
                        )
                    elif metric_type in SUPPORTED_LOOKER_METRIC_TYPES:
                        base_looker_dimension_name = "{}.{}".format(
                            ping_name_snakecase, bigquery_column_name.replace(".", "__")
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
                            looker_metric_link = (
                                base_looker_explore_link
                                + "&fields="
                                + ",".join(
                                    [
                                        f"{ping_name_snakecase}.submission_date",
                                        custom_field_name,
                                    ]
                                )
                                + "&dynamic_fields="
                                + urllib.parse.quote_plus(json.dumps(dynamic_fields))
                            )
                        else:
                            # otherwise pivoting on the dimension is the best we can do (this works
                            # well for boolean measures)
                            looker_metric_link = (
                                base_looker_explore_link
                                + "&fields="
                                + ",".join(
                                    [
                                        f"{ping_name_snakecase}.submission_date",
                                        base_looker_dimension_name,
                                        (
                                            f"{ping_name_snakecase}.clients"
                                            if ping in pings_with_client_id
                                            else f"{ping_name_snakecase}.ping_count"
                                        ),
                                    ]
                                )
                                + f"&pivots={base_looker_dimension_name}"
                            )

                    if looker_metric_link:
                        ping_data[ping]["looker"] = {
                            "base": {
                                "name": base_looker_explore_name,
                                "url": base_looker_explore_link,
                            },
                            "metric": {
                                "name": metric.identifier,
                                "url": f"{looker_metric_link}&toggle=vis",
                            },
                        }
                # GLAM data is similarly per application and per ping (well,
                # only the metrics ping right now), when it exists
                app_supports_glam = GLAM_PRODUCT_MAPPINGS.get(app.app_id)
                if not GLAM_PRODUCT_MAPPINGS.get(app.app_id):
                    ping_data[ping][
                        "glam_unsupported_reason"
                    ] = "This application is not supported by GLAM."
                elif metric.bq_prefix in ["client_info", "ping_info"]:
                    ping_data[ping][
                        "glam_unsupported_reason"
                    ] = "Internal Glean metrics are not supported by GLAM."
                elif metric_type not in SUPPORTED_GLAM_METRIC_TYPES:
                    ping_data[ping][
                        "glam_unsupported_reason"
                    ] = f"Currently GLAM does not support `{metric_type}` metrics."
                elif ping != "metrics":
                    ping_data[ping][
                        "glam_unsupported_reason"
                    ] = f"Metrics sent in the `{ping}` ping are not supported by GLAM."
                else:
                    (glam_product, glam_app_id) = GLAM_PRODUCT_MAPPINGS[app.app_id]
                    glam_metric_id = etl_snake_case(metric.identifier)
                    ping_data[ping]["glam_url"] = (
                        "https://glam.telemetry.mozilla.org/"
                        + f"{glam_product}/probe/{glam_metric_id}/explore"
                        + f"?app_id={glam_app_id}"
                    )

            etl = dict(
                ping_data=ping_data,
                bigquery_column_name=bigquery_column_name,
            )

            app_metrics[metric.identifier]["variants"].append(
                dict(
                    id=app.app_id,
                    channel=app.app.get("app_channel", "release"),
                    description=get_app_variant_description(app),
                    etl=etl,
                )
            )

    # write ping descriptions, resorting the app-specific parts in user preference order
    for ping_data in app_data["pings"]:
        ping_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
        open(os.path.join(app_ping_dir, f"{ping_data['name']}.json"), "w").write(
            json.dumps(
                _incorporate_annotation(
                    dict(
                        ping_data,
                        metrics=[
                            metric
                            for metric in metric_pings["data"]
                            if ping_data["name"] in metric["pings"]
                        ],
                        tag_descriptions=app_tags,
                    ),
                    _get_annotation(
                        annotations_index, ping_data["origin"], "pings", ping_data["name"]
                    ),
                    app_tags,
                    full=True,
                ),
                default=_serialize_sets,
            )
        )

    # write metrics, resorting the app-specific parts in user preference order
    for metric_data in app_metrics.values():
        metric_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
        open(
            os.path.join(app_metrics_dir, f"{_normalize_metrics(metric_data['name'])}.json"), "w"
        ).write(
            json.dumps(
                metric_data,
                default=_serialize_sets,
            )
        )

    # write tag metadata (if any)
    if app_annotation and app_annotation.get("tags"):
        tags = [{"name": k, "description": v} for (k, v) in app_annotation["tags"].items()]
        app_data["tags"] = tags
        for tag in tags:
            tag_metrics = [
                metric for metric in app_data["metrics"] if tag["name"] in metric.get("tags", [])
            ]
            tag["metric_count"] = len(tag_metrics)
    else:
        app_data["tags"] = []

    # sort the information in the app-level summary, then write it out
    # (we don't sort application id information, that's already handled
    # above)
    for key in ["tags", "metrics", "pings"]:
        if app_data.get(key):
            app_data[key].sort(key=lambda v: v["name"])
            # for tags, put those with no metrics associated with them at the
            # end
            if key == "tags":
                app_data[key].sort(key=lambda v: v["metric_count"] > 0, reverse=True)

    open(os.path.join(app_dir, "index.json"), "w").write(
        json.dumps(
            _incorporate_annotation(
                app_data, app_annotation.get("app", {}), app_tags, app=True, full=True
            )
        )
    )
