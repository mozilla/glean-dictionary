export default {
  bugs: {
    text:
      "Required. A list of bugs (e.g. Bugzilla or GitHub) that are relevant to this metric. For example, bugs that track its original implementation or later changes to it.",
    link: "https://mozilla.github.io/glean/book/user/metric-parameters.html",
  },
  lifetime: {
    text:
      "Defines the lifetime of the metric. Different lifetimes affect when the metrics value is reset.",
    link: "https://mozilla.github.io/glean/book/user/metric-parameters.html",
  },
  send_in_pings: {
    text:
      "Defines which pings the metric should be sent on. If not specified, the metric is sent on the 'default ping', which is the events ping for events and the metrics ping for everything else. Most metrics don't need to specify this unless they are sent on custom pings.",
    link: "https://mozilla.github.io/glean/book/user/metric-parameters.html",
  },
};
