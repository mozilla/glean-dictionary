<script>
  import { createEventDispatcher } from "svelte";

  export let variants = [];
  export let selectedAppVariant = variants[0];
  let selectedAppId;

  const dispatch = createEventDispatcher();

  const change = () => {
    selectedAppVariant = variants.find((v) => v.app_id === selectedAppId);

    dispatch("change");
  };
</script>

<!-- svelte-ignore a11y-no-onchange -->
<select bind:value={selectedAppId} on:change={change}>
  {#each variants as variant}
    <option value={variant.app_id}>
      {variant.app_channel}
      ({variant.app_id})
    </option>
  {/each}
</select>
