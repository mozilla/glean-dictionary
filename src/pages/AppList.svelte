<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { includes } from "lodash";

  import { fetchJSON } from "../state/api";

  import FilterInput from "../components/FilterInput.svelte";
  import Pill from "../components/Pill.svelte";

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

  const appLogos = {
    browser: "/img/app-logos/browser.png",
    beta: "/img/app-logos/beta.png",
    amazon: "/img/app-logos/amazon.png",
    "klar-focus": "/img/app-logos/klar-focus.png",
    lockwise: "/img/app-logos/lockwise.png",
    nightly: "/img/app-logos/nightly.png",
    reality: "/img/app-logos/reality.png",
    others: "/img/app-logos/mozilla.png",
    dev: "/img/app-logos/dev.png",
  };

  function getAppLogo(app) {
    if (app.match(/fenix/) || app.match(/nightly/)) {
      return appLogos.nightly;
    }
    if (app.match(/beta/)) {
      return appLogos.beta;
    }
    if (app.match(/echo/) || app.match(/fire-tv/)) {
      return appLogos.amazon;
    }
    if (app.match(/focus/) || app.match(/klar/)) {
      return appLogos["klar-focus"];
    }
    if (app.match(/lockwise/)) {
      return appLogos.lockwise;
    }
    if (app.match(/reality/)) {
      return appLogos.reality;
    }
    if (app.match(/dev/)) {
      return appLogos.dev;
    }
    if (app.match(/firefox/)) {
      return appLogos.browser;
    }
    return appLogos.others;
  }

  function isPlatform(app) {
    if (
      includes(app, "iOS") ||
      includes(app, "Android") ||
      includes(app, "Amazon")
    ) {
      return true;
    }
    return false;
  }

  function getPlatformLogo(app) {
    if (includes(app, "iOS")) {
      return "img/app-logos/platform-apple.jpg";
    }
    if (includes(app, "Android")) {
      return "img/app-logos/platform-android.png";
    }
    if (includes(app, "Amazon")) {
      return "img/app-logos/platform-amazon.png";
    }
    return undefined;
  }
</script>

<style>
  .app-filter {
    margin: $spacing-md $spacing-xl;
    .deprecation-checkbox {
      text-align: right;
    }
  }

  .app-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    grid-gap: $spacing-md;
  }

  .corner-flag {
    border-top: 80px solid black;
    border-right: 80px solid transparent;
    position: absolute;
    top: 1px;
    left: 1px;
  }
  .platform-logo {
    position: absolute;
    top: 7px;
    left: 7px;
    width: 30px;
    background-color: inherit;
  }
</style>

<div transition:fade>
  {#if apps}
    <div class="app-filter">
      <FilterInput text="Search for an application" onChangeText={filterApps} />
      <span class="deprecation-checkbox">
        <label>
          <input type="checkbox" bind:checked={showDeprecated} />
          Show deprecated applications
        </label>
      </span>
    </div>

    <div class="app-list">
      {#each filteredApps as app}
        {#if showDeprecated || !app.deprecated}
          <div
            class="mzp-c-card mzp-c-card-extra-small has-aspect-3-2"
            style="max-width: 230px;">
            <a class="mzp-c-card-block-link" href="/apps/{app.name}">
              <div class="mzp-c-card-media-wrapper" style="border-radius: 4px;">
                <img
                  class="mzp-c-card-imgage"
                  src={getAppLogo(app.name)}
                  alt="${app.name} Logo"
                  style="width: 230px;" />
                {#if isPlatform(app.description)}
                  <div class="corner-flag" />
                  <img
                    class="platform-logo"
                    src={getPlatformLogo(app.description)}
                    alt="Platform Logo" />
                {/if}
              </div>
              <div class="mzp-c-card-content">
                <h2 class="mzp-c-card-title">{app.name}</h2>
                {#if app.deprecated}
                  <Pill message="Deprecated" bgColor="#4a5568" />
                {/if}
                <p class="mzp-c-card-meta" style="font-size: 14px;">
                  {app.description}
                </p>
              </div>
            </a>
          </div>
        {/if}
      {:else}
        <p>Your search didn't match any application.</p>
      {/each}
    </div>
  {/if}
</div>
