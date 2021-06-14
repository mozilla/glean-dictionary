<script context="module">
  export function load({ error, status }) {
    return {
      props: {
        title: `${status} error: ${error.message}`,
      },
    };
  }
</script>

<script>
  export let title;
</script>

<h3>{title}</h3>
