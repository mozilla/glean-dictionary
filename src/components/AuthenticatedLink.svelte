<script>
  import tippy from "./tippy";

  export let href;
  export let target = "";
  export let label = null; // a prop for glean click events
  export let type = null; // a prop for glean click events
</script>

<a {href} {target} data-glean-label={label} data-glean-type={type}><slot /></a>
<a
  class="lock-link"
  href="https://docs.telemetry.mozilla.org/concepts/gaining_access.html"
  use:tippy={{
    content: "Access to this resource is limited to NDA'd Mozillians who have a demonstrated need to access this data",
    placement: "top",
  }}
>
  <span role="img" aria-label="access limited">🔒</span></a
>

<style>
  .lock-link {
    text-decoration: none;
  }
</style>
