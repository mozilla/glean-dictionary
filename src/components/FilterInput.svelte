<script>
  import { throttle } from "lodash";

  export let onChangeText;
  export let filterText = "";

  const changeText = () => {
    onChangeText(filterText);
  };
</script>

<style>
  div {
    margin: $spacing-xs 0 $spacing-xs 0;
  }
  input {
    width: 100%;
  }
</style>

<div>
  <input
    type="text"
    id="filter-input"
    bind:value={filterText}
    on:input={throttle(changeText, 200)}
    placeholder="filter terms" />
</div>
