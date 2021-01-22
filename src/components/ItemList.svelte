<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import { chunk } from "lodash";

  import { getItemURL } from "../state/urls";

  import Pagination from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";

  import { isExpired } from "../utils";

  let DEFAULT_ITEMS_PER_PAGE = 20;

  export let appName;
  export let items;
  export let itemType;
  export let filteredItems;
  export let totalItems;
  export let paginatedItems;

  let nonExpiredItems = items.filter((item) => !isExpired(item.expires));
  let shownItems = nonExpiredItems;

  let showExpired = false;
  let filterTerm = "";

  let currentPage = writable(1);
  setContext("currentPage", currentPage);

  totalItems = shownItems.length;
  paginatedItems = chunk([...shownItems], DEFAULT_ITEMS_PER_PAGE);

  function filterItems(filterText) {
    filterTerm = filterText;
    filteredItems = shownItems.filter((item) => item.name.includes(filterText));
    if (filteredItems.length > 0) {
      currentPage.set(1);
      paginatedItems = chunk([...filteredItems], DEFAULT_ITEMS_PER_PAGE);
      totalItems = filteredItems.length;
    }
  }

  function handleExpiredItems(checked) {
    if (checked) {
      shownItems = items;
      filterItems(filterTerm);
    } else {
      shownItems = nonExpiredItems;
      filterItems(filterTerm);
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

    thead {
      position: sticky;
      top: 0;
      background-color: $color-light-gray-05;
    }
    tr {
      td {
        word-wrap: break-word;
        border: 1px dotted $color-light-gray-30;
      }
      &:nth-child(odd) td {
        background: $color-light-gray-10;
      }
      &:hover td {
        background: rgba($color-link-hover, 0.1);
      }
      .description {
        @include text-body-sm;
      }
    }
  }
  .expire-checkbox {
    display: block;
    text-align: right;
    label {
      display: inline;
    }
  }
</style>

{#if !items.length}
  <p>Currently, there are no {itemType} available for {items.name}</p>
{:else}
  {#if itemType === 'metrics'}
    <span class="expire-checkbox">
      <label>
        <input
          type="checkbox"
          bind:checked={showExpired}
          on:click={handleExpiredItems(!showExpired)} />
        Show expired metrics
      </label>
    </span>
  {/if}
  <FilterInput onChangeText={filterItems} placeHolder="Search {itemType}" />
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
          {#if showExpired || !isExpired(item.expires)}
            <tr>
              <td>
                <a
                  href={getItemURL(appName, itemType, item.name)}>{item.name}</a>
                {#if isExpired(item.expires)}<i>(expired)</i>{/if}
              </td>
              {#if itemType === 'metrics'}
                <td style="text-align: center;"><code>{item.type}</code></td>
              {/if}
              <td class="description">
                <Markdown text={item.description} />
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
{/if}
{#if filteredItems.length}
  <Pagination {totalItems} itemsPerPage={DEFAULT_ITEMS_PER_PAGE} />
{/if}
