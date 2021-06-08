<script context="module">
	export async function load({ page, fetch }) {
		const tableName = page.params.table.replace(/\./g, '_');
		const res = await fetch(`/data/${page.params.app}/tables/${tableName}.json`);
		const table = await res.json();
		const app = page.params.app;
		console.log(page.params);
		return {
			props: { table, app }
		};
	}
</script>

<script>
	export let table, app;
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	import SchemaViewer from 'lib/SchemaViewer.svelte';

	import { pageState, pageTitle } from '../state/stores';

	import NotFound from 'lib/NotFound.svelte';
	import PageTitle from 'lib/PageTitle.svelte';

	const searchText = writable($pageState.search || '');
	setContext('searchText', searchText);
	$: {
		pageState.set({ search: $searchText });
	}

	pageTitle.set(`${table} table | ${app.appId}`);
</script>

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

<style lang="scss">
	@import 'main.scss';
	@include metadata-table;
</style>
