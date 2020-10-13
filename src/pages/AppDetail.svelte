<script>
  import { onMount } from "svelte";
  import { fetchJSON } from "../state/api";
  import FilterInput from "../components/FilterInput.svelte";

  export let params;
  const URL = `data/${params.app}/index.json`;
  let app;
  let filteredMetrics;

  onMount(async () => {
    app = await fetchJSON(URL);
    filteredMetrics = app.metrics;
  });

  function filterMetrics(filterText) {
    filteredMetrics = app.metrics.filter((metric) =>
      metric.name.includes(filterText)
    );
  }
</script>

<h1>{params.app}</h1>
{#if app}
  <p>{app.description}</p>
  <h2>Pings</h2>
  <ul>
    {#each app.pings as ping}
      <li>
        <a href={`/apps/${params.app}/pings/${ping.name}`}>{ping.name}</a>
        <i>{ping.description}</i>
      </li>
    {/each}
  </ul>
  <h2>Metrics</h2>
  <FilterInput onChangeText={filterMetrics} />
  <ul>
    {#each filteredMetrics as metric}
      <li>
        <a href={`/apps/${params.app}/metrics/${metric.name}`}>{metric.name}</a>
        <i>{metric.description}</i>
      </li>
    {/each}
  </ul>
{/if}
