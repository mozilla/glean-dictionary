import { isExpired } from "./metrics";

export function filterItems(items, search, showExpired) {
  const searchTokens = search.trim().toLowerCase().split(/\s+/);

  // filter on match either on name, origin, or tag
  // in all cases a partial match is ok and we'll do a case insensitive
  // match, but an item has to match *each* of the tokens
  const originMatch = (item, searchToken) =>
    item.origin && item.origin.toLowerCase().includes(searchToken);

  const tagMatch = (item, searchToken) =>
    item.tags &&
    item.tags.some((tag) => tag.toLowerCase().includes(searchToken));

  const metricTypeMatch = (item, searchToken) =>
    item.type && item.type.toLowerCase().includes(searchToken);

  return items.filter(
    (item) =>
      (showExpired || !isExpired(item.expires)) &&
      searchTokens.every(
        (searchToken) =>
          item.name.toLowerCase().includes(searchToken) ||
          originMatch(item, searchToken) ||
          tagMatch(item, searchToken) ||
          metricTypeMatch(item, searchToken)
      )
  );
}
