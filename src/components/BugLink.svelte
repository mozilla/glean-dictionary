<script>
  import { getBugLinkTitle } from "../formatters/links";

  export let ref;
  const url = ref.toString().startsWith("http")
    ? ref
    : `https://bugzilla.mozilla.org/show_bug.cgi?id=${ref}`;
</script>

<style>
  a {
    display: block;
  }
</style>

<a href={url} target="_blank"> {getBugLinkTitle(url)} </a>
