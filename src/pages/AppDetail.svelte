<script>
  import { onMount } from "svelte";
  import Pill from "../components/Pill.svelte";
  import { fetchJSON } from "../state/api";
  import FilterInput from "../components/FilterInput.svelte";
  import AppAlert from "../components/AppAlert.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Pagination, {
    makePages,
    goToPage,
  } from "../components/Pagination.svelte";

  export let params;
  const URL = `data/${params.app}/index.json`;
  let app;
  let to;
  let from;
  let total;
  let metrics = [];
  let pages = [];
  let paginationData;
  let lastPage;
  let currentPage = 1;
  let filteredMetrics;
  let filteredPings;

  function loadPage(args) {
    let tempPaginationData = goToPage(args.page, pages);
    from = tempPaginationData.from;
    to = tempPaginationData.to;
    filteredMetrics = tempPaginationData.page;
    currentPage = args.page;
  }

  onMount(async () => {
    app = await fetchJSON(URL);
    metrics = app.metrics;
    paginationData = makePages(currentPage, metrics);
    pages = paginationData.pages;
    to = paginationData.to;
    from = paginationData.from;
    total = paginationData.total;
    lastPage = paginationData.lastPage;
    currentPage = paginationData.currentPage;
    filteredMetrics = paginationData.pages[currentPage - 1];
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
  <FilterInput onChangeText={filterPings} />
  <ul>
    {#each filteredPings as ping}
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

  {#if total > 100}
    <Pagination
      {currentPage}
      {from}
      {lastPage}
      {to}
      {total}
      on:changePage={(ev) => loadPage({ page: ev.detail })} />
  {/if}
{:else}
  <NotFound pageName={params.app} itemType="application" />
{/if}
