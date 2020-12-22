<script>
  import { afterUpdate } from "svelte";
  import page from "page";
  import Tailwindcss from "./Tailwindcss.svelte";
  import Breadcrumb from "./components/Breadcrumb.svelte";
  import Footer from "./components/Footer.svelte";

  // Pages
  import AppList from "./pages/AppList.svelte";
  import AppDetail from "./pages/AppDetail.svelte";
  import PingDetail from "./pages/PingDetail.svelte";
  import MetricDetail from "./pages/MetricDetail.svelte";
  import TableDetail from "./pages/TableDetail.svelte";

  let component;
  let params = {};
  let links = [];
  let queryString;

  afterUpdate(() => {
    const { app, ping, metric, table } = params;

    links = [
      ...(app
        ? [
            { url: "/", name: "apps" },
            { url: `/apps/${app}/`, name: app },
          ]
        : []),
      ...(ping ? [{ url: `/apps/${app}/pings/${ping}/`, name: ping }] : []),
      ...(metric
        ? [
            {
              url: `/apps/${app}/metrics/${metric}/`,
              name: metric.replaceAll("-", "."),
            },
          ]
        : []),
      ...(table
        ? [
            {
              url: `/apps/${app}/pings/${table}/`,
              name: table,
            },
            {
              url: `/apps/${app}/tables/${table}/`,
              name: `${table} table`,
            },
          ]
        : []),
    ];
  });

  function setComponent(c) {
    return function setComponentInner({ params: p }) {
      component = c;
      params = p;
    };
  }

  function parseQuery(ctx, next) {
    queryString = ctx.querystring;
    queryString = queryString !== "" ? queryString.split("=")[1] : "";
    next();
  }

  function updateURL({ detail: searchQuery }) {
    const urlParams = searchQuery.length ? `?search=${searchQuery}` : "";
    page(`${window.location.pathname}${urlParams}`);
  }

  page("*", parseQuery);
  page("/", setComponent(AppList));
  page("/apps/:app/tables/:table", setComponent(TableDetail));
  page("/apps/:app/pings/:ping", setComponent(PingDetail));
  page("/apps/:app/metrics/:metric", setComponent(MetricDetail));
  page("/apps/:app", setComponent(AppDetail));
  page.exit("*", (ctx, next) => {
    ga("set", "page", ctx.page.current);
    ga("send", "pageview");
    next();
  });
  page();
</script>

<style>
  .logo {
    background-image: url("https://glean-dictionary.netlify.app/img/glean_logo.png");
  }

  .c-sub-navigation {
    background: #f9f9fa;
    box-shadow: inset 0 10px 2px -10px rgba(29, 17, 51, 0.04),
      inset 0 10px 4px -10px rgba(9, 32, 77, 0.12),
      inset 0 10px 3px -10px rgba(29, 17, 51, 0.12);
  }
</style>

<Tailwindcss />

<div class="mzp-c-navigation mzp-is-sticky">
  <div class="mzp-c-navigation-l-content">
    <div class="mzp-c-navigation-container">
      <div class="mzp-c-navigation-logo">
        <a class="logo" href="/">Glean Dictionary</a>
      </div>
    </div>
  </div>
</div>
<nav class="mzp-c-navigation c-sub-navigation">
  <div class="mzp-c-navigation-l-content">
    <div class="mzp-c-navigation-container">
      <Breadcrumb {links} />
    </div>
  </div>
</nav>
<main>
  <div class="mzp-l-content">
    <article class="mzp-c-article">
      <svelte:component
        this={component}
        bind:params
        bind:queryString
        on:updateURL={updateURL} />
    </article>
  </div>
</main>

<Footer />
