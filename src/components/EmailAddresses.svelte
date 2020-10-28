<script>
  export let emails;
</script>

{#each emails as email}
  <span class="block"> <a href="mailto:{email}">{email}</a></span>
{/each}
