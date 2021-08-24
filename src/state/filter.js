import { isExpired } from "./metrics";

export function filterByOriginOrTag(items, search) {
  const searchTokens = search.trim().toLowerCase().split(/\s+/);
  const originMatch = (item, searchToken) =>
    item.origin && item.origin.toLowerCase().includes(searchToken);

  const tagMatch = (item, searchToken) =>
    item.tags &&
    item.tags.some((tag) => tag.toLowerCase().includes(searchToken));

  return items.filter((item) =>
    searchTokens.every(
      (searchToken) =>
        originMatch(item, searchToken) || tagMatch(item, searchToken)
    )
  );
}

export const filterExpiredItems = (items, showExpired) =>
  items.filter((item) => showExpired || !isExpired(item.expires));
