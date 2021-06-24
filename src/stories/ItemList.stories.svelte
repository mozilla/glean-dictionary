<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ItemList from "./ItemList.svelte";

  const testData = {
    name: "Test data",
    metrics: [...Array(21).keys()].map((i) => ({
      name: `test metric ${i}`,
      description: `This is test metric ${i}`,
      type: `metric_type`,
    })),
  };
</script>

<Meta title="Example/ItemList" component={ItemList} />

<Template let:args>
  <ItemList {...args} />
</Template>

<Story
  name="Default"
  args={{
    items: testData.metrics,
    itemType: "metrics",
    appName: "app-name",
  }}
/>
