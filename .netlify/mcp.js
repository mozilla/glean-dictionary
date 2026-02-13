/**
 * Netlify Function handler for Glean Dictionary MCP Server
 * Implements MCP JSON-RPC protocol for discovering Glean telemetry metadata.
 */

const { submitTelemetryEvent } = require("./telemetry");

const PROBEINFO_BASE_URL = "https://probeinfo.telemetry.mozilla.org";
const ANNOTATIONS_URL = "https://mozilla.github.io/glean-annotations/api.json";

// Cache for annotations (shared across invocations in same instance)
let cachedAnnotations = null;

// MCP client info captured during initialize
let mcpClientName = null;
let mcpClientVersion = null;

/**
 * Fetch JSON from a URL
 */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `API error: ${response.status} ${response.statusText} for ${url}`
    );
  }
  return response.json();
}

/**
 * Get annotations index (cached)
 */
async function getAnnotations() {
  if (cachedAnnotations) return cachedAnnotations;
  try {
    cachedAnnotations = await fetchJson(ANNOTATIONS_URL);
    return cachedAnnotations;
  } catch {
    return {};
  }
}

/**
 * Get all app listings from probeinfo
 */
async function getAppListings() {
  return fetchJson(`${PROBEINFO_BASE_URL}/v2/glean/app-listings`);
}

/**
 * Find app by name
 */
async function findApp(appName) {
  const apps = await getAppListings();
  // Try exact match
  let app = apps.find((a) => a.app_name === appName);
  if (app) return app;
  // Try case-insensitive
  app = apps.find((a) => a.app_name.toLowerCase() === appName.toLowerCase());
  return app || null;
}

/**
 * Get v1 API identifier for an app
 */
function getV1AppId(app) {
  return app.v1_name;
}

/**
 * Get metrics for an app
 */
async function getMetrics(appName) {
  const app = await findApp(appName);
  if (!app) throw new Error(`App not found: ${appName}`);
  return fetchJson(`${PROBEINFO_BASE_URL}/glean/${getV1AppId(app)}/metrics`);
}

/**
 * Get pings for an app
 */
async function getPings(appName) {
  const app = await findApp(appName);
  if (!app) throw new Error(`App not found: ${appName}`);
  return fetchJson(`${PROBEINFO_BASE_URL}/glean/${getV1AppId(app)}/pings`);
}

/**
 * Get tags for an app
 */
async function getTags(appName) {
  const app = await findApp(appName);
  if (!app) throw new Error(`App not found: ${appName}`);
  try {
    return await fetchJson(
      `${PROBEINFO_BASE_URL}/glean/${getV1AppId(app)}/tags`
    );
  } catch {
    return {};
  }
}

// ============================================================================
// Tool implementations
// ============================================================================

async function listApps({ include_deprecated = false } = {}) {
  const [appListings, annotations] = await Promise.all([
    getAppListings(),
    getAnnotations(),
  ]);

  const appsByName = new Map();
  for (const app of appListings) {
    if (app.deprecated && !include_deprecated) continue;
    if (appsByName.has(app.app_name)) continue;

    const annotation = annotations[app.app_name]?.app;
    appsByName.set(app.app_name, {
      app_name: app.app_name,
      app_description: app.app_description,
      canonical_app_name: app.canonical_app_name,
      deprecated: app.deprecated || false,
      featured: annotation?.featured,
      url: app.url,
    });
  }

  const apps = Array.from(appsByName.values());
  apps.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.app_name.localeCompare(b.app_name);
  });

  return apps;
}

async function getApp({ app_name }) {
  const app = await findApp(app_name);
  if (!app)
    throw new Error(
      `App not found: ${app_name}. Use list_apps to see available apps.`
    );

  const [appListings, metrics, pings, tags, annotations] = await Promise.all([
    getAppListings(),
    getMetrics(app_name),
    getPings(app_name),
    getTags(app_name),
    getAnnotations(),
  ]);

  const appIds = appListings
    .filter((a) => a.app_name === app.app_name)
    .map((a) => ({
      app_id: a.app_id,
      channel: a.app_channel || "release",
      deprecated: a.deprecated || false,
    }));

  const pingSummaries = Object.entries(pings).map(([name, def]) => {
    const latest = def.history?.[def.history.length - 1] || def;
    return {
      name,
      description: latest.description || def.description,
      include_client_id: latest.include_client_id ?? def.include_client_id,
    };
  });

  const tagSummaries = Object.entries(tags).map(([name, def]) => ({
    name,
    description: def.description,
  }));

  const annotation = annotations[app_name]?.app;

  return {
    app_name: app.app_name,
    app_description: app.app_description,
    canonical_app_name: app.canonical_app_name,
    deprecated: app.deprecated || false,
    featured: annotation?.featured,
    url: app.url,
    notification_emails: app.notification_emails,
    app_ids: appIds,
    metrics_count: Object.keys(metrics).length,
    pings: pingSummaries,
    tags: tagSummaries,
    annotation,
  };
}

async function searchMetrics({
  app_name,
  query,
  type,
  include_expired = false,
  limit = 50,
  offset = 0,
}) {
  const metrics = await getMetrics(app_name);

  let results = [];
  for (const [name, def] of Object.entries(metrics)) {
    const latest = def.history?.[def.history.length - 1] || def;
    const metricType = latest.type || def.type;
    const description = latest.description || def.description;
    const expires = latest.expires || def.expires;
    const sendInPings = latest.send_in_pings || def.send_in_pings;

    // Filter expired
    if (!include_expired && expires !== "never" && expires) {
      try {
        if (new Date() > new Date(expires)) continue;
      } catch {}
    }

    // Filter by type
    if (type && metricType !== type) continue;

    // Filter by query
    if (query) {
      const searchText = `${name} ${description}`.toLowerCase();
      if (!searchText.includes(query.toLowerCase())) continue;
    }

    results.push({
      name,
      type: metricType,
      description,
      expires,
      send_in_pings: sendInPings,
    });
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  const total = results.length;
  results = results.slice(offset, offset + limit);

  return { metrics: results, total, limit, offset };
}

async function getMetricDetails({ app_name, metric_name }) {
  const [metrics, annotations] = await Promise.all([
    getMetrics(app_name),
    getAnnotations(),
  ]);

  const metric = metrics[metric_name];
  if (!metric)
    throw new Error(`Metric not found: ${metric_name} in app ${app_name}`);

  const latest = metric.history?.[metric.history.length - 1] || metric;
  const annotation = annotations[app_name]?.metrics?.[metric_name];

  return {
    app_name,
    name: metric_name,
    type: latest.type || metric.type,
    description: latest.description || metric.description,
    expires: latest.expires || metric.expires,
    bugs: latest.bugs || metric.bugs,
    data_reviews: latest.data_reviews || metric.data_reviews,
    notification_emails:
      latest.notification_emails || metric.notification_emails,
    send_in_pings: latest.send_in_pings || metric.send_in_pings,
    lifetime: latest.lifetime || metric.lifetime,
    extra_keys: latest.extra_keys || metric.extra_keys,
    labels: latest.labels || metric.labels,
    data_sensitivity: latest.data_sensitivity || metric.data_sensitivity,
    annotation,
  };
}

async function getPingDetails({ app_name, ping_name }) {
  const [pings, metrics, annotations] = await Promise.all([
    getPings(app_name),
    getMetrics(app_name),
    getAnnotations(),
  ]);

  const ping = pings[ping_name];
  if (!ping) throw new Error(`Ping not found: ${ping_name} in app ${app_name}`);

  const latest = ping.history?.[ping.history.length - 1] || ping;

  // Find metrics in this ping
  const metricsInPing = [];
  for (const [name, def] of Object.entries(metrics)) {
    const metricLatest = def.history?.[def.history.length - 1] || def;
    const sendInPings = metricLatest.send_in_pings || def.send_in_pings;
    // Check for ping name or "all pings" variants (all-pings, all_pings, glean_client_info, glean_internal_info)
    const allPingsKeywords = [
      "all-pings",
      "all_pings",
      "glean_client_info",
      "glean_internal_info",
    ];
    if (
      sendInPings.includes(ping_name) ||
      allPingsKeywords.some((kw) => sendInPings.includes(kw))
    ) {
      metricsInPing.push({
        name,
        type: metricLatest.type || def.type,
        description: metricLatest.description || def.description,
      });
    }
  }
  metricsInPing.sort((a, b) => a.name.localeCompare(b.name));

  const annotation = annotations[app_name]?.pings?.[ping_name];

  return {
    app_name,
    name: ping_name,
    description: latest.description || ping.description,
    include_client_id: latest.include_client_id ?? ping.include_client_id,
    send_if_empty: latest.send_if_empty ?? ping.send_if_empty,
    bugs: latest.bugs || ping.bugs,
    data_reviews: latest.data_reviews || ping.data_reviews,
    reasons: latest.reasons || ping.reasons,
    metrics: metricsInPing,
    annotation,
  };
}

// ============================================================================
// MCP Protocol Handler
// ============================================================================

const TOOLS = [
  {
    name: "list_apps",
    description: "List all Mozilla applications that use Glean telemetry.",
    inputSchema: {
      type: "object",
      properties: {
        include_deprecated: {
          type: "boolean",
          description: "Include deprecated apps (default: false)",
        },
      },
    },
  },
  {
    name: "get_app",
    description:
      "Get detailed information about a Glean application including metrics count, pings, and tags.",
    inputSchema: {
      type: "object",
      properties: {
        app_name: {
          type: "string",
          description: "Application name (e.g., 'firefox_desktop', 'fenix')",
        },
      },
      required: ["app_name"],
    },
  },
  {
    name: "search_metrics",
    description:
      "Search for metrics in a Glean application by name or description.",
    inputSchema: {
      type: "object",
      properties: {
        app_name: {
          type: "string",
          description: "Application name to search within",
        },
        query: { type: "string", description: "Text to search for" },
        type: {
          type: "string",
          description: "Filter by metric type (counter, event, boolean, etc.)",
        },
        include_expired: {
          type: "boolean",
          description: "Include expired metrics (default: false)",
        },
        limit: { type: "number", description: "Max results (default: 50)" },
        offset: {
          type: "number",
          description: "Pagination offset (default: 0)",
        },
      },
      required: ["app_name"],
    },
  },
  {
    name: "get_metric",
    description: "Get the complete definition of a specific metric.",
    inputSchema: {
      type: "object",
      properties: {
        app_name: { type: "string", description: "Application name" },
        metric_name: {
          type: "string",
          description:
            "Metric identifier (e.g., 'browser.engagement.active_ticks')",
        },
      },
      required: ["app_name", "metric_name"],
    },
  },
  {
    name: "get_ping",
    description:
      "Get detailed information about a ping including all metrics it contains.",
    inputSchema: {
      type: "object",
      properties: {
        app_name: { type: "string", description: "Application name" },
        ping_name: {
          type: "string",
          description: "Ping name (e.g., 'baseline', 'metrics', 'events')",
        },
      },
      required: ["app_name", "ping_name"],
    },
  },
];

async function handleToolCall(name, args) {
  switch (name) {
    case "list_apps":
      return listApps(args);
    case "get_app":
      return getApp(args);
    case "search_metrics":
      return searchMetrics(args);
    case "get_metric":
      return getMetricDetails(args);
    case "get_ping":
      return getPingDetails(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleJsonRpc(request) {
  // Validate request structure
  if (!request || typeof request !== "object") {
    return {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: invalid JSON" },
    };
  }

  if (typeof request.method !== "string") {
    return {
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: {
        code: -32600,
        message: "Invalid request: method must be a string",
      },
    };
  }

  const { id, method, params } = request;

  console.log("MCP request params:", JSON.stringify(params, null, 2));

  switch (method) {
    case "initialize":
      mcpClientName = params?.clientInfo?.name || null;
      mcpClientVersion = params?.clientInfo?.version || null;
      await submitTelemetryEvent("mcp", "initialize", {
        client_name: mcpClientName,
        client_version: mcpClientVersion,
      });
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "glean-dictionary", version: "1.0.0" },
          capabilities: { tools: {} },
        },
      };

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call":
      try {
        const result = await handleToolCall(
          params.name,
          params.arguments || {}
        );
        await submitTelemetryEvent("mcp", "tool_call", {
          tool_name: params.name,
          app_name: (params.arguments || {}).app_name,
          success: "true",
        });
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          },
        };
      } catch (error) {
        await submitTelemetryEvent("mcp", "tool_call", {
          tool_name: params.name,
          app_name: (params.arguments || {}).app_name,
          success: "false",
        });
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              { type: "text", text: JSON.stringify({ error: error.message }) },
            ],
            isError: true,
          },
        };
      }

    case "notifications/initialized":
      return { jsonrpc: "2.0", id };

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

// ============================================================================
// Netlify Function Export
// ============================================================================

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Only POST accepted" },
        id: null,
      }),
    };
  }

  try {
    const request = JSON.parse(event.body);
    const response = await handleJsonRpc(request);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: error.message },
        id: null,
      }),
    };
  }
};
