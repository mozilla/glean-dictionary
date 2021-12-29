#!/usr/bin/env python3

import os

import click

from .firefox_legacy_etl import write_firefox_legacy_metadata
from .glean_etl import write_glean_metadata

OUTPUT_DIRECTORY = os.path.join("public", "data")
FUNCTIONS_DIRECTORY = ".netlify"


@click.group()
def cli():
    pass


@cli.command()
@click.option("--output-directory", default=OUTPUT_DIRECTORY)
@click.option("--functions-directory", default=FUNCTIONS_DIRECTORY)
@click.argument("app_names", nargs=-1, required=False)
def build_metadata(output_directory, functions_directory, app_names):
    write_glean_metadata(
        output_directory,
        functions_directory,
        app_names=app_names,
    )
    write_firefox_legacy_metadata(output_directory, functions_directory)


if __name__ == "__main__":
    cli(obj={})
