import { getSearchfoxLink } from "../src/formatters/searchfox";

describe("Searchfox links", () => {
  it("directs to /mozilla-central for firefox-desktop", () => {
    expect(getSearchfoxLink("firefox-desktop", "test.metric")).toEqual(
      "https://searchfox.org/mozilla-central/search?q=test.metric"
    );
  });
  it("directs to /mozilla-mobile for applications that are not firefox-desktop", () => {
    expect(getSearchfoxLink("fenix", "test.metric")).toEqual(
      "https://searchfox.org/mozilla-mobile/search?q=test.metric&path=fenix"
    );
  });
  it("returns false if the application is not indexed on Searchfox", () => {
    expect(getSearchfoxLink("foo", "test.metric")).toBe(false);
  });
});
