const production = !process.env.ROLLUP_WATCH;

const svelteExtractor = (content) => {
  const regExp = new RegExp(/[A-Za-z0-9-_:/]+/g);
  const matchedTokens = [];
  let match = regExp.exec(content);

  while (match) {
    if (match[0].startsWith("class")) {
      matchedTokens.push(match[0].substring(6));
    } else {
      matchedTokens.push(match[0]);
    }
    match = regExp.exec(content);
  }
  return matchedTokens;
};

module.exports = {
  future: {},
  purge: {
    content: ["./src/**/*.svelte", "./src/**/*.html"],
    enabled: production, // disable purge in dev
    options: {
      whitelist: [/svelte-/],
      defaultExtractor: svelteExtractor,
    },
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
