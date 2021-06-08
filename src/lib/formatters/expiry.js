export function getExpiryInfo(expiryDateStr) {
  switch (expiryDateStr) {
    case "never":
      return "Never expires";
    case "expired":
      return "Has already manually expired";
    default:
      return `${expiryDateStr}`;
  }
}
