<script>
  import { pageState, updateURLState } from "../state/stores";

  export let placeHolder;
</script>

<div>
  <input
    {placeHolder}
    type="search"
    id="filter-input"
    bind:value={$pageState.search}
    on:input={() => {
      // we want to reset the page number to 1 if the filter text ever changes
      // (and also update the URL)
      updateURLState({ page: 1 });
    }}
  />
</div>

<style lang="scss">
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
