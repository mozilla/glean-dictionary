#!/usr/bin/env python3

import copy
import json
import os

import requests
from mozilla_schema_generator.glean_ping import GleanPing


PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org"
REPO_URL = PROBE_INFO_BASE_URL + "/glean/repositories"
PINGS_URL_TEMPLATE = PROBE_INFO_BASE_URL + "/glean/{}/pings"
OUTPUT_DIRECTORY = os.path.join("public", "data")


# we get the repos ourselves instead of using GleanPing.get_repos()
# to get all the metadata associated with the repo
repo_data = requests.get(REPO_URL).json()

# filter out repos that are just libraries, not applications
repos = list(filter(lambda r: "library_names" not in r and r['app_id'] != "glean", repo_data))

# Write out a list of apps (for the landing page)
open(os.path.join(OUTPUT_DIRECTORY, "apps.json"), 'w').write(
    json.dumps(
        [
            {k: repo[k] for k in ['app_id', 'deprecated', 'description', 'name', 'url']}
            for repo in repos
        ]
    )
)

# Write out some metadata for each app (for the app detail page)
for repo in list(repos):
    app_name = repo["name"]
    app_dir = os.path.join(OUTPUT_DIRECTORY, app_name)
    app_ping_dir = os.path.join(app_dir, 'pings')
    os.makedirs(app_ping_dir, exist_ok=True)

    app_data = copy.copy(repo)
    app_data['pings'] = []
    ping_data = requests.get(PINGS_URL_TEMPLATE.format(app_name)).json()
    for (ping_name, ping_data) in ping_data.items():
        app_data["pings"].append({
            "name": ping_name,
            "description": ping_data['history'][-1]['description']
        })

        open(os.path.join(app_ping_dir, f'{ping_name}.json'), 'w').write(
            json.dumps(dict(ping_data['history'][-1], name=ping_name,
                       history=ping_data['history']))
        )
    open(os.path.join(app_dir, "index.json"), "w").write(
        json.dumps(app_data)
    )
