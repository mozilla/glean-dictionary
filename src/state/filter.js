import { intersection, omit } from "lodash";
import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item) && !isRemoved(item))
  );

export const filterItemsByLabels = (items, labels) => {
  let itemsFilteredByLabels = items;
  // we don't need to filter by "expires" in this method
  let labelsToFilter = omit(labels, "expires");
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
  // to the target date/version in X months
  // the assumption is that there's a new version release every month
  let today = new Date();
  let targetDate = today.setMonth(
    today.getMonth() + Number(monthsOrVersionFromNow)
  );
  const willExpireItems = items.filter((item) => item.expires);

  let filteredByDate = willExpireItems.filter(
    (item) => Date.parse(item.expires) && new Date(item.expires) < targetDate
  );

  let filteredByVersion = willExpireItems.filter(
    (item) =>
      item.expires &&
      item.latest_fx_release_version &&
      Number(item.expires) <=
        Number(item.latest_fx_release_version) + Number(monthsOrVersionFromNow)
  );
  if (monthsOrVersionFromNow === "never") {
    return items.filter((item) => !item.expires);
  }
  return [...filteredByDate, ...filteredByVersion];
};
