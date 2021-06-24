<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import VariantSelector from "./VariantSelector.svelte";
</script>

<Meta title="Example/VariantSelector" component={VariantSelector} />

<Template let:args>
  <VariantSelector {...args} />
</Template>

<Story name="Default" />
