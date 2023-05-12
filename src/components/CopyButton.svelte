<script>
  import tippy from "./tippy";
  import CopyIcon from "./icons/CopyIcon.svelte";

  export let textToCopy;
  export let tooltipText = "Copy to clipboard";

  function updateClipboard() {
    navigator.clipboard.writeText(textToCopy);
  }
</script>

<button
  class="mzp-c-button mzp-t-secondary mzp-t-md"
  on:click={updateClipboard}
  use:tippy={{
    content: tooltipText,
    placement: "top",
  }}><CopyIcon /></button
>
