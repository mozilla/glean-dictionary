<script>
  import { getAppIdData } from "../state/api";

  import { APPLICATION_ID_DEFINITION_SCHEMA } from "../data/schemas";
  import MetadataTable from "../components/MetadataTable.svelte";
  import Label from "../components/Label.svelte";
  import PageHeader from "../components/PageHeader.svelte";
  import { pageTitle } from "../state/stores";
  import { getDeprecatedItemDescription } from "../data/help";

  export let params;

  function setTitle(appId, app) {
    pageTitle.set(`${appId.app_id} | ${app}`);
  }

  const appIdDataPromise = getAppIdData(params.app, params.appId).then(
    (appId) => {
      setTitle(appId, params.app);
      return appId;
    }
  );

  setTitle(params.appId, params.app);
</script>

{#await appIdDataPromise then appId}
  <PageHeader title={appId.app_id}>
    <svelte:fragment slot="tags">
      {#if appId.deprecated}
        <Label
          text="deprecated"
          description={getDeprecatedItemDescription("app id")}
        />
      {/if}
    </svelte:fragment>
  </PageHeader>

  {#if appId.description}
    <p>{appId.description}</p>
  {/if}

  <h2>Metadata</h2>

  <MetadataTable
    appName={params.app}
    item={appId}
    schema={APPLICATION_ID_DEFINITION_SCHEMA}
  />
{/await}

<style lang="scss">
  @import "../main.scss";
  h2 {
    @include text-title-xs;
  }
</style>
