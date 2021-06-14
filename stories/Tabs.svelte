<script>
  import { TabGroup, Tab, TabContent } from "../src/components/tabs";

  export let tabs;
</script>

<TabGroup active="A">
  {#each tabs as tab}
    <Tab key={tab.title}>{tab.title}</Tab>
  {/each}

  {#each tabs as tab}
    <TabContent key={tab.title}>{tab.content}</TabContent>
  {/each}
</TabGroup>
