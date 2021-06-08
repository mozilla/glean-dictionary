const c = [
	() => import("../../../src/routes/$layout.svelte"),
	() => import("../components/error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/[app]/$layout.reset.svelte"),
	() => import("../../../src/routes/[app]/index.svelte"),
	() => import("../../../src/routes/[app]/app_ids/[app_id]/$layout.reset.svelte"),
	() => import("../../../src/routes/[app]/app_ids/[app_id]/index.svelte"),
	() => import("../../../src/routes/[app]/app_ids/[app_id]/tables/$layout.reset.svelte"),
	() => import("../../../src/routes/[app]/app_ids/[app_id]/tables/[table].svelte"),
	() => import("../../../src/routes/[app]/metrics/$layout.reset.svelte"),
	() => import("../../../src/routes/[app]/metrics/[metric].svelte"),
	() => import("../../../src/routes/[app]/pings/$layout.reset.svelte"),
	() => import("../../../src/routes/[app]/pings/[ping].svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/[app]/index.svelte
	[/^\/([^/]+?)\/?$/, [c[3], c[4]], [], (m) => ({ app: d(m[1])})],

	// src/routes/[app]/app_ids/[app_id]/index.svelte
	[/^\/([^/]+?)\/app_ids\/([^/]+?)\/?$/, [c[5], c[6]], [], (m) => ({ app: d(m[1]), app_id: d(m[2])})],

	// src/routes/[app]/app_ids/[app_id]/tables/[table].svelte
	[/^\/([^/]+?)\/app_ids\/([^/]+?)\/tables\/([^/]+?)\/?$/, [c[7], c[8]], [], (m) => ({ app: d(m[1]), app_id: d(m[2]), table: d(m[3])})],

	// src/routes/[app]/metrics/[metric].svelte
	[/^\/([^/]+?)\/metrics\/([^/]+?)\/?$/, [c[9], c[10]], [], (m) => ({ app: d(m[1]), metric: d(m[2])})],

	// src/routes/[app]/pings/[ping].svelte
	[/^\/([^/]+?)\/pings\/([^/]+?)\/?$/, [c[11], c[12]], [], (m) => ({ app: d(m[1]), ping: d(m[2])})]
];

export const fallback = [c[0](), c[1]()];