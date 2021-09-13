export function stripLinks(text) {
  return text.replace(/\[(.*)\]\(.*\)/, "$1");
}
