const production = !process.env.ROLLUP_WATCH;
module.exports = {
  /* eslint-disable global-require */
  plugins: [
    require("postcss-import"),
    require("@fullhuman/postcss-purgecss")({
      content: ["index.html", "./src/**/*.svelte", "./src/**/*.html"],
      enabled: production,
      options: {
        /* eslint-disable no-unused-vars */
        defaultExtractor: (content) =>
          [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(
            ([_match, group, ..._rest]) => group
          ),
      },
      variables: true,
    }),
  ],
};
