<script>
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../main.scss';
</script>

<Header />

<main>
	<slot />
</main>

<Footer />

<style>
	main {
		margin: $spacing-md;
	}
</style>
