<script>
  export let message = "";
  export let bgColor;
</script>

<style>
  .pill {
    @apply inline-block;
    @apply border-transparent;
    @apply rounded-full;
    @apply px-2;
    @apply py-0;
    @apply text-sm;
    @apply leading-5;
    @apply text-white;
    @apply font-medium;
  }
</style>

<div style="background-color: {bgColor}" class="pill">{message}</div>
