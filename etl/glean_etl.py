import os

import copy
import requests
import stringcase
import yaml

from .bigquery import get_bigquery_column_name, get_bigquery_ping_table_name
from .expiry import get_expiry_text, get_mapped_expiry
from .glam import SUPPORTED_GLAM_METRIC_TYPES, get_glam_metadata_for_metric
from .glean import GleanApp
from .looker import (
    get_looker_explore_metadata_for_metric,
    get_looker_explore_metadata_for_ping,
    get_looker_monitoring_metadata_for_event,
)
from .search import create_metrics_search_js
from .utils import dump_json, get_event_name_and_category
from .glean_auto_events import get_auto_events_for_app, get_auto_events_names

# Various additional sources of metadata
ANNOTATIONS_URL = os.getenv(
    "ANNOTATIONS_URL", "https://mozilla.github.io/glean-annotations/api.json"
)
NAMESPACES_URL = os.getenv(
    "NAMESPACES_URL", "https://raw.githubusercontent.com/mozilla/looker-hub/main/namespaces.yaml"
)
FIREFOX_PRODUCT_DETAIL_URL = os.getenv(
    "FIREFOX_PRODUCT_DETAIL_URL",
    "https://product-details.mozilla.org/1.0/firefox_history_major_releases.json",
)
EXPERIMENT_DATA_URL = os.getenv(
    "EXPERIMENT_DATA_URL",
    "https://experimenter.services.mozilla.com/api/v6/experiments/",
)
EXPERIMENTER_URL_TEMPLATE = "https://experimenter.services.mozilla.com/nimbus/{}/summary"

# Priority for getting metric data (use the later definitions of nightly over release)
METRIC_CHANNEL_PRIORITY = {"nightly": 1, "beta": 2, "release": 3, "esr": 4}
# Priority for sorting app ids in the UI (of anticipated relevance to the suer)
USER_CHANNEL_PRIORITY = {"release": 1, "beta": 2, "nightly": 3, "esr": 4}

# Certain words are blocked by uBlock Origin, so we need to map them to something else
# to avoid the page being blocked
# See: https://github.com/mozilla/glean-dictionary/issues/1682
UBLOCK_ORIGIN_PRIVACY_FILTER = {"ad_impression": "advert_impression"}


def _normalize_metrics(name):
    # replace . with _ so sirv doesn't think that
    # a metric is a file
    metric_name = name.replace(".", "_")

    for key, value in UBLOCK_ORIGIN_PRIVACY_FILTER.items():
        if key in metric_name:
            metric_name = metric_name.replace(key, value)

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
    if app:
        # app annotations have some special properties
        if item_annotation.get("logo"):
            # the logo is dowloaded locally elsewhere
            incorporated.update(
                {"logo": f"/data/{item['app_name']}/" + _get_logo_filename(item_annotation["logo"])}
            )

        if item_annotation.get("featured"):
            incorporated["featured"] = True

        # we use the `app_tags` property to disambiguate between the tags
        # that are a property of an application vs. the list of tags that
        # it has (and can be applied to other things)
        if item_annotation.get("tags"):
            incorporated["app_tags"] = item_annotation["tags"]
    elif item_annotation.get("tags"):
        # for non-apps, just use the tags from the annotation directly, if they
        # exist
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
            {"name": tag_name, "description": tag_descriptions.get(tag_name, "Unknown tag")}
            for tag_name in item["tags"]
        ],
    )


def _get_resource_path(line: str) -> str:
    return line.replace(".", "_")


def _get_logo_filename(logo_url: str) -> str:
    _, file_extension = os.path.splitext(logo_url)
    return f"logo{file_extension}"


def _get_app_variant_description(app):
    """
    Gets a description of app variants (intended for use inside dropdowns)
    """
    description = app.app.get("app_channel", "release")
    # Make it obvious if a variant should no longer be used.
    if app.app.get("deprecated"):
        description = f"[Deprecated] {description}"
    return description


def _get_metric_sample_data(experiment_data) -> dict:
    # get experiment metric sampling data to enrich metric definitions
    interesting_experiments = [
        experiment for experiment in experiment_data if "glean" in experiment["featureIds"]
    ]
    active_experiments = [
        experiment
        for experiment in interesting_experiments
        if (experiment["startDate"] is not None or experiment["isEnrollmentPaused"] is False)
        and experiment["endDate"] is None
    ]
    sampling_data = {}
    for experiment in active_experiments:
        app_name = experiment["appName"]
        bucket_config = experiment["bucketConfig"]
        sample_size = bucket_config["count"] / bucket_config["total"]
        channel = experiment["channel"]
        sampling_data[app_name] = sampling_data.get(app_name, {})
        for branch in experiment["branches"]:
            feature_configs = branch["features"]
            filtered_configs = [
                config for config in feature_configs if config["featureId"] == "glean"
            ]
            metric_config = [
                config["value"]["gleanMetricConfiguration"]
                for config in filtered_configs
                if config["value"].get("gleanMetricConfiguration") is not None
            ]
            for entry in metric_config:
                for key in entry:
                    sampling_data[app_name][key] = sampling_data[app_name].get(key, {})
                    sampling_data[app_name][key][channel] = sampling_data[app_name][key].get(
                        channel, {}
                    )
                    sampling_data[app_name][key][channel]["sample_size"] = sample_size
                    sampling_data[app_name][key][channel]["experiment_id"] = experiment["slug"]
                    sampling_data[app_name][key][channel]["start_date"] = experiment["startDate"]
                    sampling_data[app_name][key][channel]["end_date"] = experiment["endDate"]
                    sampling_data[app_name][key][channel]["targeting"] = experiment["targeting"]
                    sampling_data[app_name][key][channel]["experimenter_link"] = (
                        EXPERIMENTER_URL_TEMPLATE.format(experiment["slug"])
                    )

    return sampling_data


def _is_metric_in_ping(metric, ping_data):
    if not ping_data["name"] in metric["pings"]:
        return False
    if metric["name"] == "client_id":
        return ping_data['include_client_id']
    if metric["is_part_of_info_section"]:
        try:
            return ping_data["include_info_sections"]
        except KeyError:
            return True
    return True


def write_glean_metadata(output_dir, functions_dir, app_names=None):
    """
    Writes out the metadata for use by the dictionary
    """
    # first, get the basic metadata from various sources
    annotations_index = requests.get(ANNOTATIONS_URL).json()
    looker_namespaces = yaml.safe_load(requests.get(NAMESPACES_URL).text)
    product_details = requests.get(FIREFOX_PRODUCT_DETAIL_URL).json()
    latest_fx_release_version = list(product_details)[-1]
    metrics_sampling_info = _get_metric_sample_data(requests.get(EXPERIMENT_DATA_URL).json())

    # Then, get the apps we're using
    apps = [app for app in GleanApp.get_apps()]
    if app_names:
        apps = [app for app in apps if app.app_name in app_names]

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

    # Process each grouping of apps into a set of summaries, app details, and all the rest
    app_summaries = []
    for app_name, app_group in app_groups.items():
        app_dir = os.path.join(output_dir, app_name)
        (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir) = (
            os.path.join(app_dir, subtype) for subtype in ("app_ids", "pings", "tables", "metrics")
        )
        for directory in (app_id_dir, app_ping_dir, app_table_dir, app_metrics_dir):
            os.makedirs(directory, exist_ok=True)

        app_annotation = _get_annotation(annotations_index, app_name, "app")

        # Create a summary (used in the top-level list of apps, and base metadata for the
        # app detail page)
        app_summary = _incorporate_annotation(app_group, app_annotation.get("app", {}), app=True)

        if app_summary.get("logo"):
            with open(os.path.join(app_dir, _get_logo_filename(app_summary["logo"])), "wb") as f:
                # want the original URL for getting the logo
                f.write(requests.get(app_annotation["app"]["logo"]).content)

        # An application group is considered a prototype only if all its application ids are
        if all([app_id.get("prototype") for app_id in app_group["app_ids"]]):
            app_summary["prototype"] = True

        # add the summary application to the app list
        app_summaries.append(app_summary)

        # Now get more detail on the application for the detail page and all the metrics
        app_data = dict(app_summary, pings=[], metrics=[])
        app_tags_for_objects = app_annotation.get(
            "tags", {}
        )  # tags for objects in the app (e.g. metrics)
        app_tags_for_app = app_summary.get("app_tags", [])  # tags for the app itself

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
                if not app_tags_for_objects.get(tag.identifier):
                    app_tags_for_objects[tag.identifier] = tag.description

            # information about this app_id
            open(os.path.join(app_id_dir, f"{_get_resource_path(app_id)}.json"), "w").write(
                dump_json(dict(app.app, app_tags=app_tags_for_app))
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
                    description=_get_app_variant_description(app),
                    table=stable_ping_table_name,
                    channel=app_channel if app_channel else "release",
                )
                looker_explore = get_looker_explore_metadata_for_ping(
                    looker_namespaces, app, app_group, ping
                )
                if not app_is_deprecated and looker_explore:
                    variant_data.update({"looker_explore": looker_explore})
                ping_data["variants"].append(variant_data)
                app_variant_table_dir = os.path.join(app_table_dir, _get_resource_path(app.app_id))
                os.makedirs(app_variant_table_dir, exist_ok=True)
                open(os.path.join(app_variant_table_dir, f"{ping.identifier}.json"), "w").write(
                    dump_json(
                        dict(
                            bq_definition=bq_definition,
                            bq_schema=bq_schema,
                            live_table=live_ping_table_name,
                            name=ping.identifier,
                            stable_table=stable_ping_table_name,
                            app_id=app_id,
                            canonical_app_name=app.app["canonical_app_name"],
                            app_tags=app_tags_for_app,
                        )
                    )
                )

            # metrics data
            metrics = app.get_metrics()
            app_sampling_info = metrics_sampling_info.get(app_name)
            for metric in metrics:
                if metric.identifier not in metric_identifiers_seen:
                    metric_identifiers_seen.add(metric.identifier)

                    # read the annotation, if any
                    metric_annotation = _get_annotation(
                        annotations_index, metric.definition["origin"], "metrics", metric.identifier
                    )

                    metric_sample_info: dict | None = (
                        dict(app_sampling_info.get(metric.identifier))
                        if app_sampling_info is not None
                        and app_sampling_info.get(metric.identifier) is not None
                        else None
                    )
                    is_sampled = metric_sample_info is not None

                    if is_sampled:
                        for channel in metric_sample_info:
                            sampled_text = (
                                str(metric_sample_info.get(channel)["sample_size"] * 100)
                                + "% "
                                + "on"
                                if metric.definition["disabled"] is True
                                else str(metric_sample_info.get(channel)["sample_size"] * 100)
                                + "% "
                                + "off"
                            )
                            metric_sample_info.get(channel)["sampled_text"] = sampled_text

                    base_definition = _incorporate_annotation(
                        dict(
                            name=metric.identifier,
                            description=metric.description,
                            tags=metric.tags,
                            in_source=metric.definition["in_source"],
                            latest_fx_release_version=latest_fx_release_version,
                            extra_keys=metric.definition["extra_keys"]
                            if "extra_keys" in metric.definition
                            else None,
                            type=metric.definition["type"],
                            expires=get_mapped_expiry(
                                metric.definition["expires"], app_name, product_details
                            ),
                            expiry_text=get_expiry_text(
                                metric.definition["expires"], app_name, product_details
                            ),
                            sampled=is_sampled,
                            sampled_text=(metric_sample_info.get("release")["sampled_text"])
                            if metric_sample_info is not None
                            else "Not sampled",
                            is_part_of_info_section=metric.bq_prefix == "client_info",
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
                                expires=base_definition["expires"],
                                latest_fx_release_version=latest_fx_release_version,
                                expiry_text=base_definition["expiry_text"],
                                canonical_app_name=app.app["canonical_app_name"],
                                app_tags=app_tags_for_app,
                                sampling_info=metric_sample_info,
                            ),
                            metric_annotation,
                            full=True,
                        ),
                        app_tags_for_objects,
                    )

                    if metric.definition["type"] == "event":
                        app_metrics[metric.identifier]["event_info"] = {
                            "name": get_event_name_and_category(metric.identifier)[1],
                            "category": get_event_name_and_category(metric.identifier)[0],
                        }

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

                    event_monitoring_metadata = get_looker_monitoring_metadata_for_event(
                        app, app_group, metric
                    )
                    if event_monitoring_metadata:
                        ping_data[ping_name].update({"event_monitoring": event_monitoring_metadata})

                etl = dict(
                    ping_data=ping_data,
                    bigquery_column_name=get_bigquery_column_name(metric),
                )

                app_metrics[metric.identifier]["variants"].append(
                    dict(
                        id=app.app_id,
                        channel=app.app.get("app_channel", "release"),
                        description=_get_app_variant_description(app),
                        etl=etl,
                    )
                )

        # write ping descriptions, resorting the app-specific parts in user preference order
        for ping_data in app_data["pings"]:
            ping_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
            open(os.path.join(app_ping_dir, f"{ping_data['name']}.json"), "w").write(
                dump_json(
                    _expand_tags(
                        _incorporate_annotation(
                            dict(
                                ping_data,
                                metrics=[
                                    metric
                                    for metric in metric_pings["data"]
                                    if _is_metric_in_ping(metric, ping_data)
                                ],
                                tag_descriptions=app_tags_for_objects,
                                canonical_app_name=app.app["canonical_app_name"],
                                app_tags=app_tags_for_app,
                            ),
                            _get_annotation(
                                annotations_index, ping_data["origin"], "pings", ping_data["name"]
                            ),
                            full=True,
                        ),
                        app_tags_for_objects,
                    )
                )
            )

        if "glean.element_click" in app_metrics:
            auto_events_all_apps = get_auto_events_names()
            auto_events_for_app = get_auto_events_for_app(app_name, auto_events_all_apps)
            app_data["metrics"].extend(auto_events_for_app)
            element_click_base = copy.deepcopy(app_metrics["glean.element_click"])
            for auto_event in auto_events_for_app:
                element_click_base["name"] = auto_event["name"]
                element_click_base["description"] = auto_event["description"]
                element_click_base["event_info"].update(auto_event["event_info"])
                app_metrics[auto_event["name"]] = copy.deepcopy(element_click_base)

        # write metrics, resorting the app-specific parts in user preference order
        for metric_data in app_metrics.values():
            metric_data["variants"].sort(key=lambda v: USER_CHANNEL_PRIORITY[v["channel"]])
            open(
                os.path.join(app_metrics_dir, f"{_normalize_metrics(metric_data['name'])}.json"),
                "w",
            ).write(dump_json(metric_data))

        # write tag metadata (if any)
        if app_tags_for_objects:
            tags = [{"name": k, "description": v} for (k, v) in app_tags_for_objects.items()]
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
            dump_json(
                _incorporate_annotation(
                    app_data, app_annotation.get("app", {}), app=True, full=True
                )
            )
        )

        # write a search index for the app
        open(os.path.join(functions_dir, f"metrics_search_{app_name}.js"), "w").write(
            create_metrics_search_js(app_metrics.values(), app_name, legacy=False)
        )

        # export FOG data to a separate file for the FOG + legacy search index
        if app_name == "firefox_desktop":
            open(os.path.join(functions_dir, "metrics_search_fog.js"), "w").write(
                create_metrics_search_js(app_metrics.values(), app_name="fog", legacy=False)
            )

    # Write out a list of app groups (for the landing page)
    # put "featured" apps first, then sort by name
    open(os.path.join(output_dir, "apps.json"), "w").write(
        dump_json(
            sorted(
                sorted(app_summaries, key=lambda s: s["app_name"]),
                key=lambda s: s.get("featured", False),
                reverse=True,
            )
        )
    )

    # also write some metadata for use by the netlify functions
    open(os.path.join(functions_dir, "supported_glam_metric_types.json"), "w").write(
        dump_json(list(SUPPORTED_GLAM_METRIC_TYPES))
    )
