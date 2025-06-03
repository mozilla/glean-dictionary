import { generateSearchIndex, fullTextSearch } from "../src/state/search";

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
  {
    name: "metric.seven",
    tags: ["Tag with spaces"],
    origin: "engine-gecko",
    type: "boolean",
    description: "jkl mno",
  },
  {
    name: "metric.eight",
    origin: "engine-gecko",
    type: "boolean",
    description: "mno pqr stu",
  },
];

const searchIndex = generateSearchIndex(items);

describe("search", () => {
  it("returns items of Foo tags and sync origin", () =>
    expect(
      getNames(fullTextSearch(searchIndex, "tags:Foo origin:sync", items))
    ).toEqual(["metric.three", "metric.four", "metric.five"]));

  it("returns items of Foo tags, sync origin, with search word 'three'", () =>
    expect(
      getNames(fullTextSearch(searchIndex, "three tags:Foo origin:sync", items))
    ).toEqual(["metric.three"]));

  it("returns the items that match the description `abc`", () =>
    expect(getNames(fullTextSearch(searchIndex, "abc", items))).toEqual([
      "metric.one",
      "metric.five",
    ]));

  it("returns only type string items", () =>
    expect(getNames(fullTextSearch(searchIndex, "string", items))).toEqual([
      "metric.one",
      "metric.two",
      "metric.four",
    ]));

  it("works correctly with tags that has a `:` in its name", () =>
    expect(getNames(fullTextSearch(searchIndex, "tags:A:Tag", items))).toEqual([
      "metric.six",
    ]));

  it("works correctly with tags with spaces", () =>
    expect(
      getNames(fullTextSearch(searchIndex, 'tags:"Tag with spaces"', items))
    ).toEqual(["metric.seven"]));

  it("exact match non-tokenized", () =>
    expect(
      getNames(fullTextSearch(searchIndex, '"mno pqr stu"', items))
    ).toEqual(["metric.eight"]));
});
