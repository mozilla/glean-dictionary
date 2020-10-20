<script>
  import { onMount } from "svelte";
  import FilterInput from "../components/FilterInput.svelte";
  import Pill from "../components/Pill.svelte";
  import { fetchJSON } from "../state/api";

  const URL = "data/apps.json";
  let apps;
  let filteredApps;

  onMount(async () => {
    apps = await fetchJSON(URL);
    apps.sort((a, b) => (a.name > b.name ? 1 : -1));
    filteredApps = apps;
  });

  function filterApps(filterText) {
    filteredApps = apps.filter((appItem) => appItem.name.includes(filterText));
  }
  let showDeprecated = false;
</script>

<h2>Applications</h2>

<label>
  <input type="checkbox" bind:checked={showDeprecated} />
  Show deprecated applications
</label>
{#if apps}
  <FilterInput onChangeText={filterApps} />
  {#each filteredApps as app}
    {#if showDeprecated || !app.deprecated}
      <p class="mb-2">
        <a href="/apps/{app.name}">{app.name}</a>
        {#if app.description}<i>{app.description}</i>{/if}
        {#if app.deprecated}
          <Pill message="Deprecated" bgColor="#4a5568" />
        {/if}
        {#if app.prototype}
          <Pill message="Prototype" bgColor="#808895" />
        {/if}
      </p>
    {/if}
  {:else}
    <p>Your search didn't match any application.</p>
  {/each}
{/if}
