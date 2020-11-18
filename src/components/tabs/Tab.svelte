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
    /* border: solid lightgray 2px; */
    border: 1px solid #dee2e6;
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    display: inline-block;
    padding: 1em;
    color: black;
    background-color: white;
  }
  .title.active {
    color: black;
    background-color: #a9b4c2;
  }
  .title:not(.active):hover {
    cursor: pointer;
    color: black;
    background-color: #d3d5da;
  }
</style>

<div
  class="title"
  on:click={() => selectTab(key)}
  class:active={$activeTab === key}>
  <slot />
</div>
