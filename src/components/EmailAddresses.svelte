<script>
  export let emails;
</script>

<style>
  span {
    display: block;
  }
</style>

{#each emails as email}<span> <a href="mailto:{email}">{email}</a></span>{/each}
