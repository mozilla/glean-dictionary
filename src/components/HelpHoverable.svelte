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
    display: inline-block;
  }
</style>

<div class="main">
  <a href={link} use:tippy={props}>
    <InfoIcon />
  </a>
</div>
