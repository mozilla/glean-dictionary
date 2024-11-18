import { getCodeSearchLink } from "../src/formatters/codesearch";

describe("Searchfox links for firefox-desktop", () => {
  it("works as expected", () => {
    expect(
      getCodeSearchLink("test.metric_name", "firefox_desktop", {
        source_url: "https://foo.bar",
      })
    ).toBe(
      "https://searchfox.org/mozilla-central/search?q=test.metric_name|test.metricName|Test.metricName|test.metric_name|test::metric_name&regexp=true"
    );
    expect(
      getCodeSearchLink("test_category.test_name", "firefox_desktop", {
        source_url: "https://foo.bar",
      })
    ).toBe(
      "https://searchfox.org/mozilla-central/search?q=test_category.test_name|testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&regexp=true"
    );
  });
});

describe("Searchfox links for applications in mozilla-mobile", () => {
  it("works as expected", () => {
    expect(
      getCodeSearchLink("test.metric_name", "fenix", {
        source_url: "https://foo.bar",
      })
    ).toBe(
      "https://searchfox.org/mozilla-mobile/search?q=test.metric_name|test.metricName|Test.metricName|test.metric_name|test::metric_name&path=fenix&regexp=true"
    );
    expect(
      getCodeSearchLink("test_category.test_name", "fenix", {
        source_url: "https://foo.bar",
      })
    ).toBe(
      "https://searchfox.org/mozilla-mobile/search?q=test_category.test_name|testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&path=fenix&regexp=true"
    );
    expect(
      getCodeSearchLink("test_category.test_name", "fenix", {
        source_url:
          "https://github.com/mozilla/application-services/foo/bar/metrics.yaml",
      })
    ).toBe(
      "https://searchfox.org/mozilla-mobile/search?q=test_category.test_name|testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&path=application-services&regexp=true"
    );
    expect(
      getCodeSearchLink("test_category.test_name", "firefox_ios", {
        source_url:
          "https://github.com/mozilla/application-services/foo/bar/metrics.yaml",
      })
    ).toBe(
      "https://searchfox.org/mozilla-mobile/search?q=test_category.test_name|testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&path=application-services&regexp=true"
    );
  });
});

describe("returns Sourcegraph link if the application is not indexed on Searchfox", () => {
  it("works as expected", () => {
    expect(
      getCodeSearchLink("usage.bad_date", "mozregression", {
        source_url: "https://foo.bar",
      })
    ).toBe(
      "https://sourcegraph.com/search?q=repo:%5Egithub%5C.com%5C/%5BMm%5Dozilla%28.*%29%5C/mozregression%24+usage.bad_date|usage.badDate|Usage.badDate|usage.bad_date|usage::bad_date&patternType=regexp"
    );
  });
});

describe("returns undefined if the application cannot be indexed", () => {
  it("works as expected", () => {
    expect(
      getCodeSearchLink("test.metric", "foo", { source_url: "https://foo.bar" })
    ).toBeUndefined();
  });
});
