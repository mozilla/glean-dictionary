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
  let params;
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
        ? [{ url: `/apps/${app}/metrics/${metric}/`, name: metric }]
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
    let hash = window.location.hash.split("?")[0];
    page(`${hash}?search=${searchQuery}`);
  }

  page("*", parseQuery);
  page("/", setComponent(AppList));
  page("/apps/:app/tables/:table", setComponent(TableDetail));
  page("/apps/:app/pings/:ping", setComponent(PingDetail));
  page("/apps/:app/metrics/:metric", setComponent(MetricDetail));
  page("/apps/:app", setComponent(AppDetail));
  page({ hashbang: true });
</script>

<style>
  .brand {
    @apply text-gray-100;
  }
</style>

<Tailwindcss />
<nav class="flex items-center justify-between flex-wrap bg-blue-800 p-2">
  <div class="flex items-center flex-shrink-0 mr-6">
    <a class="brand font-semibold text-xl tracking-tight" href="/">
      Glean Dictionary
      <i>Prototype</i>
    </a>
  </div>
</nav>
<Breadcrumb {links} />

<div class="container py-4 mx-auto">
  <svelte:component
    this={component}
    bind:params
    bind:queryString
    on:updateURL={updateURL} />
</div>

<Footer />
