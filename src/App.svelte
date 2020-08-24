<script>
  import Routes from "./routes/Routes.svelte";

  export let title;
</script>

<h1>{title}</h1>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<Routes />
