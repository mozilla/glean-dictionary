<script>
	export let metricName;
	import { pageState } from '$lib/state/stores';
    export let bigQueryLink;

    pageState.set({... $pageState, search: metricName})
</script>

<a href={bigQueryLink}>{metricName}</a>