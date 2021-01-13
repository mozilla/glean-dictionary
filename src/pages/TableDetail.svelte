<script>
  import { createEventDispatcher } from "svelte";
  import SchemaViewer from "../components/SchemaViewer.svelte";
  import { fetchJSON, getTableData } from "../state/api";

  import NotFound from "../components/NotFound.svelte";
  import PageTitle from "../components/PageTitle.svelte";

  export let params;
  export let queryString;

  const dispatch = createEventDispatcher();

  const pingDataPromise = getTableData(params.app, params.table).then(
    async (table) => {
      return {
        table,
        schema: await fetchJSON(table.bq_definition_raw_json),
      };
    }
  );

  const updateURL = () => dispatch("updateURL", queryString);
</script>

<style>
  a {
    text-decoration: none;
  }
  .mzp-u-data-table {
    margin-top: $spacing-md;
    margin-bottom: $spacing-lg;
    td {
      border: 1px solid $color-light-gray-40;
      padding: 0.5rem;
    }
  }
</style>

{#await pingDataPromise then data}
  <PageTitle text={`Table <code>${data.table.name}</code> for ${params.app}`} />
  <table class="mzp-u-data-table">
    <tr>
      <td>BigQuery Definition</td>
      <td>
        <a href={data.table.bq_definition}>
          {data.table.bq_definition.split('/').slice(-1)}
        </a>
      </td>
    </tr>
    <tr>
      <td>Live Data</td>
      <td><code>{data.table.live_table}</code></td>
    </tr>
    <tr>
      <td>Stable View</td>
      <td><code>{data.table.stable_table}</code></td>
    </tr>
  </table>
  <SchemaViewer
    app={params.app}
    nodes={data.schema}
    bind:searchText={queryString}
    on:updateURL={updateURL} />
{:catch}
  <NotFound pageName={params.app} itemType="table" />
{/await}
