const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.html", "./src/**/*.svelte"],

  whitelistPatterns: [/svelte-/],

  defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

const tailwindcss = require("tailwindcss");

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  plugins: [tailwindcss, ...(production ? [purgecss] : [])],
};
