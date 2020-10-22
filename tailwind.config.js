const production = !process.env.ROLLUP_WATCH;

module.exports = {
  future: {},
  purge: {
    content: ["./src/**/*.svelte", "./src/**/*.html"],
    enabled: production, // disable purge in dev
    options: {
      whitelist: [/svelte-/],
      /* eslint-disable no-unused-vars */
      defaultExtractor: (content) =>
        [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(
          ([_match, group, ..._rest]) => group
        ),
    },
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
