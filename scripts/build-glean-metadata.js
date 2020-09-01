const fetch = require("node-fetch");
const fs = require("fs");
const lunr = require("lunr");

// builds a set of glean metadata and search indexes,
// using the output of probe scraper (probeinfo.telemetry.mozilla.org)

PROBE_INFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org";
REPO_URL = PROBE_INFO_BASE_URL + "/glean/repositories";
OUTPUT_DIRECTORY = "public";

const getData = async () => {
  const resp = await fetch(REPO_URL);
  const repos = await resp.json();
  const pings = await Promise.all(
    repos.map(async (repo) => {
      const ping_url = PROBE_INFO_BASE_URL + `/glean/${repo.name}/pings`;
      const resp = await fetch(ping_url);
      const pings = await resp.json();
      return { app_id: repo.app_id, pings };
    })
  );
};

getData();

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
