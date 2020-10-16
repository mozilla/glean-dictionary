<script>
    export let message = "";
    export let bgColor;
  </script>
  
  <div
    style="background-color: {bgColor}"
    class="alert-banner flex items-center justify-between w-full p-2 shadow text-white">
    {message}
  </div>
  