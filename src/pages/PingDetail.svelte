<script>
  import { getPingData } from "../state/api";
  import { pageTitle } from "../state/stores";
  import { getBigQueryURL } from "../state/urls";

  import AppVariantSelector from "../components/AppVariantSelector.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import ItemList from "../components/ItemList.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Markdown from "../components/Markdown.svelte";
  import PageTitle from "../components/PageTitle.svelte";
  import { PING_SCHEMA } from "../data/schemas";

  export let params;
  let selectedAppVariant;
  const pingDataPromise = getPingData(params.app, params.ping).then(
    (pingData) => {
      [selectedAppVariant] = pingData.variants;
      return pingData;
    }
  );

  pageTitle.set(`${params.ping} | ${params.app}`);
</script>

<style>
  @import "../main.scss";

  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
</style>

{#await pingDataPromise then ping}
  <PageTitle text={ping.name} />
  <p>
    <Markdown text={ping.description} />
  </p>

  <h2>Metadata</h2>
  <MetadataTable appName={params.app} item={ping} schema={PING_SCHEMA} />

  <h2>Access</h2>

  {#if ping.variants.length > 1}
    <AppVariantSelector bind:selectedAppVariant variants={ping.variants} />
  {/if}

  {#if selectedAppVariant}
    <table>
      <col />
      <col />
      <tr>
        <td>
          BigQuery
          <HelpHoverable
            content={'The BigQuery representation of this ping.'} />
        </td>
        <td>
          <a
            href={getBigQueryURL(params.app, selectedAppVariant.app_id, params.ping)}>
            {selectedAppVariant.table}
          </a>
        </td>
      </tr>
    </table>
  {/if}

  <h2>Metrics</h2>
  <ItemList itemType="metrics" items={ping.metrics} appName={params.app} />
{:catch}
  <NotFound pageName={params.ping} itemType="ping" />
{/await}
