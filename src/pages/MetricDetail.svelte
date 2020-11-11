<script>
  import { getMetricData } from "../state/api";

  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";

  export let params;

  const metricDataPromise = getMetricData(params.app, params.metric);

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
  .metrics-table {
    @apply table-auto;
    @apply my-4;
  }
  .metrics-table td {
    @apply border;
    @apply p-2;
  }
</style>

{#await metricDataPromise then metric}
  <h1>{metric.name}</h1>
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
  <table class="metrics-table">
    <tr>
      <td>Relevant Bugs</td>
      <td>
        {#each metric.bugs as bug}
          <a
            href={typeof bug !== 'number' ? bug : `https://bugzilla.mozilla.org/show_bug.cgi?id=${bug}`}
            title={bug}
            target="_blank">
            {typeof bug !== 'number' ? bug : `https://bugzilla.mozilla.org/show_bug.cgi?id=${bug}`}
          </a>
        {/each}
      </td>
    </tr>
    <tr>
      <td>Send In Pings</td>
      <td>
        {#each metric.send_in_pings as mping}
          <a href={`/apps/${params.app}/pings/${mping}`}> {mping} </a>
        {/each}
      </td>
    </tr>
    {#if metric.lifetime}
      <tr>
        <td>
          <a
            href="https://mozilla.github.io/glean/book/user/adding-new-metrics.html?highlight=lifetime#when-should-glean-automatically-clear-the-measurement"
            target="_blank">
            Lifetime
          </a>
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
        {#each metric.data_reviews as rev, i}
          {#if rev.indexOf('http') > -1}
            <a href={rev} title={rev} target="_blank"> {i + 1} </a>
          {:else}
            <a
              href="https://bugzilla.mozilla.org/show_bug.cgi?id={rev}">{i + 1}</a>
          {/if}
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
  </table>
{:catch}
  <NotFound pageName={params.metric} itemType="metric" />
{/await}
