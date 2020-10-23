import { text } from "@storybook/addon-knobs";
import PingDescription from "../src/components/PingDescription.svelte";

export default {
  title: "Ping Description"
};

export const Description = () => ({
  Component: PingDescription,
  props: {
    app: text("app", "fenix"),
    name: text("name", "usage"),
    description: text("description", "ping description")
  },
});