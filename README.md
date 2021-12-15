# Glean Dictionary

[![CircleCI](https://circleci.com/gh/mozilla/glean-dictionary.svg?style=svg)](https://circleci.com/gh/mozilla/glean-dictionary)

The Glean dictionary aims to provide a comprehensive index of datasets generated
inside Mozilla for applications built using the
[Glean SDK](https://mozilla.github.io/glean/book/index.html).

This project is under active development. For up to date information on project
structure and governance, see:

https://wiki.mozilla.org/Data/WorkingGroups/GleanDictionary

The production version of the Glean Dictionary is deployed at:

https://dictionary.telemetry.mozilla.org

## Getting Started

You should be able to create your own local copy of the dictionary so long as
you have [Python](https://www.python.org/) (version 3.8+) and
[node.js](https://nodejs.org/) (version 12+) installed. You will also need npm
v7 or greater: run `npm install -g npm@latest` if you need to upgrade.

Assuming those requirements are met, follow these instructions:

```bash
# Create and activate a python virtual environment.
python3 -m venv venv/
venv/bin/pip install -r requirements.txt

# Build data needed by dashboard
./scripts/build-glean-metadata

# Install npm dependencies and start a local
# instance of the GUI
npm install
npm run dev
```

If that worked, you should be able to see a local version of Glean at
http://localhost:5000

You can speed up the "build data" step by appending the name of a set of
application(s) you want to build metadata for. This can speed up the process
considerably. For example, to build a metadata index for Fenix (Firefox for
Android) only, try:

```bash
./scripts/build-glean-metadata fenix
```

For the search service _only_ (see below), the Glean Dictionary also indexes
legacy Firefox telemetry metadata. To build this index (not necessary for most
testing), you need to run a seperate script:

```bash
./scripts/build-legacy-metadata
```

## Search Service

The Glean Dictionary also includes a search service which enables searching
through active metrics. Under the hood, this service is implemented with
[netlify functions]. For example:

https://dictionary.telemetry.mozilla.org/.netlify/functions/metrics_search_burnham?search=techno

You can start it up via the [netlify command line interface] (assuming you have
it installed):

```bash
netlify dev
```

If you have generated metadata as described above, you should then be able to
test the search functions locally:

http://localhost:8888/.netlify/functions/metrics_search_burnham?search=techno
http://localhost:8888/.netlify/functions/metrics_search_firefox_legacy?search=ms

[netlify command line interface]: https://docs.netlify.com/cli/get-started/
[netlify functions]: https://docs.netlify.com/functions/overview/

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

## Deployment

The production version of the Glean Dictionary
(https://dictionary.telemetry.mozilla.org) is deployed from the `production`
branch on this repository, which usually corresponds to the latest GitHub
release. To update the Glean Dictionary to the latest version, follow this
procedure:

- Do a quick test of https://glean-dictionary-dev.netlify.app to make sure it's
  working as expected.
- Create a new release, typically off of the `main` branch (use the
  [auto-generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes),
  omitting dependency updates).
- From a local checkout, update the `production` branch to be in sync with the
  tag you just created, then push to the production branch. After the
  integration tests pass, dictionary.telemetry.mozilla.org should be
  automatically updated to the latest version.

A version of the Glean Dictionary running the development branch (`main`) is
accessible at https://glean-dictionary-dev.netlify.app/

## Contributing

For more information on contributing, see [CONTRIBUTING.md](./CONTRIBUTING.md)
in the root of this repository.
