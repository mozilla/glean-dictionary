<script>
  import { getAppData } from "../state/api";

  import AppAlert from "../components/AppAlert.svelte";
  import ItemList from "../components/ItemList.svelte";
  import EmailAddresses from "../components/EmailAddresses.svelte";
  import NotFound from "../components/NotFound.svelte";
  import Pill from "../components/Pill.svelte";
  import { TabGroup, Tab, TabContent } from "../components/tabs";
  import PageTitle from "../components/PageTitle.svelte";

  export let params;

  const appDataPromise = getAppData(params.app);
</script>

<style>
  @import "../main.scss";
  @include metadata-table;
</style>

{#await appDataPromise then app}
  {#if app.prototype}
    <AppAlert
      status="warning"
      message="This application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings." />
  {/if}
  <PageTitle text={params.app} />

  {#if app.deprecated}
    <Pill message="Deprecated" bgColor="#4a5568" />
  {/if}
  <p>{app.description}</p>
  <table>
    <col />
    <col />
    <tr>
      <td>Source Code</td>
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
