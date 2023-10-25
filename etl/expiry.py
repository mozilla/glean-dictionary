def get_mapped_expiry(expiry, app_name, product_details):
    # For Desktop we can map expiry versions to dates.
    if app_name == "firefox_desktop":
        details = product_details.get(f"{expiry}.0")
        if details:
            return details

    # Other's might be either a date, a version or "never"
    if expiry == "never":
        return None
    else:
        return expiry


def get_expiry_text(expiry, app_name, product_details):
    latest_release_version = [*product_details][-1]

    if expiry == "never" or expiry is None:
        return expiry
    if type(expiry) == int and (app_name in ["firefox_desktop", "fenix", "firefox_ios"]):
        # We only have expiry versions for Firefox Desktop and Mobile currently.
        # Let's update this when version-based expiry are available for other apps.
        # See: https://github.com/mozilla/glean-dictionary/issues/1513
        return f"{expiry}. Latest release is \
     [{latest_release_version}](https://whattrainisitnow.com/)."

    return str(expiry)
