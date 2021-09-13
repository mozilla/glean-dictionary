import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items, showUncollected) =>
  items.filter(
    (item) => showUncollected || (!isExpired(item) && !isRemoved(item))
  );
