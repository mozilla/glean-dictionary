<script>
  import { getAppData } from "../state/api";

  import { APPLICATION_DEFINITION_SCHEMA } from "../data/schemas";
  import AppAlert from "../components/AppAlert.svelte";
  import Commentary from "../components/Commentary.svelte";
  import ItemList from "../components/ItemList.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Pill from "../components/Pill.svelte";
  import { TabGroup, Tab, TabContent } from "../components/tabs";
  import PageTitle from "../components/PageTitle.svelte";
  import { pageState, pageTitle } from "../state/stores";

  export let params;

  const appDataPromise = getAppData(params.app);

  $pageState = {
    itemType: "metrics",
    search: "",
    showExpired: false,
    ...$pageState,
  };

  pageTitle.set(params.app);
</script>

<style>
  @import "../main.scss";
  h2 {
    @include text-title-xs;
  }
</style>

{#await appDataPromise then app}
  {#if app.annotation && app.annotation.warning}
    <AppAlert status="warning" message={app.annotation.warning} />
  {/if}

  {#if app.prototype}
    <AppAlert
      status="warning"
      message="This application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings." />
  {/if}
  <PageTitle text={app.canonical_app_name} />

  {#if app.deprecated}
    <Pill message="Deprecated" bgColor="#4a5568" />
  {/if}
  <p>{app.app_description}</p>

  <MetadataTable
    appName={params.app}
    item={app}
    schema={APPLICATION_DEFINITION_SCHEMA} />

  <h2>Commentary</h2>
  <Commentary item={app} itemType={'application'} />

  <TabGroup
    active={$pageState.itemType}
    on:tabChanged={({ detail }) => {
      pageState.set({ ...$pageState, itemType: detail.active, search: '' });
    }}>
    <Tab key="metrics">Metrics</Tab>
    <Tab key="pings">Pings</Tab>
    <Tab key="app_ids">Application IDs</Tab>

    <TabContent key="pings">
      <ItemList itemType="pings" items={app.pings} appName={app.app_name} />
    </TabContent>

    <TabContent key="metrics">
      <ItemList itemType="metrics" items={app.metrics} appName={app.app_name} />
    </TabContent>

    <TabContent key="app_ids">
      <ItemList
        itemType="app_ids"
        items={app.app_ids}
        appName={app.app_name}
        showFilter={false} />
    </TabContent>
  </TabGroup>
{:catch}
  <NotFound pageName={params.app} itemType="application" />
{/await}
