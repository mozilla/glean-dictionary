export function getBugURL(ref) {
  // handle old-style Glean bug references (FIXME: do this in etl instead)
  return ref.toString().startsWith("http")
    ? ref
    : `https://bugzilla.mozilla.org/show_bug.cgi?id=${ref}`;
}

export function getBugLinkTitle(ref) {
  const url = getBugURL(ref);

  // bugzilla bugs
  if (url.includes("bugzilla.mozilla.org") || url.includes("bugzil.la")) {
    return url.replace(/([^\d]+)/, "bugzil.la/");
  }
  // github issues or pull requests
  if (url.includes("github.com")) {
    return url
      .replace(
        /[^\d]+\/([^\d]+)\/([^\d]+)\/[^\d]+\/([\d]+)/,
        (_, orgName, repoName, issueNumber) =>
          `${orgName}/${repoName}#${issueNumber}`
      )
      .replace(/#issuecomment.*/, "-comment");
  }
  // some other hitherto unseen issue URL, we'll just return
  // it verbatim, just remove the http/https part
  return url.replace(/^http(s?):\/\//, "");
}

export function getSourceUrlTitle(url) {
  if (url.includes("github.com")) {
    return url.replace(
      /[^\d]+\/([^\d]+)\/([^\d]+)\/([^\d]+)\/([^/]+)\/(.*)/,
      (_, orgName, repoName, _blob, _hash, path) =>
        `${orgName}/${repoName}/${path}`
    );
  }
  return url;
}

export function getGithubRepoName(url) {
  const urlObj = new URL(url);
  if (!urlObj.hostname.endsWith("github.com")) {
    return null;
  }
  // Segments without falsy values that can be introduced by things like '//'
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) {
    return null;
  }
  return pathSegments[1];
}
