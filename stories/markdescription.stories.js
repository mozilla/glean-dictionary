import { text } from "@storybook/addon-knobs";
import MarkDescription from "../src/components/MarkDescription.svelte";

const description =
  "A ping or *metric* **description** in [markdown](https://github.com/mozilla/mozregression).";

export default {
  title: "Markdown Description",
};

export const Description = () => ({
  Component: MarkDescription,
  props: {
    description: text("description", description),
  },
});
