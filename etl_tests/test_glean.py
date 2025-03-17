import pytest

from etl.glean import GleanMetric
from etl.glean_etl import _get_metric_sample_data, _is_metric_in_ping


@pytest.fixture
def activeticks_metric_definition():
    # taken verbatim from https://probeinfo.telemetry.mozilla.org/glean/firefox-desktop/metrics
    # on 2022/01/19
    return {
        "history": [
            {
                "_config": {"allow_reserved": False, "do_not_disable_expired": True},
                "bugs": [
                    "https://bugzilla.mozilla.org/show_bug.cgi?id=1376942",
                    "https://bugzilla.mozilla.org/show_bug.cgi?id=1545172",
                    "https://bugzilla.mozilla.org/show_bug.cgi?id=1741674",
                ],
                "data_reviews": ["https://bugzilla.mozilla.org/show_bug.cgi?id=1545172#c8"],
                "data_sensitivity": ["interaction"],
                "dates": {"first": "2021-11-22 20:07:38", "last": "2021-11-22 20:07:38"},
                "description": "The number of five-second intervals ('ticks') the user was considered\n'active'.\n\n'active' means keyboard or mouse interaction with the application.\nIt doesn't take into account whether or not the window has focus or is in\nthe foreground, only if it is receiving these interaction events.\n\nMigrated from Telemetry's `browser.engagement.active_ticks`.\n",  # NOQA
                "disabled": False,
                "expires": "100",
                "gecko_datapoint": "",
                "git-commits": {
                    "first": "5ee06317749a5e9b7f5ee801981c2f2ed088494d",
                    "last": "5ee06317749a5e9b7f5ee801981c2f2ed088494d",
                },
                "lifetime": "ping",
                "metadata": {},
                "no_lint": ["BASELINE_PING"],
                "notification_emails": ["loines@mozilla.com"],
                "reflog-index": {"first": 3, "last": 3},
                "send_in_pings": ["baseline", "metrics"],
                "source_url": "https://github.com/mozilla/gecko-dev/blob/5ee06317749a5e9b7f5ee801981c2f2ed088494d/browser/modules/metrics.yaml#L12",  # NOQA
                "type": "counter",
                "version": 0,
            },
            {
                "_config": {"allow_reserved": False, "do_not_disable_expired": True},
                "bugs": [
                    "https://bugzilla.mozilla.org/show_bug.cgi?id=1376942",
                    "https://bugzilla.mozilla.org/show_bug.cgi?id=1545172",
                    "https://bugzilla.mozilla.org/show_bug.cgi?id=1741674",
                ],
                "data_reviews": ["https://bugzilla.mozilla.org/show_bug.cgi?id=1545172#c8"],
                "data_sensitivity": ["interaction"],
                "dates": {"first": "2022-01-14 16:43:08", "last": "2022-01-18 18:47:57"},
                "description": "The number of five-second intervals ('ticks') the user was considered\n'active'.\n\n'active' means keyboard or mouse interaction with the application.\nIt doesn't take into account whether or not the window has focus or is in\nthe foreground, only if it is receiving these interaction events.\n\nMigrated from Telemetry's `browser.engagement.active_ticks`.\n",  # NOQA
                "disabled": False,
                "expires": "100",
                "gecko_datapoint": "",
                "git-commits": {
                    "first": "cf406dbbc98af4ebf97625449eebe9b052d55400",
                    "last": "d4b9c457db637fde655592d9e2048939b7ab2854",
                },
                "lifetime": "ping",
                "metadata": {"tags": ["Firefox :: General"]},
                "no_lint": ["BASELINE_PING"],
                "notification_emails": ["loines@mozilla.com"],
                "reflog-index": {"first": 2, "last": 0},
                "send_in_pings": ["baseline", "metrics"],
                "source_url": "https://github.com/mozilla/gecko-dev/blob/cf406dbbc98af4ebf97625449eebe9b052d55400/browser/modules/metrics.yaml#L12",  # NOQA
                "type": "counter",
                "version": 0,
            },
        ],
        "in-source": True,
        "name": "browser.engagement.active_ticks",
        "type": "counter",
        "origin": "firefox-desktop",  # this is normally added in ETL
    }


def test_glean_metric(activeticks_metric_definition):
    metric = GleanMetric(
        activeticks_metric_definition["name"], activeticks_metric_definition, ping_names=["metrics"]
    )
    # the latest revision is the only one with tags
    assert metric.definition.get("metadata") == {"tags": ["Firefox :: General"]}
    # first seen should be the *earliest* revision
    assert metric.definition["date_first_seen"] == "2021-11-22 20:07:38"


@pytest.fixture
def sample_data_definition() -> dict:
    return {
        "experimentList": [
            {
                "schemaVersion": "1.12.0",
                "slug": "pocket-newtab-spocs-cache-rollout-50",
                "id": "pocket-newtab-spocs-cache-rollout-50",
                "arguments": {},
                "application": "firefox-desktop",
                "appName": "firefox_desktop",
                "appId": "firefox-desktop",
                "channel": "release",
                "userFacingName": "Pocket Newtab Spocs Cache Rollout 50",
                "userFacingDescription": "A Pocket new tab cache duration change.",
                "isEnrollmentPaused": False,
                "isRollout": True,
                "bucketConfig": {
                    "randomizationUnit": "normandy_id",
                    "namespace": "firefox-desktop-pocketNewtab-release-pocket_common-rollout-1",
                    "start": 0,
                    "count": 2500,
                    "total": 10000,
                },
                "featureIds": ["pocketNewtab"],
                "probeSets": [],
                "outcomes": [{"slug": "pocket_newtab", "priority": "primary"}],
                "branches": [
                    {
                        "slug": "rollout",
                        "ratio": 1,
                        "feature": {
                            "featureId": "this-is-included-for-desktop-pre-95-support",
                            "enabled": False,
                            "value": {},
                        },
                        "features": [
                            {
                                "featureId": "pocketNewtab",
                                "enabled": True,
                                "value": {"spocsCacheTimeout": 15},
                            }
                        ],
                    }
                ],
                "targeting": "",
                "startDate": "2023-03-01",
                "enrollmentEndDate": {},
                "endDate": "2023-07-25",
                "proposedDuration": 28,
                "proposedEnrollment": 7,
                "referenceBranch": "rollout",
                "featureValidationOptOut": False,
                "localizations": {},
                "locales": ["en-GB", "en-CA", "en-US"],
            },
            {
                "schemaVersion": "1.12.0",
                "slug": "pocket-newtab-topics-widget",
                "id": "pocket-newtab-topics-widget",
                "arguments": {},
                "application": "firefox-desktop",
                "appName": "firefox_desktop",
                "appId": "firefox-desktop",
                "channel": "release",
                "userFacingName": "Pocket Newtab Topics Widget",
                "userFacingDescription": "A Pocket new tab visual change.",
                "isEnrollmentPaused": True,
                "isRollout": False,
                "bucketConfig": {
                    "randomizationUnit": "normandy_id",
                    "namespace": "firefox-desktop-pocketNewtab-release-1",
                    "start": 4000,
                    "count": 200,
                    "total": 10000,
                },
                "featureIds": ["pocketNewtab"],
                "probeSets": [],
                "outcomes": [{"slug": "pocket_newtab", "priority": "primary"}],
                "branches": [
                    {
                        "slug": "control",
                        "ratio": 1,
                        "feature": {
                            "featureId": "this-is-included-for-desktop-pre-95-support",
                            "enabled": False,
                            "value": {},
                        },
                        "features": [{"featureId": "pocketNewtab", "enabled": True, "value": {}}],
                    },
                    {
                        "slug": "treatment-a",
                        "ratio": 1,
                        "feature": {
                            "featureId": "this-is-included-for-desktop-pre-95-support",
                            "enabled": False,
                            "value": {},
                        },
                        "features": [
                            {
                                "featureId": "pocketNewtab",
                                "enabled": True,
                                "value": {"widgetPositions": "2"},
                            }
                        ],
                    },
                ],
                "targeting": "",
                "startDate": "2022-08-04",
                "enrollmentEndDate": "2022-08-12",
                "endDate": "2022-09-01",
                "proposedDuration": 28,
                "proposedEnrollment": 7,
                "referenceBranch": "control",
                "featureValidationOptOut": False,
                "localizations": {},
                "locales": ["en-GB", "en-CA", "en-US"],
            },
            {
                "schemaVersion": "1.12.0",
                "slug": "product-insight-telemetry-via-server-knobs-rollout-100",
                "id": "product-insight-telemetry-via-server-knobs-rollout-100",
                "arguments": {},
                "application": "firefox-desktop",
                "appName": "firefox_desktop",
                "appId": "firefox-desktop",
                "channel": "nightly",
                "userFacingName": "Product Insight Telemetry via Server Knobs - Rollout - 100%",
                "userFacingDescription": "Testing out the data and insights capture in the awesome bar.",  # noqa: E501
                "isEnrollmentPaused": False,
                "isRollout": True,
                "bucketConfig": {
                    "randomizationUnit": "normandy_id",
                    "namespace": "firefox-desktop-glean-nightly-no_targeting-rollout-1",
                    "start": 0,
                    "count": 5000,
                    "total": 10000,
                },
                "featureIds": ["glean"],
                "probeSets": [],
                "outcomes": [{"slug": "firefox_suggest", "priority": "primary"}],
                "branches": [
                    {
                        "slug": "control-rollout",
                        "ratio": 1,
                        "feature": {
                            "featureId": "this-is-included-for-desktop-pre-95-support",
                            "enabled": False,
                            "value": {},
                        },
                        "features": [
                            {
                                "featureId": "glean",
                                "enabled": True,
                                "value": {
                                    "gleanMetricConfiguration": {
                                        "urlbar.abandonment": True,
                                        "urlbar.engagement": True,
                                        "urlbar.impression": True,
                                    }
                                },
                            }
                        ],
                    }
                ],
                "targeting": "",
                "startDate": "2023-05-03",
                "enrollmentEndDate": {},
                "endDate": None,
                "proposedDuration": 28,
                "proposedEnrollment": 28,
                "referenceBranch": "control-rollout",
                "featureValidationOptOut": False,
                "localizations": {},
                "locales": ["en-US"],
            },
            {
                "schemaVersion": "1.12.0",
                "slug": "product-insight-telemetry-via-server-knobs-rollout-release",
                "id": "product-insight-telemetry-via-server-knobs-rollout-release",
                "arguments": {},
                "application": "firefox-desktop",
                "appName": "firefox_desktop",
                "appId": "firefox-desktop",
                "channel": "release",
                "userFacingName": "Product Insight Telemetry via Server Knobs - Rollout - Release",
                "userFacingDescription": "Testing out the data and insights capture in the awesome bar.",  # noqa: E501
                "isEnrollmentPaused": False,
                "isRollout": True,
                "bucketConfig": {
                    "randomizationUnit": "normandy_id",
                    "namespace": "firefox-desktop-glean-release-no_targeting-rollout-1",
                    "start": 0,
                    "count": 10000,
                    "total": 10000,
                },
                "featureIds": ["glean"],
                "probeSets": [],
                "outcomes": [{"slug": "firefox_suggest", "priority": "primary"}],
                "branches": [
                    {
                        "slug": "control-rollout",
                        "ratio": 1,
                        "feature": {
                            "featureId": "this-is-included-for-desktop-pre-95-support",
                            "enabled": False,
                            "value": {},
                        },
                        "features": [
                            {
                                "featureId": "glean",
                                "enabled": True,
                                "value": {
                                    "gleanMetricConfiguration": {
                                        "urlbar.abandonment": True,
                                        "urlbar.engagement": True,
                                        "urlbar.impression": True,
                                    }
                                },
                            }
                        ],
                    }
                ],
                "targeting": "",
                "startDate": "2023-06-06",
                "enrollmentEndDate": {},
                "endDate": None,
                "proposedDuration": 28,
                "proposedEnrollment": 28,
                "referenceBranch": "control-rollout",
                "featureValidationOptOut": False,
                "localizations": {},
                "locales": ["en-US"],
            },
        ]
    }


def test_metric_sampling(sample_data_definition: dict):
    sampling_data: dict = _get_metric_sample_data(sample_data_definition.get("experimentList"))

    print("Sampling data:" + str(sampling_data))

    test_data: dict = sampling_data.get("firefox_desktop")
    expected_metric: dict = test_data.get("urlbar.abandonment")
    nightly_channel: dict = expected_metric.get("nightly")
    release_channel: dict = expected_metric.get("release")

    assert nightly_channel is not None
    assert release_channel is not None
    assert nightly_channel.get("sample_size") == 0.5
    assert release_channel.get("sample_size") == 1


@pytest.fixture
def metric():
    return {"name": "test_metric", "pings": ["test_ping"], "is_part_of_info_section": False}


@pytest.fixture
def ping_data():
    return {"name": "test_ping", "include_client_id": False, "include_info_sections": True}


def test_is_metric_in_ping_included(metric, ping_data):
    """A metric that is not client_id and is not part of
    the info section should be included"""
    assert _is_metric_in_ping(metric, ping_data) is True


def test_is_metric_in_ping_not_included(metric, ping_data):
    """A metric that does not include the ping in the ping list should not be included"""
    metric["pings"] = ["other_ping"]
    assert _is_metric_in_ping(metric, ping_data) is False


def test_is_metric_in_ping_client_id(metric, ping_data):
    """client_id should be included in a ping that includes client_id"""
    metric["name"] = "client_id"
    ping_data["include_client_id"] = True
    assert _is_metric_in_ping(metric, ping_data) is True


def test_is_metric_in_ping_info_section(metric, ping_data):
    """A metric that is part of the info section should not be included
    in a ping that does not include info sections"""
    metric["is_part_of_info_section"] = True
    ping_data["include_info_sections"] = False
    assert _is_metric_in_ping(metric, ping_data) is False
