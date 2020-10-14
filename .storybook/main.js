const sveltePreprocess = require("svelte-preprocess");

module.exports = {
  stories: ["../stories/**/*.stories.js"],
  addons: ["@storybook/addon-knobs"],

  webpackFinal: async (config) => {
    const svelteLoader = config.module.rules.find(
      (r) => r.loader && r.loader.includes("svelte-loader")
    );
    svelteLoader.options = {
      ...svelteLoader.options,
      preprocess: sveltePreprocess({ postcss: true }),
    };

    return config;
  },
};
