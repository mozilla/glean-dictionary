const sveltePreprocess = require('svelte-preprocess');
const node = require('@sveltejs/adapter-node');
const pkg = require('./package.json');
const netlify = require('@sveltejs/adapter-netlify')
const ssr = require('@sveltejs/adapter-static')

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess({
    sourceMap: true,
    defaults: {
          style: "scss",
        },
    scss: {
          prependData: `@import 'node_modules/@mozilla-protocol/core/protocol/css/protocol.scss';`,
        },
  }),
	kit: {
		// By default, `npm run build` will create a standard Node app.
		// You can create optimized builds for different platforms by
		// specifying a different adapter
		// adapter: netlify(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: {
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {})
			}
		}
	}
};
