<script>
  import { onMount } from "svelte";
  import FilterInput from "../components/FilterInput.svelte";
  import { fetchJSON } from "../state/api";

  const URL = "data/apps.json";
  let apps;
  let filteredApps;

  onMount(async () => {
    apps = await fetchJSON(URL);
    apps.sort((a, b) => (a.app_id > b.app_id ? 1 : -1));
    filteredApps = apps;
  });

  function filterApps(filterText) {
    filteredApps = apps.filter((appItem) => appItem.name.includes(filterText));
  }
</script>

<h2>Applications</h2>
{#if apps}
  <FilterInput onChangeText={filterApps} />
  {#each filteredApps as app}
    <p>
      <a href="/apps/{app.name}">{app.name}</a>
      {#if app.description}<i>{app.description}</i>{/if}
    </p>
  {/each}
{/if}
