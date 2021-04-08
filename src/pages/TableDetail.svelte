<script>
  import { createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";

  import SchemaViewer from "../components/SchemaViewer.svelte";
  import { getTableData } from "../state/api";
  import { pageTitle } from "../state/stores";
  import { getBigQueryURL } from "../state/urls";

  import NotFound from "../components/NotFound.svelte";
  import PageTitle from "../components/PageTitle.svelte";

  export let params;
  export let search;

  const pingDataPromise = getTableData(params.app, params.appId, params.table);

  const searchText = writable(search);
  setContext("searchText", searchText);

  const dispatch = createEventDispatcher();
  $: $searchText,
    dispatch("updateURL", {
      url: getBigQueryURL(params.app, params.appId, params.table),
      search: $searchText,
    });

  pageTitle.set(`${params.table} table | ${params.appId}`);
</script>

<style>
  @import "../main.scss";
  @include metadata-table;
</style>

{#await pingDataPromise then table}
  <PageTitle text={`Table <code>${table.name}</code> for ${table.app_id}`} />
  <table>
    <col />
    <col />
    <tr>
      <td>BigQuery Definition</td>
      <td>
        <a href={table.bq_definition}>
          {table.bq_definition.split('/').slice(-1)}
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
  <SchemaViewer app={params.app} nodes={table.bq_schema} />
{:catch}
  <NotFound pageName={params.appId} itemType="table" />
{/await}
