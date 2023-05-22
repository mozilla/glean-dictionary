<script>
  import { fade } from "svelte/transition";

  let isOpen = false;

  const open = () => {
    isOpen = true;
  };
  const close = () => {
    isOpen = false;
  };

  const keydown = (e) => {
    if (e.key === "Escape") {
      close();
    }
  };
</script>

<slot name="trigger" {open}><button on:click={open}>open</button></slot>

{#if isOpen}
  <!-- svelte-ignore a11y-autofocus -->
  <div
    class="gp-modal"
    on:keydown|stopPropagation={keydown}
    autofocus
    transition:fade={{ duration: 250 }}
  >
    <div class="gp-modal__backdrop" on:click={close} />
    <div class="gp-modal__wrapper">
      <div class="gp-modal__header">
        <h1>
          <slot name="title" />
        </h1>
        <button on:click={close}> X </button>
      </div>
      <div class="gp-modal__content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @import "../main.scss";
  .gp-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .gp-modal__backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .gp-modal__wrapper {
    position: relative;
    z-index: 1000;
    border-radius: 0.5rem;
    background-color: $color-light-gray-10;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .gp-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: $spacing-md;
    background-color: $color-dark-gray-90;
  }
  .gp-modal__header h1 {
    font-weight: normal;
    padding: $spacing-md 0 0 0;
    margin: 0;
    font-size: 25px;
    line-height: 20px;
    color: $color-light-gray-05;
  }
  .gp-modal__header button {
    margin: 0;
    padding: $spacing-xs;
    border: 0;
    cursor: pointer;
  }
  .gp-modal__content {
    padding: $spacing-xs;
    max-height: 50vh;
    overflow: auto;
  }
</style>
