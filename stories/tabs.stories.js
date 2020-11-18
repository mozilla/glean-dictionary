import Tabs from "../src/components/Tabs.svelte";

export default {
  title: "Tabs",
};

export const Basic = () => ({
  Component: Tabs,
  props: {
    tabItems: ["Pings", "Metrics"],
    activeTab: "Pings",
  },
});
