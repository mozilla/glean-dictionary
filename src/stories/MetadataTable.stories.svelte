<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import MetadataTable from "../components/MetadataTable.svelte";
  import { APPLICATION_DEFINITION_SCHEMA } from "../data/schemas";
</script>

<Meta title="Example/Metadata" component={MetadataTable} />

<Template let:args>
  <MetadataTable {...args} />
</Template>

<Story
  name="Default"
  args={{
    appName: "testApp",
    schema: APPLICATION_DEFINITION_SCHEMA,
    item: {
      url: "https://github.com/mozilla/testapp",
      app_id: "org.mozilla.testApp",
      notification_emails: ["test@mozilla.com"],
    },
  }}
/>
