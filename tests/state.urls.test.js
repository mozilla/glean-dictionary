import { getMetricURL } from "../src/state/urls";

describe("metric URL replacing", () => {
  it("works as expected", () => {
    expect(getMetricURL("foo", "bar.baz")).toEqual("/apps/foo/metrics/bar-baz");
  });
});
