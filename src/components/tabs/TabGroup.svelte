<script>
  export let active = 0;
  import { writable } from "svelte/store";
  import { createEventDispatcher, setContext } from "svelte";

  const activeTab = writable(active);
  setContext("activeTab", activeTab);

  const dispatch = createEventDispatcher();
  $: dispatch("tabChanged", { active: $activeTab });
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
