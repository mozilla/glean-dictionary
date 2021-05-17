<script>
  export let active = 0;
  import { writable } from "svelte/store";
  import { createEventDispatcher, setContext } from "svelte";

  let activeTab = writable(active);
  setContext("activeTab", activeTab);

  const dispatch = createEventDispatcher();
  $: {
    // handles $activeTab changing
    dispatch("tabChanged", { active: $activeTab });
  }
  $: {
    // handles component binding changing
    activeTab.set(active);
  }
</script>

<div class="tabs">
  <slot name="tabs" />
</div>

<div class="tab-content">
  <slot />
</div>

<style>
  .tab-content {
    margin-top: $spacing-lg;
  }
</style>
