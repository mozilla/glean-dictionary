import pytest

from etl.glean import GleanMetric


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
