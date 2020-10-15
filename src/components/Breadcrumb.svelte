<script>
  export let links;
</script>

<style>
</style>

<ol class="flex bg-white divide-x divide-indigo-400">
  {#each links as link}
    <li class="px-4"><a href={link.url}>{link.name}</a></li>
  {/each}
</ol>
