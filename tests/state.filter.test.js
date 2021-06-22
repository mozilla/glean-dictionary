import { filterItems } from "../src/state/filter";

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

describe("filters on name", () => {
  it("works with empty search", () => {
    expect(getNames(filterItems(items, "", true))).toEqual([
      "metric.bestsitez",
      "metric.camel",
      "metric.expired",
    ]);
  });

  it("works when all match", () => {
    expect(getNames(filterItems(items, "metric", true))).toEqual([
      "metric.bestsitez",
      "metric.camel",
      "metric.expired",
    ]);
  });

  it("works when some match", () => {
    expect(getNames(filterItems(items, "camel", true))).toEqual([
      "metric.camel",
    ]);
  });

  it("works when none match", () => {
    expect(getNames(filterItems(items, "nope", true))).toEqual([]);
  });

  it("handles multiple tokens as you'd expect", () => {
    expect(getNames(filterItems(items, "best sites", true))).toEqual([
      "metric.bestsitez",
    ]);
    expect(getNames(filterItems(items, "best    sites", true))).toEqual([
      "metric.bestsitez",
    ]);
  });
});

describe("filters on tag", () => {
  it("handles single match", () => {
    expect(getNames(filterItems(items, "to", true))).toEqual([
      "metric.bestsitez",
    ]);
    expect(getNames(filterItems(items, "top", true))).toEqual([
      "metric.bestsitez",
    ]);
  });

  it("handles multi-match", () => {
    expect(getNames(filterItems(items, "top sites", true))).toEqual([
      "metric.bestsitez",
    ]);
  });
});

describe("filters on origin", () => {
  it("handles single match", () => {
    expect(getNames(filterItems(items, "glean", true))).toEqual([
      "metric.camel",
    ]);
    expect(getNames(filterItems(items, "core", true))).toEqual([
      "metric.camel",
    ]);
  });

  it("handles multi-match", () => {
    expect(getNames(filterItems(items, "glean core", true))).toEqual([
      "metric.camel",
    ]);
  });
});

describe("expiry", () => {
  it("doesn't return expired items when showExpired is false", () =>
    expect(getNames(filterItems(items, "", false))).toEqual([
      "metric.bestsitez",
      "metric.camel",
    ]));
});
