<script>
  import { getAppData } from "../state/api";

  import { APPLICATION_DEFINITION_SCHEMA } from "../data/schemas";
  import AppAlert from "../components/AppAlert.svelte";
  import ItemList from "../components/ItemList.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Pill from "../components/Pill.svelte";
  import { TabGroup, Tab, TabContent } from "../components/tabs";
  import PageTitle from "../components/PageTitle.svelte";
  import { pageTitle } from "../state/stores";

  export let params;

  const appDataPromise = getAppData(params.app);

  pageTitle.set(params.app);
</script>

<style>
  @import "../main.scss";
</style>

{#await appDataPromise then app}
  {#if app.prototype}
    <AppAlert
      status="warning"
      message="This application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings." />
  {/if}
  <PageTitle text={params.app} />

  {#if app.deprecated}
    <Pill message="Deprecated" bgColor="#4a5568" />
  {/if}
  <p>{app.description}</p>

  <MetadataTable
    appName={params.app}
    item={app}
    schema={APPLICATION_DEFINITION_SCHEMA} />

  <TabGroup active="Metrics">
    <Tab key="Metrics">Metrics</Tab>
    <Tab key="Pings">Pings</Tab>
    <Tab key="Application IDs">Application IDs</Tab>

    <TabContent key="Pings">
      <ItemList itemType="pings" items={app.pings} appName={app.name} />
    </TabContent>

    <TabContent key="Metrics">
      <ItemList itemType="metrics" items={app.metrics} appName={app.name} />
    </TabContent>

    <TabContent key="Application IDs">
      <ItemList
        itemType="app_ids"
        items={app.app_ids}
        appName={app.name}
        showFilter={false} />
    </TabContent>
  </TabGroup>
{:catch}
  <NotFound pageName={params.app} itemType="application" />
{/await}
