<script>
  export let key;
  import { getContext } from "svelte";

  const activeTab = getContext("activeTab");
</script>

<style>
  .box {
    padding: 2rem;
    border: 1px solid $color-light-gray-60;
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    box-shadow: 5px 5px 10px rgba($color-black, 0.1);
  }
</style>

{#if $activeTab === key}
  <div class="box">
    <slot />
  </div>
{/if}
