<script>
  // you would think we could just do:
  // import marked from "marked", but that seems to cause
  // weird problems with jest and storyshots (probably because
  // of how it imports/compiles ES modules). this is the only
  // workaround I found
  import { use, parse, parseInline } from "marked";

  const renderer = {
    list(body, ordered, start) {
      const outerEl = ordered ? "ol" : "ul";
      return `<${outerEl} ${
        start ? `start="${start}"` : ""
      } class="mzp-u-list-styled">${body}</${outerEl}>`;
    },
  };
  use({ renderer });

  export let text;
  // if inline is set, do not wrap the markdown in a paragraph -- useful for short snippets
  export let inline = true;

  // escape `<` so it doesn't get confused as an HTML tag, see:
  // https://github.com/mozilla/glean-dictionary/pull/497
  $: htmlText = text.replace("<", "&lt;");
</script>

{#if inline}
  {@html parseInline(htmlText)}
{:else}
  {@html parse(htmlText)}
{/if}
