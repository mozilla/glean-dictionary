<script>
  import HelpHoverable from "./HelpHoverable.svelte";

  export let title;
  export let helpText;
  export let withLink;
</script>

{#if withLink}
  <a href="#{title}">
    <h2 id={title} class="anchor">
      {@html title}
      {#if helpText}
        <HelpHoverable content={helpText} />
      {/if}
    </h2>
  </a>
{:else}
  <h2>
    {@html title}
    {#if helpText}
      <HelpHoverable content={helpText} />
    {/if}
  </h2>
{/if}

<style lang="scss">
  @import "../main.scss";

  h2 {
    @include text-title-xs;
  }
</style>
