<script>
  export let currentPage;
  export let lastPage;
  export let from;
  export let to;
  export let total;
  import { createEventDispatcher } from "svelte";

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

<style>
  .pagination {
    display: flex;
    justify-content: center;
  }
  .pagination ul {
    display: flex;
    padding-left: 0;
    list-style: none;
  }
  .pagination li a {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    margin-left: -1px;
    line-height: 1.25;
    background-color: #fff;
    border: 1px solid #dee2e6;
  }
  .pagination li.active a {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
  }
  .pagination li.disabled a {
    color: #6c757d;
    pointer-events: none;
    cursor: auto;
    border-color: #dee2e6;
  }
</style>

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

<nav class="pagination">
  <ul>
    <li class={currentPage === 1 ? 'disabled' : ''}>
      <a href={'#'} on:click|preventDefault={() => changePage(currentPage - 1)}>
        <span aria-hidden="true">«</span>
      </a>
    </li>
    {#each range(lastPage, 1) as page}
      <li class={page === currentPage ? 'active' : ''}>
        <a
          href={'#'}
          on:click|preventDefault={() => changePage(page)}>{page}</a>
      </li>
    {/each}
    <li class={currentPage === lastPage ? 'disabled' : ''}>
      <a href={'#'} on:click|preventDefault={() => changePage(currentPage + 1)}>
        <span aria-hidden="true">»</span>
      </a>
    </li>
  </ul>
</nav>
