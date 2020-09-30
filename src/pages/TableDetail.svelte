<script>
  import SchemaViewer from "../components/SchemaViewer.svelte";
  import { fetchJSON, getTableData } from "../state/api";

  export let params;
  const pingDataPromise = getTableData(params.app, params.ping).then(
    async (table) => {
      return {
        table,
        schema: await fetchJSON(table.bq_definition_raw_json),
      };
    }
  );
</script>

<style>
  .table-header {
    @apply table-auto;
    @apply my-4;
  }

  .table-header td {
    @apply border;
    @apply p-2;
  }
</style>

{#await pingDataPromise then data}
  <h1>Table <code>{data.table.name}</code> for {params.app}</h1>
  <table class="table-header">
    <tr>
      <td>BigQuery definition</td>
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

  <SchemaViewer app={params.app} nodes={data.schema} />
{/await}
