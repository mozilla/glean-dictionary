<script>
  import { parseInline } from "marked";

  export let text;
</script>

<slot>
  {@html parseInline(text)}
</slot>
