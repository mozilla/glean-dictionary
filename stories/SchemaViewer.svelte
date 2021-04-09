<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import SchemaViewer from "../src/components/SchemaViewer.svelte";

  export let app;
  export let nodes;
  export let searchText;
  setContext("searchText", writable(searchText));
</script>

<SchemaViewer {app} {nodes} />
