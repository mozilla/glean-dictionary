<script>
  import { isEmpty } from "lodash";

  import AppAlert from "../components/AppAlert.svelte";
  import VariantSelector from "../components/VariantSelector.svelte";
  import AuthenticatedLink from "../components/AuthenticatedLink.svelte";
  import Commentary from "../components/Commentary.svelte";
  import Label from "../components/Label.svelte";
  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import PageTitle from "../components/PageTitle.svelte";
  import SubHeading from "../components/SubHeading.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import {
    METRIC_DEFINITION_SCHEMA,
    METRIC_METADATA_SCHEMA,
  } from "../data/schemas";
  import { getMetricData } from "../state/api";
  import { pageTitle, pageState } from "../state/stores";
  import { getBigQueryURL } from "../state/urls";

  import { isExpired } from "../state/metrics";

  export let params;

  let selectedAppVariant;
  let selectedPingVariant;
  let pingData;
  const metricDataPromise = getMetricData(params.app, params.metric).then(
    (metricData) => {
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

  $: $pageState =
    selectedAppVariant && selectedPingVariant
      ? {
          ...$pageState,
          channel: selectedAppVariant.id,
          ping: selectedPingVariant.id,
        }
      : $pageState;

  pageTitle.set(`${params.metric} | ${params.app} `);

  function getMetricDocumentationURI(type) {
    const sourceDocs = "https://mozilla.github.io/glean/book/user/metrics/";
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
    };

    return `${sourceDocs}${links[type]}` || sourceDocs;
  }

  function getMetricSearchURL(search) {
    return `/apps/${params.app}?search=${search}`;
  }
</script>

{#await metricDataPromise then metric}
  {#if isExpired(metric.expires)}
    <AppAlert
      status="warning"
      message="This metric has expired: it may not be present in the source code, new data will not be ingested into BigQuery, and it will not appear in dashboards."
    />
  {/if}

  {#if metric.origin !== params.app}
    <AppAlert
      status="warning"
      message={`This metric is defined by a library used by the application (__${metric.origin}__), rather than the application itself. For more details, see the definition.`}
    />
  {/if}

  <PageTitle text={metric.name} />
  {#if metric.origin !== params.app || metric.tags.length}
    <div class="tags-container">
      {#if metric.origin !== params.app}
        <a href={getMetricSearchURL(metric.origin)}
          ><Label text={metric.origin} /></a
        >
      {/if}
      {#each metric.tags as tag}
        <a href={getMetricSearchURL(tag)}><Label text={tag} /></a>
      {/each}
    </div>
  {/if}

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
      {#each Object.entries(metric.extra_keys) as [keyName, definition]}
        <tr>
          <td><code>{keyName}</code></td>
          <td>
            <Markdown text={definition.description} />
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
  <div class="access-selectors">
    {#if metric.variants.length > 1}
      <div>
        <VariantSelector
          name={"app_id"}
          label={"Application Variant"}
          bind:selectedVariant={selectedAppVariant}
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
          {#if selectedAppVariant.etl.glam_url}
            <AuthenticatedLink href={selectedAppVariant.etl.glam_url}>
              {params.metric}
            </AuthenticatedLink>
          {:else}
            Currently GLAM doesn't support <code>{metric.type}</code> metrics.
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
          <td>
            <div>
              In
              <AuthenticatedLink href={pingData.looker.base}>
                {selectedPingVariant.id}
              </AuthenticatedLink>
              as
              <AuthenticatedLink href={pingData.looker.metric}>
                {metric.name}
              </AuthenticatedLink>
            </div>
          </td>
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
            {/if}
          </div>
        </td>
      </tr>
    </table>
  {/if}
{:catch}
  <NotFound pageName={params.metric} itemType="metric" />
{/await}

<style>
  @import "../main.scss";
  @include metadata-table;
  h2 {
    @include text-title-xs;
  }

  .tags-container {
    margin-top: -12px;
    padding-bottom: 16px;
  }
  .access-selectors {
    display: grid;
    grid-template-columns: min-content min-content;
    grid-gap: $spacing-md;
  }
</style>
