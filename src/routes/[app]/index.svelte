<script context="module">
	export async function load({ page, fetch }) {
		const res = await fetch(`/data/${page.params.app}/index.json`);
		const app = await res.json();

		return {
			props: { app }
		};
	}
</script>

<script>
	export let app;

	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	import { APPLICATION_DEFINITION_SCHEMA } from '$lib/data/schemas';
	import AppAlert from '$lib/AppAlert.svelte';
	import ItemList from '$lib/ItemList.svelte';
	import MetadataTable from '$lib/MetadataTable.svelte';
	import Pill from '$lib/Pill.svelte';
	import { TabGroup, Tab, TabContent } from '$lib/tabs';
	import PageTitle from '$lib/PageTitle.svelte';
	import { pageState } from '$lib/state/stores';

	let itemType = $pageState.itemType || 'metrics';
	const searchText = writable($pageState.search || '');
	setContext('searchText', searchText);
	const showExpired = writable($pageState.showExpired || false);
	setContext('showExpired', showExpired);
	$: {
		pageState.set({ itemType, search: $searchText, showExpired: $showExpired });
	}
</script>

<svelte:head>
	<title>{app.app_name}</title>
</svelte:head>

{#if app.prototype}
	<AppAlert
		status="warning"
		message="This application is a prototype. The metrics and pings listed below may contain inconsistencies and testing strings."
	/>
{/if}
<PageTitle text={app.canonical_app_name} />

{#if app.deprecated}
	<Pill message="Deprecated" bgColor="#4a5568" />
{/if}
<p>{app.app_description}</p>

<MetadataTable appName={app.app_name} item={app} schema={APPLICATION_DEFINITION_SCHEMA} />

<TabGroup
	active={itemType}
	on:tabChanged={({ detail }) => {
		itemType = detail.active;
		searchText.set('');
	}}
>
	<Tab key="metrics">Metrics</Tab>
	<Tab key="pings">Pings</Tab>
	<Tab key="app_ids">Application IDs</Tab>

	<TabContent key="pings">
		<ItemList itemType="pings" items={app.pings} appName={app.app_name} />
	</TabContent>

	<TabContent key="metrics">
		<ItemList itemType="metrics" items={app.metrics} appName={app.app_name} />
	</TabContent>

	<TabContent key="app_ids">
		<ItemList itemType="app_ids" items={app.app_ids} appName={app.app_name} showFilter={false} />
	</TabContent>
</TabGroup>
