<script>
  import AuthenticatedLink from "../src/components/AuthenticatedLink.svelte";

  export let title, href;
</script>

<AuthenticatedLink {href}>{title}</AuthenticatedLink>
