<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Markdown from "../components/Markdown.svelte";

  const mark =
    "A *text* in markdown [moz](https://mozilla.org).\n\nA list:\n\n* Lorem\n* Ipsum\n\nThis is an ordered list starting from 2:\n\n2. Foo\n3. Bar";
  const markWithBracket =
    "A <text> in\n\nmarkdown <> with angle <brackets> (unquoted) and more angle `<brackets>` (quoted)";

  const inline = false;
</script>

<Meta title="Example/Markdown" component={Markdown} />
<Template let:args>
  <Markdown {...args} />
</Template>

<Story
  name="Default"
  args={{
    text: mark,
    inline,
  }}
/>

<Story
  name="with brackets"
  args={{
    text: markWithBracket,
    inline,
  }}
/>
