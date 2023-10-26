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
  component: Tabs,
};

export const Basic = {
  args: {
    tabs,
  },
};
