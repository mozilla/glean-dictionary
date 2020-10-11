<script>
  import { fetchJSON } from "../state/api";

  export let params;
  const URL = `data/${params.app}/index.json`;
  let app = fetchJSON(URL);
</script>

<h1>{params.app}</h1>

{#await app then app}
  <p>{app.description}</p>
  <h2>Pings</h2>
  <ul>
    {#each app.pings as ping}
      <li>
        <a href={`/apps/${params.app}/pings/${ping.name}`}>{ping.name}</a>
        <i>{ping.description}</i>
      </li>
    {/each}
  </ul>
  <h2>Metrics</h2>
  <ul>
    {#each app.metrics as metric}
      <li>
        <a href={`/apps/${params.app}/metrics/${metric.name}`}>{metric.name}</a>
        <i>{metric.description}</i>
      </li>
    {/each}
  </ul>
{/await}
