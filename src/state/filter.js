import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item) && !isRemoved(item))
  );

export const filterUnmatchedItems = (firstArray, secondArray) =>
  firstArray.filter((l) => secondArray.includes(l));

export const filterItemsByLabels = (items, labels) => {
  let itemsFilteredByLabels = items;

  const filteredItems = (label) => {
    return items.filter(
      (item) =>
        item[label] && labels[label].every((el) => item[label].includes(el))
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
