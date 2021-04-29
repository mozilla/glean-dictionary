<script>
  import Markdown from "./Markdown.svelte";
  import defaultAnnotation from "../data/defaultAnnotation.md";

  export let itemType;
  export let item;

  let annotationPath =
    itemType === "application"
      ? `${item.app_name}/README.md`
      : `${item.origin}/${itemType}s/${item.name}/README.md`;
</script>

{#if item.annotation}
  <Markdown text={item.annotation.content} inline={false} />
  <p>
    <a
      href={`https://github.com/mozilla/glean-annotations/edit/main/annotations/${annotationPath}`}>Edit</a>
  </p>
{:else}
  <p>
    No commentary for this
    {itemType},
    <a
      href={`https://github.com/mozilla/glean-annotations/new/main?filename=annotations/${annotationPath}&value=${encodeURIComponent(defaultAnnotation)}`}>add
      some</a>?
  </p>
{/if}
