<script>
  export let links;
</script>

<ol class="flex py-2 divide-x {!links.length ? 'hidden' : ''}">
  {#each links as link}
    <li class="px-2"><a href={link.url}>{link.name}</a></li>
  {/each}
</ol>
