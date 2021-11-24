import pytest

from etl.glean import GleanApp, GleanPing
from etl.looker import get_looker_explore_metadata_for_ping


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
