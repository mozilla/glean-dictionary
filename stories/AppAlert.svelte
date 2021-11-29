<script>
  import AppAlert from "../src/components/AppAlert.svelte";

  let alertMessage =
    "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.";
</script>

<p>Error Alert</p>
<AppAlert status="error" message={alertMessage} />

<p>Warning Alert</p>
<AppAlert status="warning" message={alertMessage} />

<p>Success Alert</p>
<AppAlert status="success" message={alertMessage} />

<style lang="scss">
  p {
    @include text-title-xs;
  }
</style>
