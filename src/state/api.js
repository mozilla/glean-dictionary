import fetch from "node-fetch";
import { UBLOCK_ORIGIN_PRIVACY_FILTER } from "../formatters/adblocker";

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
  let updatedMetricName = metricName;

  Object.keys(UBLOCK_ORIGIN_PRIVACY_FILTER).forEach((filter) => {
    if (updatedMetricName.includes(filter)) {
      updatedMetricName = updatedMetricName.replace(
        filter,
        UBLOCK_ORIGIN_PRIVACY_FILTER[filter]
      );
    }
  });

  // we added data to metric names to avoid the JSON resource
  // calls being blocked by uBlock Origin
  return fetchJSON(`/data/${appName}/metrics/data_${updatedMetricName}.json`);
}

export async function getTableData(appName, appId, pingName) {
  return fetchJSON(`/data/${appName}/tables/${appId}/${pingName}.json`);
}
