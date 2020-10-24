<script context="module">
  export const paginateData = (array, totalPages) => {
    let result = [];
    let localData = array.slice();
    for (let i = totalPages; i > 0; i -= 1) {
      result.push(localData.splice(0, Math.max(Math.floor(localData.length / i), 100)));
    }
    return result;
  };

  export const makePages = (page, data, perPage = 100) => {
    if (data.length === 0) return [];
    let total = data.length;
    let currentPage = page;
    let lastPage = Math.ceil(total / perPage);
    let pages = paginateData(data, lastPage);
    let from = page + perPage * (page - 1);
    let to = page * perPage;
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
    let from = 1;
    for (let i = 0; i < page - 1; i += 1) {
      from += pages[i].length;
    }
    let to = from + pages[page - 1].length - 1;
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
    <div class="flex h-12 font-medium bg-gray-200">
      {#each range(lastPage, 1) as page}
        <div
          on:click|preventDefault={() => changePage(page)}
          class="w-12 md:flex justify-center items-center hidden cursor-pointer leading-5 {page === currentPage ? 'bg-teal-600 text-white' : ''}">
          {page}
        </div>
      {/each}
    </div>
  </div>
</div>
