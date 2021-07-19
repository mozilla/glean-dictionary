<script>
  import { getPingData } from "../state/api";
  import { pageState, pageTitle } from "../state/stores";
  import { getBigQueryURL } from "../state/urls";

  import AppAlert from "../components/AppAlert.svelte";
  import VariantSelector from "../components/VariantSelector.svelte";
  import AuthenticatedLink from "../components/AuthenticatedLink.svelte";
  import Commentary from "../components/Commentary.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import ItemList from "../components/ItemList.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Markdown from "../components/Markdown.svelte";
  import PageTitle from "../components/PageTitle.svelte";
  import SubHeading from "../components/SubHeading.svelte";
  import { PING_SCHEMA } from "../data/schemas";

  export let params;

  let selectedAppVariant;
  const pingDataPromise = getPingData(params.app, params.ping).then(
    (pingData) => {
      [selectedAppVariant] = $pageState.channel
        ? pingData.variants.filter((app) => app.id === $pageState.channel)
        : pingData.variants;
      return pingData;
    }
  );

  $pageState = {
    search: "",
    showExpired: true,
    ...$pageState,
  };

  $: $pageState = selectedAppVariant
    ? { ...$pageState, channel: selectedAppVariant.id }
    : $pageState;

  pageTitle.set(`${params.ping} | ${params.app}`);
</script>

{#await pingDataPromise then ping}
  {#if ping.origin && ping.origin !== params.app}
    <AppAlert
      status="warning"
      message={`This ping is defined by a library used by the application (__${ping.origin}__), rather than the application itself. For more details, see the definition.`}
    />
  {/if}

  <PageTitle text={ping.name} />
  <p>
    <Markdown text={ping.description} />
  </p>

  <SubHeading
    title={"Metadata"}
    helpText={"Metadata about this ping, as defined by the implementor."}
  />
  <MetadataTable appName={params.app} item={ping} schema={PING_SCHEMA} />

  <SubHeading
    title={"Commentary"}
    helpText={"Reviewed commentary from Mozilla data practitioners on this ping."}
  />
  <Commentary item={ping} itemType={"ping"} />

  <SubHeading
    title={"Access"}
    helpText={"Ways to access this metric in Mozilla's data warehouse."}
  />

  {#if ping.variants.length > 1}
    <VariantSelector
      name={"app_id"}
      label={"Application Variant"}
      bind:selectedVariant={selectedAppVariant}
      variants={ping.variants}
    />
  {/if}

  {#if selectedAppVariant}
    <table>
      <col />
      <col />
      <tr>
        <td>
          BigQuery
          <HelpHoverable
            content={"The BigQuery representation of this ping."}
            link={"https://docs.telemetry.mozilla.org/cookbooks/accessing_glean_data.html"}
          />
        </td>
        <td>
          <a
            href={getBigQueryURL(
              params.app,
              selectedAppVariant.id,
              params.ping
            )}
          >
            {selectedAppVariant.table}
          </a>
        </td>
      </tr>
      {#if selectedAppVariant.looker_url}
        <tr>
          <td>
            Looker
            <HelpHoverable
              content={"Explore this ping in Mozilla's instance of Looker."}
            />
          </td>
          <td>
            <AuthenticatedLink href={selectedAppVariant.looker_url}>
              {params.ping}
            </AuthenticatedLink>
          </td>
        </tr>
      {/if}
    </table>
  {/if}

  <SubHeading
    title={"Metrics"}
    helpText={"Metrics that are sent inside this ping."}
  />
  <ItemList itemType="metrics" items={ping.metrics} appName={params.app} />
{:catch}
  <NotFound pageName={params.ping} itemType="ping" />
{/await}

<style>
  @import "../main.scss";

  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
</style>
