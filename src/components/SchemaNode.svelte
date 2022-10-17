<script>
  export let app;
  export let node = {};
  export let parentFields = [];
</script>

<div style={node.visible ? "" : "display: none;"}>
  <p class="node">
    <span class="parent-node"
      >{parentFields.join(".")}{parentFields.length ? "." : ""}</span
    ><span>{node.name}</span>
    <!-- See: github.com/mozilla/glean-dictionary/issues/1450 -->
    {#if ["url", "text", "jwe", "labeled_rate"].includes(parentFields[1])}
      <p class="node-description">
        (<code> {parentFields[0]}.{parentFields[1]}2.{node.name}</code> if
        querying live/stable tables. See
        <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1737656#c21"
          >this bug</a
        > for more details.)
      </p>
    {/if}
    {#if node.description}
      <p class="node-description">{node.description}</p>
    {/if}
    {#if parentFields.length === 2 && parentFields[0] === "metrics"}
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
      parentFields={[...parentFields, node.name]}
    />
  {/each}
{/if}

<style lang="scss">
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
