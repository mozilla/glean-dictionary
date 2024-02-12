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
    heading(text, level, raw) {
      const id = raw
        .toLowerCase()
        .trim()
        .replace(/<[!/a-z].*?>/gi, "")
        .replace(/ +/g, "-");

      return `<h${level} class="annotation-header-link" id="${id}"><a href="#${id}">${text}</a></h${level}>\n`;
    },
  };
  use({ renderer });

  export let text;
  // if inline is set, do not wrap the markdown in a paragraph -- useful for short snippets
  export let inline = true;
</script>

{#if inline}
  {@html parseInline(text)}
{:else}
  <div>
    {@html parse(text)}
  </div>
{/if}

<style lang="scss">
  div :global(h1 a),
  div :global(h2 a),
  div :global(h3 a),
  div :global(h4 a),
  div :global(h5 a) {
    color: black;
    text-decoration: none;
  }

  div :global(h1 a:hover),
  div :global(h2 a:hover),
  div :global(h3 a:hover),
  div :global(h4 a:hover),
  div :global(h5 a:hover) {
    text-decoration: underline;
  }
</style>
