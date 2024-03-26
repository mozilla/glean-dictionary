<script>
  import tippy from "./tippy";

  export let href;
  export let label = ""; // a prop for glean click events
  export let type = ""; // a prop for glean click events
</script>

<a {href} data-glean-label={label} data-glean-type={type}><slot /></a>
<a
  class="lock-link"
  href="https://docs.telemetry.mozilla.org/concepts/gaining_access.html"
  use:tippy={{
    content: "Access to this resource is limited to NDA'd Mozillians",
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
