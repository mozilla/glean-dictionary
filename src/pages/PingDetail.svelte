<script>
  import { getPingData } from "../state/api";

  export let params;
  const pingDataPromise = getPingData(params.app, params.ping);
</script>

<style>
  .table-header {
    @apply table-auto;
    @apply my-4;
  }

  .table-header td {
    @apply border;
    @apply p-2;
  }
</style>

{#await pingDataPromise then ping}
  <h1>{ping.name}</h1>
  <table class="bg-gray-100 table-header">
    <tr>
      <td>Description</td>
      <td>{ping.description}</td>
    </tr>
    <tr>
      <td>Related Bugs</td>
      <td>
        {#each ping.bugs as bug}<a class="mr-2" href={bug}>{bug}</a>{/each}
      </td>
    </tr>
    <tr>
      <td>Reviews Data</td>
      <td>
        {#each ping.data_reviews as review}
          <a class="mr-2" href={review}>{review}</a>
        {/each}
      </td>
    </tr>
    <tr>
      <td>Client Id</td>
      <td>{ping.client_id ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>
        notification_email{ping.notification_emails.length > 1 ? 's' : ''}
      </td>
      <td>
        {#each ping.notification_emails as email}<span>{email}</span>{/each}
      </td>
    </tr>
  </table>

  <p><a href={`/apps/${params.app}/tables/${ping.name}`}>BigQuery table</a></p>
{/await}
