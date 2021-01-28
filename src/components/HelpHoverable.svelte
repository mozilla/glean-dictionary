<script>
  import tippy from "./tippy";
  import InfoIcon from "./icons/InfoIcon.svelte";

  export let content = "";
  export let link = "";

  const props = {
    content,
    allowHTML: true,
    placement: "top",
  };
</script>

<style>
  .main {
    display: inline-block;
  }
</style>

<div class="main">
  {#if link.length}
    <a href={link} use:tippy={props}>
      <InfoIcon />
    </a>
  {:else}
    <span use:tippy={props}>
      <InfoIcon />
    </span>
  {/if}
</div>
