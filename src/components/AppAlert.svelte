<script>
  export let message = "";
  export let bgColor;
</script>

<div role="alert">
  <div
    style="background-color: {bgColor}"
    class="flex items-center justify-between w-full p-2 my-3 shadow text-white">
    {message}
  </div>
</div>
