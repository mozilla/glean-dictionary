<script>
  import { pageState } from "$lib/state/stores.js";

  export let metricName;
  export let bigQueryLink;

  pageState.set({ ...$pageState, search: metricName });
</script>

<a href={bigQueryLink}>{metricName}</a>
