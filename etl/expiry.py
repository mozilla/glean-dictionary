import datetime

def validate(date_text):
    try:
        datetime.datetime.strptime(date_text, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def get_expiry_date(expiry, app_name, product_details):
    if app_name == "firefox_desktop":
        return product_details.get(f"{expiry}.0")
    if validate(expiry):
        return expiry
    return None


def get_expiry_text(expiry, app_name, product_details):
    latest_release_version = [*product_details][-1]

    if expiry == "never" or expiry is None:
        return expiry
    if app_name == "firefox_desktop":
        return f"{expiry}. Latest release is \
     [{latest_release_version}](https://wiki.mozilla.org/Release_Management/Calendar)"

    return expiry
