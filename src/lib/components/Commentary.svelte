<script>
  import Markdown from "./Markdown.svelte";

  export let itemType;
  export let item;

  const defaultAnnotation = `This is a starter template for an application, metric or ping annotation. If this is your
first time writing one of these, please see the
[contributing guidelines](https://github.com/mozilla/glean-annotations/blob/main/CONTRIBUTING.md)
in the glean-annotations repository.`;
  let annotationPath =
    itemType === "application"
      ? `${item.app_name}/README.md`
      : `${item.origin}/${itemType}s/${item.name}/README.md`;
</script>

{#if item.commentary}
  <Markdown text={item.commentary} inline={false} />
  <p>
    <a
      href={`https://github.com/mozilla/glean-annotations/edit/main/annotations/${annotationPath}`}
      >Edit</a
    >
  </p>
{:else}
  <p>
    No commentary for this
    {itemType},
    <a
      href={`https://github.com/mozilla/glean-annotations/new/main?filename=annotations/${annotationPath}&value=${encodeURIComponent(
        defaultAnnotation
      )}`}>add some</a
    >?
  </p>
{/if}
