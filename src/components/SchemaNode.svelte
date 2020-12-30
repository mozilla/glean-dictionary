<script>
  export let app;
  export let node = {};
  export let parentFields = [];
</script>

<style>
  p {
    margin: 0;
  }
</style>

<div style={node.visible ? '' : 'display: none;'}>
  <p>
    <span
      class="text-gray-700">{parentFields.join('.')}{parentFields.length ? '.' : ''}</span><span>{node.name}</span>
  </p>
  {#if node.description}
    <p class="text-gray-600 text-xs ml-2">{node.description}</p>
  {/if}
  {#if parentFields.length === 2 && parentFields[0] === 'metrics'}
    <p class="text-gray-600 text-xs ml-2">
      <a href={`/apps/${app}/metrics/${node.name}`}>[metric]</a>
    </p>
  {/if}
</div>

{#if node.fields && node.childrenVisible}
  {#each node.fields as childNode}
    <svelte:self
      {app}
      node={childNode}
      parentFields={[...parentFields, node.name]} />
  {/each}
{/if}
