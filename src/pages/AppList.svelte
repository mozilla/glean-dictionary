<script>
  import { onMount } from "svelte";
  import FilterInput from "../components/FilterInput.svelte";
  import { fetchJSON } from "../state/api";

  const URL = "data/apps.json";
  let apps;
  let filteredApps;

  onMount(async () => {
    apps = await fetchJSON(URL);
    apps.sort((a, b) => a.app_id > b.app_id);
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
      <p>
        <a href="/apps/{app.name}">{app.name}</a>
        {#if app.description}<i>{app.description}</i>{/if}
      </p>
    {/if}
  {/each}
{/if}
