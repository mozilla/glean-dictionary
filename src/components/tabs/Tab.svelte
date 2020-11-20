<script>
  export let key;
  import { getContext } from "svelte";

  const activeTab = getContext("activeTab");

  function selectTab() {
    $activeTab = key;
  }
</script>

<style>
  .title {
    @apply border-b-0;
    @apply rounded-t-lg;
    @apply p-4;
    @apply bg-white;
    @apply text-black;
    @apply inline-block;
  }
  .title.active {
    @apply bg-gray-300;
  }
  .title:not(.active):hover {
    @apply bg-gray-100;
    @apply cursor-pointer;
  }
</style>

<div
  class="title"
  on:click={() => selectTab(key)}
  class:active={$activeTab === key}>
  <slot />
</div>
