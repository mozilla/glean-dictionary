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
    margin-top: $spacing-xs;
    margin-bottom: $spacing-xs;
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
