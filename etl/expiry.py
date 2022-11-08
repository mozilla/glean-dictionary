def get_mapped_expiry(expiry, app_name, product_details):
    # For Desktop we can map expiry versions to dates.
    if app_name == "firefox_desktop":
        return product_details.get(f"{expiry}.0")

    # Other's might be either a date, a version or "never"
    if expiry == "never":
        return None
    else:
        return expiry


def get_expiry_text(expiry, app_name, product_details):
    latest_release_version = [*product_details][-1]

    if expiry == "never" or expiry is None:
        return expiry
    elif app_name == "firefox_desktop":
        return f"{expiry}. Latest release is \
     [{latest_release_version}](https://wiki.mozilla.org/Release_Management/Calendar)."

    return expiry
