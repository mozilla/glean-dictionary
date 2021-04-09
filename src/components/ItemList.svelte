<script>
  import { getContext, setContext } from "svelte";
  import { writable } from "svelte/store";
  import { chunk } from "lodash";

  import { getItemURL } from "../state/urls";

  import Pagination from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";
  import Pill from "./Pill.svelte";

  import { isExpired } from "../state/metrics";

  let DEFAULT_ITEMS_PER_PAGE = 20;

  export let appName;
  export let items;
  export let itemType;

  export let showFilter = true;

  let filteredItems = items.filter((item) => !isExpired(item.expires));
  let pagedItems;
  let paginated = true;

  let currentPage = writable(1);
  setContext("currentPage", currentPage);

  const searchText = getContext("searchText");
  const goToPage = (page, perPage = DEFAULT_ITEMS_PER_PAGE) => {
    pagedItems =
      filteredItems.length > 0
        ? chunk([...filteredItems], perPage)[page - 1]
        : [];
  };

  const showExpired = getContext("showExpired");

  $: {
    if (paginated) {
      goToPage($currentPage);
    } else {
      goToPage(1, filteredItems.length);
    }
  }

  // re-filter items when showExpired or $searchText changes
  $: {
    const shownItems = $showExpired
      ? items
      : items.filter((item) => !isExpired(item.expires));
    filteredItems = shownItems.filter((item) =>
      item.name.includes($searchText)
    );
    // show the first page of result
    currentPage.set(1);
    // even if currentPage is already 1, we need to manually call goToPage() to get the first page
    goToPage(1);
  }
</script>

<style>
  .item-browser {
    a {
      text-decoration: none;
    }
  }

  .item-property {
    height: 40px;
    overflow-y: auto;
    margin: -0.25rem;
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
        <input type="checkbox" bind:checked={$showExpired} />
        Show expired metrics
      </label>
      <label>
        <input type="checkbox" bind:checked={paginated} />
        Paginate
      </label>
    </span>
  {/if}
  {#if showFilter}
    <FilterInput placeHolder="Search {itemType}" />
  {/if}
  <div class="item-browser">
    <table class="mzp-u-data-table">
      <!-- We have to do inline styling here to override Protocol CSS rules -->
      <!-- https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity -->
      <col width="35%" />
      <col width={itemType === 'metrics' ? '20%' : '65%'} />
      <col width={itemType === 'metrics' ? '45%' : '0'} />
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
        {#each pagedItems as item}
          <tr>
            <td>
              <div class="item-property">
                <a
                  href={getItemURL(appName, itemType, item.name)}>{item.name}</a>
                {#if isExpired(item.expires)}
                  <Pill message="Expired" bgColor="#4a5568" />
                {/if}
                {#if item.deprecated}
                  <Pill message="Deprecated" bgColor="#4a5568" />
                {/if}
              </div>
            </td>
            {#if itemType === 'metrics'}
              <td style="text-align: center;">
                <div class="item-property"><code>{item.type}</code></div>
              </td>
            {/if}
            <td class="description">
              <div class="item-property" title={item.description}>
                <Markdown text={item.description} />
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

{#if filteredItems.length && paginated}
  <Pagination
    totalItems={filteredItems.length}
    itemsPerPage={DEFAULT_ITEMS_PER_PAGE} />
{/if}
