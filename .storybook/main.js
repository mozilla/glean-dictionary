const sveltePreprocess = require("svelte-preprocess");
const autoPrefixer = require("autoprefixer");

module.exports = {
  stories: ["../stories/**/*.stories.js"],
  addons: ["@storybook/addon-knobs"],

  webpackFinal: async (config) => {
    const svelteLoader = config.module.rules.find(
      (r) => r.loader && r.loader.includes("svelte-loader")
    );
    svelteLoader.options = {
      ...svelteLoader.options,
      preprocess: sveltePreprocess({
        postcss: true,
        defaults: {
          style: "scss",
        },
        scss: {
          prependData: `@import 'node_modules/@mozilla-protocol/core/protocol/css/protocol.scss';`,
        },
        postcss: {
          plugins: [autoPrefixer],
        },
      }),
    };

    config.module.rules.push({
      // this is for both less and scss
      test: /.*\.(?:le|c|sc)ss$/,
      loaders: ["style-loader", "css-loader", "sass-loader"],
    });

    return config;
  },
};
