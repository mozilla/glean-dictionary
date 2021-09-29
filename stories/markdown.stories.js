import { text, boolean } from "@storybook/addon-knobs";
import Markdown from "../src/components/Markdown.svelte";

const mark =
  "A *text* in markdown [moz](https://mozilla.org).\n\nA list:\n\n* Lorem\n* Ipsum\n\nThis is an ordered list starting from 2:\n\n2. Foo\n3. Bar";
const markdownWithHTML =
  'Markdown with inline <span style="color: blue">HTML</span> (unquoted) and more angle `<brackets>` (quoted)';

const inline = false;

export default {
  title: "Markdown",
};

export const Text = () => ({
  Component: Markdown,
  props: {
    text: text("text", mark),
    inline: boolean("inline", inline),
  },
});

export const TextWithHTML = () => ({
  Component: Markdown,
  parameters: {
    knobs: { escapeHTML: false },
  },
  props: {
    text: markdownWithHTML, // knobs don't allow unescaped text
    inline: boolean("inline", inline),
  },
});
