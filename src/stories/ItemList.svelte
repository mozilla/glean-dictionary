<script>
  import ItemList from "../components/ItemList.svelte";

  export let items;
  export let itemType;
  export let appName;
</script>

<ItemList {items} {itemType} {appName} />
