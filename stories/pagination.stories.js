import { text } from "@storybook/addon-knobs";
import Pagination from "./Pagination.svelte";

const items = {
  total: 210,
  perPage: 20,
};

export default {
  title: "Pagination",
};

export const Default = () => ({
  Component: Pagination,
  props: {
    itemsPerPage: items.perPage,
    totalItems: text("Total number of items", items.total),
  },
});
