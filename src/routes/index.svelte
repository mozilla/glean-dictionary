<script context="module">
	console.log('Starting 1')
	export async function load({ fetch }) {
		console.log('starting 2')
		const res = await fetch('/data/apps.json');

		if (res.ok) {
			const apps = await res.json();
			console.log("Starting 3");
			apps.sort((a, b) =>
				a.canonical_app_name.toLowerCase() > b.canonical_app_name.toLowerCase() ? 1 : -1
			);
			return {
				props: {
					apps
				}
			};
		}

		const { message } = await res.json();
		return { error: new Error(message) };
	}
</script>

<script>
	export let apps;
	export let shownApps;

	import FilterInput from '$lib/FilterInput.svelte';
	import { pageState } from '$lib/state/stores';
	console.log("next")

	const appLogos = {
		browser: '/img/app-logos/browser.png',
		beta: '/img/app-logos/beta.png',
		amazon: '/img/app-logos/amazon.png',
		'klar-focus': '/img/app-logos/klar-focus.png',
		lockwise: '/img/app-logos/lockwise.png',
		nightly: '/img/app-logos/nightly.png',
		reality: '/img/app-logos/reality.png',
		others: '/img/app-logos/mozilla.png',
		dev: '/img/app-logos/dev.png'
	};

	function getAppLogo(app) {
		if (app.match(/fenix/) || app.match(/nightly/)) {
			return appLogos.nightly;
		}
		if (app.match(/beta/)) {
			return appLogos.beta;
		}
		if (app.match(/echo/) || app.match(/fire-tv/)) {
			return appLogos.amazon;
		}
		if (app.match(/focus/) || app.match(/klar/)) {
			return appLogos['klar-focus'];
		}
		if (app.match(/lockwise/)) {
			return appLogos.lockwise;
		}
		if (app.match(/reality/)) {
			return appLogos.reality;
		}
		if (app.match(/dev/)) {
			return appLogos.dev;
		}
		if (app.match(/firefox/)) {
			return appLogos.browser;
		}
		return appLogos.others;
	}

	function isPlatform(app) {
		if (includes(app, 'iOS') || includes(app, 'Android') || includes(app, 'Amazon')) {
			return true;
		}
		return false;
	}

	function getPlatformLogo(app) {
		if (includes(app, 'iOS')) {
			return 'img/app-logos/platform-apple.jpg';
		}
		if (includes(app, 'Android')) {
			return 'img/app-logos/platform-android.png';
		}
		if (includes(app, 'Amazon')) {
			return 'img/app-logos/platform-amazon.png';
		}
		return undefined;
	}
	
	// reset search
	pageState.set({... $pageState, search: ""})
	
	$: shownApps = apps.filter(a => a.app_name.includes($pageState.search))
</script>

<svelte:head>
	<title>Glean Dictionary</title>
</svelte:head>

<div class="app-filter">
	<FilterInput placeHolder="Search for an application" />
</div>
{#if shownApps}
	<div class="app-list">
		{#each shownApps as app}
			<div class="mzp-c-card mzp-c-card-extra-small has-aspect-3-2" id="card">
				<a class="mzp-c-card-block-link" href={app.app_name} id="media-block">
					<div class="mzp-c-card-media-wrapper" id="media-wrapper">
						<img
							class="mzp-c-card-imgage"
							src={getAppLogo(app.app_name)}
							alt="${app.canonical_app_name} Logo"
							id="logo-img"
						/>
						<!-- TODO: add platform flags -->
						<!-- {#if isPlatform(app.app_description)}
							<div class="corner-flag" />
							<img
								class="platform-logo"
								src={getPlatformLogo(app.app_description)}
								alt="Platform Logo"
							/>
						{/if} -->
					</div>
					<div class="mzp-c-card-content">
						<h2 class="mzp-c-card-title">{app.canonical_app_name}</h2>
						<p class="mzp-c-card-meta" id="card-description">
							{app.app_description}
						</p>
					</div>
				</a>
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
@import "./apps.scss"
</style>
