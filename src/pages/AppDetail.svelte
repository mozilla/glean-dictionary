<script>
  import { onMount } from "svelte";
  import Pill from "../components/Pill.svelte";
  import { fetchJSON } from "../state/api";
  import FilterInput from "../components/FilterInput.svelte";
  import AppBanner from "../components/AppBanner.svelte"
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
{#if app}
{#if app.prototype}
  <AppBanner
    message="The glean-js application is in prototype stage. The metrics listed below may contain inconsistencies and testing string changes."
    bgColor="#808895"
  />
{/if}
{/if}
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
