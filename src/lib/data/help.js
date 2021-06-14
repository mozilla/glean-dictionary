const REQUIRED_METRIC_PARAMS_DOCS =
  "https://mozilla.github.io/glean/book/user/metric-parameters.html#required-metric-parameters";
const OPTIONAL_METRIC_PARAMS_DOCS =
  "https://mozilla.github.io/glean/book/user/metric-parameters.html#optional-metric-parameters";

export default {
  bugs: {
    text:
      "A list of bugs (e.g. Bugzilla or GitHub) that are relevant to this metric. For example, bugs that track its original implementation or later changes to it.",
    link: REQUIRED_METRIC_PARAMS_DOCS,
  },
  lifetime: {
    text:
      "Defines the lifetime of the metric. Different lifetimes affect when the metrics value is reset.",
    link: OPTIONAL_METRIC_PARAMS_DOCS,
  },
  sendInPings: {
    text: "Defines which pings the metric is sent in.",
    link: OPTIONAL_METRIC_PARAMS_DOCS,
  },
  searchFox: {
    text:
      "Finds uses of this metric using simple matching. Metrics used dynamically may not appear in the results, only metrics defined in the application will be found.",
    link: "https://searchfox.org/",
  },
};
