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

export function getBreadcrumbLinks(pageParams) {
  const { app, metric, app_id, ping, table } = pageParams;

  return [
    ...(app
      ? [
          { url: "/", name: "apps" },
          { url: `/${app}/`, name: app },
        ]
      : []),
    ...(app_id ? [{ url: `/${app}/app_ids/${app_id}/`, name: app_id }] : []),
    ...(ping ? [{ url: `/${app}/pings/${ping}/`, name: ping }] : []),
    ...(metric
      ? [
          {
            url: `/${app}/metrics/${metric}/`,
            name: metric,
          },
        ]
      : []),
    ...(table
      ? [
          {
            url: `/${app}/app_ids/${app_id}/tables/${table}/`,
            name: table,
          },
        ]
      : []),
  ];
}
