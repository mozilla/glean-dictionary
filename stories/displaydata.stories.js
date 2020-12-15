import DisplayData from "../src/components/DisplayData.svelte";

const testData = {
  name: "Test data",
  metrics: [
    {
      name: "Test metric 1",
      description: "This is a metric",
    },
    {
      name: "Test metric 2",
      description: "This is another metric",
    },
    {
      name: "Test metric 3",
      description: "This is another metric",
    },
    {
      name: "Test metric 4",
      description: "This is another metric",
    },
    {
      name: "Test metric 5",
      description: "This is another metric",
    },
    {
      name: "Test metric 6",
      description: "This is another metric",
    },
    {
      name: "Test metric 7",
      description: "This is another metric",
    },
    {
      name: "Test metric 8",
      description: "This is another metric",
    },
    {
      name: "Test metric 9",
      description: "This is another metric",
    },
    {
      name: "Test metric 10",
      description: "This is another metric",
    },
    {
      name: "Test metric 11",
      description: "This is another metric",
    },
    {
      name: "Test metric 12",
      description: "This is another metric",
    },
    {
      name: "Test metric 13",
      description: "This is another metric",
    },
    {
      name: "Test metric 14",
      description: "This is another metric",
    },
    {
      name: "Test metric 15",
      description: "This is another metric",
    },
    {
      name: "Test metric 16",
      description: "This is another metric",
    },
    {
      name: "Test metric 17",
      description: "This is another metric",
    },
    {
      name: "Test metric 18",
      description: "This is another metric",
    },
    {
      name: "Test metric 19",
      description: "This is another metric",
    },
    {
      name: "Test metric 20",
      description: "This is another metric",
    },
    {
      name: "Test metric 21",
      description: "This is another metric",
    },
  ],
};
export default {
  title: "DisplayData",
};

export const Default = () => ({
  Component: DisplayData,
  props: {
    data: testData,
    itemType: "metrics",
  },
});
