/**
 * Lightweight Glean telemetry for the MCP server.
 *
 * We can't use the Glean JS SDK here because @mozilla/glean only ships
 * browser bundles — there's no Node.js entry point. Since this runs in
 * a Netlify Function (Node.js), we handcraft a minimal events ping and
 * POST it directly to the ingestion endpoint.
 */

const { randomUUID } = require("crypto");

const DEFAULT_APP_ID = "glean-dictionary-dev";
const DEFAULT_INGESTION_URL = "https://incoming.telemetry.mozilla.org";

/**
 * Map Netlify CONTEXT env var to app_channel.
 */
function getAppChannel() {
  const context = process.env.CONTEXT;
  if (context === "production") return "production";
  if (context === "deploy-preview" || context === "branch-deploy")
    return "deploy-preview";
  return "development";
}

/**
 * Build a Glean events ping payload.
 *
 * @param {Array<Object>} events - Array of event objects with category, name, extra
 * @returns {Object} A valid glean.1 ping payload
 */
function buildPing(events) {
  const now = new Date().toISOString();

  return {
    ping_info: {
      seq: 0,
      start_time: now,
      end_time: now,
    },
    client_info: {
      app_build: "Unknown",
      app_display_version: "1.0.0",
      app_channel: getAppChannel(),
      architecture: "n/a",
      os: "n/a",
      os_version: "n/a",
      telemetry_sdk_build: "glean-mcp/1.0.0",
      first_run_date: now,
      locale: "und",
    },
    events: events.map((event, index) => ({
      category: event.category,
      name: event.name,
      timestamp: index,
      extra: event.extra,
    })),
  };
}

/**
 * Submit a telemetry event to the Glean ingestion endpoint.
 *
 * @param {string} category - Event category (e.g. "mcp")
 * @param {string} name - Event name (e.g. "tool_call")
 * @param {Object} extra - Extra key-value pairs (all string values)
 * @returns {Promise<void>} Resolves silently; never throws.
 */
async function submitTelemetryEvent(category, name, extra = {}) {
  try {
    const appId = process.env.GLEAN_APPLICATION_ID || DEFAULT_APP_ID;
    const ingestionUrl =
      process.env.GLEAN_INGESTION_URL || DEFAULT_INGESTION_URL;
    const debugTag = process.env.GLEAN_DEBUG_VIEW_TAG;

    // Filter out undefined/null extra values
    const cleanExtra = {};
    for (const [k, v] of Object.entries(extra)) {
      if (v != null) {
        cleanExtra[k] = String(v);
      }
    }

    const ping = buildPing([{ category, name, extra: cleanExtra }]);
    const uuid = randomUUID();
    const url = `${ingestionUrl}/submit/${appId}/events/1/${uuid}`;

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      Date: new Date().toUTCString(),
      "X-Telemetry-Agent": "Glean/handcrafted",
    };

    if (debugTag) {
      headers["X-Debug-ID"] = debugTag;
    }

    await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(ping),
    });
  } catch {
    // Telemetry must never break MCP responses — silently ignore all errors.
  }
}

module.exports = { submitTelemetryEvent, buildPing };
