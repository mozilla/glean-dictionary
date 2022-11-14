import pytest

from etl.expiry import get_expiry_text, get_mapped_expiry


@pytest.fixture
def fake_product_details():
    return {"1.0": "2004-11-09"}


def test_get_mapped_expiry(fake_product_details):
    assert get_mapped_expiry("1", "firefox_desktop", fake_product_details) == "2004-11-09"
    assert get_mapped_expiry("0", "firefox_desktop", fake_product_details) is None
    assert get_mapped_expiry("never", "fenix", fake_product_details) is None
    assert get_mapped_expiry(97, "fenix", fake_product_details) == 97


def test_get_expiry_text(fake_product_details):
    assert get_expiry_text("never", "fenix", fake_product_details) == "never"
    assert get_expiry_text(None, "firefox_desktop", fake_product_details) is None
    assert (
        get_expiry_text(0, "firefox_desktop", fake_product_details)
        == "0. Latest release is \
     [1.0](https://wiki.mozilla.org/Release_Management/Calendar)."
    )
    assert get_expiry_text("2021-01-01", "product", fake_product_details) == "2021-01-01"
