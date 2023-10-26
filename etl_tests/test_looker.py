import pytest

from etl.glean import GleanApp, GleanMetric, GleanPing
from etl.looker import get_looker_explore_metadata_for_metric, get_looker_explore_metadata_for_ping


@pytest.fixture
def fake_namespaces():
    return {"fenix": {"glean_app": True, "explores": {"metrics": {"type": "glean_ping_explore"}}}}


@pytest.fixture
def fake_ping():
    return GleanPing(
        "metrics",
        {
            "name": "metrics",
            "origin": "fenix",
            "history": [
                {"dates": {"first": "2020-01-01", "last": "2021-01-01"}, "metadata": {"tags": []}}
            ],
        },
    )


@pytest.fixture
def fake_timespan_metric():
    return GleanMetric(
        "mytimespan",
        {
            "name": "mytimespan",
            "origin": "fenix",
            "in-source": True,
            "history": [
                {
                    "metadata": {},
                    "send_in_pings": ["metrics"],
                    "type": "timespan",
                    "dates": {"first": "2020-01-01", "last": "2021-01-01"},
                }
            ],
        },
    )


@pytest.fixture
def fake_app():
    return GleanApp(
        {"app_name": "fenix", "app_id": "org.mozilla.firefox", "bq_dataset_family": "firefox"}
    )


@pytest.fixture
def fake_app_group():
    return dict(name="fenix", app_ids=["org.mozilla.firefox"])


def test_get_looker_explore_metadata_for_ping(fake_namespaces, fake_app, fake_app_group, fake_ping):
    assert get_looker_explore_metadata_for_ping(
        fake_namespaces, fake_app, fake_app_group, fake_ping
    ) == {"name": "metrics", "url": "https://mozilla.cloud.looker.com/explore/fenix/metrics"}


def test_get_looker_explore_metadata_for_timespan_metric(
    fake_namespaces, fake_app, fake_app_group, fake_ping, fake_timespan_metric
):
    assert get_looker_explore_metadata_for_metric(
        fake_namespaces,
        fake_app,
        fake_app_group,
        fake_timespan_metric,
        fake_ping.identifier,
        False,
    ) == {
        "base": {
            "name": "metrics",
            "url": "https://mozilla.cloud.looker.com/explore/fenix/metrics",
        },
        "metric": {
            "name": "mytimespan",
            "url": "https://mozilla.cloud.looker.com/explore/fenix/metrics?fields=metrics.submission_date%2Cmedian_of_mytimespan&dynamic_fields=%5B%7B%22measure%22%3A+%22median_of_mytimespan%22%2C+%22label%22%3A+%22Median+of+mytimespan%22%2C+%22based_on%22%3A+%22metrics.metrics__timespan__mytimespan__value%22%2C+%22expression%22%3A+%22%22%2C+%22type%22%3A+%22median%22%7D%5D&toggle=vis",  # noqa
        },
    }


def test_get_looker_explore_metadata_for_metric_unioned_app(
    fake_namespaces, fake_app, fake_ping, fake_timespan_metric
):
    # The application needs an "app channel" to trigger the relevant
    # code path.
    fake_app.app["app_channel"] = "nightly"

    FAKE_APP_GROUP = {
        "app_description": "Fenix for iOS",
        "app_ids": [
            {
                "channel": "nightly",
                "name": "org.mozilla.ios.Fennec",
            },
            {
                "channel": "release",
                "name": "org.mozilla.ios.Firefox",
            },
        ],
        "app_name": "fenix",
    }

    assert get_looker_explore_metadata_for_metric(
        fake_namespaces,
        fake_app,
        FAKE_APP_GROUP,
        fake_timespan_metric,
        fake_ping.identifier,
        False,
    ) == {
        "base": {
            "name": "metrics",
            "url": "https://mozilla.cloud.looker.com/explore/fenix/metrics?f%5Bmetrics.channel%5D=nightly",  # noqa
        },
        "metric": {
            "name": "mytimespan",
            "url": "https://mozilla.cloud.looker.com/explore/fenix/metrics?f%5Bmetrics.channel%5D=nightly&fields=metrics.submission_date%2Cmedian_of_mytimespan&dynamic_fields=%5B%7B%22measure%22%3A+%22median_of_mytimespan%22%2C+%22label%22%3A+%22Median+of+mytimespan%22%2C+%22based_on%22%3A+%22metrics.metrics__timespan__mytimespan__value%22%2C+%22expression%22%3A+%22%22%2C+%22type%22%3A+%22median%22%7D%5D&toggle=vis",  # noqa
        },
    }
