<script>
  import { isEmpty } from "lodash";

  import AppAlert from "../components/AppAlert.svelte";
  import AppVariantSelector from "../components/AppVariantSelector.svelte";
  import AuthenticatedLink from "../components/AuthenticatedLink.svelte";
  import Commentary from "../components/Commentary.svelte";
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

  <h2>Definition</h2>

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
  <h2>Metadata</h2>

  <MetadataTable
    appName={params.app}
    item={metric}
    schema={METRIC_METADATA_SCHEMA}
  />

  <h2>Commentary</h2>
  <Commentary item={metric} itemType={"metric"} />

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
            content={"The BigQuery representation of this metric."}
          />
        </td>
        <td>
          {#each selectedAppVariant.etl.stable_ping_table_names as [sendInPing, tableName]}
            <div>
              In
              <a
                href={getBigQueryURL(
                  params.app,
                  selectedAppVariant.app_id,
                  sendInPing
                )}>{tableName}</a
              >
              <!-- Skip search string for event metrics as we can't directly lookup the columns in events tables -->
              {#if metric.type !== "event"}
                as
                <a
                  href={getBigQueryURL(
                    params.app,
                    selectedAppVariant.app_id,
                    sendInPing,
                    selectedAppVariant.etl.table_name
                  )}
                >
                  {selectedAppVariant.etl.table_name}
                </a>
              {/if}
            </div>
          {/each}
        </td>
      </tr>
      {#if selectedAppVariant.etl.glam_url}
        <tr>
          <td>
            GLAM
            <HelpHoverable
              content={"View this metric in the Glean Aggregated Metrics (GLAM) dashboard"}
              link={"https://docs.telemetry.mozilla.org/cookbooks/glam.html"}
            />
          </td>
          <td>
            <AuthenticatedLink href={selectedAppVariant.etl.glam_url}>
              {params.metric}
            </AuthenticatedLink>
          </td>
        </tr>
      {/if}
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
</style>
