import { getBugLinkTitle, getSourceUrlTitle } from "../src/formatters/links";

describe("Titles for bugzilla URLs", () => {
  it("works as expected", () => {
    expect(getBugLinkTitle("https://bugzilla.mozilla.org/1234")).toEqual(
      "bugzil.la/1234"
    );
    expect(getBugLinkTitle("https://bugzilla.mozilla.org/1234#c23")).toEqual(
      "bugzil.la/1234#c23"
    );
    expect(getBugLinkTitle("https://bugzil.la/1234")).toEqual("bugzil.la/1234");
    expect(getBugLinkTitle("https://bugzil.la/show_bug.cgi?id=1234")).toEqual(
      "bugzil.la/1234"
    );
  });
});

describe("Titles for github URLs", () => {
  it("works as expected", () => {
    expect(
      getBugLinkTitle("https://github.com/mozilla-mobile/fenix/issues/1234")
    ).toEqual("mozilla-mobile/fenix#1234");
    expect(
      getBugLinkTitle(
        "https://github.com/mozilla-mobile/fenix/issues/1234#issuecomment-5678"
      )
    ).toEqual("mozilla-mobile/fenix#1234-comment");
  });
});

describe("Titles for other issue tracker URLs", () => {
  it("works as expected", () => {
    expect(getBugLinkTitle("https://jira.com/1234")).toEqual("jira.com/1234");
  });
});

describe("Titles for source definition", () => {
  it("works as expected", () => {
    expect(
      getSourceUrlTitle(
        "https://github.com/mozilla-mobile/fenix/blob/b01dbeeebf2b54dabbb1b60916bee4ec2c837b5f/app/metrics.yaml#L1234"
      )
    ).toEqual("mozilla-mobile/fenix/app/metrics.yaml#L1234");
  });
});
