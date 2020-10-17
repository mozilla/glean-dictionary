<script>
  import { afterUpdate } from "svelte";
  import page from "page";
  import Tailwindcss from "./Tailwindcss.svelte";
  import Breadcrumb from "./components/Breadcrumb.svelte";

  // Pages
  import AppList from "./pages/AppList.svelte";
  import AppDetail from "./pages/AppDetail.svelte";
  import PingDetail from "./pages/PingDetail.svelte";
  import MetricDetail from "./pages/MetricDetail.svelte";
  import TableDetail from "./pages/TableDetail.svelte";

  let component;
  let params;
  let links = [];

  afterUpdate(() => {
    const { app, ping, metric, bigquery } = params;

    links = [{ url: "/", name: "apps" }];

    let link = app && { url: `/apps/${app}/`, name: app };
    links.push(link);

    link =
      (ping && { url: `/apps/${app}/pings/${ping}/`, name: ping }) ||
      (metric && { url: `/apps/${app}/metrics/${metric}/`, name: metric });
    links.push(link);

    link = ping &&
      bigquery && {
        url: `/apps/${app}/tables/${ping}/bigquery`,
        name: bigquery,
      };
    links.push(link);

    // remove unwanted values
    links = links.filter(Boolean);
  });

  function setComponent(c) {
    return function setComponentInner({ params: p }) {
      component = c;
      params = p;
    };
  }

  page("/", setComponent(AppList));
  page("/apps/:app/tables/:ping/:bigquery", setComponent(TableDetail));
  page("/apps/:app/pings/:ping", setComponent(PingDetail));
  page("/apps/:app/metrics/:metric", setComponent(MetricDetail));
  page("/apps/:app", setComponent(AppDetail));
  page("*", setComponent(Breadcrumb));
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
  <Breadcrumb {links} />
</nav>

<div class="container py-4 mx-auto">
  <svelte:component this={component} bind:params />
</div>
