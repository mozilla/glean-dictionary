<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import FilterInput from "../src/components/FilterInput.svelte";

  export let listItems;
  let filteredItems = listItems;

  let searchText = writable("");
  setContext("searchText", searchText);

  $: {
    filteredItems = listItems.filter((item) => item.includes($searchText));
  }
</script>

<div class="container">
  <FilterInput />
  <ul>
    {#each filteredItems as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>
