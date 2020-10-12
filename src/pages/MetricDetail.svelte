<script>
  import { getMetricData } from "../state/api";

  export let params;
  const metricDataPromise = getMetricData(params.app, params.metric);

  function getMetricDocumentationURI(type) {
    const sourceDocs = "https://mozilla.github.io/glean/book/user/metrics/";
    const links = {
      memory_distribution: `${sourceDocs}memory_distribution.html`,
      quantity: `${sourceDocs}quantity.html`,
      custom_distribution: `${sourceDocs}custom_distribution.html`,
      string_list: `${sourceDocs}string_list.html`,
      labeled_string: `${sourceDocs}labeled_strings.html`,
      timespan: `${sourceDocs}timespan.html`,
      datetime: `${sourceDocs}datetime.html`,
      string: `${sourceDocs}string.html`,
      timing_distribution: `${sourceDocs}timing_distribution.html`,
      boolean: `${sourceDocs}boolean.html`,
      labeled_counter: `${sourceDocs}labeled_counters.html`,
      uuid: `${sourceDocs}uuid.html`,
      counter: `${sourceDocs}counter.html`,
      event: `${sourceDocs}event.html`,
      jwe: `${sourceDocs}jwe.html`,
    };

    return links[type] || sourceDocs;
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

{#await metricDataPromise then metric}
  <h1>{metric.name}</h1>
  <p>{metric.description}</p>
  <p>
    <a
      href={getMetricDocumentationURI(metric.type)}
      target="_blank">{metric.type}</a>
    that
    {getExpiryInfo(metric.expires)}
  </p>
{/await}
