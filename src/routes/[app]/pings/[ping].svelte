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
	export let ping, app;
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

{#if ping.variants.length > 1}
	<h2>Access</h2>
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
	@include metadata-table;
	h2 {
		@include text-title-xs;
	}
</style>
