<script>
  import { includes } from "lodash";
  import { onMount } from "svelte";

  import { fetchJSON } from "../state/api";

  import FilterInput from "../components/FilterInput.svelte";
  import Markdown from "../components/Markdown.svelte";
  import Label from "../components/Label.svelte";

  import { pageState, updateBreadcrumbs } from "../state/stores";

  const URL = "data/apps.json";

  let apps;
  let filteredApps;

  onMount(async () => {
    apps = await fetchJSON(URL);
    filteredApps = apps;
  });

  $: {
    // update page state when user filters something
    if (apps) {
      filteredApps = apps.filter((appItem) =>
        appItem.canonical_app_name
          .toLowerCase()
          .includes(($pageState.search || "").toLowerCase())
      );
    }
  }

  let showDeprecated = false;

  function getAppTagLogo(app) {
    if (includes(app.app_tags, "iOS")) {
      return "img/app-logos/platform-apple.jpg";
    }
    if (includes(app.app_tags, "Android")) {
      return "img/app-logos/platform-android.png";
    }
    if (includes(app.app_tags, "Amazon")) {
      return "img/app-logos/platform-amazon.png";
    }
    return undefined;
  }

  updateBreadcrumbs([]);
</script>

<div class="mzp-c-emphasis-box mzp-t-dark banner">
  <h5>
    The Glean Dictionary documents the data collected by <a
      href="https://mozilla.org">Mozilla</a
    >
    projects that use
    <a href="https://mozilla.github.io/glean/">Glean</a>.
  </h5>
  <p>
    Select a project to browse its data catalog. If you have questions, please
    ask in the <a
      href="https://chat.mozilla.org/#/room/#glean-dictionary:mozilla.org"
      >#glean-dictionary</a
    > channel on Mozilla's instance of Matrix.
  </p>
</div>

{#if apps}
  <div class="app-filter">
    <FilterInput placeHolder="Search for an application" />
    <span id="deprecation-checkbox">
      <label>
        <input type="checkbox" bind:checked={showDeprecated} />
        Show deprecated applications
      </label>
    </span>
  </div>
  <div class="app-list">
    {#each filteredApps as app}
      {#if showDeprecated || !app.deprecated}
        <div class="mzp-c-card mzp-c-card-extra-small has-aspect-3-2" id="card">
          <a
            class="mzp-c-card-block-link"
            href="/apps/{app.app_name}"
            id="media-block"
            data-glean-label="Home page: {app.app_name}"
          >
            <div
              class="mzp-c-card-media-wrapper"
              id="media-wrapper"
            >
              <img
                class="mzp-c-card-imgage"
                src={app.logo || "/img/app-logos/mozilla.png"}
                alt="${app.canonical_app_name} Logo"
                id="logo-img"
              />
              {#if getAppTagLogo(app)}
                <div class="corner-flag" />
                <img
                  class="platform-logo"
                  src={getAppTagLogo(app)}
                  alt="Platform Logo"
                />
              {/if}
            </div>
            <div class="mzp-c-card-content">
              <h2 class="mzp-c-card-title">{app.canonical_app_name}</h2>
              {#if app.deprecated}
                <Label text="deprecated" />
              {/if}
              <p class="mzp-c-card-meta" id="card-description">
                <Markdown text={app.app_description} />
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

<style lang="scss">
  @import "@mozilla-protocol/core/protocol/css/components/card";
  @import "@mozilla-protocol/core/protocol/css/components/emphasis-box";
  .app-filter {
    margin: $spacing-md $spacing-xl;
    #deprecation-checkbox {
      display: block;
      text-align: right;
      label {
        display: inline;
      }
    }
  }

  .app-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    grid-gap: $spacing-md;
  }

  .banner {
    text-align: center;
    margin: $spacing-sm;
    p {
      @include text-body-sm;
    }
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
  #card {
    justify-self: center;
    max-width: 230px;
    #media-block {
      &:hover {
        border-radius: 15px;
      }
    }
    #media-wrapper {
      border-radius: 15px;
      #logo-img {
        width: 200px;
        padding: 15px;
      }
    }
  }
  #card-description {
    font-size: 14px;
  }
</style>
