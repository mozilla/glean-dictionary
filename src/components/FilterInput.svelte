<script>
  import { getContext } from "svelte";

  export let placeHolder;

  const searchText = getContext("searchText");
</script>

<style>
  div {
    margin-top: $spacing-xs;
    margin-bottom: $spacing-xs;
  }
  #filter-input {
    width: 100%;
    box-shadow: 3px 3px 6px rgba($color-black, 0.1);
    border-radius: 15px;
    border: 1px solid #000;
  }
</style>

<div>
  <input
    {placeHolder}
    type="search"
    id="filter-input"
    bind:value={$searchText} />
</div>
