<script context="module">
	export async function load({ page, fetch }) {
		const appIdName = page.params.app_id.replace(/\./g, '_');
		const res = await fetch(`/data/${page.params.app}/app_ids/${appIdName}.json`);
		const appId = await res.json();
		const app = page.params.app;

		return {
			props: { appId, app }
		};
	}
</script>

<script>
	export let appId, app;

	import { APPLICATION_ID_DEFINITION_SCHEMA } from '$lib/data/schemas';
	import MetadataTable from '$lib/MetadataTable.svelte';
	import Pill from '$lib/Pill.svelte';
	import PageTitle from '$lib/PageTitle.svelte';
</script>

<svelte:head>
	<title>{appId.app_id} | {app}</title>
</svelte:head>

<PageTitle text={appId.app_id} />
{#if appId.description}
	<p>{appId.description}</p>
{/if}
{#if appId.deprecated}
	<Pill message="Deprecated" bgColor="#4a5568" />
{/if}

<h2>Metadata</h2>

<MetadataTable appName={app} item={appId} schema={APPLICATION_ID_DEFINITION_SCHEMA} />

<style>
	@import '../../../../main.scss';
	h2 {
		@include text-title-xs;
	}
</style>
