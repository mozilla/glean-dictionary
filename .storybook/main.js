const sveltePreprocess = require("svelte-preprocess");
const autoPrefixer = require("autoprefixer");
const path = require("path");

module.exports = {
  stories: ["../stories/**/*.stories.js"],
  addons: ["@storybook/addon-controls"],

  webpackFinal: async (config) => {
    const svelteLoader = config.module.rules.find(
      (r) => r.loader && r.loader.includes("svelte-loader")
    );
    svelteLoader.options = {
      ...svelteLoader.options,
      preprocess: sveltePreprocess({
        scss: {
          prependData: `@import 'src/protocol-tokens.scss';`,
        },
        postcss: {
          plugins: [autoPrefixer],
        },
      }),

      // turn off warning about unused CSS selectors to
      // shorten Netlify build time. More context:
      // https://github.com/mozilla/glean-dictionary/pull/312#issuecomment-759251341

      onwarn: (warning, handler) => {
        const { code } = warning;
        if (code === "css-unused-selector") return;

        handler(warning);
      },
    };

    config.module.rules.push({
      // this is for both less and scss
      test: /.*\.(?:le|c|sc)ss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, "../"),
    });

    return config;
  },

  framework: {
    name: "@storybook/svelte-webpack5",
    options: {},
  },

  docs: {
    autodocs: true,
  },
};
