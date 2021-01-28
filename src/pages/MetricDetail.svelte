<script>
  import { getMetricData } from "../state/api";
  import { getMetricBigQueryURL } from "../state/urls";
  import BugLink from "../components/BugLink.svelte";
  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";
  import HelpHoverable from "../components/HelpHoverable.svelte";
  import helpText from "../data/help";
  import PageTitle from "../components/PageTitle.svelte";
  import WarningIcon from "../components/icons/WarningIcon.svelte";

  import { getSearchfoxLink } from "../formatters/searchfox";
  import Pill from "../components/Pill.svelte";

  import { pageTitle } from "../state/stores";

  import { isExpired } from "../state/metrics";

  export let params;

  const metricDataPromise = getMetricData(params.app, params.metric);

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

  function getExpiryInfo(expiry) {
    if (Date.now() > new Date(expiry)) {
      return `expired on ${expiry}`;
    }

    switch (expiry) {
      case "never":
        return "never expires";
      case "expired":
        return "has already manually expired";
      default:
        return `expires on ${expiry}`;
    }
  }
</script>

<style>
  @import "../main.scss";
  @include metadata-table;
</style>

{#await metricDataPromise then metric}
  <PageTitle text={metric.name} />
  {#if isExpired(metric.expires)}
    <Pill message="Expired" bgColor="#4a5568" />
  {/if}
  <p>
    <Markdown text={metric.description} />
  </p>
  <p>
    <a
      href={getMetricDocumentationURI(metric.type)}
      target="_blank">{metric.type}</a>
    in
    <a href={`/apps/${params.app}`}>{params.app}</a>
    that
    {getExpiryInfo(metric.expires)}
  </p>
  <table>
    <col />
    <col />
    <tr>
      <td>
        Bugs
        <HelpHoverable content={helpText.bugs.text} link={helpText.bugs.link} />
      </td>
      <td>
        {#each metric.bugs as bugRef}
          <BugLink ref={bugRef} />
        {/each}
      </td>
    </tr>
    <tr>
      <td>
        Send In Pings
        <HelpHoverable
          content={helpText.sendInPings.text}
          link={helpText.sendInPings.link} />
      </td>
      <td>
        {#each metric.send_in_pings as name}
          <a href={`/apps/${params.app}/pings/${name}`}> {name} </a>&nbsp;
        {/each}
      </td>
    </tr>
    {#if metric.lifetime}
      <tr>
        <td>
          Lifetime
          <HelpHoverable
            content={helpText.lifetime.text}
            link={helpText.lifetime.link} />
        </td>
        <td>{metric.lifetime}</td>
      </tr>
    {/if}
    {#if metric.time_unit}
      <tr>
        <td>
          <a
            href="https://mozilla.github.io/glean/book/user/metrics/timing_distribution.html"
            target="_blank">
            Time unit
          </a>
        </td>
        <td>{metric.time_unit}</td>
      </tr>
    {/if}
    {#if metric.bucket_count}
      <tr>
        <td>Bucket count</td>
        <td>{metric.bucket_count}</td>
      </tr>
    {/if}
    {#if metric.histogram_type}
      <tr>
        <td>Histogram type</td>
        <td>{metric.histogram_type}</td>
      </tr>
    {/if}
    {#if metric.unit}
      <tr>
        <td>Unit</td>
        <td>{metric.unit}</td>
      </tr>
    {/if}
    {#if metric.range_min !== undefined}
      <tr>
        <td>Range Minimum</td>
        <td>{metric.range_min}</td>
      </tr>
    {/if}
    {#if metric.range_max !== undefined}
      <tr>
        <td>Range Maximum</td>
        <td>{metric.range_max}</td>
      </tr>
    {/if}
    <tr>
      <td>Disabled</td>
      <td>{metric.disabled}</td>
    </tr>
    <tr>
      <td>Data Reviews</td>
      <td>
        {#each metric.data_reviews as dataReviewRef}
          <BugLink ref={dataReviewRef} />
        {/each}
      </td>
    </tr>
    {#if metric.labels && metric.labels.length}
      <tr>
        <td>Labels</td>
        <td>{metric.labels.join(', ')}</td>
      </tr>
    {/if}
    <tr>
      <td>Version</td>
      <td>{metric.version || 0}</td>
    </tr>
    {#if getSearchfoxLink(params.app, metric.name)}
      <tr>
        <td>
          Searchfox
          <HelpHoverable
            content={helpText.searchFox.text}
            link={helpText.searchFox.link} />
          {#if isExpired(metric.expires)}
            <HelpHoverable
              content={'This metric has expired and will likely not appear in Searchfox.'}>
              <WarningIcon width={'15px'} height={'15px'} />
            </HelpHoverable>
          {/if}
        </td>
        <td>
          <a href={getSearchfoxLink(params.app, metric.name)}>
            <code>{metric.name}</code></a>
        </td>
      </tr>
    {/if}
    <tr>
      <td>BigQuery</td>
      <td>
        {#each metric.bigquery_names.stable_ping_table_names as [sendInPing, tableName]}
          <div>
            In
            <a
              href={getMetricBigQueryURL(params.app, sendInPing)}>{tableName}</a>
            <!-- Skip search string for event metrics as we can't directly lookup the columns in events tables -->
            {#if metric.bigquery_names.metric_type !== 'event'}
              as
              <a
                href={getMetricBigQueryURL(params.app, sendInPing, metric.bigquery_names.metric_table_name)}>
                {metric.bigquery_names.metric_table_name}
              </a>
            {/if}
          </div>
        {/each}
      </td>
    </tr>
    {#if glamUrl && metric.bigquery_names.metric_type !== 'event'}
      <tr>
        <td>GLAM</td>
        <td>
          <a
            href={glamUrl(metric.bigquery_names.glam_etl_name)}>{metric.bigquery_names.glam_etl_name}</a>
        </td>
      </tr>
    {/if}
  </table>
{:catch}
  <NotFound pageName={params.metric} itemType="metric" />
{/await}
