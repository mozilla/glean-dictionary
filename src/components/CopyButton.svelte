<script>
  import tippy from "./tippy";
  import CopyIcon from "./icons/CopyIcon.svelte";

  export let textToCopy;
  export let type = null; // a prop for glean click events

  function updateClipboard() {
    navigator.clipboard.writeText(textToCopy);
  }
</script>

<button
  class="mzp-c-button mzp-t-secondary mzp-t-md"
  data-glean-type={type}
  on:click={updateClipboard}
  use:tippy={{
    content: "Copy to clipboard",
    placement: "top",
  }}><CopyIcon /></button
>
