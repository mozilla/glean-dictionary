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
you have [Python](https://www.python.org/) (version 3.8) and
[node.js](https://nodejs.org/) installed. Follow these instructions:

```bash
# Create and activate a python virtual environment.
python3 -m venv venv/
source venv/bin/activate
pip install -r requirements.txt

# Build data needed by dashboard
./scripts/build-glean-metadata.py

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
./scripts/build-glean-metadata.py fenix
```

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

## Deployment

The production version of the Glean Dictionary
(https://dictionary.telemetry.mozilla.org) is deployed from the `production`
branch on this repository, which usually corresponds to the latest GitHub
release. To update the Glean Dictionary to the latest version, follow this
procedure:

- Do a quick test of https://glean-dictionary-dev.netlify.app to make sure it's
  working as expected.
- Create a new release, typically off of the `main` branch (you might find
  [this iodide notebook](https://alpha.iodide.io/notebooks/6616/) useful for
  creating a set of notes on what changed).
- From a local checkout, update the `production` branch to be in sync with the
  tag you just created, then push to the production branch. After the
  integration tests pass, dictionary.telemetry.mozilla.org should be
  automatically updated to the latest version.

A version of the Glean Dictionary running the development branch (`main`) is
accessible at https://glean-dictionary-dev.netlify.app/

## Contributing

For more information on contributing, see [CONTRIBUTING.md](./CONTRIBUTING.md)
in the root of this repository.
