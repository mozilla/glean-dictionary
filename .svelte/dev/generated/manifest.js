const c = [
	() => import("../../../src/routes/$layout.svelte"),
	() => import("../../../src/routes/$error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/[app]/$layout.svelte"),
	() => import("../../../src/routes/[app]/$error.svelte"),
	() => import("../../../src/routes/[app]/index.svelte"),
	() => import("../../../src/routes/[app]/app_ids/[app_id]/index.svelte"),
	() => import("../../../src/routes/[app]/app_ids/[app_id]/tables/[table].svelte"),
	() => import("../../../src/routes/[app]/metrics/[metric].svelte"),
	() => import("../../../src/routes/[app]/tables/[table].svelte"),
	() => import("../../../src/routes/[app]/pings/[ping].svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/[app]/index.svelte
	[/^\/([^/]+?)\/?$/, [c[0], c[3], c[5]], [c[1], c[4]], (m) => ({ app: d(m[1])})],

	// src/routes/[app]/app_ids/[app_id]/index.svelte
	[/^\/([^/]+?)\/app_ids\/([^/]+?)\/?$/, [c[0], c[3], c[6]], [c[1], c[4]], (m) => ({ app: d(m[1]), app_id: d(m[2])})],

	// src/routes/[app]/app_ids/[app_id]/tables/[table].svelte
	[/^\/([^/]+?)\/app_ids\/([^/]+?)\/tables\/([^/]+?)\/?$/, [c[0], c[3], c[7]], [c[1], c[4]], (m) => ({ app: d(m[1]), app_id: d(m[2]), table: d(m[3])})],

	// src/routes/[app]/metrics/[metric].svelte
	[/^\/([^/]+?)\/metrics\/([^/]+?)\/?$/, [c[0], c[3], c[8]], [c[1], c[4]], (m) => ({ app: d(m[1]), metric: d(m[2])})],

	// src/routes/[app]/tables/[table].svelte
	[/^\/([^/]+?)\/tables\/([^/]+?)\/?$/, [c[0], c[3], c[9]], [c[1], c[4]], (m) => ({ app: d(m[1]), table: d(m[2])})],

	// src/routes/[app]/pings/[ping].svelte
	[/^\/([^/]+?)\/pings\/([^/]+?)\/?$/, [c[0], c[3], c[10]], [c[1], c[4]], (m) => ({ app: d(m[1]), ping: d(m[2])})]
];

export const fallback = [c[0](), c[1]()];