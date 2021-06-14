<script context="module">
  export async function load({ page, fetch }) {
    const res = await fetch(`/data/${page.params.app}/index.json`);
    const URLSearchParams = Object.fromEntries(page.query);

    if (res.ok) {
      const app = await res.json();
      return {
        props: { app, URLSearchParams },
      };
    }

    const { message } = await res.json();
    return { error: new Error(message) };
  }
</script>

<script>
  import pkg from "lodash";
  import { stringify } from "query-string";
  import { pageState } from "$lib/state/stores";
  import { APPLICATION_DEFINITION_SCHEMA } from "$lib/data/schemas";

  // components
  import AppAlert from "$lib/components/AppAlert.svelte";
  import ItemList from "$lib/components/ItemList.svelte";
  import MetadataTable from "$lib/components/MetadataTable.svelte";
  import Label from "$lib/components/Label.svelte";
  import { TabGroup, Tab, TabContent } from "$lib/components/tabs";
  import PageTitle from "$lib/components/PageTitle.svelte";
  import Commentary from "$lib/components/Commentary.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import SubHeading from "$lib/components/SubHeading.svelte";


  const { mapValues, pickBy } = pkg;

  export let app;
  export let URLSearchParams;

  // update pageState to match URL search params
  $pageState = { ...$pageState, search: "", ...URLSearchParams };

  function updatePath(state) {
    const simplifiedState = mapValues(
      pickBy(state, (v) => (typeof v !== "string" && v) || v.length > 0),
      (v) => (typeof v === "boolean" ? +v : v)
    );
    const query = stringify(simplifiedState);
    const path = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, undefined, path);
  }

  /* eslint-disable no-unused-expressions */
  $: typeof window !== "undefined" && updatePath($pageState);
</script>

<svelte:head>
  <title>{app.canonical_app_name}</title>
</svelte:head>

{#if app.annotation && app.annotation.warning}
  <AppAlert status="warning" message={app.annotation.warning} />
{/if}

{#if app.prototype}
  <AppAlert
    status="warning"
    message="This application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings."
  />
{/if}

<PageTitle text={app.canonical_app_name} />

{#if app.deprecated}
  <Label text="deprecated" />
{/if}
<Markdown text={app.app_description} inline={false} />

<MetadataTable
  appName={app.app_name}
  item={app}
  schema={APPLICATION_DEFINITION_SCHEMA}
/>

<SubHeading
title={"Commentary"}
helpText={"Reviewed commentary from Mozilla data practitioners on this application."} />

<Commentary item={app} itemType={"application"} />

<TabGroup
bind:active={$pageState.itemType}
on:tabChanged={({ detail }) => {
  pageState.set({
    ...$pageState,
    itemType: detail.active,
    search: "",
    page: 1,
  });
}}
>
<Tab key="metrics">Metrics</Tab>
<Tab key="pings">Pings</Tab>
{#if app.tags && app.tags.length}
  <Tab key="tags">Features</Tab>
{/if}
<Tab key="app_ids">Application IDs</Tab>

<TabContent key="tags">
  <ItemList itemType="tags" items={app.tags} appName={app.app_name} />
</TabContent>

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
    showFilter={false}
  />
</TabContent>
</TabGroup>

<style>
  h2 {
    @include text-title-xs;
  }
</style>
