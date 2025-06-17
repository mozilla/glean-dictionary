import pytest
from etl.glean_auto_events import get_auto_events_for_app


# ruff: noqa: E501
@pytest.fixture
def mock_auto_click_events():
    return [
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.inline_recovery_key_setup_create_do_it_later",
            "count": "16538",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.account_pref_recovery_key_copy",
            "count": "3084",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.inline_recovery_key_cta_submit",
            "count": "3811",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.account_pref_promo_monitor_submit",
            "count": "1188",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.account_banner_create_recovery_key_dismiss",
            "count": "3267",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.account_banner_create_recovery_key_submit",
            "count": "1622",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_app_link",
            "count": "1007",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_codes_submit",
            "count": "4230",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_codes_download",
            "count": "1745",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_enter_code_submit",
            "count": "4970",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_qr_submit",
            "count": "5350",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.third-party-auth-set-password-submit",
            "count": "556",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_codes_copy",
            "count": "1009",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.password_reset_success_continue_to_relying_party_submit",
            "count": "544",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.account_pref_two_step_auth_codes_get_new_submit",
            "count": "163",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.cad_redirect_mobile_learn_more",
            "count": "388",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.reset_password_confirm_totp_code_submit_button",
            "count": "396",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_codes_print",
            "count": "177",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.reset_password_confirm_totp_use_different_account_button",
            "count": "39",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.reset_password_confirm_recovery_code_trouble_with_code_button",
            "count": "82",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.reset_password_confirm_recovery_code_submit_button",
            "count": "71",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.reset_password_confirm_totp_trouble_with_code_button",
            "count": "118",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.two_step_auth_codes_cancel",
            "count": "42",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.complete_reset_password_recovery_key_link",
            "count": "11",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.element_click.cad_redirect_mobile_download",
            "count": "10",
        },
    ]


@pytest.fixture
def mock_auto_pageload_events():
    """Mock data for auto page_load events."""
    return [
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/account_recovery_reset_password]",
            "count": "1932",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/force_auth]",
            "count": "2032",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/settings/recovery_phone/setup]",
            "count": "2098",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/signin_bounced]",
            "count": "2140",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/reset_password]",
            "count": "2149",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/settings/clients]",
            "count": "2533",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/settings/avatar/change]",
            "count": "2725",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/inline_totp_setup]",
            "count": "2811",
        },
        {
            "app": "accounts_frontend",
            "event_name": "glean.page_load[/reset_password_verified]",
            "count": "3438",
        },
    ]


# ruff: noqa: E501
def test_get_auto_click_events_for_app(mock_auto_click_events):
    app_name = "accounts_frontend"
    auto_events = get_auto_events_for_app(app_name, mock_auto_click_events)

    assert len(auto_events) == 25
    assert (
        auto_events[0]["name"] == "glean.element_click.inline_recovery_key_setup_create_do_it_later"
    )
    assert (
        auto_events[0]["description"]
        == "An event triggered whenever the inline_recovery_key_setup_create_do_it_later element is clicked on a page."
    )
    assert (
        auto_events[0]["event_info"]["auto_event_id"]
        == "inline_recovery_key_setup_create_do_it_later"
    )
    assert auto_events[1]["name"] == "glean.element_click.account_pref_recovery_key_copy"
    assert (
        auto_events[1]["description"]
        == "An event triggered whenever the account_pref_recovery_key_copy element is clicked on a page."
    )
    assert auto_events[1]["event_info"]["auto_event_id"] == "account_pref_recovery_key_copy"
    assert auto_events[-1]["name"] == "glean.element_click.cad_redirect_mobile_download"
    assert (
        auto_events[-1]["description"]
        == "An event triggered whenever the cad_redirect_mobile_download element is clicked on a page."
    )
    assert auto_events[-1]["event_info"]["auto_event_id"] == "cad_redirect_mobile_download"


# ruff: noqa: E501
def test_get_auto_pageload_events_for_app(mock_auto_pageload_events):
    app_name = "accounts_frontend"
    auto_events = get_auto_events_for_app(app_name, mock_auto_pageload_events)

    assert len(auto_events) == 9
    assert auto_events[0]["name"] == "glean.page_load[/account_recovery_reset_password]"
    assert (
        auto_events[0]["description"]
        == "An event triggered whenever the page /account_recovery_reset_password is loaded."
    )
    assert (
        auto_events[0]["event_info"]["auto_event_id"]
        == "page_load[/account_recovery_reset_password]"
    )
    assert auto_events[1]["name"] == "glean.page_load[/force_auth]"
    assert (
        auto_events[1]["description"]
        == "An event triggered whenever the page /force_auth is loaded."
    )
    assert auto_events[-1]["name"] == "glean.page_load[/reset_password_verified]"
    assert (
        auto_events[-1]["description"]
        == "An event triggered whenever the page /reset_password_verified is loaded."
    )
    assert auto_events[-1]["event_info"]["auto_event_id"] == "page_load[/reset_password_verified]"
