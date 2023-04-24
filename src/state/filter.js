import { intersection, omit } from "lodash";
import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item) && !isRemoved(item))
  );

export const filterItemsByLabels = (items, labels) => {
  let itemsFilteredByLabels = items;
  // we don't need to filter by "expires" in this method
  const labelsToFilter = omit(labels, "expires");
  // filter items that match every value of a label type
  // (e.g. an item can have multiple tags)
  const getItemsByLabel = (label) =>
    items.filter(
      (item) =>
        item[label] &&
        labelsToFilter[label].every((el) => item[label].includes(el))
    );

  // for each label type, get an array of items that match all labels of that type
  // then, filter the result by getting the intersection of said arrays
  Object.keys(labelsToFilter).forEach((key) => {
    if (labelsToFilter[key].length) {
      itemsFilteredByLabels = intersection(
        getItemsByLabel(key),
        itemsFilteredByLabels
      );
    }
  });
  return itemsFilteredByLabels;
};

export const filterItemsByExpiration = (items, monthsOrVersionFromNow) => {
  // filter items that will expire by comparing the expiration date/version
  // to the target date/version in n = monthsOrVersionFromNow months
  // the assumption is that there's a new version released every month
  if (monthsOrVersionFromNow === "never") {
    return items.filter((item) => !item.expires || item.expires === "never");
  }
  const today = new Date();
  const targetDate = today.setMonth(
    today.getMonth() + Number(monthsOrVersionFromNow)
  );

  // don't include items that don't expire
  const itemsWithAnExpirationDate = items.filter((item) => item.expires);

  const filteredByDate = itemsWithAnExpirationDate.filter(
    (item) => Date.parse(item.expires) && new Date(item.expires) < targetDate
  );

  const filteredByVersion = itemsWithAnExpirationDate.filter(
    (item) =>
      !Number.isNaN(item.expires) &&
      item.latest_fx_release_version &&
      item.expires <=
        Number(item.latest_fx_release_version) + Number(monthsOrVersionFromNow)
  );

  return [...filteredByDate, ...filteredByVersion];
};
