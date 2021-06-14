<script>
    import HelpHoverable from "./HelpHoverable.svelte";
  
    export let title;
    export let helpText;
  </script>
  
  <h2>
    {@html title}
    {#if helpText}
      <HelpHoverable content={helpText} />
    {/if}
  </h2>
  
  <style>
    h2 {
      @include text-title-xs;
    }
  </style>