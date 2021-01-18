<script>
  import { throttle } from "lodash";

  export let onChangeText;
  export let filterText = "";

  export let text;

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
    cursor: pointer;
    box-shadow: $box-shadow-sm;
  }
</style>

<div>
  <input
    placeHolder={text}
    style="border-radius: 15px; border: 1px solid #000;"
    type="search"
    id="filter-input"
    bind:value={filterText}
    on:input={throttle(changeText, 200)} />
</div>
