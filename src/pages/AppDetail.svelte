<script>
  import { createEventDispatcher } from "svelte";

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
  export let search;

  const appDataPromise = getAppData(params.app);

  $: itemType = params.itemType ? params.itemType : "metrics";
  const dispatch = createEventDispatcher();

  function updateURL() {
    dispatch("updateURL", {
      url: `/apps/${params.app}/${itemType}`,
      search,
    });
  }

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
  <PageTitle text={app.canonical_app_name} />

  {#if app.deprecated}
    <Pill message="Deprecated" bgColor="#4a5568" />
  {/if}
  <p>{app.app_description}</p>

  <MetadataTable
    appName={params.app}
    item={app}
    schema={APPLICATION_DEFINITION_SCHEMA} />

  <TabGroup
    active={itemType}
    on:tabChanged={({ detail }) => {
      itemType = detail.active;
      search = '';
      updateURL();
    }}>
    <Tab key="metrics">Metrics</Tab>
    <Tab key="pings">Pings</Tab>
    <Tab key="app_ids">Application IDs</Tab>

    <TabContent key="pings">
      <ItemList
        itemType="pings"
        items={app.pings}
        appName={app.app_name}
        bind:filterText={search}
        on:filterTextChanged={updateURL} />
    </TabContent>

    <TabContent key="metrics">
      <ItemList
        itemType="metrics"
        items={app.metrics}
        appName={app.app_name}
        bind:filterText={search}
        on:filterTextChanged={updateURL} />
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
