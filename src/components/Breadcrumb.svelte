<script>
  export let links;
</script>

<style>
  ol {
    display: flex;
  }
  li {
    padding-left: $spacing-xs;
  }
  a {
    text-decoration: none;
    @include text-title-xs;
  }
</style>

<ol style={!links.length ? 'display: none;' : ''}>
  {#each links as link}
    <li>
      <a href={link.url}>{link.name}
      </a>{links.indexOf(link) === links.length - 1 ? '' : '/'}
    </li>
  {/each}
</ol>
