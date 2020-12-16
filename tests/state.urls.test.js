import { getItemURL } from "../src/state/urls";

describe("metric URL replacing", () => {
  it("works as expected", () => {
    expect(getItemURL("foo", "metrics", "bar.baz")).toEqual(
      "/apps/foo/metrics/bar-baz"
    );
  });
});
