// ESlint does not support subpath exports, which are used by Glean.
// https://github.com/import-js/eslint-plugin-import/issues/1868
//
// eslint-disable-next-line import/no-unresolved
import Glean from "@mozilla/glean/web";

import { googleAnalytics } from "./ga";

// Glean generated metrics and pings files
import * as pageMetrics from "./generated/page";
import { pageView as pageViewPing } from "./generated/pings";

// detecting "do not track" via these instructions:
// https://dev.to/corbindavenport/how-to-correctly-check-for-do-not-track-with-javascript-135d
const isDNTEnabled =
  window.doNotTrack === "1" ||
  navigator.doNotTrack === "yes" ||
  navigator.doNotTrack === "1" ||
  navigator.msDoNotTrack === "1" ||
  ("msTrackingProtectionEnabled" in window.external &&
    window.external.msTrackingProtectionEnabled());

/**
 * Initialize Telemetry.
 *
 * This function will initialize both Glean and Google Analytics.
 */
export function initializeTelemetry() {
  // Initialize Google Analytics only if DNT is not enabled.
  if ("__GOOGLE_ANALYTICS_ID__".length && !isDNTEnabled)
    googleAnalytics("__GOOGLE_ANALYTICS_ID__");

  // Initialize Glean regardless whether DNT is enabled,
  // however give Glean the DNT stats as the uploadEnabled status.
  //
  // If DNT is enabled Glean will _not_ upload any telemetry
  // other than the deletion-request ping.
  Glean.initialize("__GLEAN_APPLICATION_ID__", !isDNTEnabled, {
    appBuild: "__VERSION__",
    appDisplayVersion: "__DISPLAY_VERSION__",
  });

  /* eslint-disable no-undef, no-constant-condition */

  // GLEAN_LOG_PINGS is a boolean value,
  // thus it should not have quotes around it.
  if (GLEAN_LOG_PINGS === true) {
    Glean.setLogPings(true);
  }

  if ("GLEAN_DEBUG_VIEW_TAG") {
    Glean.setDebugViewTag("GLEAN_DEBUG_VIEW_TAG");
  }

  if ("GLEAN_SOURCE_TAGS") {
    // GLEAN_SOURCE_TAGS is supposed to be a comma separated string of tags
    const sourceTags = "GLEAN_SOURCE_TAGS".split(",").map((tag) => tag.trim());
    Glean.setSourceTags(sourceTags);
  }
  /* eslint-enable no-undef */
}

/**
 * Submits telemetry to Glean and Google Analytics related to a page view.
 *
 * @param {string} path The current page path.
 */
export function submitPageViewTelemetry(path) {
  // Send telemetry to Google Analytics.
  if (window.ga) {
    // `ga` will not be set if not using google analytics
    ga("set", "page", path);
    ga("send", "pageview");
  }

  // Send telemetry to Glean.
  pageMetrics.loaded.set();
  // Remove query params and trailing `/` characters.
  pageMetrics.path.set(path.split("?")[0].replace(/\/$/, ""));
  pageViewPing.submit();
}
