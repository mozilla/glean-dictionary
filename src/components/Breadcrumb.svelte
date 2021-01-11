<script>
  export let links;
</script>

<style>
  ol {
    display: flex;
    li {
      padding-left: $spacing-xs;
      @include text-title-sm;
      font-weight: bold;
      a {
        text-decoration: none;
      }
      span {
        color: $color-dark-gray-20;
      }
    }
  }
</style>

<ol style={!links.length ? 'display: none;' : ''}>
  {#each links as link}
    <li>
      <a href={link.url}>{link.name} </a><span
        class>{links.indexOf(link) === links.length - 1 ? '' : '/'}</span>
    </li>
  {/each}
</ol>
