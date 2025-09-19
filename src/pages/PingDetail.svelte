<script>
  import { getPingData } from "../state/api";
  import {
    pageState,
    updateURLState,
    updateBreadcrumbs,
  } from "../state/stores";
  import { getBigQueryURL } from "../state/urls";

  import VariantSelector from "../components/VariantSelector.svelte";
  import AuthenticatedLink from "../components/AuthenticatedLink.svelte";
  import Commentary from "../components/Commentary.svelte";
  import CopyButton from "../components/CopyButton.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import ItemList from "../components/ItemList.svelte";
  import Label from "../components/Label.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Markdown from "../components/Markdown.svelte";
  import PageHeader from "../components/PageHeader.svelte";
  import SubHeading from "../components/SubHeading.svelte";
  import AppAlert from "../components/AppAlert.svelte";
  import SqlModal from "../components/SqlModal.svelte";
  import {
    getLibraryDescription,
    getRecentlyAddedItemDescription,
    getRemovedItemDescription,
  } from "../data/help";
  import { PING_SCHEMA } from "../data/schemas";
  import { getLibraryName } from "../formatters/library";
  import { stripLinks } from "../formatters/markdown";
  import { getMetricSearchURL } from "../state/urls";
  import { isRemoved, isRecent } from "../state/items";
  import { getAppBreadcrumbs } from "./AppDetail.svelte";
  import { getGleanPingQuery, getGleanPingQuerySTMOTemplateUrl } from "../data/gleanSql";

  export let params;

  let selectedAppVariant;
  const pingDataPromise = getPingData(params.app, params.ping).then(
    (pingData) => {
      updateBreadcrumbs([
        ...getAppBreadcrumbs(params, pingData),
        {
          url: `/apps/${params.app}/pings/${params.ping}/`,
          name: pingData.name,
        },
      ]);

      [selectedAppVariant] = $pageState.channel
        ? pingData.variants.filter((app) => app.id === $pageState.channel)
        : pingData.variants;
      return pingData;
    }
  );
</script>

{#await pingDataPromise then ping}
  {#if isRemoved(ping)}
    <AppAlert status="warning" message={getRemovedItemDescription("ping")} />
  {/if}

  <PageHeader title={ping.name}>
    <svelte:fragment slot="tags">
      {#if ping.origin && ping.origin !== params.app}
        <a href={getMetricSearchURL(params.app, ping.origin)}
          ><Label
            text={getLibraryName(ping)}
            description={getLibraryDescription("ping", ping.origin)}
          /></a
        >
      {/if}
      {#each ping.tags as tag}
        <a href={getMetricSearchURL(params.app, tag.name)}
          ><Label
            text={tag.name}
            description={stripLinks(tag.description)}
          /></a
        >
      {/each}
    </svelte:fragment>
  </PageHeader>
  <Markdown text={ping.description} inline={false} />

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
    title={"Server Knobs Configuration"}
    helpText={"Information about Server Knobs configuration for this ping."}
  />
  <table>
    <col />
    <col />
    <col />
    <tr>
      <td>
        Sampling Configuration Snippet
        <HelpHoverable
          content={"Click the button to copy a configuration snippet for use in Mozilla Experimenter configuration"}
          link={"https://mozilla.github.io/glean/book/user/pings/data-control-plane/experimenter-configuration.html"}
        />
      </td>
      <td>
        Click the button to copy a snippet for use in a
        <a
          href="https://mozilla.github.io/glean/book/user/pings/data-control-plane/experimenter-configuration.html"
          data-glean-label="Mozilla Experimenter configuration"
          data-glean-type="PingDetail.PingSampling.MozillaExperimenterConfigurationURL"
        >
          Mozilla Experimenter configuration.
        </a>
      </td>
      <td>
        <CopyButton
          textToCopy="{'{\n  "gleanMetricConfiguration": {\n    "pings_enabled": {\n      "'}{ping.name}{'": true\n    }\n  }\n}'}"
          type="PingDetail.PingSampling.CopySamplingConfigurationSnippet"
        />
      </td>
    </tr>
  </table>

  <SubHeading
    title={"Access"}
    helpText={"Ways to access this metric in Mozilla's data warehouse."}
  />
  {#if isRecent(ping)}
    <AppAlert
      status="warning"
      message={getRecentlyAddedItemDescription(ping.variants.length, "ping")}
    />{/if}
  {#if ping.variants.length > 1}
    <VariantSelector
      name={"app_id"}
      label={"Application Variant"}
      bind:selectedVariant={selectedAppVariant}
      on:change={() => updateURLState({ channel: selectedAppVariant.id })}
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
      <td>
        Data Catalog
        <HelpHoverable
          content={"View this table in Mozilla's instance of DataHub"}
        />
      </td>
      <td>
        <AuthenticatedLink
          href={`https://mozilla.acryl.io/dataset/urn:li:dataset:(urn:li:dataPlatform:Glean,${params.app}.${params.ping},PROD)`}
        >
          {params.app}.{params.ping}
        </AuthenticatedLink>
      </td>
      {#if selectedAppVariant.looker_explore}
        <tr>
          <td>
            Looker
            <HelpHoverable
              content={"Explore this ping in Mozilla's instance of Looker."}
            />
          </td>
          <td>
            <AuthenticatedLink href={selectedAppVariant.looker_explore.url}>
              {selectedAppVariant.looker_explore.name}
            </AuthenticatedLink>
          </td>
        </tr>
      {/if}
      <tr>
        <td>
          STMO
          <HelpHoverable
            content={"Query this metric in Mozilla's instance of Redash."}
            link={"https://docs.telemetry.mozilla.org/tools/stmo.html"}
          />
        </td>
        <td class="stmo">
          <div>
            Explore this ping in
            <AuthenticatedLink
              href={getGleanPingQuerySTMOTemplateUrl(selectedAppVariant.table)}
              target="_blank">STMO</AuthenticatedLink
            > or use the following SQL ➡ &nbsp;
          </div>
          <div>
            <SqlModal
              openModalText="Generate SQL"
              sqlContent={getGleanPingQuery(selectedAppVariant.table)}
            />
            </div>
        </td>
      </tr>
    </table>
  {/if}

  <SubHeading
    title={"Metrics"}
    helpText={"Metrics that are sent inside this ping."}
  />
  <ItemList
    itemType="metrics"
    items={ping.metrics}
    appName={params.app}
    tagDescriptions={ping.tag_descriptions}
  />
{:catch}
  <NotFound pageName={params.ping} itemType="ping" />
{/await}

<style lang="scss">
  @import "../main.scss";

  @include metadata-table;

  .stmo {
    display: flex;
  }
</style>
