const fetch = require("node-fetch");
const fs = require("fs");
const lunr = require("lunr");

// builds a set of glean metadata and search indexes,
// using the output of probe scraper (probeinfo.telemetry.mozilla.org)

PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org";
REPO_URL = PROBE_INFO_BASE_URL + "/glean/repositories";
OUTPUT_DIRECTORY = "public";

const writeRepoMetadata = async () => {
  const resp = await fetch(REPO_URL);
  const repos = await resp.json();
  const repoMetadata = await Promise.all(
    repos.map(async (repo) => {
      const ping_url = PROBE_INFO_BASE_URL + `/glean/${repo.name}/pings`;
      const resp = await fetch(ping_url);
      const pings = await resp.json();
      let base = {
        app_id: repo.app_id,
        repo: repo.url,
        pings: Object.keys(pings),
      };
      // FIXME: this code is probably going to hit github's rate
      // limiting pretty quickly -- we may want to put this in probe scraper
      if (repo.url.startsWith("https://github.com")) {
        const githubRepoApiUrl = repo.url.replace(
          "https://github.com",
          "https://api.github.com/repos"
        );

        const resp = await fetch(githubRepoApiUrl);
        const repoMetadata = await resp.json();
        base = { ...base, description: repoMetadata.description };
        console.log(resp);
      }
      return base;
    })
  );
  fs.writeFileSync(
    OUTPUT_DIRECTORY + "/data/repos.json",
    JSON.stringify(repoMetadata)
  );
};

writeRepoMetadata();

return;

const args = process.argv.slice(2);
fs.readFile(args[0], (err, data) => {
  if (err) throw err;

  const idx = lunr(function buildIndex() {
    this.field("name");
    //this.field("description");

    const metrics = JSON.parse(data);
    Object.keys(metrics).forEach((id) => {
      const metric = metrics[id];
      console.log(metric.name.split(/[\._]/));
      this.add({
        id,
        name: metric.name.split(/[\._]/).join(" "),
        //description: metric.history[0].description,
      });
    });
  });
  fs.writeFileSync(args[1], JSON.stringify(idx));
  //console.log(idx.search("serp"));
});
