<script>
  import marked from "marked";

  let markdown;
  export let text = "";
</script>

{#if markdown}
  {@html marked.parseInline(markdown.textContent)}
{/if}
<div class="raw-markdown hidden" bind:this={markdown}>
  <slot>{text}</slot>
</div>
