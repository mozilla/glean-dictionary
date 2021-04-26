import fetch from "node-fetch";

export async function fetchJSON(uri) {
  const res = await fetch(uri);
  return res.json();
}

export async function getAppData(appName) {
  return fetchJSON(`/data/${appName}/index.json`);
}

export async function getAppIdData(appName, appId) {
  return fetchJSON(`/data/${appName}/app_ids/${appId}.json`);
}

export async function getPingData(appName, pingName) {
  return fetchJSON(`/data/${appName}/pings/${pingName}.json`);
}

export async function getMetricData(appName, metricName) {
  // for metric names that start with "metrics", we added "data"
  // to its JSON file name to avoid being blocked by uBlock origin

  return fetchJSON(`/data/${appName}/metrics/data_${metricName}.json`);
}

export async function getTableData(appName, appId, pingName) {
  return fetchJSON(`/data/${appName}/tables/${appId}/${pingName}.json`);
}
