import { mapValues, pickBy } from "lodash";
import { stringify } from "query-string";
import { writable, get } from "svelte/store";

export const pageTitle = writable("");
export const pageState = writable({});

// updates page state and synchronizes with the url
export const updateURLState = (newState, push = false) => {
  const mergedState = { ...get(pageState), ...newState };
  pageState.set(mergedState);

  // convert the state into a query string like "a=b&c=d" and attach it
  // to the URL
  const simplifiedState = mapValues(
    pickBy(mergedState, (v) => typeof v !== "string" || v.length > 0),
    (v) => (typeof v === "boolean" ? +v : v)
  );
  const query = stringify(simplifiedState);
  const path = `${window.location.pathname}${query ? `?${query}` : ""}`;
  // in response to some actions, we want to explicitly add a url to the
  // page history
  if (push) {
    window.history.pushState(null, undefined, path);
  } else {
    window.history.replaceState(null, undefined, path);
  }
};
