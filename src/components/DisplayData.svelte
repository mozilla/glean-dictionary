<script>
    import Pagination, { makePages, goToPage } from "./Pagination.svelte";
    import FilterInput from "./FilterInput.svelte";
    import Markdown from "./Markdown.svelte";

    export let paginationState = {
      pages: [],
      currentPage: 1,
    };

    export let appName;
    export let data;
    export let filteredItems;
    export let itemType;

    paginationState = makePages(paginationState.currentPage, data[itemType]);
    filteredItems = paginationState.pages[paginationState.currentPage - 1];
  
    function loadPage(args) {
      let tempState = goToPage(args.page, paginationState.pages);
      paginationState = Object.assign(paginationState, tempState);
      filteredItems = tempState.page;
    }
    
    function filterItems(filterText) {
      filteredItems = data[itemType].filter((item) =>
        item.name.includes(filterText)
      );
      if (filteredItems.length > 0) {
        paginationState.currentPage = 1;
        paginationState = makePages(paginationState.currentPage, filteredItems);
        filteredItems = paginationState.pages[paginationState.currentPage - 1];
      }
    }
  
    const capitalize = (s) => {
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

  </script>

  <h2>{capitalize(itemType)}</h2>
  {#if !data[itemType].length}
    <p>Currently, there are no {itemType} available for {data.name}</p>
  {:else}
    <FilterInput onChangeText={filterItems} />
    <ul>
      {#each filteredItems as item}
        <li>
          <a
            href={`/apps/${appName || data.name}/${itemType}/${item.name}`}>{item.name}</a>
          <i><Markdown text={item.description} /></i>
        </li>
      {:else}
        <p>Your search didn't match any {itemType}.</p>
      {/each}
    </ul>
  {/if}
  {#if paginationState.total > 20 && filteredItems.length}
    <Pagination
      {...paginationState}
      on:changePage={(ev) => loadPage({ page: ev.detail })} />
  {/if}
  