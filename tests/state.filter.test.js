import { filterExpiredItems } from "../src/state/filter";

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

function getDateStr(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getNames(items) {
  return items.map((i) => i.name);
}

const items = [
  {
    name: "metric.bestsitez",
    tags: ["TopSites"],
    expires: getDateStr(tomorrow),
  },
  { name: "metric.camel", expires: getDateStr(tomorrow), origin: "glean-core" },
  { name: "metric.expired", expires: getDateStr(yesterday) },
];

describe("expiry", () => {
  it("doesn't return expired items when showExpired is false", () =>
    expect(getNames(filterExpiredItems(items, false))).toEqual([
      "metric.bestsitez",
      "metric.camel",
    ]));
});
