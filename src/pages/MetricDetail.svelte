<script>
  import { getMetricData } from "../state/api";

  export let params;
  const metricDataPromise = getMetricData(params.app, params.metric);
</script>

{#await metricDataPromise then metric}
  <h1>{metric.name}</h1>
  <p>{metric.description}</p>
{/await}
