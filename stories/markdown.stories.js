import { text } from "@storybook/addon-knobs";
import Markdown from "../src/components/Markdown.svelte";

const mark = "A *text* in markdown [moz](https://mozilla.org).";

export default {
  title: "Markdown",
};

export const Text = () => ({
  Component: Markdown,
  props: {
    text: text("text", mark),
  },
});
