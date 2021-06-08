<script>
  export let message = "";
  export let bgColor;
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
  }
</style>

<div style="background-color: {bgColor}" class="pill">{message}</div>
