<script>
  import MozillaLogo from "./icons/MozillaLogo.svelte";
</script>

<style>
  .glean-footer {
    @apply flex;
    @apply items-center;
    @apply justify-between;
    @apply px-8;
    @apply py-4;
  }
  .project-links {
    @apply grid;
    @apply grid-cols-4;
    @apply justify-items-center;
    @apply p-0;
    @apply m-0;
    @apply gap-2;
  }
  .mozilla-logo {
    @apply text-black;
  }
</style>

<footer class="glean-footer">
  <a class="mozilla-logo" href="https://www.mozilla.org/"><MozillaLogo /></a>
  <ul class="project-links">
    <li>
      <a href="https://www.mozilla.org/privacy/websites/#cookies">Cookies</a>
    </li>
    <li>
      <a
        href="https://chat.mozilla.org/#/room/#glean-dictionary:mozilla.org">Matrix</a>
    </li>
    <li><a href="https://github.com/mozilla/glean-dictionary">Issues</a></li>
    <li><a href="https://github.com/mozilla/glean-dictionary">Source</a></li>
  </ul>
</footer>
