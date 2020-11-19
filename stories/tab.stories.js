import { withKnobs } from "@storybook/addon-knobs";
import Tabs from "./Tabs.svelte";

const tabs = [
  {
    title: "A",
    content: "Content for Tab A",
  },
  {
    title: "B",
    content: "Content for Tab B",
  },
];
export default {
  title: "Tab",
  decorators: [withKnobs],
};

export const Basic = () => ({
  Component: Tabs,
  props: {
    tabs,
  },
});
