<script>
  export let message = "";
  export let bgColor;
  export let clickable = false;
</script>

<style>
  .pill {
    @include text-body-sm;
    display: inline-block;
    border-radius: 9999px;
    border-color: transparent;
    padding: 0 $spacing-sm 0 $spacing-sm;
    color: $color-light-gray-05;
    font-weight: bold;
    margin-right: 2px;
  }

  .clickable {
    cursor: pointer;
  }
</style>

<div
  style="background-color: {bgColor}"
  class="pill {clickable ? 'clickable' : ''}"
  on:click>
  {message}
</div>
