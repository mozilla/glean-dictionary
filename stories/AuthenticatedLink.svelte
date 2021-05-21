<script>
  import AuthenticatedLink from "../src/components/AuthenticatedLink.svelte";

  export let href;
  export let title;
</script>

<AuthenticatedLink {href}>{title}</AuthenticatedLink>
