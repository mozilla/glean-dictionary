import ItemList from "../src/components/ItemList.svelte";

const testData = {
  name: "Test data",
  metrics: [...Array(21).keys()].map((i) => ({
    name: `test metric ${i}`,
    description: `This is test metric ${i}`,
    type: `metric_type`,
  })),
};
export default {
  title: "ItemList",
};

export const Default = () => ({
  Component: ItemList,
  props: {
    items: testData.metrics,
    itemType: "metrics",
    appName: "app-name",
  },
});
