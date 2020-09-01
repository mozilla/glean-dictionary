<script>
  import Tailwindcss from "./Tailwindcss.svelte";

  import page from "page";

  // Pages
  import Index from "./routes/Index.svelte";
  import About from "./routes/About.svelte";

  let component;
  let params;

  function setComponent(c) {
    return function setComponentInner({ params: p }) {
      component = c;
      params = p;
    };
  }

  page("/", setComponent(Index));
  page("/about", setComponent(About));
  page({ hashbang: true });
</script>

<style>
  .active-link {
    @apply text-blue-100;
  }

  .brand {
    @apply text-gray-100;
  }
</style>

<Tailwindcss />
<nav class="flex items-center justify-between flex-wrap bg-blue-800 p-2">
  <div class="flex items-center flex-shrink-0 mr-6">
    <a class="brand font-semibold text-xl tracking-tight" href="/">
      Glean Dictionary&nbsp;
      <i>Prototype</i>
    </a>
  </div>
</nav>

<div class="container py-4 mx-auto">

  <svelte:component this={component} bind:params />

</div>
