import { text } from "@storybook/addon-knobs";

import SubHeading from "./SubHeading.svelte";

export default {
  title: "Sub-heading",
};

export const Default = () => ({
  Component: SubHeading,
  props: {
    title: text("Title", "Commentary"),
    helpText: text(
      "Help text",
      "Reviewed commentary from Mozilla data practitioners on this application."
    ),
  },
});
