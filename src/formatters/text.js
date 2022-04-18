export function getPingReasons(reasons) {
  // `reasons` is a JS object, we need to convert
  // it to a markdown string of key-value pairs
  // to be used in the MetadataTable schema
  return Object.entries(reasons)
    .map(([k, v]) => `- <code>${k}</code>: ${v}`)
    .join("<br>")
    .toString();
}
