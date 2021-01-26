import { isExpired } from "../src/state/metrics";

describe("checking if a date has expired", () => {
  it("returns True if input is 'never' or undefined", () => {
    expect(isExpired("never") || isExpired(undefined)).toEqual(false);
  });
  it("returns True if input is a date from the past", () => {
    expect(isExpired("2021-01-01")).toEqual(true);
  });
  it("returns False if input is a date from the future", () => {
    expect(isExpired("3021-01-01")).toEqual(false);
  });
});
