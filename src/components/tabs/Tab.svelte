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
    @include text-title-3xs;
    border-top-width: 0px;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    padding: 1rem;
    background-color: $color-light-gray-10;
    display: inline-block;
    &.active {
      background-color: $color-light-gray-40;
      border: 1px solid $color-light-gray-60;
      border-bottom-style: none;
    }
    &:not(.active):hover {
      background-color: $color-light-gray-20;
      cursor: pointer;
    }
  }
</style>

<div
  class="title"
  on:click={() => selectTab(key)}
  class:active={$activeTab === key}>
  <slot />
</div>
