<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import ItemList from "../src/components/ItemList.svelte";

  export let items;
  export let itemType;
  export let appName;

  let searchText = writable("");
  setContext("searchText", searchText);
</script>

<ItemList {items} {itemType} {appName} />
