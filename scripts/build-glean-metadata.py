#!/usr/bin/env python3

import json
import os

import requests
from mozilla_schema_generator.glean_ping import GleanPing


PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org"
REPO_URL = PROBE_INFO_BASE_URL + "/glean/repositories"
PINGS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"
OUTPUT_DIRECTORY = os.path.join("public", "data")


def snake_case(line: str) -> str:
    """Convert a string into a snake_cased string."""
    # replace non-alphanumeric characters with spaces in the reversed line
    subbed = re.sub(r"[^\w]|_", " ", line[::-1])
    # apply the regex on the reversed string
    words = REV_WORD_BOUND_PAT.split(subbed)
    # filter spaces between words and snake_case and reverse again
    return "_".join([w.lower() for w in words if w.strip()])[::-1]


# we get the repos ourselves instead of using GleanPing.get_repos()
# to get all the metadata associated with the repo
repo_data = requests.get(REPO_URL).json()
repos = filter(lambda r: "library_names" not in r and r['app_id'] != "glean", repo_data)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), 'w').write(
    json.dumps(
        [
            {k: repo[k] for k in ['app_id', 'deprecated', 'description', 'name', 'url']}
            for repo in repos
        ]
    )
)


# glean_products = [repo for repo in GleanPing.get_repos()]
# print(glean_products)
# for glean_product in glean_products:
#    print(glean_product.url)
