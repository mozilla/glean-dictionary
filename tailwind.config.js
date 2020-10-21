const production = !process.env.ROLLUP_WATCH;

module.exports = {
  future: {},
  purge: {
    content: ["./src/**/*.svelte", "./src/**/*.html"],
    enabled: production, // disable purge in dev
    options: {
      whitelist: [/svelte-/],
      defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
    },
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
