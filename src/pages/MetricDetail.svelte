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
  import SqlModal from "../components/SqlModal.svelte";
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
  import {
    getBigQueryURL,
    getDataCatalogMetricURL,
    getMetricSearchURL,
  } from "../state/urls";
  import { getAppBreadcrumbs } from "./AppDetail.svelte";

  import { isExpired, isRemoved, isRecent } from "../state/items";

  import {
    getGleanQuery,
    getGleanLabeledCounterQuery,
    getGleanDualLabeledCounterQuery,
    getGleanEventQuery,
    getGleanLegacyEventQuery,
    getGleanAutoEventQuery,
    getGleanAutoEventQuerySTMOTemplateUrl,
    getGleanEventQuerySTMOTemplateUrl,
    getGleanLegacyEventQuerySTMOTemplateUrl,
    getGleanLabeledCounterQuerySTMOTemplateUrl,
    getGleanDualLabeledCounterQuerySTMOTemplateUrl,
    getGleanQuerySTMOTemplateUrl,
  } from "../data/gleanSql";

  export let params;

  let selectedAppVariant;
  let selectedPingVariant;
  let pingData = {};

  function getSQLResource(
    metricType,
    table,
    columnName,
    additionalInfo,
    isSTMOTemplate
  ) {
    if (metricType === "event") {
      // Although events might come from other pings, we override that and
      // generate SQL just for the `events_stream`. This changes
      // `some_database.table` to `some_database.events_stream`.
      const tableNameParts = table.split(".");
      const override = `${tableNameParts[0]}.events_stream`;
      if (tableNameParts[1] === "events") {
        if (additionalInfo.is_auto) {
          return isSTMOTemplate
            ? getGleanAutoEventQuerySTMOTemplateUrl(override, additionalInfo)
            : getGleanAutoEventQuery(override, additionalInfo);
        }
        return isSTMOTemplate
          ? getGleanEventQuerySTMOTemplateUrl(override, additionalInfo)
          : getGleanEventQuery(override, additionalInfo);
      }
      return isSTMOTemplate
        ? getGleanLegacyEventQuerySTMOTemplateUrl(table, additionalInfo)
        : getGleanLegacyEventQuery(table, additionalInfo);
    }
    if (metricType === "labeled_counter") {
      return isSTMOTemplate
        ? getGleanLabeledCounterQuerySTMOTemplateUrl(columnName, table)
        : getGleanLabeledCounterQuery(columnName, table);
    }
    if (metricType === "dual_labeled_counter") {
      return isSTMOTemplate
        ? getGleanDualLabeledCounterQuerySTMOTemplateUrl(columnName, table)
        : getGleanDualLabeledCounterQuery(columnName, table);
    }

    return isSTMOTemplate
      ? getGleanQuerySTMOTemplateUrl(columnName, table)
      : getGleanQuery(columnName, table);
  }

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

  {#if metric.type === "event"}
    <p>
      The event category is <code>{metric.event_info.category}</code> and event
      name is <code>{metric.event_info.name}.</code>
    </p>
  {/if}

  <MetadataTable
    appName={params.app}
    item={metric}
    schema={METRIC_DEFINITION_SCHEMA}
  />

  <h2>
    Metric sampling
    <HelpHoverable
      content={"Information about the sampling state and rate."}
      link={"https://mozilla.github.io/glean/book/user/metrics/data-control-plane/index.html"}
    />
  </h2>
  {#if !isEmpty(metric.sampling_info)}
    {#each Object.entries(metric.sampling_info) as [keyName, definition]}
      <table>
        <col />
        <col />
        <tr>
          <td>
            Channel
            <HelpHoverable
              content={"Indicates the delivery channel being sampled"}
            />
          </td>
          <td>
            <code>{keyName}</code>
          </td>
        </tr>
        <tr>
          <td>
            Sample size
            <HelpHoverable
              content={"The percentage of the population being sampled"}
            />
          </td>
          <td>
            <code>{definition.sampled_text}</code>
          </td>
        </tr>
        <tr>
          <td>
            Sample configuration id
            <HelpHoverable
              content={"The unique identfier for the sampling configuration"}
            />
          </td>
          <td>
            <code>{definition.experiment_id || "ID not available"}</code>
          </td>
        </tr>
        <tr>
          <td>
            Start date
            <HelpHoverable
              content={"Date sampling was started or 'enrolling' if still in uptake"}
            />
          </td>
          <td>
            <code>{definition.start_date || "Currently enrolling"}</code>
          </td>
        </tr>
        <tr>
          <td>
            End date
            <HelpHoverable
              content={"Date sampling ended, or 'active' if sampling is still live"}
            />
          </td>
          <td>
            <code>{definition.end_date || "Currently active"}</code>
          </td>
        </tr>
        <tr>
          <td>
            Sample audience targeting
            <HelpHoverable content={"JEXL encoded custom audience targeting"} />
          </td>
          <td>
            <code>{definition.targeting || "No custom targeting"}</code>
          </td>
        </tr>
        <tr>
          <td>
            Sampling config link
            <HelpHoverable
              content={"Link to the sampling configuration definition (NDA Only)"}
            />
          </td>
          <td>
            <AuthenticatedLink href={definition.experimenter_link || ""}>
              <code>{definition.experimenter_link || "Link not available"}</code
              >
            </AuthenticatedLink>
          </td>
        </tr>
      </table>
    {/each}
  {:else}
    <table>
      <col />
      <col />
      <tr>
        <td> Not Sampled </td>
        <td>
          This metric is not currently affected by any sampling configuration
          and is operating based on its defaults in the metrics.yaml file
        </td>
      </tr>
    </table>
  {/if}
  <table>
    <col />
    <col />
    <col />
    <tr>
      <td>
        Sampling Configuration Snippet
        <HelpHoverable
          content={"Click the button to copy a configuration snippet for use in Mozilla Experimenter configuration"}
          link={"https://mozilla.github.io/glean/book/user/metrics/data-control-plane/experimenter-configuration.html"}
        />
      </td>
      <td>
        Click the button to copy a snippet for use in a
        <a
          href="https://mozilla.github.io/glean/book/user/metrics/data-control-plane/experimenter-configuration.html"
          data-glean-label="Mozilla Experimenter configuration"
          data-glean-type="MetricDetail.MetricSampling.MozillaExperimenterConfigurationURL"
        >
          Mozilla Experimenter configuration.
        </a>
      </td>
      <td>
        <CopyButton
          textToCopy="{'{\n  "gleanMetricConfiguration": {\n    "metrics_enabled": {\n      "'}{metric.name}{'": true\n    }\n  }\n}'}"
          type="MetricDetail.MetricSampling.CopySamplingConfigurationSnippet"
        />
      </td>
    </tr>
  </table>

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
            <a
              href={pingData.glam_url}
              data-glean-label={params.metric}
              data-glean-type="MetricDetail.Access.GLAM.PingData.GlamURL"
            >
              {params.metric}
            </a>
          {:else}
            <Markdown text={pingData.glam_unsupported_reason} inline={true} />
          {/if}
        </td>
      </tr>
      {#if pingData.looker_explores}
        <tr>
          <td
            >Looker <HelpHoverable
              content={"Explore this metric in Mozilla's instance of Looker."}
            />
          </td>
          <td>
            {#if metric.send_in_pings.length === 1 && metric.send_in_pings[0] === "events" && metric.type !== "event"}
              This metric is a <code>{metric.type}</code> metric. Currently,
              event explores only support <code>event</code> metrics.
            {:else}
              {#each pingData.looker_explores as explore}
                <div>
                  In
                  <AuthenticatedLink
                    href={explore.base.url}
                    label={explore.base.name}
                    type="MetricDetail.Access.Looker.PingData.BaseURL"
                  >
                    {explore.base.name}
                  </AuthenticatedLink>
                  as
                  <AuthenticatedLink
                    href={explore.metric.url}
                    label={explore.metric.name}
                    type="MetricDetail.Access.Looker.PingData.MetricURL"
                  >
                    {explore.metric.name}
                  </AuthenticatedLink>
                </div>
              {/each}
            {/if}
            {#if pingData.event_monitoring}
              <div>
                On the
                <AuthenticatedLink
                  href={pingData.event_monitoring.event.url}
                  label={pingData.event_monitoring.event.name}
                  type="MetricDetail.Access.Looker.EventMonitoring.EventURL"
                >
                  Event Monitoring Dashboard for the
                  {pingData.event_monitoring.event.name}
                </AuthenticatedLink>
                event
              </div>
            {/if}
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
              )}
              data-glean-label={pingData.bigquery_table}
              data-glean-type="MetricDetail.Access.BigQuery.AppVariant.TableURL"
              >{pingData.bigquery_table}</a
            >
            and <AuthenticatedLink
              href={`https://mozilla.acryl.io/dataset/urn:li:dataset:(urn:li:dataPlatform:bigquery,mozdata.${params.app}.${selectedPingVariant.id},PROD)`}
              label="{params.app}.{selectedPingVariant.id}"
              type="MetricDetail.Access.BigQuery.Union.TableURL"
              >{pingData.bigquery_table}
              >
              {params.app}.{selectedPingVariant.id}
              <HelpHoverable
                content={"The result table of UNION-ing all the per-app_id datasets."}
                link={"https://github.com/mozilla/bigquery-etl/tree/main/sql_generators/glean_usage#glean-usage"}
              />
            </AuthenticatedLink>
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
                data-glean-label={selectedAppVariant.etl.bigquery_column_name}
                data-glean-type="MetricDetail.Access.BigQuery.AppVariant.Table.NonEventMetricURL"
              >
                {selectedAppVariant.etl.bigquery_column_name}
              </a>
              <CopyButton
                textToCopy={selectedAppVariant.etl.bigquery_column_name}
                type="MetricDetail.Access.BigQuery.AppVariant.Table.NonEventMetricURL.Copy"
              />
            {:else}
              (event.category=<code>{metric.event_info.category}</code>
              <CopyButton
                textToCopy={metric.event_info.category}
                type="MetricDetail.Access.BigQuery.AppVariant.Table.EventMetric.Category.Copy"
              /> and event.name=<code>{metric.event_info.name}</code>
              <CopyButton
                textToCopy={metric.event_info.name}
                type="MetricDetail.Access.BigQuery.AppVariant.Table.EventMetric.Name.Copy"
              />)
            {/if}
          </div>
        </td>
      </tr>
      <tr>
        <td>
          Data Catalog
          <HelpHoverable
            content={"View this metric in Mozilla's instance of DataHub"}
          />
        </td>
        <td>
          <AuthenticatedLink
            href={getDataCatalogMetricURL(
              selectedAppVariant.id,
              selectedPingVariant.id,
              selectedAppVariant.etl.bigquery_column_name
            )}
          >
            {selectedAppVariant.etl.bigquery_column_name}
          </AuthenticatedLink>
        </td>
      </tr>
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
            Start a query in
            <AuthenticatedLink
              href={getSQLResource(
                metric.type,
                pingData.bigquery_table,
                selectedAppVariant.etl.bigquery_column_name,
                metric.event_info,
                true
              )}
              target="_blank"
              label="STMO"
              type="MetricDetail.Access.STMO.NewQueryURL"
              >STMO</AuthenticatedLink
            > with the following SQL ➡ &nbsp;
          </div>
          <SqlModal
            openModalText="Generate SQL"
            type="MetricDetail.Access.STMO.GenerateSQL"
            sqlContent={getSQLResource(
              metric.type,
              pingData.bigquery_table,
              selectedAppVariant.etl.bigquery_column_name,
              metric.event_info,
              false
            )}
          />
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
  .stmo {
    display: flex;
  }
</style>
