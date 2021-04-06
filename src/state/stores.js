import { mapValues, pickBy } from "lodash";
import { stringify } from "query-string";
import { get, writable } from "svelte/store";

export const pageTitle = writable("");
export const pageState = writable({});

// synchronizes url state with page state
export const updateURLState = (push = false) => {
  const simplifiedState = mapValues(
    pickBy(get(pageState), (v) => (typeof v !== "string" && v) || v.length > 0),
    (v) => (typeof v === "boolean" ? +v : v)
  );
  // convert the state into a query string like "a=b&c=d" and attach it
  // to the URL
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
