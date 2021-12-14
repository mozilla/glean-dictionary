import Glean from "@mozilla/glean/web";

import App from "./App.svelte";

import { googleAnalytics } from "./ga";

// detecting "do not track" via these instructions:
// https://dev.to/corbindavenport/how-to-correctly-check-for-do-not-track-with-javascript-135d
const isDNTEnabled =
  window.doNotTrack === "1" ||
  navigator.doNotTrack === "yes" ||
  navigator.doNotTrack === "1" ||
  navigator.msDoNotTrack === "1" ||
  ("msTrackingProtectionEnabled" in window.external &&
    window.external.msTrackingProtectionEnabled());

if ("__GOOGLE_ANALYTICS_ID__".length && !isDNTEnabled)
  googleAnalytics("__GOOGLE_ANALYTICS_ID__");

if (process.env.NODE_ENV === "development") {
  Glean.setLogPings(true);
}

Glean.initialize("__GLEAN_APPLICATION_ID__", !isDNTEnabled, {
  appBuild: "__VERSION__",
  appDisplayVersion: "__DISPLAY_VERSION__",
});

const app = new App({
  target: document.body,
  props: {
    title: "Glean Dictionary prototype",
  },
});

export default app;
