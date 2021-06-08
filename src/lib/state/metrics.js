export const isExpired = (expiryDate) => {
  if (expiryDate === "never" || expiryDate === undefined) {
    return false;
  }
  return new Date() > new Date(expiryDate);
};
