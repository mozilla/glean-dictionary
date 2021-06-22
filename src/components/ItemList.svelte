<script>
  import { chunk } from "lodash";

  import { getItemURL } from "../state/urls";

  import Pagination from "./Pagination.svelte";
  import FilterInput from "./FilterInput.svelte";
  import Markdown from "./Markdown.svelte";
  import Label from "./Label.svelte";

  import { filterItems } from "../state/filter";
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
  let topElement;
  let scrollY;

  // update pagedItems when either pagination changes or search text changes
  // (above)
  $: {
    // filter items by search terms and expiry state
    filteredItems = filterItems(
      items,
      $pageState.search || "",
      $pageState.showExpired
    );

    // update pagination
    const currentPage = $pageState.page || 1;
    const perPage = paginated ? DEFAULT_ITEMS_PER_PAGE : filteredItems.length;
    const chunkIndex = paginated ? currentPage - 1 : 0;
    pagedItems =
      filteredItems.length > 0
        ? chunk([...filteredItems], perPage)[chunkIndex]
        : [];
  }

  const updateSearch = (origin, type = undefined) => {
    $pageState = type
      ? { ...$pageState, search: origin, page: 1, itemType: type }
      : { ...$pageState, search: origin, page: 1 };
    // when the user clicks on an origin (library name), we want to persist a new state
    updateURLState(true);
    // reset scroll position if we've scrolled down
    if (scrollY > topElement.offsetTop) {
      window.scroll(0, topElement.offsetTop);
    }
  };
</script>

<svelte:window bind:scrollY />

<div bind:this={topElement}>
  {#if !items.length}
    <p>
      No {itemType} found matching specified criteria.
    </p>
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
        <col
          width={itemType === "metrics" || itemType === "tags" ? "20%" : "65%"}
        />
        <col
          width={itemType === "metrics" || itemType === "tags" ? "45%" : "0"}
        />
        <thead>
          <tr>
            <th scope="col" style="text-align: center;">Name</th>
            {#if itemType === "metrics"}
              <th scope="col" style="text-align: center;">Type</th>
            {:else if itemType === "tags"}
              <th scope="col" style="text-align: center;">Metric Count</th>
            {/if}
            <th scope="col" style="text-align: center;">Description</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedItems as item}
            <tr>
              <td>
                <div class="item-property">
                  {#if itemType === "tags"}
                    <Label
                      text={item.name}
                      on:click={updateSearch(item.name, "metrics")}
                      clickable
                    />
                  {:else}
                    <a href={getItemURL(appName, itemType, item.name)}
                      >{item.name}</a
                    >
                  {/if}
                  {#if item.origin && item.origin !== appName}
                    <Label
                      text={item.origin}
                      on:click={updateSearch(item.origin)}
                      clickable
                    />
                  {/if}
                  {#if item.tags}
                    {#each item.tags as tag}
                      <Label
                        text={tag}
                        clickable
                        on:click={updateSearch(tag)}
                      />
                    {/each}
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
              {:else if itemType === "tags"}
                <td style="text-align: center;">
                  <div class="item-property">
                    {item.metric_count}
                  </div>
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
</div>

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
