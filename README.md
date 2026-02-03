# Glean Dictionary

[![CircleCI](https://circleci.com/gh/mozilla/glean-dictionary.svg?style=svg)](https://circleci.com/gh/mozilla/glean-dictionary)

The Glean dictionary aims to provide a comprehensive index of datasets generated
inside Mozilla for applications built using the
[Glean SDKs](https://mozilla.github.io/glean/book/index.html).

This project is under active development. For up to date information on project
structure and governance, see:

https://wiki.mozilla.org/Data/WorkingGroups/GleanDictionary

The production version of the Glean Dictionary is deployed at:

https://dictionary.telemetry.mozilla.org

## Getting Started

You should be able to create your own local copy of the dictionary so long as
you have [Python](https://www.python.org/) (version 3.9+) and
[node.js](https://nodejs.org/) (version 18+) installed. You will also need npm
v8 or greater: run `npm install -g npm@latest` if you need to upgrade.

Assuming those requirements are met, follow these instructions:

```bash
# Create and activate a python virtual environment.
python3 -m venv venv/
venv/bin/pip install -r requirements.txt

# Build data needed by dashboard
./scripts/gd build-metadata
# Or, on Windows: python3 -m etl build-metadata

# Install npm dependencies and start a local
# instance of the GUI
npm install
npm run dev
```

If that worked, you should be able to see a local version of Glean at
http://localhost:5555

You can speed up the "build data" step by appending the name of a set of
application(s) you want to build metadata for. This can speed up the process
considerably. For example, to build a metadata index for Fenix (Firefox for
Android) only, try:

```bash
./scripts/gd build-metadata fenix
```

## Search Service

The Glean Dictionary also includes a search service which enables searching
through active metrics. Under the hood, this service is implemented with
[netlify functions]. For example:

https://dictionary.telemetry.mozilla.org/api/v1/metrics_search_burnham?search=techno

You can start it up via the [netlify command line interface] (assuming you have
it installed):

```bash
netlify dev
```

If you have generated metadata as described above, you should then be able to
test the search functions locally:

http://localhost:8888/api/v1/metrics_search_burnham?search=techno
http://localhost:8888/api/v1/metrics_search_firefox_legacy?search=ms

[netlify command line interface]: https://docs.netlify.com/cli/get-started/
[netlify functions]: https://docs.netlify.com/functions/overview/

## MCP Server

The Glean Dictionary provides an
[MCP (Model Context Protocol)](https://modelcontextprotocol.io) server for AI
assistants to query telemetry metadata programmatically. See
[docs/mcp-server.md](./docs/mcp-server.md) for setup and usage.

## Storybook

We use [Storybook](https://storybook.js.org/) for developing and validating
Svelte components used throughout the app. To view the existing list of stories,
run:

```bash
npm run storybook
```

### Storybook Snapshot Testing

To give us more confidence that changes don't unintentionally break the UI, we
run
[storybook snapshot tests](https://storybook.js.org/docs/react/workflows/snapshot-testing).

You can run them manually as follows:

```bash
npm run test:jest
```

If you intentionally made a change to a component that results in a change to
the output of the storybook snapshots, you can re-generate them using the
following command:

```bash
npm run test:jest -- -u
```

## End-to-End Testing

We use [Playwright](https://playwright.dev/) for our end-to-end tests.

Before testing, download the supported browsers needed for Playwright to execute
successfully by running:

```bash
npx playwright install
```

To run the end-to-end tests along with other tests:

```bash
npm run test
```

To run only the Playwright tests:

```bash
npx playwright test
```

## ETL Testing

The transforms used by the Glean Dictionary have their own tests. Assuming
you've run the set up as described above, you can run these tests by executing:

```bash
venv/bin/pytest
```

## Glean Debugging

In order to enable
[ping logging](https://mozilla.github.io/glean/book/reference/debug/logPings.html)
set the `GLEAN_LOG_PINGS` environment variable.

```bash
GLEAN_LOG_PINGS=true npm run dev
```

In order to send Glean pings to the
[debug viewer](https://mozilla.github.io/glean/book/reference/debug/debugViewTag.html)
set the `GLEAN_DEBUG_VIEW_TAG` environment variable.

```bash
GLEAN_DEBUG_VIEW_TAG=my-tag npm run dev
```

## Deployment

A version of the Glean Dictionary running the development branch (`main`) is
accessible at https://glean-dictionary-dev.netlify.app/ .

The production version of the Glean Dictionary
(https://dictionary.telemetry.mozilla.org) is deployed from the `production`
branch on this repository, which usually corresponds to the latest GitHub
release. To update the Glean Dictionary to the latest version, follow this
procedure:

- Do a quick test of https://glean-dictionary-dev.netlify.app to make sure it's
  working as expected.
- Create a new release off of the `main` branch:
  - use the
    [auto-generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes),
    omitting dependency updates, unless it's `glean.js`;
  - use the format `vX.Y.Z` for the tag, where `X.Y.Z` is the new version
    number.
- From a local checkout (assuming `origin` is the name of the remote):
  - fetch the newly created tags, `git fetch --tags origin`;
  - switch to the `production`, `git checkout production`;
  - make it in sync with the tag you just created, `git merge tags/vX.Y.Z`
    (where `X.Y.Z` is the new version number).
  - push to the production branch, `git push origin production`.
- Wait for the integration tests to pass by monitoring
  [CircleCi](https://app.circleci.com/pipelines/github/mozilla/glean-dictionary?branch=production).
- Ensure that https://dictionary.telemetry.mozilla.org is automatically updated
  to the released version by checking that `<HASH>` in
  `Built from revision: <HASH>` at the bottom of the Glean Dictionary page
  matches the one reported at the top right of the release page
  `https://github.com/mozilla/glean-dictionary/releases/tag/vX.Y.Z`.

## Contributing

For more information on contributing, see [CONTRIBUTING.md](./CONTRIBUTING.md)
in the root of this repository.
