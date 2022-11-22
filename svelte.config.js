const sveltePreprocess = require("svelte-preprocess");
const autoPrefixer = require("autoprefixer");
const postCssImport = require("postcss-import");

module.exports = {
  preprocess: sveltePreprocess({
    defaults: {
      style: "scss",
    },
    scss: {
      prependData: `@import 'node_modules/@mozilla-protocol/core/protocol/css/protocol.scss';`,
    },
    postcss: {
      plugins: [autoPrefixer, postCssImport],
    },
  }),
};
