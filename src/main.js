import { initializeTelemetry } from "./telemetry";

import App from "./App.svelte";

initializeTelemetry();

const app = new App({
  target: document.body,
  props: {
    title: "Glean Dictionary prototype",
  },
});

export default app;
