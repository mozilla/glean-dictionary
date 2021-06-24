<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import FilterInput from "./FilterInput.svelte";

  const listItems = ["foo", "bar", "foobar", "lorem", "ipsum"];
</script>

<Meta
  title="Example/FilterInput"
  component={FilterInput}
  argTypes={{
    status: { control: "text" },
  }}
/>

<Template let:args>
  <FilterInput {...args} />
</Template>

<Story name="Default" args={{ listItems }} />
