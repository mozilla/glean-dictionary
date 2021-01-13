<script>
  import { getContext } from "svelte";

  import BackButton from "./icons/BackButton.svelte";
  import ForwardButton from "./icons/ForwardButton.svelte";

  export let itemsPerPage;
  export let totalItems;
  let from;
  let to;
  let lastPage;
  let currentPage = getContext("currentPage");

  const truncatedPagination = (current, last) => {
    // Source: https://gist.github.com/kottenator/9d936eb3e4e3c3e02598#gistcomment-3413141
    const center = [
      current - 2,
      current - 1,
      current,
      current + 1,
      current + 2,
    ];
    const filteredCenter = center.filter((p) => p > 1 && p < last);
    const includeThreeLeft = current === 5;
    const includeThreeRight = current === last - 4;
    const includeLeftDots = current > 5;
    const includeRightDots = current < last - 4;

    if (includeThreeLeft) filteredCenter.unshift(2);
    if (includeThreeRight) filteredCenter.push(last - 1);

    if (includeLeftDots) filteredCenter.unshift("...");
    if (includeRightDots) filteredCenter.push("...");

    return [1, ...filteredCenter, last];
  };

  function changePage(page) {
    if (page !== currentPage) {
      currentPage.set(page);
    }
  }

  $: {
    lastPage = Math.ceil(totalItems / itemsPerPage);
    from = 1 + itemsPerPage * ($currentPage - 1);
    if ($currentPage * itemsPerPage > totalItems) {
      to = totalItems;
    } else {
      to = $currentPage * itemsPerPage;
    }
  }
</script>

<style>
  .pagination-position {
    margin-top: $spacing-md;
  }
  .pagination-bar {
    display: flex;
    justify-content: center;
    color: $color-dark-gray-70;
    .pagination-button {
      height: 2.5rem;
      width: 2.5rem;
    }

    .pages {
      display: flex;
      justify-content: center;
      .page {
        @include text-body-md;
        height: 3rem;
        font-weight: bold;
        margin: 0.5rem;
        cursor: pointer;
      }
    }
    .current-page {
      color: $color-light-gray-50;
      cursor: not-allowed;
    }
  }
</style>

<div class="pagination-position">
  <p>
    Page
    <code>{$currentPage}</code>
    of
    <code>{lastPage}</code>
    (<code>{from}</code>
    -
    <code>{to}</code>
    on
    <code>{totalItems}</code>
    items)
  </p>
</div>

{#if itemsPerPage < totalItems}
  <div class="pagination-bar">
    <div
      on:click|preventDefault={() => changePage($currentPage !== 1 ? $currentPage - 1 : 1)}
      class="pagination-button {$currentPage === 1 ? 'current-page' : ''}">
      <BackButton />
    </div>
    <div class="pages">
      {#each truncatedPagination($currentPage, lastPage) as page}
        <div
          on:click|preventDefault={() => changePage(Number.isInteger(page) ? page : $currentPage)}
          class="page {page === $currentPage ? 'current-page' : ''}">
          {page}
        </div>
      {/each}
    </div>
    <div
      on:click|preventDefault={() => changePage($currentPage !== lastPage ? $currentPage + 1 : lastPage)}
      class="pagination-button {$currentPage === lastPage ? 'current-page' : ''}">
      <ForwardButton />
    </div>
  </div>
{/if}
