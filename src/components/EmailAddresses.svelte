<script>
  export let emails;
</script>

{#each emails as email}
  <span class="block">
    <a href="mailto:{email}" target="_blank">{email}</a></span>
{/each}
