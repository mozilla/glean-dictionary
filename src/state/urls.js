export function getMetricURL(appName, metricName) {
  // workaround servers that incorrectly interpret url resources with a "." in
  // them as having an extension (this is common for metrics) -- the glean
  // schema doesn't allow `-`'s in metrics, so this should be ok
  return `/apps/${appName}/metrics/${metricName.replace(/-/g, "i")}`;
}
