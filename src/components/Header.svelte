<script>
  import Breadcrumb from "./Breadcrumb.svelte";

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

  .search-autocomplete {
    margin-left: 24px;
    margin-top: 24px;
    min-width: 480px;
    position: relative;
  }

  .search-input {
    margin: 0;
    width: 100%;
  }

  .search-results {
    position: absolute;
    border: 1px solid #dbdbdb;
    background-color: white;
    width: 100%;
    z-index: 100;
  }
  .search-results ul {
    margin: 0;
    padding: 0;
  }

  .search-results li {
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }

  .search-results li {
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }
  .search-results li:hover {
    background-color: #dbdbdb;
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
          <div class="search-autocomplete">
            <input class="search-input" type="search" />
            <div class="search-results">
              <ul>
                <li>Foo</li>
                <li>Bar</li>
                <li>Baz</li>
              </ul>
            </div>
          </div>
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
