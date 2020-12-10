import fetch from "node-fetch";

export async function fetchJSON(uri) {
  const res = await fetch(uri);
  return res.json();
}

export async function getAppData(appName) {
  return fetchJSON(`/data/${appName}/index.json`);
}

export async function getPingData(appName, pingName) {
  return fetchJSON(`/data/${appName}/pings/${pingName}.json`);
}

export async function getMetricData(appName, metricName) {
  return fetchJSON(`/data/${appName}/metrics/${metricName}.json`);
}

export async function getTableData(appName, pingName) {
  return fetchJSON(`/data/${appName}/tables/${pingName}.json`);
}
