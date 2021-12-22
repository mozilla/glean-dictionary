import pytest

from etl.expiry import get_expiry_date, get_expiry_text, validate


def test_validate():
    assert validate("2021-12-31") is True
    assert validate("foo bar") is False


@pytest.fixture
def fake_product_details():
    return {"1.0": "2004-11-09"}


def test_get_expiry_date(fake_product_details):
    assert get_expiry_date("1", "firefox_desktop", fake_product_details) == "2004-11-09"
    assert get_expiry_date("0", "firefox_desktop", fake_product_details) is None
    assert get_expiry_date("never", "fenix", fake_product_details) is None


def test_get_expiry_text(fake_product_details):
    assert get_expiry_text("never", "fenix", fake_product_details) == "never"
    assert get_expiry_text(None, "firefox_desktop", fake_product_details) is None
    assert (
        get_expiry_text("0", "firefox_desktop", fake_product_details)
        == "0. Latest release is \
     [1.0](https://wiki.mozilla.org/Release_Management/Calendar)."
    )
    assert get_expiry_text("2021-01-01", "product", fake_product_details) == "2021-01-01"
