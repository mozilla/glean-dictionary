import { text } from "@storybook/addon-knobs";
import PingDescription from "../src/components/PingDescription.svelte";

const description =
  "This is a [markdown](https://github.com/mozilla/mozregression) ping **description**.";

export default {
  title: "Ping Description",
};

export const Description = () => ({
  Component: PingDescription,
  props: {
    app: text("app", "mozregression"),
    name: text("name", "usage.good_date"),
    description: text("description", description),
  },
});
