<script>
  export let message = "";
  export let bgColor;
</script>

<style>
  .app-alert {
    width: 100%;
    padding: $spacing-xs;
    margin-top: $spacing-sm;
    margin-bottom: $spacing-sm;
    box-shadow: 4px 2px 2px $color-light-gray-70;

    p {
      @include text-title-xs;
      color: $color-light-gray-10;
    }
  }
</style>

<div role="alert">
  <div class="app-alert" style="background-color: {bgColor}">
    <p>{message}</p>
  </div>
</div>
