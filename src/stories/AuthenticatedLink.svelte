<script>
    import AuthenticatedLink from "../components/AuthenticatedLink.svelte";
    export let href;
  </script>
  
  <AuthenticatedLink {href}>Authenticated Link</AuthenticatedLink>