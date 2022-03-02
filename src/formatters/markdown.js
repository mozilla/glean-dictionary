export function stripLinks(text) {
  return (text && text.replace(/\[(.*)\]\(.*\)/, "$1")) || text;
}
