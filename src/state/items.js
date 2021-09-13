export const isRemoved = (item) => {
  // only consider an item expired if it has an in_source property
  // and it is false
  return item.in_source === false;
};

export const isExpired = (item) => {
  if (item.expires === "never" || item.expires === undefined) {
    return false;
  }
  return new Date() > new Date(item.expires);
};
