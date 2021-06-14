<script context="module">
  export async function load({ page, fetch }) {
    const res = await fetch(
      `/data/${page.params.app}/pings/${page.params.ping}.json`
    );
    if (res.ok) {
      const ping = await res.json();
      const { app } = page.params;

      return {
        props: { ping, app },
      };
    }
    const { message } = await res.json();
    return { error: new Error(message) };
  }
</script>

<script>
  // components
  import AppAlert from "$lib/components/AppAlert.svelte";
  import VariantSelector from "$lib/components/VariantSelector.svelte";
  import Commentary from "$lib/components/Commentary.svelte";
  import HelpHoverable from "$lib/components/HelpHoverable.svelte";
  import ItemList from "$lib/components/ItemList.svelte";
  import MetadataTable from "$lib/components/MetadataTable.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import PageTitle from "$lib/components/PageTitle.svelte";
  import AuthenticatedLink from "$lib/components/AuthenticatedLink.svelte";
  import SubHeading from "$lib/components/SubHeading.svelte";

  import { pageState } from "$lib/state/stores";
  import { getBigQueryURL } from "$lib/state/urls";

  import { PING_SCHEMA } from "$lib/data/schemas";

  export let ping;
  export let app;

  let selectedAppVariant;
  [selectedAppVariant] = ping.variants;

  $pageState = {
    search: "",
    showExpired: true,
    ...$pageState,
  };
</script>

<svelte:head>
  <title>{ping.name} | {app}</title>
</svelte:head>

{#if ping.origin && ping.origin !== app}
  <AppAlert
    status="warning"
    message={`This ping is defined by a library used by the application (__${ping.origin}__), rather than the application itself. For more details, see the definition.`}
  />
{/if}

<PageTitle text={ping.name} />
<p><Markdown text={ping.description} /></p>

<SubHeading
title={"Metadata"}
helpText={"Metadata about this ping, as defined by the implementor."}
/>
<MetadataTable appName={app} item={ping} schema={PING_SCHEMA} />

<SubHeading
title={"Commentary"}
helpText={"Reviewed commentary from Mozilla data practitioners on this ping."}
/>
<Commentary item={ping} itemType={"ping"} />

{#if ping.variants.length > 1}
<SubHeading
title={"Access"}
helpText={"Ways to access this metric in Mozilla's data warehouse."}
/>
  {#if ping.variants.length > 1}
    <VariantSelector
      name={"app_id"}
      label={"Application Variant"}
      bind:selectedVariant={selectedAppVariant}
      variants={ping.variants}
    />
  {/if}

  {#if selectedAppVariant}
    <table>
      <col />
      <col />
      <tr>
        <td>
          BigQuery
          <HelpHoverable
            content={"The BigQuery representation of this ping."}
          />
        </td>
        <td>
          <a
            href={getBigQueryURL(
              app,
              selectedAppVariant.id,
              ping
            )}
          >
            {selectedAppVariant.table}
          </a>
        </td>
      </tr>
      {#if selectedAppVariant.looker_url}
        <tr>
          <td>
            Looker
            <HelpHoverable
              content={"Explore this ping in Mozilla's instance of Looker."}
            />
          </td>
          <td>
            <AuthenticatedLink href={selectedAppVariant.looker_url}>
              {ping.name}
            </AuthenticatedLink>
          </td>
        </tr>
      {/if}
    </table>
  {/if}
  {/if}

<SubHeading
title={"Metrics"}
helpText={"Metrics that are sent inside this ping."}
/>
<details>
  <ItemList itemType="metrics" items={ping.metrics} appName={app} />
</details>

<style>
  @include metadata-table;
  h2 {
    @include text-title-xs;
  }
</style>
