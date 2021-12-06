import pytest

from etl.expiry import get_expiry_date


@pytest.fixture
def fake_product_details():
    return {"1.0": "2004-11-09"}


def test_get_expiry_date(fake_product_details):
    assert get_expiry_date("1", "firefox_desktop", fake_product_details) == "2004-11-09"
    assert get_expiry_date("0", "firefox_desktop", fake_product_details) is None
    assert get_expiry_date("never", "fenix", fake_product_details) is None
