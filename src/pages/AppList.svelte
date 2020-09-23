<script>
  const URL = "data/apps.json";
  let apps = undefined;
  const request = fetch(URL)
    .then(r => r.json())
    .then(ret => {
      apps = ret.sort((a, b) => a.app_id > b.app_id);
      console.log(apps);
    });
</script>

<h2>Applications</h2>
{#if apps}
  {#each apps as app}
    <p>
      <a href="#/{app.app_id}">{app.name}</a>
      {#if app.description}
        &nbsp;
        <i>{app.description}</i>
      {/if}
    </p>
  {/each}
{/if}
