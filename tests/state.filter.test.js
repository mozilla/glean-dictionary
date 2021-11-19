import {
  filterUncollectedItems,
  filterItemsByLabels,
} from "../src/state/filter";

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
