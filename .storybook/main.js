const sveltePreprocess = require("svelte-preprocess");
const autoPrefixer = require("autoprefixer");
const path = require("path");

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
          prependData: `@import '@mozilla-protocol/core/protocol/css/protocol.scss';`,
        },
        postcss: {
          plugins: [autoPrefixer],
        },
      }),
      onwarn: (warning, handler) => {
        const { code } = warning;
        if (code === "css-unused-selector") return;

        handler(warning);
      },
    };

    config.module.rules.push({
      // this is for both less and scss
      test: /.*\.(?:le|c|sc)ss$/,
      loaders: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

    return config;
  },
};
