<script>
  import page from "page";

  // Pages
  import Index from "./Index.svelte";
  import About from "./About.svelte";

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

<svelte:component this={component} bind:params />
