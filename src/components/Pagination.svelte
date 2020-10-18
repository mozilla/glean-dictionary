<script context="module">
  export const paginateData = (array, totalPages) => {
    let result = [];
    let localData = array.slice(); // Don't fuckup the array!
    for (let i = totalPages; i > 0; i -= 1) {
      result.push(localData.splice(0, Math.ceil(localData.length / i)));
    }
    return result;
  };

  export const makePages = (page, perPage, data) => {
    if (data.length === 0) return [];
    let total = data.length;
    let currentPage = page;
    let lastPage = Math.ceil(total / perPage);
    let from = page + perPage * (page - 1);
    let to = page * perPage;
    let pages = paginateData(data, lastPage);
    return {
      total,
      currentPage,
      lastPage,
      from,
      to,
      pages,
    };
  };

  export const goToPage = (page, pages) => {
    let from = 0;
    for (let i = 0; i < page - 1; i += 1) {
      from += pages[i].length;
    }
    let to = from + pages[page - 1].length;
    return {
      currentPage: page,
      from,
      to,
      page: pages[page - 1],
    };
  };
</script>

<script>
  import { createEventDispatcher } from "svelte";

  export let currentPage;
  export let lastPage;
  export let from;
  export let to;
  export let total;
  const dispatch = createEventDispatcher();

  function range(size, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
  }

  function changePage(page) {
    if (page !== currentPage) {
      dispatch("changePage", page);
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
  <code>{total}</code>
  items)
</p>

<div class="flex flex-col items-center my-12">
  <div class="flex text-gray-700">
    <div
      on:click|preventDefault={() => changePage(currentPage - 1)}
      class="h-12 w-12 mr-1 flex justify-center items-center bg-gray-200 cursor-pointer {currentPage === 1 ? 'pointer-events-none' : ''}">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-chevron-left w-6 h-6">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </div>
    <div class="flex h-12 font-medium bg-gray-200">
      {#each range(lastPage, 1) as page}
        <div
          on:click|preventDefault={() => changePage(page)}
          class="w-12 md:flex justify-center items-center hidden  cursor-pointer leading-5 transition duration-150 ease-in {page === currentPage ? 'bg-teal-600 text-white' : ''}">
          {page}
        </div>
      {/each}
    </div>
    <div
      on:click|preventDefault={() => changePage(currentPage + 1)}
      class="h-12 w-12 ml-1 flex justify-center items-center bg-gray-200 cursor-pointer {currentPage === lastPage ? 'pointer-events-none' : ''}">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-chevron-right w-6 h-6">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  </div>
</div>
