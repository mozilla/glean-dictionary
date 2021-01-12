<script>
  import { getAppData } from "../state/api";

  import AppAlert from "../components/AppAlert.svelte";
  import ItemList from "../components/ItemList.svelte";
  import EmailAddresses from "../components/EmailAddresses.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Pill from "../components/Pill.svelte";
  import { TabGroup, Tab, TabContent } from "../components/tabs";
  import Title from "../components/Title.svelte";
  export let params;

  const appDataPromise = getAppData(params.app);
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

{#await appDataPromise then app}
  <Title text={params.app} />

  {#if app.deprecated}
    <Pill message="Deprecated" bgColor="#4a5568" />
  {/if}
  <p>{app.description}</p>
  <table class="mzp-u-data-table">
    <tr>
      <td>Source Code URL</td>
      <td><a href={app.url}>{app.url}</a></td>
    </tr>
    <tr>
      <td>Application ID</td>
      <td><code>{app.app_id}</code></td>
    </tr>
    <tr>
      <td>Notification Email{app.notification_emails.length > 1 ? 's' : ''}</td>
      <td>
        <EmailAddresses emails={app.notification_emails} />
      </td>
    </tr>
  </table>
  {#if app.prototype}
    <AppAlert
      message="The {params.app} application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings."
      bgColor="#808895" />
  {/if}

  <TabGroup active="Metrics">
    <Tab key="Metrics">Metrics</Tab>
    <Tab key="Pings">Pings</Tab>

    <TabContent key="Pings">
      <ItemList itemType="pings" items={app.pings} appName={app.name} />
    </TabContent>

    <TabContent key="Metrics">
      <ItemList itemType="metrics" items={app.metrics} appName={app.name} />
    </TabContent>
  </TabGroup>
{:catch}
  <NotFound pageName={params.app} itemType="application" />
{/await}
