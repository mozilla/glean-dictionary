<script>
  export let key;
  import { getContext } from "svelte";

  const activeTab = getContext("activeTab");
</script>

<style>
  .box {
    @apply p-8;
    @apply border;
    @apply border-gray-200;
    @apply rounded-b-lg;
  }
</style>

{#if $activeTab === key}
  <div class="box">
    <slot />
  </div>
{/if}
