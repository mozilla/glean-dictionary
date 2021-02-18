<script>
  import AppAlert from "../components/AppAlert.svelte";
  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import PageTitle from "../components/PageTitle.svelte";
  import MetadataTable from "../components/MetadataTable.svelte";
  import {
    METRIC_DEFINITION_SCHEMA,
    METRIC_METADATA_SCHEMA,
  } from "../data/schemas";
  import { getMetricData } from "../state/api";
  import { pageTitle } from "../state/stores";
  import { getMetricBigQueryURL } from "../state/urls";

  import { isExpired } from "../state/metrics";

  export let params;

  let appVariants;
  let selectedAppId;
  let selectedAppVariant;
  const metricDataPromise = getMetricData(params.app, params.metric).then(
    (metricData) => {
      appVariants = metricData.variants;
      [ selectedAppVariant ] = metricData.variants;
      return metricData;
    }
  );

  function selectAppId() {
    selectedAppVariant = appVariants.find((v) => v.app_id === selectedAppId);
  }

  pageTitle.set(`${params.metric} | ${params.app} `);

  function getGlamUrlTemplate(app) {
    const map = {
      fenix: {
        product: "fenix",
        app_id: "",
      },
      "firefox-android-beta": {
        product: "fenix",
        app_id: "beta",
      },
      "firefox-android-release": {
        product: "fenix",
        app_id: "release",
      },
    };
    if (Object.keys(map).includes(app)) {
      const p = map[app];
      return function makeGlamUrl(metric) {
        return `https://glam.telemetry.mozilla.org/${p.product}/probe/${metric}/explore?app_id=${p.app_id}`;
      };
    }

    // The app isn't one GLAM supports so return nothing.
    return undefined;
  }

  const glamUrl = getGlamUrlTemplate(params.app);

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
</script>

<style>
  @import "../main.scss";
  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
</style>

{#await metricDataPromise then metric}
  {#if isExpired(metric.expires)}
    <AppAlert
      status="warning"
      message="This metric has expired: it may not be present in the source code, new data will not be ingested into BigQuery, and it will not appear in dashboards." />
  {/if}

  <PageTitle text={metric.name} />

  <p>
    <Markdown text={metric.description} />
  </p>

  <p>
    Metric of type
    <a
      href={getMetricDocumentationURI(metric.type)}
      target="_blank">{metric.type}</a>. Sent in the
    {#each metric.send_in_pings as pingId, i}
      <a
        href={`/apps/${params.app}/pings/${pingId}`}>{pingId}</a>{metric.send_in_pings.length > 1 && i < metric.send_in_pings.length - 1 ? ', ' : ''}
    {/each}
    ping{metric.send_in_pings.length > 1 ? 's' : ''}.
  </p>
  <h2>Definition</h2>

  <MetadataTable
    appName={params.app}
    item={metric}
    schema={METRIC_DEFINITION_SCHEMA} />

  <h2>Metadata</h2>

  <MetadataTable
    appName={params.app}
    item={metric}
    schema={METRIC_METADATA_SCHEMA} />

  <h2>Access</h2>

  {#if metric.variants.length > 1}
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={selectedAppId} on:change={selectAppId}>
      {#each metric.variants as variant}
        <option value={variant.app_id}>
          {variant.app_channel}
          ({variant.app_id})
        </option>
      {/each}
    </select>
  {/if}

  {#if selectedAppVariant}
    <table>
      <col />
      <col />
      <tr>
        <td>
          BigQuery
          <HelpHoverable
            content={'The BigQuery repesentation of this metric.'} />
        </td>
        <td>
          {#each selectedAppVariant.bigquery_names.stable_ping_table_names as [sendInPing, tableName]}
            <div>
              In
              <a
                href={getMetricBigQueryURL(params.app, selectedAppVariant.app_id, sendInPing)}>{tableName}</a>
              <!-- Skip search string for event metrics as we can't directly lookup the columns in events tables -->
              {#if selectedAppVariant.bigquery_names.metric_type !== 'event'}
                as
                <a
                  href={getMetricBigQueryURL(params.app, selectedAppVariant.app_id, sendInPing, selectedAppVariant.bigquery_names.metric_table_name)}>
                  {selectedAppVariant.bigquery_names.metric_table_name}
                </a>
              {/if}
            </div>
          {/each}
        </td>
      </tr>
      {#if glamUrl && selectedAppVariant.bigquery_names.metric_type !== 'event'}
        <tr>
          <td>
            GLAM
            <HelpHoverable
              content={'View this metric in Glean Aggregated Metrics'} />
          </td>
          <td>
            <a
              href={glamUrl(selectedAppVariant.bigquery_names.glam_etl_name)}>{selectedAppVariant.bigquery_names.glam_etl_name}</a>
          </td>
        </tr>
      {/if}
    </table>
  {/if}
{:catch}
  <NotFound pageName={params.metric} itemType="metric" />
{/await}
