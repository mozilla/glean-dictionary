<script>
  import FilterInput from "../components/FilterInput.svelte";
  import { fetchJSON } from "../state/api";

  const URL = "data/apps.json";
  let apps;
  let filteredApps;

  const filteredDataPromise = async () => {
    apps = await fetchJSON(URL);
    apps = apps.sort((a, b) => a.app_id > b.app_id);
    return apps;
  };

  filteredApps = filteredDataPromise();

  function filterApps(filterText) {
    filteredApps = apps.filter((appItem) => appItem.name.includes(filterText));
  }
</script>

<h2>Applications</h2>
{#await filteredApps then apps}
  <FilterInput onChangeText={filterApps} />
  {#each apps as app}
    <p>
      <a href="/apps/{app.name}">{app.name}</a>
      {#if app.description}<i>{app.description}</i>{/if}
    </p>
  {/each}
{/await}
