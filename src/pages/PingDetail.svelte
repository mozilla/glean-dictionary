<script>
  import { getPingData } from "../state/api";
  import NotFoundPage from "../components/NotFoundPage.svelte";

  export let params;
  const pingDataPromise = getPingData(params.app, params.ping);
</script>

{#await pingDataPromise then ping}
  <h1>{ping.name}</h1>
  <p>{ping.description}</p>
  <p><a href={`/apps/${params.app}/tables/${ping.name}`}>BigQuery table</a></p>
  {:catch}
  <NotFoundPage pageName = {params.ping} itemType = "ping"/>
{/await}
