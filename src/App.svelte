<script>
  import page from "page";
  import Tailwindcss from "./Tailwindcss.svelte";

  // Pages
  import AppList from "./pages/AppList.svelte";
  import AppDetail from "./pages/AppDetail.svelte";
  import PingDetail from "./pages/PingDetail.svelte";
  import TableDetail from "./pages/TableDetail.svelte";

  let component;
  let params;

  function setComponent(c) {
    return function setComponentInner({ params: p }) {
      component = c;
      params = p;
    };
  }

  page("/", setComponent(AppList));
  page("/apps/:app/tables/:ping", setComponent(TableDetail));
  page("/apps/:app/pings/:ping", setComponent(PingDetail));
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

<div class="container py-4 mx-auto">
  <svelte:component this={component} bind:params />
</div>
