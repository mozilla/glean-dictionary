<script>
  import VariantSelector from "../src/components/VariantSelector.svelte";
</script>

<VariantSelector
  name={"app_id"}
  label={"Application Variant"}
  variants={[
    { id: "org.mozilla.fenix", description: "nightly" },
    { id: "org.mozilla.fenix_release", description: "release" },
  ]}
/>
