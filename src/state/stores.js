import { mapValues, pickBy } from "lodash";
import { stringify } from "query-string";
import { writable, get } from "svelte/store";

export const pageTitle = writable("");
export const pageState = writable({});

// updates page state and synchronizes with the url
export const updatePageState = (newState, push = false) => {
  const mergedState = mapValues(
    pickBy(
      { ...get(pageState), ...newState },
      (v) =>
        (typeof v !== "string" && v) ||
        (v && ((v.length > 0 && v !== "page") || v !== "1"))
    ),
    (v) => (typeof v === "boolean" ? +v : v)
  );
  pageState.set(mergedState);

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
