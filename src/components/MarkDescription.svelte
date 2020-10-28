<script>
  import marked from "marked";

  export let description;
</script>

{@html marked.parseInline(description)}
