export function getItemURL(appName, itemType, itemName) {
  // workaround servers that incorrectly interpret url resources with a "." in
  // them as having an extension (this is common for metrics) -- the glean
  // schema doesn't allow `-`'s in metrics, so this should be ok
  return `/apps/${appName}/${itemType}/${itemName.replace(/\./g, "-")}`;
}

export function getMetricBigQueryURL(appName, pingName, metricName) {
  return metricName
    ? `/apps/${appName}/tables/${pingName}?search=${metricName}`
    : `/apps/${appName}/tables/${pingName}`;
}
