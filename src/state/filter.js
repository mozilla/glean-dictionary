import { isExpired } from "./metrics";

export const filterExpiredItems = (items, showExpired) =>
  items.filter((item) => showExpired || !isExpired(item.expires));
