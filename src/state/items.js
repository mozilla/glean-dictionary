export const isRemoved = (item) => {
  // only consider an item expired if it has an in_source property
  // and it is false
  return item.in_source === false;
};

export const isExpired = (item) => {
  if (item.expires === "never" || !item.expires) {
    return false;
  }
  return new Date() > new Date(item.expires);
};

export const isRecent = (item) => {
  const daysDifference =
    (new Date() - new Date(item.date_first_seen)) / (1000 * 3600 * 24);
  return daysDifference < 30;
};
