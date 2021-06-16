<script context="module">
  export async function load({ fetch }) {
    const res = await fetch("/data/apps.json");

    if (res.ok) {
      const apps = await res.json();
      apps.sort((a, b) =>
        a.canonical_app_name.toLowerCase() > b.canonical_app_name.toLowerCase()
          ? 1
          : -1
      );
      return {
        props: {
          apps,
        },
      };
    }

    const { message } = await res.json();
    return { error: new Error(message) };
  }
</script>

<script>
  export let apps;
  export let shownApps;

  // components
  import FilterInput from "$lib/components/FilterInput.svelte";
  import Markdown from "$lib/components/Markdown.svelte";

  // state
  import { pageState } from "$lib/state/stores";

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

  let showDeprecated = false;

  // reset search
  pageState.set({ ...$pageState, search: "", itemType: "metrics" });

  $: shownApps = apps.filter((a) => a.app_name.includes($pageState.search));
</script>

<svelte:head>
  <title>Glean Dictionary</title>
</svelte:head>
<div class="mzp-c-emphasis-box mzp-t-dark hero-box">
  <h5>
    The Glean Dictionary documents the data collected by Mozilla projects that
    use <a href="https://mozilla.github.io/glean/">Glean</a>.
  </h5>
  <p>
    Select a project to browse its data catalog. If you have questions, please
    ask in the <a
      href="https://chat.mozilla.org/#/room/#glean-dictionary:mozilla.org"
      >#glean-dictionary</a
    > channel on Mozilla's instance of Matrix.
  </p>
</div>
{#if shownApps}
<div class="mzp-l-content">
    <div class="app-filter">
      <FilterInput placeHolder="Search for an application" width="90%" />
      <span id="deprecation-checkbox">
        <label>
          <input type="checkbox" bind:checked={showDeprecated} />
          Show deprecated applications
        </label>
      </span>
    </div>
    <div class="app-list">
      {#each shownApps as app}
        {#if showDeprecated || !app.deprecated}
          <div class="mzp-c-card mzp-c-card-extra-small has-aspect-3-2">
            <a
              class="mzp-c-card-block-link"
              href={app.app_name}
              id="media-block"
            >
              <img
                class="mzp-c-card-image"
                src={getAppLogo(app.app_name)}
                alt="${app.canonical_app_name} Logo"
              />
              <div class="mzp-c-card-content">
                <h6 class="mzp-c-card-title">{app.canonical_app_name}</h6>
                <p>
                  <Markdown text={app.app_description} />
                </p>
              </div>
            </a>
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style>
  .hero-box {
    text-align: center;
  }

  .mzp-c-card-image {
    width: 100%;
    background-color: $color-light-gray-20;
  }

  .app-filter {
    margin: $spacing-sm;
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
  p {
    @include text-body-sm;
  }
  .mzp-l-content {
    padding: $spacing-xl;
  }
</style>
