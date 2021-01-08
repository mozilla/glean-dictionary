<script>
  import Pill from "./Pill.svelte";
</script>

<style>
  .search-autocomplete {
    margin-left: 24px;
    margin-top: 24px;
    min-width: 600px;
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
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: max-content max-content;
    grid-template-areas:
      "title type"
      "description description";
    cursor: pointer;
  }

  .search-results li {
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }
  .search-results li:hover {
    background-color: #dbdbdb;
  }

  .search-results .title {
    grid-area: title;
  }
</style>

<div class="search-autocomplete">
  <input class="search-input" type="search" />
  <div class="search-results">
    <ul>
      <li>
        <div class="name">about_page.libraries_tapped</div>
        <div class="type">
          <Pill message="metric" bgColor="#4a5568" />
        </div>
        <div class="description">
          A user tapped on "Libraries that we use" item from About page
        </div>
      </li>
      <li>Bar</li>
      <li>Baz</li>
    </ul>
  </div>
</div>
