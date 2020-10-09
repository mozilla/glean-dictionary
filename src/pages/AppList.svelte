<script>
  import { fade } from "svelte/transition";
  let showDeprecated = true;
  const URL = "data/apps.json";
  let apps;
  fetch(URL)
    .then((r) => r.json())
    .then((ret) => {
      apps = ret.sort((a, b) => a.app_id > b.app_id);
    });
</script>

<h2>Applications</h2>

<label>
  <input type="checkbox" bind:checked={showDeprecated} />
  Show deprecated applications
</label>

{#if showDeprecated}
  {#if apps}
    {#each apps as app}
      <p>
        <a href="/apps/{app.name}">{app.name}</a>
        {#if app.description}<i>{app.description}</i>{/if}
      </p>
    {/each}
  {/if}
{:else if apps}
  {#each apps as app}
    {#if !app.deprecated}
      <p>
        <a href="/apps/{app.name}">{app.name}</a>
        {#if app.description}<i>{app.description}</i>{/if}
      </p>
    {/if}
  {/each}
{/if}
