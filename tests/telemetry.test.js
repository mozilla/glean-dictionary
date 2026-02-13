/**
 * Tests for the telemetry module — validates ping payloads against the
 * official Glean ping schema (glean.1.schema.json).
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const draft06MetaSchema = require("ajv/dist/refs/json-schema-draft-06.json");
const nodeFetch = require("node-fetch");

// Mock global fetch before requiring the module
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, status: 200, statusText: "OK" })
);

const { submitTelemetryEvent, buildPing } = require("../.netlify/telemetry");
const gleanSchema = require("./fixtures/glean.1.schema.json");

// Set up AJV with draft-06 support (strict: false for custom keywords like mozPipelineMetadata)
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addMetaSchema(draft06MetaSchema);
const validate = ajv.compile(gleanSchema);

describe("Glean ping schema validation", () => {
  it("produces a valid ping with all extras", () => {
    const ping = buildPing([
      {
        category: "mcp",
        name: "tool_call",
        extra: {
          tool_name: "get_app",
          app_name: "fenix",
          success: "true",
          client_name: "claude-code",
        },
      },
    ]);

    const valid = validate(ping);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("produces a valid ping with minimal extras", () => {
    const ping = buildPing([
      {
        category: "mcp",
        name: "tool_call",
        extra: { tool_name: "list_apps", success: "true" },
      },
    ]);

    const valid = validate(ping);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("produces a valid ping with no extras", () => {
    const ping = buildPing([
      {
        category: "mcp",
        name: "initialize",
        extra: {},
      },
    ]);

    const valid = validate(ping);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("includes required client_info fields", () => {
    const ping = buildPing([
      { category: "mcp", name: "tool_call", extra: { tool_name: "get_app" } },
    ]);

    const requiredFields = [
      "app_build",
      "app_display_version",
      "architecture",
      "first_run_date",
      "os",
      "os_version",
      "telemetry_sdk_build",
    ];

    requiredFields.forEach((field) => {
      expect(ping.client_info).toHaveProperty(field);
      expect(typeof ping.client_info[field]).toBe("string");
    });
  });

  it("includes required ping_info fields", () => {
    const ping = buildPing([
      { category: "mcp", name: "tool_call", extra: { tool_name: "get_app" } },
    ]);

    expect(ping.ping_info).toHaveProperty("seq");
    expect(typeof ping.ping_info.seq).toBe("number");
    expect(ping.ping_info).toHaveProperty("start_time");
    expect(ping.ping_info).toHaveProperty("end_time");
  });

  it("event structure matches expected shape", () => {
    const ping = buildPing([
      {
        category: "mcp",
        name: "tool_call",
        extra: { tool_name: "search_metrics", success: "false" },
      },
    ]);

    expect(ping.events).toHaveLength(1);
    const event = ping.events[0];
    expect(event.category).toBe("mcp");
    expect(event.name).toBe("tool_call");
    expect(event.timestamp).toBe(0);
    expect(event.extra.tool_name).toBe("search_metrics");
    expect(event.extra.success).toBe("false");
  });
});

describe("submitTelemetryEvent", () => {
  beforeEach(() => {
    global.fetch.mockClear();
    // Reset env vars
    delete process.env.GLEAN_APPLICATION_ID;
    delete process.env.GLEAN_INGESTION_URL;
    delete process.env.GLEAN_DEBUG_VIEW_TAG;
    delete process.env.CONTEXT;
  });

  it("POSTs to the correct ingestion URL", async () => {
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "list_apps",
      success: "true",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(
      /^https:\/\/incoming\.telemetry\.mozilla\.org\/submit\/glean-dictionary-dev\/events\/1\//
    );
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(options.headers["X-Telemetry-Agent"]).toBe("Glean/handcrafted");
  });

  it("uses custom app ID from environment", async () => {
    process.env.GLEAN_APPLICATION_ID = "glean-dictionary";
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "get_app",
      success: "true",
    });

    const [url] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/submit\/glean-dictionary\/events\/1\//);
  });

  it("uses custom ingestion URL from environment", async () => {
    process.env.GLEAN_INGESTION_URL = "https://custom.endpoint.example";
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "get_app",
      success: "true",
    });

    const [url] = global.fetch.mock.calls[0];
    expect(url).toMatch(/^https:\/\/custom\.endpoint\.example\/submit\//);
  });

  it("adds X-Debug-ID header when GLEAN_DEBUG_VIEW_TAG is set", async () => {
    process.env.GLEAN_DEBUG_VIEW_TAG = "mcp-test";
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "list_apps",
      success: "true",
    });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers["X-Debug-ID"]).toBe("mcp-test");
  });

  it("does not add X-Debug-ID header when GLEAN_DEBUG_VIEW_TAG is not set", async () => {
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "list_apps",
      success: "true",
    });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers["X-Debug-ID"]).toBeUndefined();
  });

  it("filters out null/undefined extra values", async () => {
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "list_apps",
      app_name: null,
      client_name: undefined,
      success: "true",
    });

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.events[0].extra).toEqual({
      tool_name: "list_apps",
      success: "true",
    });
  });

  it("never throws even when fetch fails", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    // Should not throw
    await expect(
      submitTelemetryEvent("mcp", "tool_call", {
        tool_name: "list_apps",
        success: "true",
      })
    ).resolves.toBeUndefined();
  });

  it("sends a schema-valid payload", async () => {
    await submitTelemetryEvent("mcp", "tool_call", {
      tool_name: "get_metric",
      app_name: "firefox_desktop",
      success: "true",
      client_name: "claude-code",
    });

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    const valid = validate(body);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("maps CONTEXT=production to app_channel production", async () => {
    process.env.CONTEXT = "production";
    await submitTelemetryEvent("mcp", "initialize", {});

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.client_info.app_channel).toBe("production");
  });

  it("maps CONTEXT=deploy-preview to app_channel deploy-preview", async () => {
    process.env.CONTEXT = "deploy-preview";
    await submitTelemetryEvent("mcp", "initialize", {});

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.client_info.app_channel).toBe("deploy-preview");
  });

  it("defaults app_channel to development when CONTEXT is unset", async () => {
    await submitTelemetryEvent("mcp", "initialize", {});

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.client_info.app_channel).toBe("development");
  });
});

describe("Glean schema freshness", () => {
  const SCHEMA_URL =
    "https://raw.githubusercontent.com/mozilla-services/mozilla-pipeline-schemas/generated-schemas/schemas/glean/glean/glean.1.schema.json";
  const LOCAL_SCHEMA_PATH = path.resolve(
    __dirname,
    "fixtures/glean.1.schema.json"
  );

  it("local schema matches upstream mozilla-pipeline-schemas", async () => {
    const response = await nodeFetch(SCHEMA_URL);
    expect(response.ok).toBe(true);
    const upstream = await response.json();

    const local = JSON.parse(fs.readFileSync(LOCAL_SCHEMA_PATH, "utf-8"));
    expect(local).toEqual(upstream);
  });
});
