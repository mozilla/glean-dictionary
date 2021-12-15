"""Installation for glean-dictionary."""
# -*- coding: utf-8 -*-

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from setuptools import find_packages, setup

readme = open("README.md").read()

setup(
    name="glean-dictionary",
    python_requires=">=3.8.0",
    version="0.0.0",
    description="Glean Dictionary Python support.",
    long_description=readme,
    long_description_content_type="text/markdown",
    author="Data@Mozilla",
    author_email="fx-data-dev@mozilla.org",
    url="https://github.com/mozilla/glean-dictionary",
    packages=find_packages(include=["etl"]),
    package_dir={"glean-dictionary": "etl"},
    include_package_data=True,
    zip_safe=False,
    keywords="glean-dictionary",
    classifiers=[
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
    ],
)
