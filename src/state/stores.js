import { mapValues, pickBy } from "lodash";
import { stringify } from "query-string";
import { writable, get } from "svelte/store";

export const pageTitle = writable("");
export const pageState = writable({});

// simplifies the page state (removing redundant values)
// before updating the store
const setPageState = (newState) => {
  pageState.set(mapValues(
    pickBy(
      { ...get(pageState), ...newState },
      (v) => (typeof v !== "string" && v) || v.length > 0
    ),
    (v) => (typeof v === "boolean" ? +v : v)
  );
};

// replaces the existing page state
export const replacePageState = (newState) => {
  setPageState(newState);
};

// updates page state and synchronizes with the url
export const updatePageState = (newState, push = false) => {
  const mergedState = { ...get(pageState), ...newState };
  setPageState(mergedState);

  // convert the state into a query string like "a=b&c=d" and attach it
  // to the URL
  const query = stringify(mergedState);
  const path = `${window.location.pathname}${query ? `?${query}` : ""}`;
  // in response to some actions, we want to explicitly add a url to the
  // page history
  if (push) {
    window.history.pushState(null, undefined, path);
  } else {
    window.history.replaceState(null, undefined, path);
  }
};
