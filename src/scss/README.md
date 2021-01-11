## Protocol

Glean Dictionary uses [Mozilla Protocol](https://protocol.mozilla.org/) for
styling. To optimize performance, we only copy what's needed from the package.
Currently that's everything from
`node_modules/@mozilla-protocol/protocol/css/base`, which has basic elements and
typography. If you want to use classes from `./components` or `./templates`,
make sure the corresponding stylesheet is imported to `src/scss` first.

All Protocol SCSS variables (colors, tokens, functions, mixins, etc.) in
`./included` are available for component styling.

## SCSS

If you run into an issue where SCSS syntax is not properly highlighted in Svelte
components, try:

- Update `svelte.language-server.runtime` setting to the path of your node
  runtime. Detailed instruction for Mac and Windows:
  https://daveceddia.com/svelte-with-sass-in-vscode/#svelte-with-sass-in-vscode.

- Then, restart the svelte language server: `ctrl-shift-p` or `cmd-shift-p` on
  Mac, type `svelte restart`, and select `Svelte: Restart Language Server`.
