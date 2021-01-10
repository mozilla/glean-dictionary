## Protocol

Glean Dictionary uses [Mozilla Protocol](https://protocol.mozilla.org/) for styling. To optimize performance, currently we're only importing what's needed from the package.  Right now that's everything from `node_modules/@mozilla-protocol/protocol/css/base`, which includes basic elements and typography. If you want to use component or layout styling, make sure the corresponding stylesheet is imported to `src/scss` first. 

All Protocol tokens (colors, tokens, etc.) are available for component styling. 

## SCSS

If you run into an issue where SCSS syntax is not properly highlighted in your Svelte components, you might need to:

- Update `svelte.language-server.runtime` setting to the path of your node runtime. Detailed instruction for Mac and Windows: https://daveceddia.com/svelte-with-sass-in-vscode/#svelte-with-sass-in-vscode.

- Then, restart the svelte language server: `ctrl-shift-p` or `cmd-shift-p` on mac, type `svelte restart`, and select `Svelte: Restart Language Server`. 
