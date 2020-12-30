<script>
  import Pagination, { makePages, goToPage } from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";
  import { getItemURL } from "../state/urls";

  export let paginationState = {
    pages: [],
    currentPage: 1,
  };

  export let appName;
  export let items;
  export let filteredItems;
  export let itemType;

  paginationState = makePages(paginationState.currentPage, items);
  filteredItems = paginationState.pages[paginationState.currentPage - 1];

  function loadPage(args) {
    let tempState = goToPage(args.page, paginationState.pages);
    paginationState = Object.assign(paginationState, tempState);
    filteredItems = tempState.page;
  }

  function filterItems(filterText) {
    filteredItems = items.filter((item) => item.name.includes(filterText));
    if (filteredItems.length > 0) {
      paginationState.currentPage = 1;
      paginationState = makePages(paginationState.currentPage, filteredItems);
      filteredItems = paginationState.pages[paginationState.currentPage - 1];
    }
  }
</script>

<style>
  .item-browser {
    max-height: 400px;
    overflow: scroll;
  }
</style>

{#if !items.length}
  <p>Currently, there are no {itemType} available for {items.name}</p>
{:else}
  <FilterInput onChangeText={filterItems} />
  <div class="item-browser mx-auto my-4 p-2">
    <ul>
      {#each filteredItems as item}
        <li>
          <a href={getItemURL(appName, itemType, item.name)}>{item.name}</a>
          <i><Markdown text={item.description} /></i>
        </li>
      {:else}
        <p>Your search didn't match any {itemType}.</p>
      {/each}
    </ul>
  </div>
{/if}
{#if paginationState.total > 20 && filteredItems.length}
  <Pagination
    {...paginationState}
    on:changePage={(ev) => loadPage({ page: ev.detail })} />
{/if}
