<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import SubHeading from "../components/SubHeading.svelte";

  export let title = "SubHeading";
  export let helpText = "This is a help text for this subheading.";
</script>

<Meta title="Example/SubHeading" component={SubHeading} />

<Template let:args>
  <SubHeading {...args} />
</Template>

<Story
  name="Default"
  args={{
    title,
    helpText,
  }}
/>
