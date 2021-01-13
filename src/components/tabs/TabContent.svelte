<script>
  export let key;
  import { getContext } from "svelte";

  const activeTab = getContext("activeTab");
</script>

<style>
  .box {
    padding: 2rem;
    border: 1px solid $color-light-gray-40;
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
</style>

{#if $activeTab === key}
  <div class="box">
    <slot />
  </div>
{/if}
