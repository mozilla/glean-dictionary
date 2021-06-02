<script>
  import { chunk } from "lodash";

  import { getItemURL } from "../state/urls";

  import Pagination from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";
  import Label from "./Label.svelte";

  import { isExpired } from "../state/metrics";
  import { pageState, updateURLState } from "../state/stores";

  let DEFAULT_ITEMS_PER_PAGE = 20;

  export let appName;
  export let items;
  export let itemType;

  export let showFilter = true;

  let filteredItems = items.filter((item) => !isExpired(item.expires));
  let pagedItems;
  let paginated = true;

  // track change of filter input
  let { search } = $pageState;

  // re-filter items when showExpired or search text changes
  $: {
    if (search !== $pageState.search) {
      search = $pageState.search || "";
      $pageState.page = 1;
    }
  }

  // update pagedItems when either pagination changes or search text changes
  // (above)
  $: {
    const originMatch = (item) =>
      item.origin && item.origin.includes(search.toLowerCase());

    // filter on match either on name or on origin
    filteredItems = items.filter(
      (item) => item.name.includes(search) || originMatch(item)
    );

    // also filter out expired items (if we're not showing expired)
    filteredItems = $pageState.showExpired
      ? filteredItems
      : filteredItems.filter((item) => !isExpired(item.expires));

    // update pagination
    const currentPage = $pageState.page || 1;
    const perPage = paginated ? DEFAULT_ITEMS_PER_PAGE : filteredItems.length;
    const chunkIndex = paginated ? currentPage - 1 : 0;
    pagedItems =
      filteredItems.length > 0
        ? chunk([...filteredItems], perPage)[chunkIndex]
        : [];
  }

  const originClicked = (origin) => {
    $pageState = { ...$pageState, search: origin };
    // when the user clicks on an origin (library name), we want to persist a new state
    updateURLState(true);
  };
</script>

{#if !items.length}
  <p>Currently, there are no {itemType} available for {items.name}</p>
{:else}
  {#if itemType === "metrics"}
    <span class="expire-checkbox">
      <label>
        <input type="checkbox" bind:checked={$pageState.showExpired} />
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
      <col width={itemType === "metrics" ? "20%" : "65%"} />
      <col width={itemType === "metrics" ? "45%" : "0"} />
      <thead>
        <tr>
          <th scope="col" style="text-align: center;">Name</th>
          {#if itemType === "metrics"}
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
                <a href={getItemURL(appName, itemType, item.name)}
                  >{item.name}</a
                >
                {#if item.origin && item.origin !== appName}
                  <Label
                    text={item.origin}
                    on:click={originClicked(item.origin)}
                    clickable
                  />
                {/if}
                {#if isExpired(item.expires)}
                  <Label text="expired" />
                {/if}
                {#if item.deprecated}
                  <Label text="deprecated" />
                {/if}
              </div>
            </td>
            {#if itemType === "metrics"}
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
    itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
  />
{/if}

<style>
  .item-browser {
    a {
      text-decoration: none;
    }
  }

  .item-property {
    height: 50px;
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
