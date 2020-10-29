import Markdown from "../src/components/Markdown.svelte";

const markdown = "A *text* in markdown [moz](https://mozilla.org).";

export default {
  title: "Markdown",
};

const Mark = ({ ...args }) => ({
  Component: Markdown,
  props: args,
});

export const Text = Mark.bind({});
Text.args = { markdown };
