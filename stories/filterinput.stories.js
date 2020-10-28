import { withKnobs, array } from "@storybook/addon-knobs";
import FilterableList from "./FilterableList.svelte";

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
