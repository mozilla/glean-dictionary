import { getEmailLink } from "../src/formatters/emails";

describe("Email link generation", () => {
  it("works as expected", () => {
    expect(getEmailLink("gecko@mozilla.com")).toBe("mailto:gecko@mozilla.com");
  });
});
