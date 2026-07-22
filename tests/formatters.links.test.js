import {
  getBugLinkTitle,
  getSourceUrl,
  getSourceUrlTitle,
} from "../src/formatters/links";

describe("Titles for bugzilla URLs", () => {
  it("works as expected", () => {
    expect(getBugLinkTitle("https://bugzilla.mozilla.org/1234")).toBe(
      "bugzil.la/1234"
    );
    expect(getBugLinkTitle("https://bugzilla.mozilla.org/1234#c23")).toBe(
      "bugzil.la/1234#c23"
    );
    expect(getBugLinkTitle("https://bugzil.la/1234")).toBe("bugzil.la/1234");
    expect(getBugLinkTitle("https://bugzil.la/show_bug.cgi?id=1234")).toBe(
      "bugzil.la/1234"
    );
  });
});

describe("Titles for github URLs", () => {
  it("works as expected", () => {
    expect(
      getBugLinkTitle("https://github.com/mozilla-mobile/fenix/issues/1234")
    ).toBe("mozilla-mobile/fenix#1234");
    expect(
      getBugLinkTitle(
        "https://github.com/mozilla-mobile/fenix/issues/1234#issuecomment-5678"
      )
    ).toBe("mozilla-mobile/fenix#1234-comment");
  });
});

describe("Titles for other issue tracker URLs", () => {
  it("works as expected", () => {
    expect(getBugLinkTitle("https://jira.com/1234")).toBe("jira.com/1234");
  });
});

describe("Links for source URL", () => {
  it("converts github.com/mozilla-firefox/firefox links to searchfox.org links", () => {
    expect(
      getSourceUrl(
        "https://github.com/mozilla-firefox/firefox/blob/b52296d542b89092ffd707ca478a85ebf0f89ff5/accessible/metrics.yaml#L14"
      )
    ).toBe(
      "https://searchfox.org/firefox-main/rev/b52296d542b89092ffd707ca478a85ebf0f89ff5/accessible/metrics.yaml#14"
    );
  });
});

describe("Titles for source definition", () => {
  it("works as expected", () => {
    expect(
      getSourceUrlTitle(
        "https://github.com/mozilla-mobile/fenix/blob/b01dbeeebf2b54dabbb1b60916bee4ec2c837b5f/app/metrics.yaml#L1234"
      )
    ).toBe("mozilla-mobile/fenix/app/metrics.yaml#L1234");
  });

  it("only shows path and changes line hash for mozilla-firefox/firefox", () => {
    expect(
      getSourceUrlTitle(
        "https://github.com/mozilla-firefox/firefox/blob/b52296d542b89092ffd707ca478a85ebf0f89ff5/accessible/metrics.yaml#L14"
      )
    ).toBe("accessible/metrics.yaml#14");
  });
});
