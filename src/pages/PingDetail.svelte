<script>
  import { getPingData } from "../state/api";
  import { pageTitle } from "../state/stores";

  import ItemList from "../components/ItemList.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Markdown from "../components/Markdown.svelte";
  import PageTitle from "../components/PageTitle.svelte";
  import { PING_SCHEMA } from "../data/schemas";

  export let params;
  const pingDataPromise = getPingData(params.app, params.ping);

  pageTitle.set(`${params.ping} | ${params.app}`);
</script>

<style>
  @import "../main.scss";
  h2 {
    font-size: 24px;
  }
</style>

{#await pingDataPromise then ping}
  <PageTitle text={ping.name} />
  <p>
    <Markdown text={ping.description} />
  </p>
  <p>
    It is represented in BigQuery as
    <a
      href={`/apps/${params.app}/tables/${params.ping}`}>{ping.stable_table_name}</a>.
  </p>
  <h2>Metadata</h2>
  <MetadataTable appName={params.app} item={ping} schema={PING_SCHEMA} />
  <h2>Metrics</h2>
  <ItemList itemType="metrics" items={ping.metrics} appName={params.app} />
{:catch}
  <NotFound pageName={params.ping} itemType="ping" />
{/await}
