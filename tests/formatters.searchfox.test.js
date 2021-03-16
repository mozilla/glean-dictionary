import { getSearchfoxLink } from "../src/formatters/searchfox";

describe("Searchfox links for firefox-desktop", () => {
  it("works as expected", () => {
    expect(getSearchfoxLink("firefox_desktop", "test.metric_name")).toEqual(
      "https://searchfox.org/mozilla-central/search?q=test.metricName|Test.metricName|test.metric_name|test::metric_name&regexp=true"
    );
    expect(
      getSearchfoxLink("firefox_desktop", "test_category.test_name")
    ).toEqual(
      "https://searchfox.org/mozilla-central/search?q=testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&regexp=true"
    );
  });
});

describe("Searchfox links for applications in mozilla-mobile", () => {
  it("works as expected", () => {
    expect(getSearchfoxLink("fenix", "test.metric_name")).toEqual(
      "https://searchfox.org/mozilla-mobile/search?q=test.metricName|Test.metricName|test.metric_name|test::metric_name&path=fenix&regexp=true"
    );
    expect(getSearchfoxLink("fenix", "test_category.test_name")).toEqual(
      "https://searchfox.org/mozilla-mobile/search?q=testCategory.testName|TestCategory.testName|test_category.test_name|test_category::test_name&path=fenix&regexp=true"
    );
  });
});

describe("returns undefined if the application is not indexed on Searchfox", () => {
  it("works as expected", () => {
    expect(getSearchfoxLink("foo", "test.metric")).toBeUndefined();
  });
});
