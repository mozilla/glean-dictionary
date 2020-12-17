<script context="module">
  import { chunk } from "lodash";

  let DEFAULT_ITEMS_PER_PAGE = 20;

  export const makePages = (page, data, perPage = DEFAULT_ITEMS_PER_PAGE) => {
    if (data.length === 0) return {};
    let total = data.length;
    let currentPage = page;
    let lastPage = Math.ceil(total / perPage);
    let pages = chunk([...data], perPage);
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

  export const truncatedPagination = (current, last) => {
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
    if (includeThreeRight) filteredCenter.push(total - 1);

    if (includeLeftDots) filteredCenter.unshift("...");
    if (includeRightDots) filteredCenter.push("...");

    if (total <= 1) return [1];
    return [1, ...filteredCenter, last];
  };

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
      {#each truncatedPagination(currentPage, lastPage) as page}
        <div
          on:click|preventDefault={() => changePage(page)}
          class="m-4 md:flex justify-center items-center cursor-pointer leading-5 {page === currentPage ? 'bg-teal-600 text-white' : ''}">
          {page}
        </div>
      {/each}
    </div>
  </div>
</div>
