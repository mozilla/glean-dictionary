import App from "./App.svelte";

import { googleAnalytics } from "./ga";

if ("__GOOGLE_ANALYTICS_ID__".length)
  googleAnalytics("__GOOGLE_ANALYTICS_ID__");

const app = new App({
  target: document.body,
  props: {
    title: "Glean Dictionary prototype",
  },
});

export default app;
