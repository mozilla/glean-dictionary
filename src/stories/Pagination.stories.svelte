<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Pagination from "./Pagination.svelte";

  const items = {
    total: 210,
    perPage: 20,
  };
</script>

<Meta title="Example/Pagination" component={Pagination} />

<Template let:args>
  <Pagination {...args} />
</Template>

<Story
  name="Default"
  args={{
    itemsPerPage: items.perPage,
    totalItems: items.total,
  }}
/>
