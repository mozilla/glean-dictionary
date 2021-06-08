<script context="module">

export const router = false;

	export async function load({ page, fetch }) {
		const tableName = page.params.table.replace(/\./g, '_');
		const res = await fetch(
			`/data/${page.params.app}/tables/${page.params.app_id}/${tableName}.json`
		);
		const table = await res.json();
		const app = page.params.app;
		const search = page.query.get("search")
		return {
			props: { table, app, search }
		};
	}
</script>

<script>
	export let table, app, search;
	import SchemaViewer from '$lib/SchemaViewer.svelte';
	import PageTitle from '$lib/PageTitle.svelte';

	import { pageState } from '$lib/state/stores';
	
	if (search) {
		pageState.set({... $pageState,search: search})
	}
</script>

<svelte:head>
	<title>{table.name} table | {table.app_id}</title>
</svelte:head>

<PageTitle text={`Table <code>${table.name}</code> for ${table.app_id}`} />
<table>
	<col />
	<col />
	<tr>
		<td>BigQuery Definition</td>
		<td>
			<a href={table.bq_definition}>
				{table.bq_definition.split('/').slice(-1)}
			</a>
		</td>
	</tr>
	<tr>
		<td>Live Data</td>
		<td><code>{table.live_table}</code></td>
	</tr>
	<tr>
		<td>Stable View</td>
		<td><code>{table.stable_table}</code></td>
	</tr>
</table>
<SchemaViewer {app} nodes={table.bq_schema} />

<!-- <style>
	@import '../../../../../main.scss';
	@include metadata-table;
</style> -->
