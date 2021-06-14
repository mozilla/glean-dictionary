<!-- we use __layout.reset.svelte instead of __layout.svelte here because we need breadcrumb links to dynamically change -->
<script context="module">
  import { getBreadcrumbLinks } from "$lib/state/urls";

  export async function load({ page }) {
    return { props: { links: getBreadcrumbLinks(page.params) } };
  }
</script>

<script>
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import BreadCrumb from "$lib/components/BreadCrumb.svelte";

  export let links;
</script>

<Header />
<BreadCrumb {links} />

<div class="mzp-l-content">
<slot />
</div>

<Footer />

<style>
  @import "src/app.scss";
</style>
