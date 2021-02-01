<script>
  export let text;
</script>

<style>
  h1 {
    @include text-title-sm;
  }
</style>

<slot>
  <h1>
    {@html text}
  </h1>
</slot>
