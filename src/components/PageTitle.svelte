<script>
  export let text;
</script>

<style>
  h1 {
    font-size: 32px;
  }
</style>

<slot>
  <h1>
    {@html text}
  </h1>
</slot>
