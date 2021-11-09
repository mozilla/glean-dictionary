import { isExpired, isRemoved } from "./items";

export const filterUncollectedItems = (items) =>
  items.filter((item) => !isExpired(item) && !isRemoved(item));
