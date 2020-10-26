<script>
  export let emails;
</script>

<style>
  td {
    @apply border;
    @apply p-2;
  }
</style>

<tr>
  <td>Notification Email{emails.length > 1 ? 's' : ''}</td>
  <td>
    {#each emails as email}
      <a href="mailto:{email}" target="_blank" {...$$props}>{email}</a>
      <br />
    {/each}
  </td>
</tr>
