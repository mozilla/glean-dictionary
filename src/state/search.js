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
  let searchQueryWithoutLabels = "";
  let itemsFilteredByLabels = searchItems;

  const searchWords = query.split(" ");
  const labels = { tags: [], origin: [] };
  const searchIndex = generateSearchIndex(searchItems);

  searchWords.forEach((word) => {
    if (word.startsWith("tags:") || word.startsWith("origin:")) {
      const labelType = word.split(":")[0];
      labels[labelType] = [...labels[labelType], word.split(":")[1]];
    } else {
      // join the rest of the search tokens
      searchQueryWithoutLabels = word
        ? `${searchQueryWithoutLabels} ${word}`
        : searchQueryWithoutLabels;
    }
  });

  itemsFilteredByLabels = filterItemsByLabels(searchItems, labels);

  if (!query || !searchQueryWithoutLabels) return itemsFilteredByLabels;

  const results = [
    ...new Set(
      searchIndex
        // manually set the limit here to get all results (FlexSearch only returns 100 entries: https://github.com/nextapps-de/flexsearch#limit--offset)
        .search(searchQueryWithoutLabels, { limit: 10000 })
        .flatMap((match) => match.result)
    ),
  ];

  return results
    .map((result) => {
      return itemsFilteredByLabels.find((item) => item.name === result);
    })
    .filter((el) => el !== undefined);
};
