const flexsearch = require("flexsearch");

const SUPPORTED_GLAM_METRIC_TYPES = new Set(
  require("./supported_glam_metric_types.json")
);

// (duplicates `src/state/items.js`: included here because netlify functions do not yet support
// ES6 modules)
function isExpired(item) {
  if (item.expires === "never" || item.expires === undefined) {
    return false;
  }
  return new Date() > new Date(item.expires);
}

function createSearchIndex(metricData) {
  const searchIndex = new flexsearch.Index({
    tokenize: "full",
  });

  Object.entries(metricData).forEach(([metricId, metric]) => {
    const metricSummary = [metricId, metric.type, metric.description].join(" ");
    searchIndex.add(metricId, metricSummary);
  });

  return searchIndex;
}

exports.getSearchFunction = function (metricData, legacy) {
  const searchIndex = createSearchIndex(metricData);

  return async function (event /*, context*/) {
    const { search, glam, limit } = event.queryStringParameters;

    const glamMode = !!parseInt(glam);

    const searchResults = searchIndex
      .search(search || "", parseInt(limit) || 10)
      .map((id) => ({ name: id, ...metricData[id] }));

    const getScore = legacy
      ? (item) => {
          let score = 0;
          // the only criteria for legacy data is if it's "active" or not
          score += item.active || item.active === undefined ? 1 : 0;
          return score;
        }
      : (item) => {
          let score = 0;
          // sort expired metrics below non-expired ones
          score += !isExpired(item) ? 1 : 0;
          // if in glam mode, we want to move unsupported metrics right to the bottom
          score +=
            glamMode && SUPPORTED_GLAM_METRIC_TYPES.has(item.type) ? 10 : 0;
          return score;
        };

    searchResults.sort((a, b) => {
      return getScore(b) - getScore(a);
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(searchResults),
    };
  };
};
