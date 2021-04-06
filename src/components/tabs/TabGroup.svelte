<script>
  export let active = 0;
  import { writable } from "svelte/store";
  import { createEventDispatcher, setContext } from "svelte";

  const store = writable(active);
  setContext("activeTab", store);

  const dispatch = createEventDispatcher();
  store.subscribe((value) => dispatch("tabChanged", { active: value }));
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
