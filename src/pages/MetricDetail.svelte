<script>
  import { getMetricData } from "../state/api";

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

{#await metricDataPromise then metric}
  <h1>{metric.name}</h1>
  <p>{metric.description}</p>
  <p>
    <a
      href={getMetricDocumentationURI(metric.type)}
      target="_blank">{metric.type}</a>
    in
    <a href={`/apps/${params.app}`}>{params.app}</a>
    that
    {getExpiryInfo(metric.expires)}
  </p>
{/await}
