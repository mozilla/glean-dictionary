<script>
  import FilterInput from "../components/FilterInput.svelte";

  const URL = "data/apps.json";
  let apps;
  let filteredApps;
  fetch(URL)
    .then((r) => r.json())
    .then((ret) => {
      apps = ret.sort((a, b) => a.app_id > b.app_id);
      filteredApps = apps;
    });

  function filterApps(filterText) {
    filteredApps = apps.filter((appItem) => appItem.name.includes(filterText));
  }
</script>

<h2>Applications</h2>
<FilterInput onChangeText={filterApps} />
{#if apps}
  {#each filteredApps as app}
    <p>
      <a href="/apps/{app.name}">{app.name}</a>
      {#if app.description}<i>{app.description}</i>{/if}
    </p>
  {/each}
{/if}
