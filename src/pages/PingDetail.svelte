<script>
  import { getPingData } from "../state/api";

  import BugLink from "../components/BugLink.svelte";
  import EmailAddresses from "../components/EmailAddresses.svelte";
  import ItemList from "../components/ItemList.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Markdown from "../components/Markdown.svelte";
  import PageTitle from "../components/PageTitle.svelte";

  export let params;
  const pingDataPromise = getPingData(params.app, params.ping);
</script>

<style>
  @import "../main.scss";
  @include metadata-table;
</style>

{#await pingDataPromise then ping}
  <PageTitle text={ping.name} />
  <table>
    <col />
    <col />
    <tr>
      <td>Description</td>
      <td>
        <Markdown text={ping.description} />
      </td>
    </tr>
    <tr>
      <td>Related Bugs</td>
      <td>
        {#each ping.bugs as bugRef}
          <BugLink ref={bugRef} />
        {/each}
      </td>
    </tr>
    <tr>
      <td>Reviews Data</td>
      <td>
        {#each ping.data_reviews as reviewRef}
          <BugLink ref={reviewRef} />
        {/each}
      </td>
    </tr>
    <tr>
      <td>Includes Client Identifier</td>
      <td>{ping.include_client_id ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>
        Notification Email{ping.notification_emails.length > 1 ? 's' : ''}
      </td>
      <td>
        <EmailAddresses emails={ping.notification_emails} />
      </td>
    </tr>
    <tr>
      <td>BigQuery Table</td>
      <td>
        <a
          href={`/apps/${params.app}/tables/${params.ping}`}>{ping.stable_table_name}</a>
      </td>
    </tr>
  </table>
  <ItemList itemType="metrics" items={ping.metrics} appName={params.app} />
{:catch}
  <NotFound pageName={params.ping} itemType="ping" />
{/await}
