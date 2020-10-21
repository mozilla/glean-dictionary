const postCssImport = require("postcss-import");

const tailwindcss = require("tailwindcss");

module.exports = {
  plugins: [postCssImport, tailwindcss],
};
