<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import AuthenticatedLink from "./AuthenticatedLink.svelte";
</script>

<Meta
  title="Example/AuthenticatedLink"
  component={AuthenticatedLink}
/>

<Template let:args>
  <AuthenticatedLink {...args} />
</Template>

<Story
  name="Primary"
  args={{
    href: "test"
  }}
/>