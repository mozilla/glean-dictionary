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
  // we added data to metric names to avoid the JSON resource
  // calls being blocked by uBlock Origin

  Object.keys(UBLOCK_ORIGIN_PRIVACY_FILTER).forEach((filter) => {
    if (metricName.includes(filter)) {
      const newMetricName = metricName.replace(
        filter,
        UBLOCK_ORIGIN_PRIVACY_FILTER[filter]
      );
      console.log(newMetricName);
      return fetchJSON(`/data/${appName}/metrics/data_${newMetricName}.json`);
    } else return fetchJSON(`/data/${appName}/metrics/data_${metricName}.json`);
  });
  console.log("barb");
  return;
}

export async function getTableData(appName, appId, pingName) {
  return fetchJSON(`/data/${appName}/tables/${appId}/${pingName}.json`);
}
