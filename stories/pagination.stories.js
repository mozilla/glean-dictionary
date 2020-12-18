import { text } from "@storybook/addon-knobs";
import Pagination from "../src/components/Pagination.svelte";

const paginationState = {
  total: 204,
  currentPage: 1,
  lastPage: 21,
  from: 1,
  to: 8,
};

export default {
  title: "Pagination",
};

export const Default = () => ({
  Component: Pagination,
  props: {
    currentPage: text("Current page number", paginationState.currentPage),
    lastPage: text("Last page number", paginationState.lastPage),
    from: text("From item", paginationState.from),
    to: text("To item", paginationState.to),
    total: text("Total number of items", paginationState.total),
  },
});
