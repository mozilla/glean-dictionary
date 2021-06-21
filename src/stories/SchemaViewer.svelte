<script>
  import { pageState } from "../state/stores";

  import SchemaViewer from "../components/SchemaViewer.svelte";

  export let app;
  export let nodes;
  export let searchText = "";

  pageState.set({ search: searchText, pageState });
</script>

<SchemaViewer {app} {nodes} />
