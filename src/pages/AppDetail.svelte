<script>
  import { onMount } from "svelte";
  import Pill from "../components/Pill.svelte";
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

<style>
  .table-header {
    @apply table-auto;
    @apply my-4;
  }

  .table-header td {
    @apply border;
    @apply p-2;
  }
</style>

<h1>{params.app}</h1>
{#if app}
  {#if app.deprecated}
    <Pill message="Deprecated" bgColor="#4a5568" />
  {/if}
  <p class="mt-2">{app.description}</p>
  <table class="table-header">
    <tr>
      <td>Source code Url</td>
      <td><a href={app.url}>{app.url}</a></td>
    </tr>
    <tr>
      <td>Application id</td>
      <td><code>{app.app_id}</code></td>
    </tr>
  </table>

  <h2>Pings</h2>
  {#if !app.pings.length}
    <p>Currently, there are no pings available for {app.name}</p>
  {/if}
  <ul>
    {#each app.pings as ping}
      <li>
        <a href={`/apps/${params.app}/pings/${ping.name}`}>{ping.name}</a>
        <i>{ping.description}</i>
      </li>
    {/each}
  </ul>
  <h2>Metrics</h2>
  {#if !app.metrics.length}
    <p>Currently, there are no metrics available for {app.name}</p>
  {:else}
    <FilterInput onChangeText={filterMetrics} />
    <ul>
      {#each filteredMetrics as metric}
        <li>
          <a
            href={`/apps/${params.app}/metrics/${metric.name}`}>{metric.name}</a>
          <i>{metric.description}</i>
        </li>
      {/each}
    </ul>
  {/if}
{/if}
