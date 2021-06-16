<script context="module">
  export async function load({ page, fetch }) {
    const metricName = page.params.metric.replace(/\./g, "_");
    const res = await fetch(
      `/data/${page.params.app}/metrics/data_${metricName}.json`
    );

    if (res.ok) {
      const metric = await res.json();
      const { app } = page.params;

      return {
        props: { metric, app },
      };
    }
    const { message } = await res.json();
    return { error: new Error(message) };
  }
</script>

<script>
  // components
  import VariantSelector from "$lib/components/VariantSelector.svelte";
  import AuthenticatedLink from "$lib/components/AuthenticatedLink.svelte";
  import AppAlert from "$lib/components/AppAlert.svelte";
  import Commentary from "$lib/components/Commentary.svelte";
  import HelpHoverable from "$lib/components/HelpHoverable.svelte";
  import PageTitle from "$lib/components/PageTitle.svelte";
  import MetadataTable from "$lib/components/MetadataTable.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import SubHeading from "$lib/components/SubHeading.svelte";
  import Label from "$lib/components/Label.svelte";

  import { getBigQueryURL } from "$lib/state/urls";
  import { isExpired } from "$lib/state/metrics";
  import {
    METRIC_DEFINITION_SCHEMA,
    METRIC_METADATA_SCHEMA,
  } from "$lib/data/schemas";

  export let metric;
  export let app;

  let selectedAppVariant;
  [selectedAppVariant] = metric.variants;

  let selectedPingVariant;
  selectedPingVariant = { id: metric.send_in_pings[0] };

  let pingData;

  $: {
    pingData =
      selectedAppVariant &&
      selectedPingVariant &&
      selectedAppVariant.etl.ping_data[selectedPingVariant.id];
  }

  function getMetricSearchURL(search) {
    return `/${app}?search=${search}`;
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

<svelte:head>
  <title>{metric.name} | {app}</title>
</svelte:head>

{#if isExpired(metric.expires)}
  <AppAlert
    status="warning"
    message="This metric has expired: it may not be present in the source code, new data will not be ingested into BigQuery, and it will not appear in dashboards."
  />
{/if}

{#if metric.origin !== app}
  <AppAlert
    status="warning"
    message={`This metric is defined by a library used by the application (__${metric.origin}__), rather than the application itself. For more details, see the definition.`}
  />
{/if}

<PageTitle text={metric.name} />
{#if metric.origin !== app || metric.tags.length}
<div class="tags-container">
  {#if metric.origin !== app}
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
    <a href={`/${app}/pings/${pingId}`}>{pingId}</a>{metric.send_in_pings
      .length > 1 && i < metric.send_in_pings.length - 1
      ? ", "
      : ""}
  {/each}
  ping{metric.send_in_pings.length > 1 ? "s" : ""}.
</p>

<h2>Definition</h2>

<MetadataTable appName={app} item={metric} schema={METRIC_DEFINITION_SCHEMA} />

<SubHeading
title={"Metadata"}
helpText={"Metadata about this metric, as defined by the implementor."}
/>
<MetadataTable appName={app} item={metric} schema={METRIC_METADATA_SCHEMA} />

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
              {metric.name}
            </AuthenticatedLink>
          </td>
        </tr>
      {/if}
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
          />
        </td>
        <td>
          <div>
            In
            <a
              href={getBigQueryURL(
                app,
                selectedAppVariant.id,
                selectedPingVariant.id
              )}>{pingData.bigquery_table}</a
            >
            <!-- Skip search string for event metrics as we can't directly lookup the columns in events tables -->
            {#if metric.type !== "event"}
              as
              <a
                href={getBigQueryURL(
                  app,
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



<style>
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
