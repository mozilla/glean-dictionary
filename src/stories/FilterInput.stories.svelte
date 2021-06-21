<!-- import { withKnobs, array } from "@storybook/addon-knobs";
import FilterableList from "./FilterableList.svelte";

<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import FilterInput from "../components/FilterInput.svelte";
</script>

export default {
  title: "FilterInput",
  decorators: [withKnobs],
};

export const Basic = () => ({
  Component: FilterableList,
  props: {
    listItems: array("listItems", listItems),
  },
}); -->

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

<Story
  name="Default"
  args={{
    listItems: listItems
  }}
/>