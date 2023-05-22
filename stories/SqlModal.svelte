<script>
  import SqlModal from "../src/components/SqlModal.svelte";

  export let openModalText = "Open SQL Modal";

  export let sqlContent = `
    SELECT
      *
    FROM
        'bigquery-public-data.covid19_open_data.covid19_open_data'
    LIMIT
        10

    `;
</script>

<SqlModal {openModalText} {sqlContent} />
