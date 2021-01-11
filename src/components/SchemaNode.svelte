<script>
  export let app;
  export let node = {};
  export let parentFields = [];
</script>

<style>
  p {
    margin: 0;
  }
  .node {
    @include text-body-md;
    .parent-node {
      color: $color-dark-gray-60;
    }
    .node-description,
    .node-link {
      @include text-body-sm;
      color: $color-dark-gray-20;
      margin-left: $spacing-sm;
    }
  }
</style>

<div style={node.visible ? '' : 'display: none;'}>
  <p class="node">
    <span
      class="parent-node">{parentFields.join('.')}{parentFields.length ? '.' : ''}</span><span>{node.name}</span>
    {#if node.description}
      <p class="node-description">{node.description}</p>
    {/if}
    {#if parentFields.length === 2 && parentFields[0] === 'metrics'}
      <p class="node-link">
        <a href={`/apps/${app}/metrics/${node.name}`}>[metric]</a>
      </p>
    {/if}
  </p>
</div>

{#if node.fields && node.childrenVisible}
  {#each node.fields as childNode}
    <svelte:self
      {app}
      node={childNode}
      parentFields={[...parentFields, node.name]} />
  {/each}
{/if}
