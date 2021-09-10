import { isExpired } from "./metrics";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item.expires) && item.in_source)
  );
