import { getMetricLink } from "../src/formatters/searchfox";

describe("Searchfox links for firefox-desktop", () => {
  it("works as expected", () => {
    expect(getMetricLink("firefox_desktop", "test.metric_name")).toEqual(
      "https://searchfox.org/mozilla-central/search?q=test.metricName|Test.metricName|test.metric_name|test::metric_name&regexp=true"
    );
    expect(getMetricLink("firefox_desktop", "test_category.test_name")).toEqual(
      "https://searchfox.org/mozilla-central/search?q=testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&regexp=true"
    );
  });
});

describe("Searchfox links for applications in mozilla-mobile", () => {
  it("works as expected", () => {
    expect(getMetricLink("fenix", "test.metric_name")).toEqual(
      "https://searchfox.org/mozilla-mobile/search?q=test.metricName|Test.metricName|test.metric_name|test::metric_name&path=fenix&regexp=true"
    );
    expect(getMetricLink("fenix", "test_category.test_name")).toEqual(
      "https://searchfox.org/mozilla-mobile/search?q=testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&path=fenix&regexp=true"
    );
  });
});

describe("returns Sourcegraph link if the application is not indexed on Searchfox", () => {
  it("works as expected", () => {
    expect(getMetricLink("mozregression", "usage.bad_date")).toEqual(
      "https://sourcegraph.com/search?q=repo:%5Egithub%5C.com%5C/%5BMm%5Dozilla%28.*%29%5C/mozregression%24+usage.badDate|Usage.badDate|usage.bad_date|usage::bad_date&patternType=regexp"
    );
  });
});
