import { mapValues, pickBy } from "lodash";
import { stringify } from "query-string";
import { writable, get } from "svelte/store";

export const pageTitle = writable("");
export const pageState = writable({});
export const pageBreadcrumbs = writable([]);

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

export const updateBreadcrumbs = (newBreadcrumbs) => {
  if (newBreadcrumbs.length > 0) {
    // add a breadcrumb to return to the root
    pageBreadcrumbs.set([{ url: "/", name: "apps" }, ...newBreadcrumbs]);
    // set a pagetitle in reverse order
    pageTitle.set(
      newBreadcrumbs
        .slice(0)
        .reverse()
        .map((b) => b.name)
        .join(" | ")
    );
  } else {
    pageBreadcrumbs.set([]);
    pageTitle.set("Glean Dictionary");
  }
};
