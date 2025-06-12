function getResourceName(name) {
  // workaround servers that incorrectly interpret url resources with a "." in
  // them as having an extension (this is common for metrics and application ids) -- the glean
  // schema doesn't allow `-`'s in metrics, so this should be ok.
  // Also replace square brackets, which are not valid in URLs, and slashes, for the case
  // of page_loag auto-events.
  return name.replace(/[.\[\]\/]/g, "_");
}

export function getItemURL(appName, itemType, itemName) {
  if (itemType === "tags") {
    return `/apps/${appName}?itemType=metrics&search=${itemName}`;
  }
  return `/apps/${appName}/${itemType}/${getResourceName(itemName)}`;
}

export function getBigQueryURL(appName, appId, pingName, metricName) {
  const base = `/apps/${getResourceName(appName)}/app_ids/${getResourceName(
    appId
  )}/tables/${pingName}`;

  return base + (metricName ? `?search=${metricName}` : "");
}

export function getMetricSearchURL(app, search) {
  return `/apps/${app}?search=${search}`;
}

export function getDataCatalogMetricURL(appId, pingId, bigQueryColumn) {
  const DATA_CATALOG_URL = "https://mozilla.acryl.io";
  return `${DATA_CATALOG_URL}/dataset/urn:li:dataset:(urn:li:dataPlatform:bigquery,moz-fx-data-shared-prod.${appId.replace(
    /\./g,
    "_"
  )}.${pingId},PROD)/Lineage?column=${bigQueryColumn}`;
}
