import MetadataTable from "../src/components/MetadataTable.svelte";
import { APPLICATION_DEFINITION_SCHEMA } from "../src/data/schemas";

export default {
  title: "Metadata Table",
};

export const Default = () => ({
  Component: MetadataTable,
  props: {
    appName: "testapp",
    schema: APPLICATION_DEFINITION_SCHEMA,
    item: {
      url: "https://github.com/mozilla/testapp",
      app_id: "org.mozilla.testapp",
      notification_emails: ["test@mozilla.com"],
    },
  },
});
