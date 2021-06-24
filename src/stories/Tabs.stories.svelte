<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Tabs from "./Tabs.svelte";

  export let tabs = [
    {
      title: "A",
      content: "Content for Tab A",
    },
    {
      title: "B",
      content: "Content for Tab B",
    },
  ];
</script>

<Meta title="Example/Tabs" component={Tabs} />

<Template let:args>
  <Tabs {...args} />
</Template>

<Story name="Default" args={{ tabs }} />
