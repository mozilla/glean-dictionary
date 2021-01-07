<script>
  import BackButton from "../src/components/icons/BackButton.svelte";
  import ForwardButton from "../src/components/icons/ForwardButton.svelte";

  export let itemsPerPage;
  export let totalItems;
  let from;
  let to;
  let lastPage;
  let currentPage = 1;

  const truncatedPagination = (current, last) => {
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
      currentPage = page;
    }
  }

  $: {
    lastPage = Math.ceil(totalItems / itemsPerPage);
    from = 1 + itemsPerPage * (currentPage - 1);
    if (currentPage * itemsPerPage > totalItems) {
      to = totalItems;
    } else {
      to = currentPage * itemsPerPage;
    }
  }
</script>

<p>
  Page
  <code>{currentPage}</code>
  of
  <code>{lastPage}</code>
  (<code>{from}</code>
  -
  <code>{to}</code>
  on
  <code>{totalItems}</code>
  items)
</p>

{#if itemsPerPage < totalItems}
  <div class="flex flex-col items-center my-12">
    <div class="flex text-gray-700">
      <div
        on:click|preventDefault={() => changePage(currentPage !== 1 ? currentPage - 1 : 1)}
        class="h-12 w-12 mr-1 flex justify-center items-center rounded-full bg-gray-200 cursor-pointer {currentPage === 1 ? 'bg-teal-600 text-white' : ''}">
        <BackButton />
      </div>
      <div class="flex h-12 font-medium rounded-full bg-gray-200">
        {#each truncatedPagination(currentPage, lastPage) as page}
          <div
            on:click|preventDefault={() => changePage(Number.isInteger(page) ? page : currentPage)}
            class="w-12 md:flex justify-center items-center hidden cursor-pointer {page === currentPage ? 'bg-teal-600 text-white' : ''}">
            {page}
          </div>
        {/each}
      </div>
      <div
        on:click|preventDefault={() => changePage(currentPage !== lastPage ? currentPage + 1 : lastPage)}
        class="h-12 w-12 ml-1 flex justify-center items-center rounded-full bg-gray-200 cursor-pointer {currentPage === lastPage ? 'bg-teal-600 text-white' : ''}">
        <ForwardButton />
      </div>
    </div>
  </div>
{/if}
