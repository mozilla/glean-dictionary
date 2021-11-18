import { fullTextSearch } from "../src/state/search";

const getNames = (items) => items.map((i) => i.name);

const items = [
  {
    name: "metric.one",
    tags: ["TopSites"],
    type: "string",
    description: "abc def",
  },
  {
    name: "metric.two",
    origin: "glean-core",
    type: "string",
    description: "ghi jkl",
  },
  {
    name: "metric.three",
    origin: "sync",
    tags: ["Foo", "Bar"],
    type: "event",
    description: "mno pqr test",
  },
  {
    name: "metric.four",
    tags: ["Foo"],
    origin: "sync",
    type: "string",
    description: "tuv wxy",
  },
  {
    name: "metric.five",
    tags: ["Foo", "Bar", "Baz"],
    origin: "sync",
    type: "event",
    description: "z abc",
  },
  {
    name: "metric.six",
    tags: ["A:Tag"],
    origin: "engine-gecko",
    type: "boolean",
    description: "def ghi",
  },
];

describe("search", () => {
  it("returns items of Foo tags and sync origin", () =>
    expect(getNames(fullTextSearch("tags:Foo origin:sync", items))).toEqual([
      "metric.three",
      "metric.four",
      "metric.five",
    ]));

  it("returns items of Foo tags, sync origin, with search word 'three'", () =>
    expect(
      getNames(fullTextSearch("three tags:Foo origin:sync", items))
    ).toEqual(["metric.three"]));

  it("returns the items that match the description `abc`", () =>
    expect(getNames(fullTextSearch("abc", items))).toEqual([
      "metric.one",
      "metric.five",
    ]));

  it("returns only type string items", () =>
    expect(getNames(fullTextSearch("string", items))).toEqual([
      "metric.one",
      "metric.two",
      "metric.four",
    ]));

  it("works correctly with tags that has a `:` in its name", () =>
    expect(getNames(fullTextSearch("tags:A:Tag", items))).toEqual([
      "metric.six",
    ]));
});
