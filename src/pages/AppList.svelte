<script>
  const URL = "data/apps.json";
  let searchTerm = "";
  let apps;
  let filteredApps;

  fetch(URL)
    .then((r) => r.json())
    .then((ret) => {
      apps = ret.sort((a, b) => a.app_id > b.app_id);
      filteredApps = apps;
    });

  const searchTextChange = () => {
    const searchApps = (appItem) => appItem.name.includes(searchTerm);
    filteredApps = apps.filter(searchApps);
  };
</script>

<h2>Applications</h2>
<input
  class="p-2 mb-4"
  type="text"
  bind:value={searchTerm}
  on:input={searchTextChange}
  placeholder="Search" />

{#if apps}
  {#each filteredApps as app}
    <p>
      <a href="/apps/{app.name}">{app.name}</a>
      {#if app.description}<i>{app.description}</i>{/if}
    </p>
  {/each}
{/if}
