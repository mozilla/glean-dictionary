<script>
  import marked from "marked";

  export let text;
</script>

<slot>
  {@html marked.parseInline(text)}
</slot>
