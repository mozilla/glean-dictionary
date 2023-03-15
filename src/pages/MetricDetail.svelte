<script>
  import { isEmpty } from "lodash";

  import AppAlert from "../components/AppAlert.svelte";
  import VariantSelector from "../components/VariantSelector.svelte";
  import AuthenticatedLink from "../components/AuthenticatedLink.svelte";
  import Commentary from "../components/Commentary.svelte";
  import CopyButton from "../components/CopyButton.svelte";
  import Label from "../components/Label.svelte";
  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import PageHeader from "../components/PageHeader.svelte";
  import SubHeading from "../components/SubHeading.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import {
    METRIC_DEFINITION_SCHEMA,
    METRIC_METADATA_SCHEMA,
  } from "../data/schemas";
  import {
    getExpiredItemDescription,
    getRemovedItemDescription,
    getLibraryDescription,
    getRecentlyAddedItemDescription,
  } from "../data/help";
  import { stripLinks } from "../formatters/markdown";
  import { getLibraryName } from "../formatters/library";
  import { getMetricData } from "../state/api";
  import {
    pageState,
    updateURLState,
    updateBreadcrumbs,
  } from "../state/stores";
  import { getBigQueryURL, getMetricSearchURL } from "../state/urls";
  import { getAppBreadcrumbs } from "./AppDetail.svelte";

  import { isExpired, isRemoved, isRecent } from "../state/items";

  export let params;

  let selectedAppVariant;
  let selectedPingVariant;
  let pingData = {};

  const metricDataPromise = getMetricData(params.app, params.metric).then(
    (metricData) => {
      updateBreadcrumbs([
        ...getAppBreadcrumbs(params, metricData),
        {
          url: `/apps/${params.app}/metrics/${params.metric}/`,
          name: metricData.name,
        },
      ]);
      [selectedAppVariant] = $pageState.channel
        ? metricData.variants.filter((app) => app.id === $pageState.channel)
        : metricData.variants;
      selectedPingVariant = {
        id: $pageState.ping ? $pageState.ping : metricData.send_in_pings[0],
      };
      return metricData;
    }
  );

  $: {
    pingData =
      selectedAppVariant &&
      selectedPingVariant &&
      selectedAppVariant.etl.ping_data[selectedPingVariant.id];
  }

  function getMetricDocumentationURI(type) {
    const sourceDocs =
      "https://mozilla.github.io/glean/book/reference/metrics/";
    const links = {
      memory_distribution: "memory_distribution.html",
      quantity: "quantity.html",
      custom_distribution: "custom_distribution.html",
      string_list: "string_list.html",
      labeled_string: "labeled_strings.html",
      timespan: "timespan.html",
      datetime: "datetime.html",
      string: "string.html",
      timing_distribution: "timing_distribution.html",
      boolean: "boolean.html",
      labeled_counter: "labeled_counters.html",
      uuid: "uuid.html",
      counter: "counter.html",
      event: "event.html",
      jwe: "jwe.html",
      url: "url.html",
      rate: "rate.html",
      text: "text.html",
    };

    return links[type] ? `${sourceDocs}${links[type]}` : sourceDocs;
  }
  $: console.log(metricDataPromise);
</script>

{#await metricDataPromise then metric}
  {#if isRemoved(metric)}
    <AppAlert status="warning" message={getRemovedItemDescription("metric")} />
  {:else if isExpired(metric)}
    <AppAlert status="warning" message={getExpiredItemDescription("metric")} />
  {/if}

  <PageHeader title={metric.name}>
    <svelte:fragment slot="tags">
      {#if metric.origin !== params.app || metric.tags.length}
        {#if metric.origin !== params.app}
          <a href={getMetricSearchURL(params.app, metric.origin)}
            ><Label
              text={getLibraryName(metric)}
              description={getLibraryDescription("metric", metric.origin)}
            /></a
          >
        {/if}
        {#each metric.tags as tag}
          <a href={getMetricSearchURL(params.app, tag.name)}
            ><Label
              text={tag.name}
              description={stripLinks(tag.description)}
            /></a
          >
        {/each}
      {/if}
    </svelte:fragment>
  </PageHeader>
  <Markdown text={metric.description} inline={false} />

  <p>
    Metric of type
    <a href={getMetricDocumentationURI(metric.type)} target="_blank"
      >{metric.type}</a
    >. Sent in the
    {#each metric.send_in_pings as pingId, i}
      <a href={`/apps/${params.app}/pings/${pingId}`}>{pingId}</a>{metric
        .send_in_pings.length > 1 && i < metric.send_in_pings.length - 1
        ? ", "
        : ""}
    {/each}
    ping{metric.send_in_pings.length > 1 ? "s" : ""}.
  </p>

  <MetadataTable
    appName={params.app}
    item={metric}
    schema={METRIC_DEFINITION_SCHEMA}
  />

  {#if metric.extra_keys && !isEmpty(metric.extra_keys)}
    <h2>
      Extra keys
      <HelpHoverable
        content={'The acceptable keys on the "extra" object sent with events.'}
        link={"https://mozilla.github.io/glean/book/reference/metrics/event.html#extra_keys"}
      />
    </h2>
    <table>
      <col />
      <col />
      <col />
      {#each Object.entries(metric.extra_keys) as [keyName, definition]}
        <tr>
          <td><code>{keyName}</code></td>
          <td>
            <code>{definition.type || "string"}</code>
          </td>
          <td>
            <Markdown text={definition.description} inline={false} />
          </td>
        </tr>
      {/each}
    </table>
  {/if}

  <SubHeading
    title={"Metadata"}
    helpText={"Metadata about this metric, as defined by the implementor."}
  />
  <MetadataTable
    appName={params.app}
    item={metric}
    schema={METRIC_METADATA_SCHEMA}
  />

  <SubHeading
    title={"Commentary"}
    helpText={"Reviewed commentary from Mozilla data practitioners on this metric."}
  />
  <Commentary item={metric} itemType={"metric"} />

  <SubHeading
    title={"Access"}
    helpText={"Ways to access this metric in Mozilla's data warehouse."}
  />
  {#if isRecent(metric)}
    <AppAlert
      status="warning"
      message={getRecentlyAddedItemDescription(
        metric.variants.length,
        "metric"
      )}
    />{/if}
  <div class="access-selectors">
    {#if metric.variants.length > 1}
      <div>
        <VariantSelector
          name={"app_id"}
          label={"Application Variant"}
          bind:selectedVariant={selectedAppVariant}
          on:change={() => updateURLState({ channel: selectedAppVariant.id })}
          variants={metric.variants}
        />
      </div>
    {/if}

    {#if metric.send_in_pings.length > 1}
      <div>
        <VariantSelector
          name={"ping_id"}
          label={"Ping"}
          bind:selectedVariant={selectedPingVariant}
          on:change={() => updateURLState({ ping: selectedPingVariant.id })}
          variants={metric.send_in_pings.map((p) => ({ id: p }))}
        />
      </div>
    {/if}
  </div>

  {#if selectedAppVariant}
    <table>
      <col />
      <col />
      <tr>
        <td>
          GLAM
          <HelpHoverable
            content={"View this metric in the Glean Aggregated Metrics (GLAM) dashboard"}
            link={"https://docs.telemetry.mozilla.org/cookbooks/glam.html"}
          />
        </td>
        <td>
          {#if pingData.glam_url}
            <AuthenticatedLink href={pingData.glam_url}>
              {params.metric}
            </AuthenticatedLink>
          {:else}
            <Markdown text={pingData.glam_unsupported_reason} inline={true} />
          {/if}
        </td>
      </tr>
      {#if pingData.looker}
        <tr>
          <td
            >Looker <HelpHoverable
              content={"Explore this metric in Mozilla's instance of Looker."}
            />
          </td>
          {#if metric.send_in_pings[0] === "events" && metric.type !== "event"}
            <td
              >This metric is a <code>{metric.type}</code> metric. Currently,
              event count explores only support <code>event</code> metrics.</td
            >
          {:else}
            <td>
              <div>
                In
                <AuthenticatedLink href={pingData.looker.base.url}>
                  {pingData.looker.base.name}
                </AuthenticatedLink>
                as
                <AuthenticatedLink href={pingData.looker.metric.url}>
                  {pingData.looker.metric.name}
                </AuthenticatedLink>
              </div>
            </td>
          {/if}
        </tr>
      {/if}

      <tr>
        <td>
          BigQuery
          <HelpHoverable
            content={"The BigQuery representation of this metric."}
            link={"https://docs.telemetry.mozilla.org/cookbooks/accessing_glean_data.html"}
          />
        </td>
        <td>
          <div>
            In
            <a
              href={getBigQueryURL(
                params.app,
                selectedAppVariant.id,
                selectedPingVariant.id
              )}>{pingData.bigquery_table}</a
            >
            <!-- Skip search string for event metrics as we can't directly lookup the columns in events tables -->
            {#if metric.type !== "event"}
              as
              <a
                href={getBigQueryURL(
                  params.app,
                  selectedAppVariant.id,
                  selectedPingVariant.id,
                  selectedAppVariant.etl.bigquery_column_name
                )}
              >
                {selectedAppVariant.etl.bigquery_column_name}
              </a>
              <CopyButton
                textToCopy={selectedAppVariant.etl.bigquery_column_name}
              />
            {/if}
          </div>
        </td>
      </tr>
    </table>
  {/if}
{:catch}
  <NotFound pageName={params.metric} itemType="metric" />
{/await}

<style lang="scss">
  @import "../main.scss";
  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
  .access-selectors {
    display: grid;
    grid-template-columns: min-content min-content;
    grid-gap: $spacing-md;
  }
</style>
