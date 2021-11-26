<script>
  export let title;
</script>

<h1>
  {@html title}
</h1>

{#if $$slots.tags}
  <div class="tags-container">
    <slot name="tags" />
  </div>
{/if}

<style lang="scss">
  h1 {
    @include text-title-sm;
  }

  .tags-container {
    margin-top: -12px;
    padding-bottom: 16px;
  }
</style>
