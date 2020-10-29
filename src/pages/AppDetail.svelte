<script>
  import { onMount } from "svelte";
  import Pill from "../components/Pill.svelte";
  import { fetchJSON } from "../state/api";
  import FilterInput from "../components/FilterInput.svelte";
  import AppAlert from "../components/AppAlert.svelte";
  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";

  export let params;
  const URL = `data/${params.app}/index.json`;
  let app;
  let filteredMetrics;
  let filteredPings;

  onMount(async () => {
    app = await fetchJSON(URL);
    filteredMetrics = app.metrics;
    filteredPings = app.pings;
  });

  function filterMetrics(filterText) {
    filteredMetrics = app.metrics.filter((metric) =>
      metric.name.includes(filterText)
    );
  }
  function filterPings(filterText) {
    filteredPings = app.pings.filter((ping) => ping.name.includes(filterText));
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
  <h1>{params.app}</h1>
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
  {#if app.prototype}
    <AppAlert
      message="The {params.app} application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings."
      bgColor="#808895" />
  {/if}
  <h2>Pings</h2>
  {#if !app.pings.length}
    <p>Currently, there are no pings available for {app.name}</p>
  {:else}
    <FilterInput onChangeText={filterPings} />
    <ul>
      {#each filteredPings as ping}
        <li>
          <a href={`/apps/${app.name}/pings/${ping.name}`}>{ping.name}</a>
          <i>
            <Markdown>{ping.description}</Markdown>
          </i>
        </li>
      {/each}
    </ul>
  {/if}
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
          <i>
            <Markdown>{metric.description}</Markdown>
          </i>
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  <NotFound pageName={params.app} itemType="application" />
{/if}
