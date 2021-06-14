<script context="module">
  export async function load({ page, fetch }) {
    const tableName = page.params.table.replace(/\./g, "_");
    const URLSearchParams = Object.fromEntries(page.query);

    const res = await fetch(
      `/data/${page.params.app}/tables/${page.params.app_id}/${tableName}.json`
    );
    if (res.ok) {
      const table = await res.json();
      const { app } = page.params;
      return {
        props: { table, app, URLSearchParams },
      };
    }
    const { message } = await res.json();
    return { error: new Error(message) };
  }
</script>

<script>
  import SchemaViewer from "$lib/components/SchemaViewer.svelte";
  import PageTitle from "$lib/components/PageTitle.svelte";

  import { pageState } from "$lib/state/stores";

  export let table;
  export let app;
  export let URLSearchParams;

  $pageState = { ...$pageState, search: "", ...URLSearchParams };
</script>

<svelte:head>
  <title>{table.name} table | {table.app_id}</title>
</svelte:head>

<PageTitle text={`Table <code>${table.name}</code> for ${table.app_id}`} />
<table>
  <col />
  <col />
  <tr>
    <td>BigQuery Definition</td>
    <td>
      <a href={table.bq_definition}>
        {table.bq_definition.split("/").slice(-1)}
      </a>
    </td>
  </tr>
  <tr>
    <td>Live Data</td>
    <td><code>{table.live_table}</code></td>
  </tr>
  <tr>
    <td>Stable View</td>
    <td><code>{table.stable_table}</code></td>
  </tr>
</table>
<SchemaViewer {app} nodes={table.bq_schema} />

<style>
  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
</style>
