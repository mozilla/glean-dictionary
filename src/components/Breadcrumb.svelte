<script>
  export let params;
</script>

<style>
</style>

<ol class="flex bg-white divide-x divide-indigo-400">
  <li class="px-4"><a href="/"> apps </a></li>
  {#if params.app}
    <li class="px-4"><a href="/apps/{params.app}"> {params.app} </a></li>
    {#if params.ping}
      <li class="px-4">
        <a href="/apps/{params.app}/pings/{params.ping}">
          pings /
          {params.ping}
        </a>
      </li>
    {/if}
    {#if params.metric}
      <li class="px-4">
        <a href="/apps/{params.app}/metrics/{params.metric}">
          metric /
          {params.metric}
        </a>
      </li>
    {/if}
  {/if}
</ol>
