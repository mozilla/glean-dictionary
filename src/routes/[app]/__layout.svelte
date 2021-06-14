<script context="module">
  import { getBreadcrumbLinks } from "$lib/state/urls";

  export async function load({ page }) {
    return { props: { links: getBreadcrumbLinks(page.params) } };
  }
</script>

<script>
  export let links;
  import BreadCrumb from "$lib/components/BreadCrumb.svelte";
</script>

<BreadCrumb {links} />

<div class="mzp-l-content">
<slot />
</div>

<style>
  @import "src/app.scss";
</style>
