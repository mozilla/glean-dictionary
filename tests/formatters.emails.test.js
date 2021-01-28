import { getEmailLink } from "../src/formatters/emails";

describe("Email link generation", () => {
  it("works as expected", () => {
    expect(getEmailLink("gecko@mozilla.com")).toEqual(
      "mailto:gecko@mozilla.com"
    );
  });
});
