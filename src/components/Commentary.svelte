<script>
  import Markdown from "./Markdown.svelte";
  import defaultAnnotation from "../data/defaultAnnotation.md";

  export let itemType;
  export let item;

  const annotationPath =
    itemType === "application"
      ? `${item.app_name}/README.md`
      : `${item.origin}/${itemType}s/${item.name}/README.md`;
  const editLink = item.has_annotation
    ? `https://github.com/mozilla/glean-annotations/edit/main/annotations/${annotationPath}`
    : `https://github.com/mozilla/glean-annotations/new/main?filename=annotations/${annotationPath}&value=${encodeURIComponent(
        defaultAnnotation
      )}`;
</script>

{#if item.commentary}
  <Markdown text={item.commentary} inline={false} />
  <p>
    <a href={editLink}>Edit</a>
  </p>
{:else}
  <p>
    No commentary for this
    {itemType},
    <a href={editLink}>add some</a>?
  </p>
{/if}
