import Pill from "../src/components/Pill.svelte";

export default {
  title: "Pill",
};

export const Deprecated = () => ({
  Component: Pill,
  props: {
    message: "Deprecated",
    bgColor: "#4a5568",
  },
});
