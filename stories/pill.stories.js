import Pill from "../src/components/Pill.svelte";
import { withKnobs, text, color } from "@storybook/addon-knobs";

export default {
  title: "Pill",
  decorators: [withKnobs],
};

export const Deprecated = () => ({
  Component: Pill,
  props: {
    message: text("message", "Deprecated"),
    bgColor: color("bgColor", "#4a5568"),
  },
});
