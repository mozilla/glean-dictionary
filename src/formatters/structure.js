export function getStructureMarkdown(structure) {
  return structure
    ? `<pre><code>${JSON.stringify(structure, null, 2)}</code></pre>`
    : null;
}
