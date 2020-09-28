import fetch from "node-fetch";

async function fetchJSON(uri) {
  const res = await fetch(uri);
  return res.json();
}

export async function getPingData(appName, pingName) {
  return fetchJSON(`data/${appName}/pings/${pingName}.json`);
}
