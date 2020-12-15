import ItemList from "../src/components/ItemList.svelte";

const testData = {
  name: "Test data",
  metrics: [...Array(21).keys()].map((i) => ({
    name: `Test metric ${i}`,
    description: `This is test metric ${i}`,
  })),
};
export default {
  title: "ItemList",
};

export const Default = () => ({
  Component: ItemList,
  props: {
    items: testData,
    itemType: "metrics",
  },
});
