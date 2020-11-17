<script>
  import { createEventDispatcher } from "svelte";

  export let tabItems;
  export let activeTab;

  const dispatch = createEventDispatcher();
</script>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }
  li {
    margin-bottom: -1px;
  }

  li > div {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
</style>

<div class="tabs">
  <ul>
    {#each tabItems as item}
      <li on:click={() => dispatch('tabChange', item)}>
        <div class:active={item === activeTab}>{item}</div>
      </li>
    {/each}
  </ul>
</div>
