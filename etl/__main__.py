#!/usr/bin/env python3

import json
import os
import sys

import requests
import stringcase
import yaml

from .bigquery import get_bigquery_column_name, get_bigquery_ping_table_name
from .glam import SUPPORTED_GLAM_METRIC_TYPES, get_glam_metadata_for_metric
from .glean import GleanApp
from .looker import get_looker_explore_metadata_for_metric, get_looker_explore_metadata_for_ping
from .search import create_metrics_search_js

OUTPUT_DIRECTORY = os.path.join("public", "data")
FUNCTIONS_DIRECTORY = ".netlify"
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


def _incorporate_annotation(item, item_annotation, app=False, full=False):
    incorporated = dict(item, has_annotation=len(item_annotation) > 0)

    # handle tags, which are in a slightly different format than other types
    # of annotations (and we want to apply to both full and non-full)
    if not app and item_annotation.get("tags"):
        # annotation tags always take precedence over any tags defined in
        # metrics.yaml
        incorporated.update({"tags": item_annotation["tags"]})

    if full:
        # other annotations are only applied to the full version (not the
        # summaries we list out in various places)
        for annotation_type in ["commentary", "warning"]:
            if item_annotation.get(annotation_type):
                incorporated[annotation_type] = item_annotation[annotation_type]

    return incorporated


def _expand_tags(item, tag_descriptions):
    """
    Expand the tags into full name/description objects (for full definitions)
    """
    return dict(
        item,
        tags=[
            {"name": tag_name, "description": tag_descriptions[tag_name]}
            for tag_name in item["tags"]
        ],
    )


def get_resource_path(line: str) -> str:
    return line.replace(".", "_")


def get_app_variant_description(app):
    """
    Gets a description of app variants (intended for use inside dropdowns)
    """
    description = app.app.get("app_channel", "release")
    # Make it obvious if a variant should no longer be used.
    if app.app.get("deprecated"):
        description = f"[Deprecated] {description}"
    return description


def main():
    # Pull down the annotations
    annotations_index = requests.get(ANNOTATIONS_URL).json()
    looker_namespaces = yaml.safe_load(requests.get(NAMESPACES_URL).text)

    # Then, get the apps we're using
    apps = [app for app in GleanApp.get_apps()]

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
    open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), "w").write(
        json.dumps(list(app_groups.values()))
    )

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

            # app-id tags: tags specified in the annotations (and or more recent versions of an app)
            # will always override older ones
            for tag in app.get_tags():
                if not app_tags.get(tag.identifier):
                    app_tags[tag.identifier] = tag.description

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
                                tags=ping.tags,
                                variants=[],
                            ),
                            _get_annotation(
                                annotations_index,
                                ping.definition["origin"],
                                "pings",
                                ping.identifier,
                            ),
                        )
                    )

                ping_data = next(pd for pd in app_data["pings"] if pd["name"] == ping.identifier)

                if ping_data["include_client_id"]:
                    pings_with_client_id.add(ping_data["name"])

                # write table description (app variant specific)
                ping_name_snakecase = stringcase.snakecase(ping.identifier)
                stable_ping_table_name = f"{app.app['bq_dataset_family']}.{ping_name_snakecase}"
                live_ping_table_name = (
                    f"{app.app['bq_dataset_family']}_live.{ping_name_snakecase}_v1"
                )
                bq_path = (
                    f"{app.app['document_namespace']}/{ping.identifier}/{ping.identifier}.1.bq"
                )
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
                looker_explore = get_looker_explore_metadata_for_ping(
                    looker_namespaces, app, app_group, ping
                )
                if not app_is_deprecated and looker_explore:
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
                            tags=metric.tags,
                            in_source=metric.definition["in_source"],
                            extra_keys=metric.definition["extra_keys"]
                            if "extra_keys" in metric.definition
                            else None,
                            type=metric.definition["type"],
                            expires=metric.definition["expires"],
                        ),
                        metric_annotation,
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
                    app_metrics[metric.identifier] = _expand_tags(
                        _incorporate_annotation(
                            dict(
                                metric.definition,
                                name=metric.identifier,
                                tags=metric.tags,
                                # convert send_in_pings to a list so we can sort (see below)
                                send_in_pings=list(metric.definition["send_in_pings"]),
                                repo_url=app.app["url"],
                                variants=[],
                            ),
                            metric_annotation,
                            full=True,
                        ),
                        app_tags,
                    )

                    # sort "send in pings" alphanumerically, except that `metrics`
                    # should always be first if present and `deletion-request`
                    # should be last
                    ping_priority = {"metrics": 0, "deletion-request": 2}
                    app_metrics[metric.identifier]["send_in_pings"].sort()
                    app_metrics[metric.identifier]["send_in_pings"].sort(
                        key=lambda ping: ping_priority.get(ping, 1)
                    )

                # BigQuery and Looker metadata is ping based
                ping_data = {}
                for ping_name in metric.definition["send_in_pings"]:
                    ping_data[ping_name] = {
                        "bigquery_table": get_bigquery_ping_table_name(
                            app.app["bq_dataset_family"], ping_name
                        )
                    }
                    # FIXME: if we allow the metadata format to change, we can
                    # just set it up all in one go above
                    looker_metadata = get_looker_explore_metadata_for_metric(
                        looker_namespaces,
                        app,
                        app_group,
                        metric,
                        ping_name,
                        ping_name in pings_with_client_id,
                    )
                    if looker_metadata:
                        ping_data[ping_name].update({"looker": looker_metadata})
                    glam_metadata = get_glam_metadata_for_metric(app, metric, ping_name)
                    ping_data[ping_name].update(glam_metadata)

                etl = dict(
                    ping_data=ping_data,
                    bigquery_column_name=get_bigquery_column_name(metric),
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
                    _expand_tags(
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
                            full=True,
                        ),
                        app_tags,
                    ),
                    default=_serialize_sets,
                )
            )

        # write metrics, resorting the app-specific parts in user preference order
        for metric_data in app_metrics.values():
            metric_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
            open(
                os.path.join(app_metrics_dir, f"{_normalize_metrics(metric_data['name'])}.json"),
                "w",
            ).write(
                json.dumps(
                    metric_data,
                    default=_serialize_sets,
                )
            )

        # write tag metadata (if any)
        if app_tags:
            tags = [{"name": k, "description": v} for (k, v) in app_tags.items()]
            app_data["tags"] = tags
            for tag in tags:
                tag_metrics = [
                    metric
                    for metric in app_data["metrics"]
                    if tag["name"] in metric.get("tags", [])
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
                    app_data, app_annotation.get("app", {}), app=True, full=True
                )
            )
        )

        # write a search index for the app
        open(os.path.join(FUNCTIONS_DIRECTORY, f"metrics_search_{app_name}.js"), "w").write(
            create_metrics_search_js(app_metrics.values(), legacy=False)
        )

    # also write some metadata for use by the netlify functions
    open(os.path.join(FUNCTIONS_DIRECTORY, "supported_glam_metric_types.json"), "w").write(
        json.dumps(list(SUPPORTED_GLAM_METRIC_TYPES))
    )


if __name__ == "__main__":
    main()
