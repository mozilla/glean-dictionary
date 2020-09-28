<script>
  import { getPingData } from "../state/api.js";
  export let params;

  const pingDataPromise = getPingData(params.app, params.ping);
</script>

{#await pingDataPromise then ping}
  <h1>{ping.name}</h1>
  <p>{ping.description}</p>

{/await}
