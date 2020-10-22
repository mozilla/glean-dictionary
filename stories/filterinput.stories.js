import FilterableList from "./FilterableList.svelte";
import { withKnobs, array } from "@storybook/addon-knobs";

const listItems = ["foo", "bar", "foobar", "lorem", "ipsum"];

export default {
  title: "FilterInput",
  decorators: [withKnobs],
};

export const Basic = () => ({
  Component: FilterableList,
  props: {
    listItems: array("listItems", listItems),
  },
});
