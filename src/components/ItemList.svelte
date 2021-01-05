<script>
  import { chunk } from "lodash";

  import { currentPage } from "../state/stores";
  import { getItemURL } from "../state/urls";

  import Pagination from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";

  let DEFAULT_ITEMS_PER_PAGE = 20;

  export let appName;
  export let items;
  export let itemType;
  export let filteredItems;
  export let totalItems;
  export let paginatedItems;

  totalItems = items.length;
  paginatedItems = chunk([...items], DEFAULT_ITEMS_PER_PAGE);

  currentPage.set(1);

  function filterItems(filterText) {
    filteredItems = items.filter((item) => item.name.includes(filterText));
    if (filteredItems.length > 0) {
      currentPage.set(1);
      paginatedItems = chunk([...filteredItems], DEFAULT_ITEMS_PER_PAGE);
      totalItems = filteredItems.length;
    }
  }

  $: {
    filteredItems = paginatedItems[$currentPage - 1];
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
{#if filteredItems.length}
  <Pagination {totalItems} itemsPerPage={DEFAULT_ITEMS_PER_PAGE} />
{/if}
