import {
  filterUncollectedItems,
  filterItemsByLabels,
  filterItemsByExpiration,
} from "../src/state/filter";

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const sixMonthsFromNow = dateObj.setMonth(today.getMonth() + 6);
const twelveMonthsFromNow = dateObj.setMonth(today.getMonth() + 12);

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
  {
    name: "metric.foo",
    expires: getDateStr(tomorrow),
    origin: "sync",
    tags: ["Foo", "Bar"],
    in_source: false,
  },
  {
    name: "metric.bar",
    expires: getDateStr(tomorrow),
    tags: ["Foo"],
    origin: "sync",
    in_source: false,
  },
  {
    name: "metric.baz",
    expires: getDateStr(tomorrow),
    tags: ["Foo", "Bar", "Baz"],
    origin: "sync",
    in_source: false,
  },
  {
    name: "metric.1",
    expires: 99,
    tags: [],
    latest_fx_release_version: 100,
    in_source: false,
  },
  {
    name: "metric.2",
    expires: getDateStr(sixMonthsFromNow),
    tags: [],
    origin: "sync",
    latest_fx_release_version: 100,
    in_source: false,
  },
  {
    name: "metric.3",
    expires: getDateStr(twelveMonthsFromNow),
    tags: [],
    origin: "sync",
    latest_fx_release_version: 100,
    in_source: false,
  },
  {
    name: "metric.4",
    expires: 105,
    tags: [],
    origin: "sync",
    in_source: false,
  },
  {
    name: "metric.5",
    expires: "never",
    tags: [],
    origin: "sync",
    in_source: false,
  },
];

describe("expiry", () => {
  it("doesn't return expired or removed items when showUncollected is false", () =>
    expect(getNames(filterUncollectedItems(items, false))).toEqual([
      "metric.bestsitez",
      "metric.camel",
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
    expect(getNames(filterItemsByExpirationDate(items, 6))).toEqual([
      "metric.2",
      "metric.4",
    ]));

  it("returns items that will expire in 12 versions/months", () =>
    expect(getNames(filterItemsByExpirationDate(items, 6))).toEqual([
      "metric.2",
      "metric.3",
      "metric.4",
    ]));
  it("returns items that never expire", () =>
    expect(getNames(filterItemsByExpirationDate(items, "never"))).toEqual([
      "metric.5",
    ]));
});
