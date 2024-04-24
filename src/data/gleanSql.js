export const getGleanQuery = (columnName, table) => `
-- Auto-generated by the Glean Dictionary.
-- https://docs.telemetry.mozilla.org/cookbooks/accessing_glean_data.html#accessing-glean-data-in-bigquery

SELECT
  ${columnName}
FROM
  ${table} AS m
WHERE
  -- Pick yesterday's data from stable/historical tables.
  -- https://docs.telemetry.mozilla.org/cookbooks/bigquery/querying.html#table-layout-and-naming
  DATE(submission_timestamp) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
-- IMPORTANT: Remove the limit clause when the query is ready.
LIMIT 10`;

export const getGleanLegacyEventQuery = (table, additionalInfo) => `
  -- Auto-generated by the Glean Dictionary.
  -- https://docs.telemetry.mozilla.org/cookbooks/accessing_glean_data.html#event-metrics

  WITH events AS (
    SELECT
      submission_timestamp,
      client_info.client_id,
      event.timestamp AS event_timestamp,
      event.category AS event_category,
      event.name AS event_name,
      event.extra AS event_extra,
    FROM ${table} AS e
    CROSS JOIN UNNEST(e.events) AS event
    WHERE
      -- Pick yesterday's data from stable/historical tables.
      -- https://docs.telemetry.mozilla.org/cookbooks/bigquery/querying.html#table-layout-and-naming
      date(submission_timestamp) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
      AND sample_id = 1 -- 1% sample for development
      AND event.category = '${additionalInfo.category}'
      AND event.name = '${additionalInfo.name}'
  )
  SELECT * FROM events
  -- IMPORTANT: Remove the limit clause when the query is ready.
  LIMIT 10`;

export const getGleanEventQuery = (table, additionalInfo) => `
  -- Auto-generated by the Glean Dictionary.
  -- https://docs.telemetry.mozilla.org/cookbooks/accessing_glean_data.html#event-metrics

  WITH events AS (
    SELECT
      -- The table is partitioned by submission timestamp, so we need to
      -- include it in the query. We use event_timestamp instead to understand
      -- when the event happened exactly at the source.
      submission_timestamp,
      event_timestamp,
      event,
      event_extra
    FROM ${table} as e
    WHERE
      -- Pick data for the last two days from stable/historical tables.
      -- https://docs.telemetry.mozilla.org/cookbooks/bigquery/querying.html#table-layout-and-naming
      date(submission_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)
      AND event = '${additionalInfo.category}.${additionalInfo.name}'
      -- Event extras can be queried as a JSON object. Here is an example
      -- to only fetch events that carry an extra property named 'the_name'
      -- with a value of 'the_value'.
      -- AND JSON_VALUE(event_extra.the_name) = 'the_value'
  )
  SELECT event_timestamp, event, event_extra FROM events
  ORDER BY event_timestamp DESC
  -- IMPORTANT: Remove the limit clause when the query is ready.
  LIMIT 10`;

export const getGleanPingQuery = (table) => `
  -- Autogenerated by the Glean Dictionary.
  -- https://mozilla.github.io/glean/book/user/pings/index.html#payload-structure
  SELECT
    client_info.*,
    ping_info.*,
    metrics.*
  FROM
    ${table} AS m
  WHERE
    -- Pick yesterday's data from stable/historical tables.
    -- https://docs.telemetry.mozilla.org/cookbooks/bigquery/querying.html#table-layout-and-naming
    DATE(submission_timestamp) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  -- IMPORTANT: Remove the limit clause when the query is ready.
  LIMIT 10`;
