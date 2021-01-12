<script>
  import { onMount } from "svelte";
  import FilterInput from "../components/FilterInput.svelte";
  import Pill from "../components/Pill.svelte";
  import Title from "../components/Title.svelte";
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

<style>
  .app-detail {
    @include text-title-3xs;
    a {
      text-decoration: none;
    }
    i {
      @include text-body-md;
    }
  }
  .deprecation-checkbox {
    margin-bottom: $spacing-sm;
  }
</style>

<Title text="Applications" />

<div class="deprecation-checkbox">
  <label>
    <input type="checkbox" bind:checked={showDeprecated} />
    Show deprecated applications
  </label>
</div>
{#if apps}
  <FilterInput onChangeText={filterApps} />
  {#each filteredApps as app}
    {#if showDeprecated || !app.deprecated}
      <p class="app-detail">
        <a href="/apps/{app.name}">{app.name}</a>
        {#if app.description}<i>{app.description}</i>{/if}
        {#if app.deprecated}
          <Pill message="Deprecated" bgColor="#4a5568" />
        {/if}
      </p>
    {/if}
  {:else}
    <p>Your search didn't match any application.</p>
  {/each}
{/if}
