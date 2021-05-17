<script>
  import { getLabelData } from "../state/api";
  import Commentary from "../components/Commentary.svelte";
  import ItemList from "../components/ItemList.svelte";
  import Markdown from "../components/Markdown.svelte";
  import NotFound from "../components/NotFound.svelte";
  import PageTitle from "../components/PageTitle.svelte";

  export let params;

  const labelDataPromise = getLabelData(params.app, params.label);
</script>

{#await labelDataPromise then label}
  <PageTitle text={label.name} />
  <p>
    {#if label.description.length > 0}
      <Markdown text={label.description} inline={false} />
    {:else}
      <i>No description available.</i>
    {/if}
  </p>
  <h2>Commentary</h2>
  <Commentary item={label} itemType={"label"} />
  <h2>Metrics</h2>
  <ItemList itemType="metrics" items={label.metrics} appName={params.app} />
{:catch}
  <NotFound pageName={params.label} itemType="label" />
{/await}

<style>
  @import "../main.scss";

  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
</style>
