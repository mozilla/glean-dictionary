<script>
  const marked = require("marked");

  export let text;
</script>

<slot>
  {@html marked.parseInline(text)}
</slot>
