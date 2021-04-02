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

  // Split using the regex "/\r?\n|\r/" which should be able to
  // detect most common line ending formats (win / mac / unix).
  // ex: "This\nis\n\nan example" -> ["This", "is", "", "an example"]
  let lines = text.split(/\r?\n|\r/);
</script>

{#if text.includes('<')}
  {#if inline}
    {text}
  {:else}
    {#each lines as text}
      <p style="margin: 0">{text}</p>
    {/each}
  {/if}
  <!-- hack to get consistent margin -->
  <p />
{:else}
  {#if inline}
    {@html parseInline(text)}
  {:else}
    {@html parse(text)}
  {/if}
{/if}
