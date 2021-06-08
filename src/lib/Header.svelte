<header>
	<div class="mzp-c-navigation mzp-is-sticky">
		<div class="mzp-c-navigation-l-content">
			<div class="mzp-c-navigation-container">
				<div class="mzp-c-navigation-logo-glean">
					<a class="glean-logo" href="/">
						<img src="/glean_logo.png" alt="Glean Dictionary Logo" /></a
					>
					<a href="/"><h5>Dictionary</h5></a>
				</div>
			</div>
		</div>
	</div>

	<!-- {#if links.length}
		<nav class="mzp-c-navigation c-sub-navigation">
			<div class="mzp-c-navigation-l-content">
				<div class="mzp-c-navigation-container">
					<Breadcrumb {links} />
				</div>
			</div>
		</nav>
	{/if} -->
</header>

<style lang="scss">
	@import '@mozilla-protocol/core/protocol/css/protocol.scss';

	.mzp-c-navigation {
		background: $color-black;
		padding-top: $spacing-md;
		margin-bottom: $spacing-md;

		.mzp-c-navigation-logo-glean {
			width: 100%;
			display: flex;
			padding-top: $spacing-xs;
			.glean-logo {
				text-decoration: none;
				img {
					max-width: 113px;
				}
			}
			h5 {
				display: inline-block;
				color: #e0e3e0;
				line-height: 0.7;
				padding-left: $spacing-xs;
				font-size: 38px;
			}
		}
	}
</style>
