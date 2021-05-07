function getResourceName(name) {
  // workaround servers that incorrectly interpret url resources with a "." in
  // them as having an extension (this is common for metrics and application ids) -- the glean
  // schema doesn't allow `-`'s in metrics, so this should be ok
  return name.replace(/\./g, "_");
}

export function getItemURL(appName, itemType, itemName) {
  return `/apps/${appName}/${itemType}/${getResourceName(itemName)}`;
}

export function getBigQueryURL(appName, appId, pingName, metricName) {
  const base = `/apps/${getResourceName(appName)}/app_ids/${getResourceName(
    appId
  )}/tables/${pingName}`;

  return base + (metricName ? `?search=${metricName}` : "");
}

export function getLookerURL(appName, pingName) {
  // this is currently only supported for a hardcoded set of app ids and is a bit of a
  // hack (we should ideally be doing this somewhere in our upstream ETL)

  if (appName === "fenix" || appName === "burnham") {
    return `https://mozilladev.cloud.looker.com/explore/${appName}/${pingName.replace(
      /-/g,
      "_"
    )}`;
  }

  return undefined;
}
