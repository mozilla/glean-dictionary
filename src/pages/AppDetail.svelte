<script>
  import { onMount } from "svelte";
  import Pill from "../components/Pill.svelte";
  import { fetchJSON } from "../state/api";
  import FilterInput from "../components/FilterInput.svelte";
  import Pagination from "../components/Pagination.svelte";

  export let params;
  const URL = `data/${params.app}/index.json`;
  let app;
  let filteredMetrics;
  let metrics = [];
  let currentPage = 1;
  let from = 1;
  let to = 100;
  let perPage = 100;
  let lastPage = 1;
  let total = 0;

  function breakUp(array, parts) {
    let result = [];
    for (let i = parts; i > 0; i -= 1) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
  }

  let loadPage = async (data) => {
    if (metrics.length === 0) {
      app = await fetchJSON(URL);
      total = app.metrics.length;
      currentPage = data.page;
      lastPage = Math.ceil(total / perPage);
      from = data.page + perPage * (data.page - 1);
      to = perPage * data.page;
      metrics = breakUp(app.metrics, lastPage);
    }
    from = data.page + perPage * (data.page - 1);
    to = perPage * data.page;
    currentPage = data.page;
    filteredMetrics = metrics[data.page - 1];
  };

  onMount(async () => {
    loadPage({ page: 1 });
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

  {#if total > perPage}
    <Pagination
      {currentPage}
      {from}
      {lastPage}
      {perPage}
      {to}
      {total}
      on:changePage={(ev) => loadPage({ page: ev.detail })} />
  {/if}
{/if}
