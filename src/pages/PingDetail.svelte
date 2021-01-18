<script>
  import { getPingData } from "../state/api";
  import { pageTitle } from "../state/stores";

  import EmailAddresses from "../components/EmailAddresses.svelte";
  import ItemList from "../components/ItemList.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Markdown from "../components/Markdown.svelte";
  import PageTitle from "../components/PageTitle.svelte";

  export let params;
  const pingDataPromise = getPingData(params.app, params.ping);

  pageTitle.set(`${params.ping} | ${params.app}`);
</script>

<style>
  a {
    text-decoration: none;
  }
  .mzp-u-data-table {
    margin-top: $spacing-md;
    margin-bottom: $spacing-lg;
    td {
      border: 1px solid $color-light-gray-40;
      padding: 0.5rem;
    }
  }
</style>

{#await pingDataPromise then ping}
  <PageTitle text={ping.name} />
  <table class="mzp-u-data-table">
    <tr>
      <td>Description</td>
      <td>
        <Markdown text={ping.description} />
      </td>
    </tr>
    <tr>
      <td>Related Bugs</td>
      <td>
        {#each ping.bugs as bug}
          {#if typeof bug === 'number'}
            <a
              href={`https://bugzilla.mozilla.org/show_bug.cgi?id=${bug}`}>{bug}</a>
          {:else}<a href={bug}>{bug}</a>{/if}
        {/each}
      </td>
    </tr>
    <tr>
      <td>Reviews Data</td>
      <td>
        {#each ping.data_reviews as review}<a href={review}>{review}</a>{/each}
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
