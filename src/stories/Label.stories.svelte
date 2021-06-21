<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Label from "./Label.svelte";
</script>

<Meta
  title="Example/Label"
  component={Label}
/>

<Template let:args>
  <Label {...args} />
</Template>

<Story
  name="Default"
/>