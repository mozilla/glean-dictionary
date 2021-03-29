<script>
  import Markdown from "./Markdown.svelte";
  import defaultAnnotation from "../data/defaultAnnotation.md";

  export let itemType;
  export let item;
</script>

{#if item.annotation}
  <Markdown text={item.annotation.content} inline={false} />
  <p>
    <a
      href={`https://github.com/mozilla/glean-annotations/edit/main/annotations/${item.origin}/${itemType}s/${item.name}/README.md`}>Edit</a>
  </p>
{:else}
  <p>
    No commentary for this
    {itemType},
    <a
      href={`https://github.com/mozilla/glean-annotations/new/main?filename=annotations/${item.origin}/${itemType}s/${item.name}/README.md&value=${encodeURIComponent(defaultAnnotation)}`}>add
      some</a>?
  </p>
{/if}
