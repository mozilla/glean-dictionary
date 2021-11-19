import { intersection } from "lodash";
import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item) && !isRemoved(item))
  );

export const filterItemsByLabels = (items, labels) => {
  let itemsFilteredByLabels = items;

  // filter items that match every value of a label type
  // (e.g. an item can have multiple tags)
  const getItemsByLabel = (label) => {
    return items.filter(
      (item) =>
        item[label] && labels[label].every((el) => item[label].includes(el))
    );
  };

  // for each label type, get an array of items that match all labels of that type
  // then, filter the result by getting the intersection of said arrays
  Object.keys(labels).forEach((key) => {
    if (labels[key].length) {
      itemsFilteredByLabels = intersection(
        getItemsByLabel(key),
        itemsFilteredByLabels
      );
    }
  });
  return itemsFilteredByLabels;
};
