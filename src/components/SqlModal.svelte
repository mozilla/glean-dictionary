<script>
  import { fade } from "svelte/transition";
  import CopyButton from "./CopyButton.svelte";

  export let openModalText = "";

  export let sqlContent = "";

  export let type = null; // a prop for glean click events

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

<div name="trigger" {open}>
  <button on:click={open} data-glean-type={type}>{openModalText}</button>
</div>

{#if isOpen}
  <!-- svelte-ignore a11y-autofocus -->
  <div
    class="gp-modal"
    on:keydown|stopPropagation={keydown}
    tabindex={0}
    autofocus
    transition:fade={{ duration: 250 }}
  >
    <div class="gp-modal__backdrop" on:click={close} />
    <div class="gp-modal__wrapper">
      <div class="gp-modal__header">
        <h1>Explore the data in Redash or BigQuery console 📊</h1>
        <button on:click={close}> X </button>
      </div>
      <div class="gp-modal__content">
        <div class="modal-content">
          <pre><code
              >{sqlContent}
                </code>
                <div class="buttons">
                  <CopyButton
                tooltipText="Copy the SQL code"
                textToCopy={sqlContent}
                type="MetricDetail.Access.STMO.CopyGeneratedSQL"
              />
                  </div>
              </pre>
        </div>
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
    z-index: 1000;
  }
  .gp-modal__backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .gp-modal__wrapper {
    position: relative;
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
    padding: $spacing-sm;
    max-height: 50vh;
    overflow: auto;
  }
  .stmo {
    display: flex;
  }

  .modal-content {
    pre {
      background-color: $color-light-gray-30;
      padding: $spacing-sm;
      overflow-x: auto;
      code {
        display: block;
        font-family: monospace;
      }
      .buttons {
        position: absolute;
        top: 50px;
        right: 10px;
        cursor: pointer;
      }
    }
  }
</style>
