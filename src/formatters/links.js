export function getBugLinkTitle(url) {
  // bugzilla bugs
  if (url.includes("bugzilla.mozilla.org") || url.includes("bugzil.la")) {
    return url.replace(/([^\d]+)/, "bugzil.la/");
  }
  // github issues or pull requests
  if (url.includes("github.com")) {
    return url
      .replace(
        /[^\d]+\/([^\d]+)\/([^\d]+)\/[^\d]+\/([\d]+)/,
        (_, orgName, repoName, issueNumber) => {
          return `${orgName}/${repoName}#${issueNumber}`;
        }
      )
      .replace(/#issuecomment.*/, "-comment");
  }
  // some other hitherto unseen issue URL, we'll just return
  // it verbatim, just remove the http/https part
  return url.replace(/^http(s?):\/\//, "");
}
