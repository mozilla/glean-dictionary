<script>
  import { fade } from "svelte/transition";

  import WarningIcon from "./icons/WarningIcon.svelte";
  import ErrorIcon from "./icons/ErrorIcon.svelte";
  import SuccessIcon from "./icons/SuccessIcon.svelte";

  export let status;
  export let message;

  const icons = {
    warning: WarningIcon,
    error: ErrorIcon,
    success: SuccessIcon,
  };
</script>

<style>
  .mzp-c-notification-bar {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-md;
    border-radius: 8px;
    padding: $spacing-md;
    .alert-text {
      flex-grow: 1;
      margin-left: $spacing-sm;
    }
  }
  .warning {
    background-color: $color-yellow-20;
  }
  .error {
    background-color: $color-red-20;
  }
  .success {
    background-color: $color-green-20;
  }
</style>

<div class="mzp-c-notification-bar mzp-t-{status} {status}" transition:fade>
  <svelte:component this={icons[status]} />
  <div class="alert-text">{message}</div>
</div>
