<script>
  import tippy from "sveltejs-tippy";
  import InfoIcon from "./icons/InfoIcon.svelte";

  export let content;
  export let link;
  let props = {
    content,
    allowHTML: true,
    placement: "top",
  };
</script>

<style>
  .main {
    @apply inline-block;
    @apply text-gray-500;
  }
</style>

<div class="main">
  <a href={link} use:tippy={props}>
    <InfoIcon />
  </a>
</div>
