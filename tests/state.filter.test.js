import { filterUncollectedItems } from "../src/state/filter";

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
    in_source: true,
  },
  {
    name: "metric.camel",
    expires: getDateStr(tomorrow),
    origin: "glean-core",
    in_source: true,
  },
  { name: "metric.expired", expires: getDateStr(yesterday), in_source: true },
  { name: "metric.removed", expires: getDateStr(tomorrow), in_source: false },
];

describe("expiry", () => {
  it("doesn't return expired or removed items when showUncollected is false", () =>
    expect(getNames(filterUncollectedItems(items, false))).toEqual([
      "metric.bestsitez",
      "metric.camel",
    ]));
});
