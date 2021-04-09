<script>
  export let activeTab;
  import { createEventDispatcher, setContext } from "svelte";

  setContext("activeTab", activeTab);

  const dispatch = createEventDispatcher();
  $: dispatch("tabChanged", { activeTab: $activeTab });
</script>

<style>
  .tab-content {
    margin-top: $spacing-lg;
  }
</style>

<div class="tabs">
  <slot name="tabs" />
</div>

<div class="tab-content">
  <slot />
</div>
