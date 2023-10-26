import Pagination from "./Pagination.svelte";

const items = {
  total: 210,
  perPage: 20,
};

export default {
  title: "Pagination",
  component: Pagination,
  argTypes: {
    itemsPerPage: {
      control: "number",
    },
    totalItems: {
      control: "number",
      description: "Total number of items",
    },
  },
};

export const Default = {
  args: {
    itemsPerPage: items.perPage,
    totalItems: items.total,
  },
};
