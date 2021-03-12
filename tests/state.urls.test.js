import { getItemURL, getBigQueryURL } from "../src/state/urls";

describe("metric URL replacing", () => {
  it("works as expected", () => {
    expect(getItemURL("foo", "metrics", "bar.baz")).toEqual(
      "/apps/foo/metrics/bar_baz"
    );
  });
});

describe("getting bigquery urls", () => {
  it("works as expected when you provide a metric name", () => {
    expect(
      getBigQueryURL(
        "fenix",
        "org.mozilla.fenix",
        "activation",
        "activation.activation_id"
      )
    ).toEqual(
      "/apps/fenix/app_ids/org_mozilla_fenix/tables/activation?search=activation.activation_id"
    );
  });

  it("works as expected when you don't provide a metric name", () => {
    expect(getBigQueryURL("fenix", "org.mozilla.fenix", "activation")).toEqual(
      "/apps/fenix/app_ids/org_mozilla_fenix/tables/activation"
    );
  });
});
