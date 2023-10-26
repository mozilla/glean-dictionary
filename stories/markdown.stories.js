import Markdown from "../src/components/Markdown.svelte";

const mark =
  "A *text* in markdown [moz](https://mozilla.org).\n\nA list:\n\n* Lorem\n* Ipsum\n\nThis is an ordered list starting from 2:\n\n2. Foo\n3. Bar";
const markdownWithHTML =
  'Markdown with inline <span style="color: blue">HTML</span> (unquoted) and more angle `<brackets>` (quoted)';

const inline = false;

export default {
  title: "Markdown",
  component: Markdown,
};

export const Text = {
  args: {
    text: mark,
    inline,
  },
};

export const TextWithHTML = {
  parameters: {
    knobs: { escapeHTML: false },
  },
  args: {
    text: markdownWithHTML, // knobs don't allow unescaped text
    inline,
  },
};
