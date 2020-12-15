<script>
  import { _ } from "lodash";
  import Pagination, { makePages, goToPage } from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";

  export let paginationState = {
    pages: [],
    currentPage: 1,
  };

  export let appName;
  export let items;
  export let filteredItems;
  export let itemType;

  paginationState = makePages(paginationState.currentPage, items[itemType]);
  filteredItems = paginationState.pages[paginationState.currentPage - 1];

  function loadPage(args) {
    let tempState = goToPage(args.page, paginationState.pages);
    paginationState = Object.assign(paginationState, tempState);
    filteredItems = tempState.page;
  }

  function filterItems(filterText) {
    filteredItems = items[itemType].filter((item) =>
      item.name.includes(filterText)
    );
    if (filteredItems.length > 0) {
      paginationState.currentPage = 1;
      paginationState = makePages(paginationState.currentPage, filteredItems);
      filteredItems = paginationState.pages[paginationState.currentPage - 1];
    }
  }
</script>

<h2>{_.capitalize(itemType)}</h2>
{#if !items[itemType].length}
  <p>Currently, there are no {itemType} available for {items.name}</p>
{:else}
  <FilterInput onChangeText={filterItems} />
  <ul>
    {#each filteredItems as item}
      <li>
        <a
          href={`/apps/${appName || items.name}/${itemType}/${item.name}`}>{item.name}</a>
        <i><Markdown text={item.description} /></i>
      </li>
    {:else}
      <p>Your search didn't match any {itemType}.</p>
    {/each}
  </ul>
{/if}
{#if paginationState.total > 20 && filteredItems.length}
  <Pagination
    {...paginationState}
    on:changePage={(ev) => loadPage({ page: ev.detail })} />
{/if}
