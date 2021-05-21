import { text } from "@storybook/addon-knobs";

import AuthenticatedLink from "./AuthenticatedLink.svelte";

export default {
  title: "Authenticated Link",
};

export const Text = () => ({
  Component: AuthenticatedLink,
  props: {
    href: text("href", "https://glam.telemetry.mozilla.org"),
    title: text("title", "GLAM"),
  },
});
