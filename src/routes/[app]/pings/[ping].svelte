<script context="module">
	export async function load({ page, fetch }) {
		const res = await fetch(`/data/${page.params.app}/pings/${page.params.ping}.json`);
		const ping = await res.json();
		const app = page.params.app;

		return {
			props: { ping, app }
		};
	}
</script>

<script>
	export let ping;
	export let app;
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	import { pageState } from '$lib/state/stores';
	import { getBigQueryURL } from '$lib/state/urls';

	import AppVariantSelector from '$lib/AppVariantSelector.svelte';
	import Commentary from '$lib/Commentary.svelte';
	import HelpHoverable from '$lib/HelpHoverable.svelte';
	import ItemList from '$lib/ItemList.svelte';
	import MetadataTable from '$lib/MetadataTable.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import PageTitle from '$lib/PageTitle.svelte';
	import { PING_SCHEMA } from '$lib/data/schemas';

	let selectedAppVariant;

	const searchText = writable($pageState.search || '');
	setContext('searchText', searchText);
	const showExpired = writable($pageState.showExpired || false);
	setContext('showExpired', showExpired);
	$: {
		pageState.set({ search: $searchText, showExpired: $showExpired });
	}
</script>

<svelte:head>
	<title>{ping.name} | {app}</title>
</svelte:head>

<PageTitle text={ping.name} />
<p>
	<Markdown text={ping.description} />
</p>

<h2>Metadata</h2>
<MetadataTable appName={app} item={ping} schema={PING_SCHEMA} />

<h2>Commentary</h2>
<Commentary item={ping} itemType={'ping'} />

<h2>Access</h2>

{#if ping.variants.length > 1}
	<AppVariantSelector bind:selectedAppVariant variants={ping.variants} />
{/if}

{#if selectedAppVariant}
	<table>
		<col />
		<col />
		<tr>
			<td>
				BigQuery
				<HelpHoverable content={'The BigQuery representation of this ping.'} />
			</td>
			<td>
				<a href={getBigQueryURL(app, selectedAppVariant.app_id, ping.name)}>
					{selectedAppVariant.table}
				</a>
			</td>
		</tr>
	</table>
{/if}

<h2>Metrics</h2>
<ItemList itemType="metrics" items={ping.metrics} appName={app} />

<style>
	@import '../../../main.scss';

	@include metadata-table;
	h2 {
		@include text-title-xs;
	}
</style>
