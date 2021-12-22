import { capitalize } from "lodash";
import { getEmailLink } from "../formatters/emails";
import { getExpiryInfo } from "../formatters/expiry";
import {
  getBugURL,
  getBugLinkTitle,
  getSourceUrlTitle,
} from "../formatters/links";
import { getCodeSearchLink } from "../formatters/codesearch";

const REQUIRED_METRIC_PARAMS_DOCS =
  "https://mozilla.github.io/glean/book/user/metric-parameters.html#required-metric-parameters";
const OPTIONAL_METRIC_PARAMS_DOCS =
  "https://mozilla.github.io/glean/book/user/metric-parameters.html#optional-metric-parameters";

const getFirstAddedText = (itemType) => {
  return `The date when this ${itemType} was first added to the product source code. If it was added recently, it may take some time before the software is released to users and data starts showing up.`;
};

export const APPLICATION_DEFINITION_SCHEMA = [
  {
    title: "Source",
    id: "url",
    type: "link",
    helpText: "Where the source code for this application lives.",
  },
  {
    title: "Notification Emails",
    id: "notification_emails",
    type: "links",
    helpText:
      "A list of email addresses to notify for important events with the application or when people with context or ownership for the application need to be contacted.",
    linkFormatter: getEmailLink,
  },
  {
    title: "Rentention Period",
    id: "retention_days",
    displayNull: true,
    type: "value",
    helpText:
      "The number of days Mozilla retains raw decoded ping data received for this application. If not specified, retention will be unlimited.",
    valueFormatter: (value) => {
      return value !== null ? `${value} days` : "Unlimited";
    },
  },
];

export const APPLICATION_ID_DEFINITION_SCHEMA = [
  {
    title: "Channel",
    id: "app_channel",
    type: "value",
    helpText:
      "Release channel that this application id corresponds to (release, beta, nightly, or esr).",
    valueFormatter: (item) => item.channel || "release",
  },
  {
    title: "Dependencies",
    id: "dependencies",
    type: "list",
    helpText:
      "List of library dependencies that this application id depends on.",
  },
];

export const METRIC_DEFINITION_SCHEMA = [
  {
    title: "Source",
    id: "source_url",
    type: "link",
    helpText:
      "Where the source definition of the metric may be found (referencing the first commit in which it was introduced).",
    valueFormatter: getSourceUrlTitle,
  },
  {
    title: "Code Search",
    id: "name",
    type: "link",
    helpText:
      "Finds uses of this metric using simple matching. Metrics used dynamically may not appear in the results, only metrics defined in the application will be found.",
    linkFormatter: (metricId, appName) => {
      return getCodeSearchLink(appName, metricId);
    },
  },
];
export const METRIC_METADATA_SCHEMA = [
  {
    title: "Data Sensitivity",
    id: "data_sensitivity",
    type: "list",
    helpText:
      "A list of data sensitivity categories that the metric falls under.",
    helpLink:
      "https://mozilla.github.io/glean/book/reference/yaml/metrics.html#data_sensitivity",
    valueFormatter: (item) => {
      return item
        .split("_")
        .map((s) => capitalize(s))
        .join(" ");
    },
  },
  {
    title: "Lifetime",
    id: "lifetime",
    type: "value",
    helpText:
      "Defines the lifetime of the metric. Different lifetimes affect when the metrics value is reset.",
    helpLink: OPTIONAL_METRIC_PARAMS_DOCS,
  },
  {
    title: "First Added",
    id: "date_first_seen",
    type: "value",
    helpText: getFirstAddedText("metric"),
  },
  {
    title: "Time Unit",
    id: "time_unit",
    type: "value",
    helpText:
      "The smallest unit of time resolution that the metric will record.",
  },
  {
    title: "Bucket count",
    id: "bucket_count",
    type: "value",
    helpText: "Number of possible histogram buckets to use for this metric.",
  },
  {
    title: "Histogram type",
    id: "histogram_type",
    type: "value",
    helpText: "Type of histogram (exponential, linear, ...).",
  },
  {
    title: "Unit",
    id: "unit",
    type: "value",
    helpText: "The unit for this metric type.",
  },
  {
    title: "Range minimum",
    id: "range_min",
    type: "value",
    helpText: "The minimum value in the range.",
  },
  {
    title: "Range maximum",
    id: "range_max",
    type: "value",
    helpText: "The maximum value in the range.",
  },
  {
    title: "Disabled",
    id: "disabled",
    type: "value",
    helpText:
      "True if data collection for this metric is disabled. Sometimes this is used to temporarily disable the collection for a specific metric without removing references to it in the source code.",
  },
  {
    title: "Labels",
    id: "labels",
    type: "list",
    helpText:
      "Only used for labeled metrics. If provided, the labels are enforced at runtime, and recording to an unknown label is recorded to the special label `__other__`.",
  },
  {
    title: "Version",
    id: "version",
    type: "value",
    helpText:
      "The version of the metric. A monotonically increasing integer value. Normally bumped if the metric changes in a backward-incompatible way.",
    helpLink: OPTIONAL_METRIC_PARAMS_DOCS,
    valueFormatter: (item) => item.version || 0,
  },
  {
    title: "Bugs",
    id: "bugs",
    helpText:
      "A list of bugs (e.g. Bugzilla or GitHub) that are relevant to this metric. For example, bugs that track its original implementation or later changes to it.",
    helpLink: REQUIRED_METRIC_PARAMS_DOCS,
    type: "links",
    linkFormatter: getBugURL,
    valueFormatter: getBugLinkTitle,
  },
  {
    title: "Data reviews",
    id: "data_reviews",
    type: "links",
    helpText: "Any data collection reviews responses relevant to the metric.",
    helpLink: REQUIRED_METRIC_PARAMS_DOCS,
    linkFormatter: getBugURL,
    valueFormatter: getBugLinkTitle,
  },
  {
    title: "Notification Emails",
    id: "notification_emails",
    type: "links",
    helpText:
      "A list of email addresses to notify for important events with the metric or when people with context or ownership for the metric need to be contacted.",
    helpLink: REQUIRED_METRIC_PARAMS_DOCS,
    linkFormatter: getEmailLink,
  },
  {
    title: "Expires",
    id: "expiry_text",
    type: "markdown",
    helpText:
      "When the metric is set to expire. After a metric expires, an application will no longer collect or send data related to it.",
    helpLink: REQUIRED_METRIC_PARAMS_DOCS,
    valueFormatter: getExpiryInfo,
  },
];
export const PING_SCHEMA = [
  {
    title: "Source",
    id: "source_url",
    type: "link",
    helpText: "Where the source definition of the ping may be found.",
    valueFormatter: getSourceUrlTitle,
  },
  {
    title: "First Added",
    id: "date_first_seen",
    type: "value",
    helpText: getFirstAddedText("ping"),
  },
  {
    title: "Includes Client Identifier",
    id: "include_client_id",
    helpText: "Whether this ping includes the client_id field.",
    valueFormatter: (v) => (v ? "Yes" : "No"),
  },
  {
    title: "Bugs",
    id: "bugs",
    helpText:
      "A list of bugs (e.g. Bugzilla or GitHub) that are relevant to this ping. For example, bugs that track its original implementation or later changes to it.",
    type: "links",
    linkFormatter: getBugURL,
    valueFormatter: getBugLinkTitle,
  },
  {
    title: "Data reviews",
    id: "data_reviews",
    type: "links",
    helpText: "Any data collection reviews responses relevant to the metric.",
    linkFormatter: getBugURL,
    valueFormatter: getBugLinkTitle,
  },
  {
    title: "Notification Emails",
    id: "notification_emails",
    type: "links",
    helpText:
      "A list of email addresses to notify for important events with the ping or when people with context or ownership for the ping need to be contacted.",
    helpLink: REQUIRED_METRIC_PARAMS_DOCS, // all the stuff applying to metrics applies to pings here
    linkFormatter: getEmailLink,
  },
];
