<script>
  import Breadcrumb from "./Breadcrumb.svelte";
  import SearchBox from "./SearchBox.svelte";

  export let links = [];
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

<div class="mzp-c-navigation mzp-is-sticky">
  <div class="mzp-c-navigation-l-content">
    <div class="mzp-c-navigation-container">
      <div class="mzp-c-navigation-logo">
        <a class="logo" href="/">Glean Dictionary</a>
      </div>
      <div class="mzp-c-navigation-menu">
        <div class="mzp-c-navigation-container">
          <SearchBox />
        </div>
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
