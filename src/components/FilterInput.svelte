<script>
  const throttle = require("just-throttle");

  export let onChangeText;
  export let filterText;

  const changeText = () => {
    onChangeText(filterText);
  };
</script>

<div class="container py-4 mx-auto">
  <input
    class="shadow appearance-none border rounded w-full p-2 text-gray-700
    leading-tight focus:outline-none focus:shadow-outline"
    type="text"
    bind:value={filterText}
    on:input={throttle(changeText, 200)}
    placeholder="filter terms" />
</div>
