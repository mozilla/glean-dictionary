function getResourceName(name) {
  // workaround servers that incorrectly interpret url resources with a "." in
  // them as having an extension (this is common for metrics and application ids) -- the glean
  // schema doesn't allow `-`'s in metrics, so this should be ok
  return name.replace(/\./g, "_");
}

export function getItemURL(appName, itemType, itemName) {
  return `/${appName}/${itemType}/${getResourceName(itemName)}`;
}

export function getBigQueryURL(appName, appId, pingName, metricName) {
  const base = `/${getResourceName(appName)}/app_ids/${getResourceName(
    appId
  )}/tables/${pingName}`;

  return base + (metricName ? `?search=${metricName}` : "");
}
