export const isExpired = (date) => {
  if (date === "never" || date === undefined) {
    return false;
  }
  const GivenDate = new Date(date);
  const CurrentDate = new Date();
  if (GivenDate > CurrentDate) {
    return false;
  }
  return true;
};
