import SchemaViewer from "./SchemaViewer.svelte";

const nodes = [
  {
    description:
      "A JSON string containing any payload properties not present in the schema",
    mode: "NULLABLE",
    name: "additional_properties",
    type: "STRING",
  },
  {
    fields: [
      {
        description:
          'The user-visible version of the operating system (e.g. "1.2.3"). If the version detection fails, this metric gets set to `Unknown`.',
        mode: "NULLABLE",
        name: "os_version",
        type: "STRING",
      },
      {
        description: "The version of the Glean SDK",
        mode: "NULLABLE",
        name: "telemetry_sdk_build",
        type: "STRING",
      },
    ],
    mode: "NULLABLE",
    name: "client_info",
    type: "RECORD",
  },
  {
    description:
      "The document ID specified in the URI when the client sent this message",
    mode: "NULLABLE",
    name: "document_id",
    type: "STRING",
  },
];

export default {
  title: "Schema Viewer",
};

export const Basic = () => {
  return {
    Component: SchemaViewer,
    props: {
      app: "fenix",
      nodes,
    },
  };
};
