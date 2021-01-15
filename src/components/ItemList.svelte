<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import { chunk } from "lodash";

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

  let currentPage = writable(1);
  setContext("currentPage", currentPage);

  totalItems = items.length;
  paginatedItems = chunk([...items], DEFAULT_ITEMS_PER_PAGE);

  function filterItems(filterText) {
    filteredItems = items.filter((item) => item.name.includes(filterText));
    if (filteredItems.length > 0) {
      currentPage.set(1);
      paginatedItems = chunk([...filteredItems], DEFAULT_ITEMS_PER_PAGE);
      totalItems = filteredItems.length;
    }
  }

  $: filteredItems = paginatedItems[$currentPage - 1];
</script>

<style>
  .item-browser {
    max-height: 400px;
    overflow: scroll;
    a {
      text-decoration: none;
    }
  }

  table {
    table-layout: fixed;
    width: 100%;
    background: $color-light-gray-05;
    border-collapse: collapse;
    margin: auto;
    tr {
      td {
        word-wrap: break-word;
        border: 1px dotted $color-light-gray-30;
      }
      &:nth-child(odd) td {
        background: $color-light-gray-10;
      }
      &:hover td {
        background: $color-dark-gray-30;
        color: $color-light-gray-05;
        a {
          color: $color-light-gray-05;
          &:hover {
            color: $color-blue-40;
          }
        }
      }
      .description {
        @include text-body-sm;
      }
    }
  }
</style>

{#if !items.length}
  <p>Currently, there are no {itemType} available for {items.name}</p>
{:else}
  <FilterInput onChangeText={filterItems} />
  <div class="item-browser">
    <table class="mzp-u-data-table">
      <!-- We have to do inline styling here to override Protocol CSS rules -->
      <!-- https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity -->
      <col width="35%" />
      <col width={itemType === 'metrics' ? '25%' : '65%'} />
      <col width={itemType === 'metrics' ? '40%' : '0'} />
      <thead>
        <tr>
          <th scope="col" style="text-align: center;">Name</th>
          {#if itemType === 'metrics'}
            <th scope="col" style="text-align: center;">Type</th>
          {/if}
          <th scope="col" style="text-align: center;">Description</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredItems as item}
          <tr>
            <td>
              <a href={getItemURL(appName, itemType, item.name)}>{item.name}</a>
            </td>
            {#if itemType === 'metrics'}
              <td style="text-align: center;"><code>{item.type}</code></td>
            {/if}
            <td class="description">
              <Markdown text={item.description} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
{#if filteredItems.length}
  <Pagination {totalItems} itemsPerPage={DEFAULT_ITEMS_PER_PAGE} />
{/if}
