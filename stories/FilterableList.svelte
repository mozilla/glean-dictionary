<script>
  import FilterInput from "../src/components/FilterInput.svelte";
  export let listItems;

  let filteredItems = listItems;
  function filterList(filterText = "") {
    filteredItems = listItems.filter((item) => item.includes(filterText));
  }
</script>

<div class="container">
  <FilterInput onChangeText={filterList} />
  <ul>
    {#each filteredItems as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>
