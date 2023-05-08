import {
  filterUncollectedItems,
  filterItemsByLabels,
  filterItemsByExpiration,
} from "../src/state/filter";

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const sixMonthsFromNow = new Date(today.getTime() + 24 * 60 * 60 * 180 * 1000);
const twelveMonthsFromNow = today.setMonth(today.getMonth() + 12);

function getDateStr(date) {
  const newDate = new Date(date);
  return `${newDate.getFullYear()}-${
    newDate.getMonth() + 1
  }-${newDate.getDate()}`;
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
  { name: "metric.removed", expires: getDateStr(yesterday), in_source: false },
  {
    name: "metric.foo",
    expires: getDateStr(yesterday),
    origin: "sync",
    tags: ["Foo", "Bar"],
    in_source: false,
  },
  {
    name: "metric.bar",
    expires: getDateStr(yesterday),
    tags: ["Foo"],
    origin: "sync",
    in_source: false,
  },
  {
    name: "metric.baz",
    expires: getDateStr(yesterday),
    tags: ["Foo", "Bar", "Baz"],
    origin: "sync",
    in_source: false,
  },
  {
    name: "metric.blah",
    expires: getDateStr(sixMonthsFromNow),
    tags: [],
    origin: "sync",
    in_source: true,
  },
  {
    name: "metric.freh",
    expires: getDateStr(twelveMonthsFromNow),
    tags: [],
    origin: "sync",
    in_source: true,
    latest_fx_release_version: 100,
  },
  {
    name: "metric.meh",
    expires: 110,
    tags: [],
    origin: "sync",
    in_source: true,
    latest_fx_release_version: 100,
  },
  {
    name: "metric.test",
    expires: "never",
    tags: [],
    origin: "sync",
    in_source: true,
  },
];

const unCollectedMetrics = filterUncollectedItems(items, false);

describe("expiry", () => {
  it("doesn't return expired or removed items when showUncollected is false", () =>
    expect(getNames(unCollectedMetrics)).toEqual([
      "metric.bestsitez",
      "metric.camel",
      "metric.blah",
      "metric.freh",
      "metric.meh",
      "metric.test",
    ]));
});

describe("filter items by labels", () => {
  const labels = { tags: ["Foo", "Bar"], origin: ["sync"] };
  it("returns items of origin 'sync', with tags 'Foo' and 'Bar'", () =>
    expect(getNames(filterItemsByLabels(items, labels))).toEqual([
      "metric.foo",
      "metric.baz",
    ]));
});

describe("filter items by expiration", () => {
  it("returns items that will expire in 6 versions/months", () =>
    expect(getNames(filterItemsByExpiration(unCollectedMetrics, 6))).toEqual([
      "metric.bestsitez",
      "metric.camel",
      "metric.blah",
    ]));

  it("returns items that will expire in 12 versions/months", () =>
    expect(getNames(filterItemsByExpiration(unCollectedMetrics, "12"))).toEqual(
      [
        "metric.bestsitez",
        "metric.camel",
        "metric.blah",
        "metric.freh",
        "metric.meh",
      ]
    ));

  it("returns items that never expire", () =>
    expect(getNames(filterItemsByExpiration(items, "never"))).toEqual([
      "metric.test",
    ]));
});
