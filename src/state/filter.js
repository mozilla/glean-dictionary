import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item) && !isRemoved(item))
  );

const filterUnmatchedItems = (firstArray, secondArray) =>
  firstArray.filter((l) => secondArray.includes(l));

export const filterItemsByLabels = (items, labels) => {
  let itemsFilteredByLabels = items;

  // an item can have many tags, but only one origin
  const filteredItems = (label) => {
    return label === "tags"
      ? items.filter((item) =>
          labels.tags.every((tag) => item.tags.includes(tag))
        )
      : items.filter(
          (item) => item.origin && item.origin.includes(labels.origin[0])
        );
  };

  Object.keys(labels).forEach((key) => {
    if (labels[key].length) {
      itemsFilteredByLabels = filterUnmatchedItems(
        filteredItems(key),
        itemsFilteredByLabels
      );
    }
  });
  return itemsFilteredByLabels;
};
