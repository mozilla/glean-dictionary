const sveltePreprocess = require("svelte-preprocess");
const autoPrefixer = require("autoprefixer");

module.exports = {
  preprocess: sveltePreprocess({
    defaults: {
      style: "scss",
    },
    scss: {
      prependData: `@import 'src/main.scss';`,
    },
    postcss: {
      plugins: [autoPrefixer],
    },
  }),
};
