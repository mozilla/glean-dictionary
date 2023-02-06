<script>
  import tippy from "./tippy";
  import CopyIcon from "./icons/CopyIcon.svelte";

  export let textToCopy;

  function updateClipboard() {
    navigator.clipboard.writeText(textToCopy);
  }
</script>

<button
  class="mzp-c-button mzp-t-secondary mzp-t-md"
  on:click={updateClipboard}
  use:tippy={{
    content: "Copy to clipboard",
    placement: "top",
  }}><CopyIcon /></button
>
