<script context="module">
  export const getAppBreadcrumbs = (params, obj) => {
    return [
      {
        url: `/apps/${params.app}`,
        name: obj.canonical_app_name,
        tags: obj.app_tags,
      },
    ];
  };
</script>

<script>
  import { getAppData } from "../state/api";

  import { APPLICATION_DEFINITION_SCHEMA } from "../data/schemas";
  import AppAlert from "../components/AppAlert.svelte";
  import Commentary from "../components/Commentary.svelte";
  import ItemList from "../components/ItemList.svelte";
  import Markdown from "../components/Markdown.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Label from "../components/Label.svelte";
  import { TabGroup, Tab, TabContent } from "../components/tabs";
  import PageHeader from "../components/PageHeader.svelte";
  import SubHeading from "../components/SubHeading.svelte";
  import ThirdPartyData from "../components/iOSThirdPartyData.svelte";
  import {
    pageState,
    updateURLState,
    updateBreadcrumbs,
  } from "../state/stores";

  export let params;

  let itemType;

  const appDataPromise = getAppData(params.app).then((app) => {
    updateBreadcrumbs(getAppBreadcrumbs(params, app));
    return {
      ...app,
      tagDescriptions: Object.fromEntries(
        app.tags.map((t) => [t.name, t.description])
      ),
    };
  });

  $: {
    itemType = $pageState.itemType || "metrics";
  }
</script>

{#await appDataPromise then app}
  {#if app.warning}
    <AppAlert status="warning" message={app.warning} />
  {/if}

  {#if app.prototype}
    <AppAlert
      status="warning"
      message="This application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings."
    />
  {/if}
  <PageHeader title={app.canonical_app_name}>
    <svelte:fragment slot="tags">
      {#if app.deprecated}
        <Label text="deprecated" />
      {/if}
    </svelte:fragment>
  </PageHeader>

  <Markdown text={app.app_description} inline={false} />

  <MetadataTable
    appName={params.app}
    item={app}
    schema={APPLICATION_DEFINITION_SCHEMA}
  />

  <SubHeading
    title={"Commentary"}
    helpText={"Reviewed commentary from Mozilla data practitioners on this application."}
  />
  <Commentary item={app} itemType={"application"} />

  <TabGroup
    bind:active={itemType}
    on:tabChanged={({ detail }) => {
      updateURLState({
        itemType: detail.active,
        search: "",
        page: 1,
      });
    }}
  >
    <Tab key="metrics">Metrics</Tab>
    <Tab key="pings">Pings</Tab>
    {#if app.tags && app.tags.length}
      <Tab key="tags">Tags</Tab>
    {/if}
    <Tab key="app_ids">Application IDs</Tab>
    {#if app.app_name === "firefox_ios"}
      <!-- for now, only Firefox iOS uses third-party data collection -->
      <Tab key="third_party_data">Third-Party Data</Tab>
    {/if}

    <TabContent key="tags">
      <ItemList itemType="tags" items={app.tags} appName={app.app_name} />
    </TabContent>

    <TabContent key="pings">
      <ItemList
        itemType="pings"
        items={app.pings}
        appName={app.app_name}
        tagDescriptions={app.tagDescriptions}
      />
    </TabContent>

    <TabContent key="metrics">
      <ItemList
        itemType="metrics"
        items={app.metrics}
        appName={app.app_name}
        tagDescriptions={app.tagDescriptions}
      />
    </TabContent>

    <TabContent key="app_ids">
      <ItemList
        itemType="app_ids"
        items={app.app_ids}
        appName={app.app_name}
        showFilter={false}
      />
    </TabContent>
    <TabContent key="third_party_data">
      <ThirdPartyData />
    </TabContent>
  </TabGroup>
{:catch}
  <NotFound pageName={params.app} itemType="application" />
{/await}

<style lang="scss">
  @import "../main.scss";
  h2 {
    @include text-title-xs;
  }
</style>
