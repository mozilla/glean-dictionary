<script>
  export let text;
</script>

<slot>
  <h1>
    {@html text}
  </h1>
</slot>

<style>
  h1 {
    @include text-title-sm;
  }
</style>
