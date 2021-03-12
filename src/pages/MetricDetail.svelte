<script>
  import AppAlert from "../components/AppAlert.svelte";
  import AppVariantSelector from "../components/AppVariantSelector.svelte";
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
  import { getBigQueryURL } from "../state/urls";

  import { isExpired } from "../state/metrics";

  export let params;

  let selectedAppVariant;
  const metricDataPromise = getMetricData(params.app, params.metric).then(
    (metricData) => {
      [selectedAppVariant] = metricData.variants;
      return metricData;
    }
  );

  pageTitle.set(`${params.metric} | ${params.app} `);

  function getGlamUrl(appVariant) {
    if (selectedAppVariant.bigquery_names.metric_type === "event") {
      // events are not supported by GLAM presently
      return undefined;
    }
    const map = {
      "org.mozilla.fenix": {
        product: "fenix",
        glam_id: "",
      },
      "org.mozilla.firefox_beta": {
        product: "fenix",
        glam_id: "beta",
      },
      "org.mozilla.firefox": {
        product: "fenix",
        glam_id: "release",
      },
    };
    if (Object.keys(map).includes(appVariant.app_id)) {
      const p = map[appVariant.app_id];
      return `https://glam.telemetry.mozilla.org/${p.product}/probe/${appVariant.bigquery_names.glam_etl_name}/explore?app_id=${p.glam_id}`;
    }

    // The app isn't one GLAM supports so return nothing.
    return undefined;
  }

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

  <Markdown text={metric.description} inline={false} />

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
    <AppVariantSelector bind:selectedAppVariant variants={metric.variants} />
  {/if}

  {#if selectedAppVariant}
    <table>
      <col />
      <col />
      <tr>
        <td>
          BigQuery
          <HelpHoverable
            content={'The BigQuery representation of this metric.'} />
        </td>
        <td>
          {#each selectedAppVariant.bigquery_names.stable_ping_table_names as [sendInPing, tableName]}
            <div>
              In
              <a
                href={getBigQueryURL(params.app, selectedAppVariant.app_id, sendInPing)}>{tableName}</a>
              <!-- Skip search string for event metrics as we can't directly lookup the columns in events tables -->
              {#if selectedAppVariant.bigquery_names.metric_type !== 'event'}
                as
                <a
                  href={getBigQueryURL(params.app, selectedAppVariant.app_id, sendInPing, selectedAppVariant.bigquery_names.metric_table_name)}>
                  {selectedAppVariant.bigquery_names.metric_table_name}
                </a>
              {/if}
            </div>
          {/each}
        </td>
      </tr>
      {#if getGlamUrl(selectedAppVariant)}
        <tr>
          <td>
            GLAM
            <HelpHoverable
              content={'View this metric in Glean Aggregated Metrics'} />
          </td>
          <td>
            <a
              href={getGlamUrl(selectedAppVariant)}>{selectedAppVariant.bigquery_names.glam_etl_name}</a>
          </td>
        </tr>
      {/if}
    </table>
  {/if}
{:catch}
  <NotFound pageName={params.metric} itemType="metric" />
{/await}
