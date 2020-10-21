<script>
  export let message = "";
  export let bgColor;
</script>

<div
  style="background-color: {bgColor}"
  class="inline-block border rounded-full text-xs py-1 px-3 w-15 text-white">
  {message}
</div>
