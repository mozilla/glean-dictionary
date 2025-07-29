/* eslint-disable camelcase */
export function formatMonitor(monitor) {
  if (typeof monitor === "boolean") {
    return monitor ? "Enabled" : "Disabled";
  }
  if (
    typeof monitor !== "object" ||
    monitor === null ||
    Object.keys(monitor).length === 0
  ) {
    return "Disabled";
  }
  const {
    alert,
    platforms = [],
    bugzilla_notification_emails = [],
    lower_is_better,
    change_detection_technique,
    change_detection_args = [],
  } = monitor;
  const notificationEmails =
    Array.isArray(bugzilla_notification_emails) &&
    bugzilla_notification_emails.length > 0
      ? bugzilla_notification_emails
      : [];
  const json = {
    alert: alert ? "Enabled" : "Disabled",
    platforms: platforms.length ? platforms : [],
    notificationEmails,
    lowerIsBetter: lower_is_better === undefined ? null : !!lower_is_better,
    changeDetectionTechnique: change_detection_technique || null,
    changeDetectionArgs: change_detection_args,
  };
  return ["<pre><code>", JSON.stringify(json, null, 2), "</code></pre>"].join(
    ""
  );
}
