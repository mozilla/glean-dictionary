<script>
  import { createEventDispatcher } from "svelte";
  import { updateURLState, pageState } from "../state/stores";

  export let name;
  export let label;
  export let variants;
  export let selectedVariant = variants[0];

  let selectedId = selectedVariant.id;

  const dispatch = createEventDispatcher();

  const change = () => {
    selectedVariant = variants.find((v) => v.id === selectedId);
    $pageState = {
      ...$pageState,
      // because both app channel and ping use `id` as the identifier
      // we check if selectedVariant.channel exists to differentiate
      // between setting channel and ping state
      channel: selectedVariant.channel
        ? selectedVariant.id
        : $pageState.channel || "",
      ping: selectedVariant.channel
        ? $pageState.ping || ""
        : selectedVariant.id || "",
    };
    updateURLState(true);
    dispatch("change");
  };
</script>

<label for={name}>{label}</label>
<!-- svelte-ignore a11y-no-onchange -->
<select {name} bind:value={selectedId} on:change={change}>
  {#each variants as variant}
    <option value={variant.id}>
      {#if variant.description}
        {variant.description}
        ({variant.id})
      {:else}
        {variant.id}
      {/if}
    </option>
  {/each}
</select>
