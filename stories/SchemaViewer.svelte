<script>
  import { pageState } from "../src/state/stores";

  import SchemaViewer from "../src/components/SchemaViewer.svelte";

  export let app;
  export let nodes;
  export let searchText = "";

  pageState.set({ search: searchText, pageState });
</script>

<SchemaViewer {app} {nodes} />
