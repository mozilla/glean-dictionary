<script>
  import AppVariantSelector from "../src/components/AppVariantSelector.svelte";
</script>

<AppVariantSelector
  variants={[{ app_id: 'org.mozilla.fenix', app_channel: 'nightly' }, { app_id: 'org.mozilla.fenix_release', app_channel: 'release' }]} />
