import FilterableList from "./FilterableList.svelte";

const listItems = ["foo", "bar", "foobar", "lorem", "ipsum"];

export default {
  title: "FilterInput",
  component: FilterableList,
};

export const Basic = {
  args: {
    listItems,
  },
};
