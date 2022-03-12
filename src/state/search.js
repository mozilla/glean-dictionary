import { Document } from "flexsearch";

import { filterItemsByLabels } from "./filter";

const generateSearchIndex = (items) => {
  const searchIndex = new Document({
    tokenize: "forward",
    index: ["id", "type", "tags", "origin", "description"],
  });

  items.forEach((item) => {
    searchIndex.add({
      id: item.name,
      type: item.type,
      tags: item.tags,
      origin: item.origin,
      description: item.description,
    });
  });

  return searchIndex;
};

export const fullTextSearch = (query, searchItems) => {
  let itemsFilteredByLabels = searchItems;
  let unlabeledsearchTerms = [];

  const searchTerms = query.match(/(?:(?:tags:)?".+")|"?[^ ]+"?/g);
  const labels = { tags: [], origin: [] };
  const searchIndex = generateSearchIndex(searchItems);

  searchTerms.forEach((term) => {
    if (term.startsWith("tags:") || term.startsWith("origin:")) {
      const splitter = term.indexOf(":");
      const labelType = term.slice(0, splitter);
      labels[labelType] = [
        ...labels[labelType],
        term.slice(splitter + 1).replace(/"?(.*?)"?$/, "$1"),
      ];
    } else {
      // join the rest of the search tokens
      unlabeledsearchTerms = term && [...unlabeledsearchTerms, term];
    }
  });
  itemsFilteredByLabels = filterItemsByLabels(searchItems, labels);

  if (!unlabeledsearchTerms.length) return itemsFilteredByLabels;

  const results = [
    ...new Set(
      searchIndex
        // manually set the limit here to get all results (FlexSearch only returns 100 entries: https://github.com/nextapps-de/flexsearch#limit--offset)
        .search(unlabeledsearchTerms.join(" "), { limit: 10000 })
        .flatMap((match) => match.result)
    ),
  ];

  return results
    .map((result) => {
      return itemsFilteredByLabels.find((item) => item.name === result);
    })
    .filter((el) => el !== undefined);
};
