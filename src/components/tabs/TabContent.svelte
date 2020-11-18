<script>
  export let key;
  import { getContext } from "svelte";

  const activeTab = getContext("activeTab");
</script>

<style>
  .box {
    padding: 40px;
    border: 1px solid #dee2e6;
    border-radius: 0 0 0.5rem 0.5rem;
  }
</style>

{#if $activeTab === key}
  <div class="box">
    <slot />
  </div>
{/if}
