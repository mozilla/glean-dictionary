import { getGleanInvestigationQuery } from "../src/data/gleanSql";

describe("getGleanInvestigationQuery", () => {
  it("includes the diagnostic dimensions and doc link for a scalar metric", () => {
    const query = getGleanInvestigationQuery(
      "counter",
      "fenix.metrics",
      "metrics.counter.some_metric",
      undefined
    );

    // Diagnostic dimensions from the investigation guide.
    expect(query).toContain("metadata.geo.country");
    expect(query).toContain("metadata.isp.name");
    expect(query).toContain("client_info.app_display_version");
    expect(query).toContain("client_info.telemetry_sdk_build");
    expect(query).toContain("client_info.os_version");
    expect(query).toContain("client_info.architecture");
    expect(query).toContain("ping_info.reason");

    // Queries the ping table and groups with GROUP BY ALL.
    expect(query).toContain("fenix.metrics AS m");
    expect(query).toContain("GROUP BY ALL");

    // Reports both ping and distinct-client volume.
    expect(query).toContain("COUNT(*) AS ping_count");
    expect(query).toContain(
      "COUNT(DISTINCT client_info.client_id) AS client_count"
    );

    // Shows where a HAVING clause goes (commented out).
    expect(query).toContain("-- HAVING ping_count > 5000");

    // Link back to the investigation guide.
    expect(query).toContain(
      "investigating-data-issues/investigating-data-issues.html"
    );

    // No active event filter for a non-event metric.
    expect(query).not.toMatch(/^\s*AND event = /m);
  });

  it("totals numeric scalar metrics", () => {
    const query = getGleanInvestigationQuery(
      "counter",
      "fenix.metrics",
      "metrics.counter.some_metric",
      undefined
    );
    expect(query).toContain(
      "SUM(metrics.counter.some_metric) AS some_metric_sum"
    );
    expect(query).toContain(
      "AVG(metrics.counter.some_metric) AS some_metric_avg"
    );
  });

  it("groups low-cardinality scalars by value", () => {
    const query = getGleanInvestigationQuery(
      "boolean",
      "fenix.metrics",
      "metrics.boolean.some_flag",
      undefined
    );
    expect(query).toMatch(/^ {2}metrics\.boolean\.some_flag AS some_flag,$/m);
  });

  it("counts distinct values for high-cardinality scalars", () => {
    const query = getGleanInvestigationQuery(
      "uuid",
      "fenix.metrics",
      "metrics.uuid.some_id",
      undefined
    );
    expect(query).toContain(
      "COUNT(DISTINCT metrics.uuid.some_id) AS distinct_some_id"
    );
  });

  it("extracts the sum from distribution metrics", () => {
    const query = getGleanInvestigationQuery(
      "timing_distribution",
      "fenix.metrics",
      "metrics.timing_distribution.load_time",
      undefined
    );
    expect(query).toContain(
      "SUM(metrics.timing_distribution.load_time.sum) AS load_time_sum"
    );
  });

  it("UNNESTs labeled metrics and breaks them down by label", () => {
    const query = getGleanInvestigationQuery(
      "labeled_counter",
      "fenix.metrics",
      "metrics.labeled_counter.some_metric",
      undefined
    );
    expect(query).toContain(
      "CROSS JOIN UNNEST(metrics.labeled_counter.some_metric) AS some_metric_label"
    );
    expect(query).toContain("some_metric_label.key AS some_metric_label");
    expect(query).toContain("SUM(some_metric_label.value) AS some_metric_sum");
  });

  it("double-UNNESTs dual labeled counters", () => {
    const query = getGleanInvestigationQuery(
      "dual_labeled_counter",
      "fenix.metrics",
      "metrics.dual_labeled_counter.some_metric",
      undefined
    );
    expect(query).toContain(
      "CROSS JOIN UNNEST(metrics.dual_labeled_counter.some_metric) AS some_metric_key"
    );
    expect(query).toContain(
      "CROSS JOIN UNNEST(some_metric_key.value) AS some_metric_category"
    );
  });

  it("offers JSON_VALUE paths for an object metric's scalar fields, skipping maps", () => {
    // Shape of glean.internal.metrics.server_knobs_config.
    const structure = {
      type: "object",
      properties: {
        metrics_enabled: {
          type: "object",
          properties: { key: { type: "string" }, value: { type: "boolean" } },
        },
        pings_enabled: {
          type: "object",
          properties: { key: { type: "string" }, value: { type: "boolean" } },
        },
        event_threshold: { type: "number" },
        session_sample_rate: { type: "number" },
      },
    };
    const query = getGleanInvestigationQuery(
      "object",
      "fenix.metrics",
      "metrics.object.server_knobs_config",
      undefined,
      structure
    );

    // Scalar leaves become concrete JSON_VALUE options.
    expect(query).toContain(
      "-- JSON_VALUE(metrics.object.server_knobs_config, '$.event_threshold') AS event_threshold,"
    );
    expect(query).toContain(
      "-- JSON_VALUE(metrics.object.server_knobs_config, '$.session_sample_rate') AS session_sample_rate,"
    );
    // Map (key/value) fields are skipped and called out.
    expect(query).not.toContain("metrics_enabled");
    expect(query).toContain("map (key/value) fields");
  });

  it("recurses into nested objects and aliases by the full path", () => {
    const structure = {
      type: "object",
      properties: {
        settings: {
          type: "object",
          properties: { enabled: { type: "boolean" } },
        },
      },
    };
    const query = getGleanInvestigationQuery(
      "object",
      "fenix.metrics",
      "metrics.object.config",
      undefined,
      structure
    );
    expect(query).toContain(
      "-- JSON_VALUE(metrics.object.config, '$.settings.enabled') AS settings_enabled,"
    );
  });

  it("treats a oneOf field as a scalar JSON_VALUE path", () => {
    // Glean object metrics allow `oneOf`, whose subtypes are restricted to
    // scalars (string/number/boolean), so it is JSON_VALUE-extractable.
    const structure = {
      type: "object",
      properties: {
        state: {
          type: "oneOf",
          subtypes: [{ type: "string" }, { type: "number" }],
        },
      },
    };
    const query = getGleanInvestigationQuery(
      "object",
      "fenix.metrics",
      "metrics.object.config",
      undefined,
      structure
    );
    expect(query).toContain(
      "-- JSON_VALUE(metrics.object.config, '$.state') AS state,"
    );
  });

  it("hints at UNNEST for object metrics whose structure is a JSON array", () => {
    // Shape of glean.health.data_directory_info.
    const structure = {
      type: "array",
      items: {
        type: "object",
        properties: { dir_name: { type: "string" } },
      },
    };
    const query = getGleanInvestigationQuery(
      "object",
      "fenix.metrics",
      "metrics.object.data_directory_info",
      undefined,
      structure
    );
    expect(query).toContain(
      "JSON_QUERY_ARRAY(metrics.object.data_directory_info)"
    );
  });

  it("falls back to a generic JSON_VALUE hint when no structure is available", () => {
    const query = getGleanInvestigationQuery(
      "object",
      "fenix.metrics",
      "metrics.object.some_object",
      undefined
    );
    expect(query).not.toMatch(/^ {2}metrics\.object\.some_object,$/m);
    expect(query).toContain(
      "JSON_VALUE(metrics.object.some_object, '$.field')"
    );
  });

  it("targets events_stream and filters by event for an event metric", () => {
    const query = getGleanInvestigationQuery(
      "event",
      "fenix.events",
      "events",
      {
        category: "activation",
        name: "identifier",
      }
    );

    expect(query).toContain("fenix.events_stream AS m");
    expect(query).toContain("AND event = 'activation.identifier'");
    // Still slices across the same diagnostic dimensions.
    expect(query).toContain("metadata.geo.country");
  });
});
