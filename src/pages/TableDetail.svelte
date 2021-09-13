<script>
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import SchemaViewer from "../components/SchemaViewer.svelte";
  import SubHeading from "../components/SubHeading.svelte";
  import { getTableData } from "../state/api";
  import { pageTitle } from "../state/stores";

  import NotFound from "../components/NotFound.svelte";
  import PageHeader from "../components/PageHeader.svelte";

  export let params;

  const pingDataPromise = getTableData(params.app, params.appId, params.table);

  pageTitle.set(`${params.table} table | ${params.appId}`);
</script>

{#await pingDataPromise then table}
  <PageHeader title={`Table <code>${table.name}</code> for ${table.app_id}`} />
  <table>
    <col />
    <col />
    <tr>
      <td>
        Stable
        <HelpHoverable
          content={"BigQuery table containing stable ping data, rolled up once per day, deduplicated on document_id, and clustered on normalized_channel and sample_id fields. Use this table for most analysis."}
          link={"https://docs.telemetry.mozilla.org/cookbooks/bigquery/querying.html#table-layout-and-naming"}
        />
      </td>
      <td>
        <code>{table.stable_table}</code>
      </td>
    </tr>
    <tr>
      <td>
        Live
        <HelpHoverable
          content={"BigQuery table containing live ping data as it is submitted to our pipeline. Only use this table if you need results for the current (partial) day."}
          link={"https://docs.telemetry.mozilla.org/cookbooks/bigquery/querying.html#table-layout-and-naming"}
        />
      </td>
      <td>
        <code>{table.live_table}</code>
      </td>
    </tr>
    <tr>
      <td>
        Schema
        <HelpHoverable
          content={"BigQuery schema definition for this table."}
          link={"https://docs.telemetry.mozilla.org/concepts/pipeline/schemas.html#mozilla-schema-generator"}
        />
      </td>
      <td>
        <a href={table.bq_definition}>
          {table.bq_definition.split("/").slice(-1)}
        </a>
      </td>
    </tr>
  </table>
  <p>
    To access BigQuery data directly, you need to write queries using SQL. For
    more information on how to do this, see
    <a
      href="https://docs.telemetry.mozilla.org/cookbooks/accessing_glean_data.html"
    >
      Accessing Glean Data
    </a>
    on
    <a href="https://docs.telemetry.mozilla.org">docs.telemetry.mozilla.org</a>
    .
  </p>

  <SubHeading
    title={"Schema Browser"}
    helpText={"Browse and filter the BigQuery schema for this table."}
  />
  <SchemaViewer app={params.app} nodes={table.bq_schema} />
{:catch}
  <NotFound pageName={params.appId} itemType="table" />
{/await}

<style>
  @import "../main.scss";
  @include metadata-table;
</style>
