import pytest
from etl.glean_auto_events import get_auto_events_for_app


# ruff: noqa: E501
@pytest.fixture
def mock_auto_events():
    return [
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.inline_recovery_key_setup_create_do_it_later",
            "count": "16538",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.account_pref_recovery_key_copy",
            "count": "3084",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.inline_recovery_key_cta_submit",
            "count": "3811",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.account_pref_promo_monitor_submit",
            "count": "1188",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.account_banner_create_recovery_key_dismiss",
            "count": "3267",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.account_banner_create_recovery_key_submit",
            "count": "1622",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_app_link",
            "count": "1007",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_codes_submit",
            "count": "4230",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_codes_download",
            "count": "1745",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_enter_code_submit",
            "count": "4970",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_qr_submit",
            "count": "5350",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.third-party-auth-set-password-submit",
            "count": "556",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_codes_copy",
            "count": "1009",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.password_reset_success_continue_to_relying_party_submit",
            "count": "544",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.account_pref_two_step_auth_codes_get_new_submit",
            "count": "163",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.cad_redirect_mobile_learn_more",
            "count": "388",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.reset_password_confirm_totp_code_submit_button",
            "count": "396",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_codes_print",
            "count": "177",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.reset_password_confirm_totp_use_different_account_button",
            "count": "39",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.reset_password_confirm_recovery_code_trouble_with_code_button",
            "count": "82",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.reset_password_confirm_recovery_code_submit_button",
            "count": "71",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.reset_password_confirm_totp_trouble_with_code_button",
            "count": "118",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.two_step_auth_codes_cancel",
            "count": "42",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.complete_reset_password_recovery_key_link",
            "count": "11",
        },
        {
            "app": "accounts_frontend",
            "name": "glean.element_click.cad_redirect_mobile_download",
            "count": "10",
        },
    ]


# ruff: noqa: E501
def test_get_auto_events_for_app(mock_auto_events):
    app_name = "accounts_frontend"
    auto_events = get_auto_events_for_app(app_name, mock_auto_events)

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
