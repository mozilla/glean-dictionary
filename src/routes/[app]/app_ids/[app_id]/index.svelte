<script context="module">
  export async function load({ page, fetch }) {
    const appIdName = page.params.app_id.replace(/\./g, "_");
    const res = await fetch(
      `/data/${page.params.app}/app_ids/${appIdName}.json`
    );
    if (res.ok) {
      const appId = await res.json();
      const { app } = page.params;

      return {
        props: { appId, app },
      };
    }

    const { message } = await res.json();
    return { error: new Error(message) };
  }
</script>

<script>
  import MetadataTable from "$lib/components/MetadataTable.svelte";
  import Label from "$lib/components/Label.svelte";
  import PageTitle from "$lib/components/PageTitle.svelte";

  import { APPLICATION_ID_DEFINITION_SCHEMA } from "$lib/data/schemas";

  export let appId;
  export let app;
</script>

<svelte:head>
  <title>{appId.app_id} | {app}</title>
</svelte:head>

<h2>Application ID</h2>
<PageTitle text={appId.app_id} />
{#if appId.description}
  <p>{appId.description}</p>
{/if}

{#if appId.deprecated}
  <Label text="deprecated" />
{/if}

<MetadataTable
  appName={app}
  item={appId}
  schema={APPLICATION_ID_DEFINITION_SCHEMA}
/>

<style>
  h2 {
    @include text-title-xs;
  }
</style>
