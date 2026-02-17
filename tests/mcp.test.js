/**
 * Tests for MCP server JSON-RPC handler
 */

// Mock global fetch before requiring the module
global.fetch = jest.fn();

// Require the handler (CommonJS module)
const { handler } = require("../.netlify/mcp");

// Helper to create HTTP events
function createEvent(method, body) {
  return {
    httpMethod: method,
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

// Helper to call handler and parse response
async function callHandler(method, body) {
  const event = createEvent(method, body);
  const response = await handler(event);
  return {
    ...response,
    parsedBody: response.body ? JSON.parse(response.body) : null,
  };
}

describe("MCP Server HTTP handling", () => {
  it("handles OPTIONS requests for CORS preflight", async () => {
    const response = await callHandler("OPTIONS", "");
    expect(response.statusCode).toBe(204);
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(response.headers["Access-Control-Allow-Methods"]).toContain("POST");
  });

  it("rejects non-POST methods", async () => {
    const response = await callHandler("GET", "");
    expect(response.statusCode).toBe(405);
    expect(response.parsedBody.error.code).toBe(-32600);
    expect(response.parsedBody.error.message).toContain("POST");
  });

  it("handles malformed JSON in request body", async () => {
    const response = await callHandler("POST", "not valid json");
    expect(response.statusCode).toBe(500);
    expect(response.parsedBody.error.code).toBe(-32603);
    expect(response.parsedBody.id).toBeNull();
  });
});

describe("MCP Server request validation", () => {
  it("handles null request", async () => {
    const response = await callHandler("POST", null);
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.error.code).toBe(-32700);
    expect(response.parsedBody.error.message).toContain("invalid JSON");
    expect(response.parsedBody.id).toBeNull();
  });

  it("handles request with missing method", async () => {
    const response = await callHandler("POST", { jsonrpc: "2.0", id: 123 });
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.error.code).toBe(-32600);
    expect(response.parsedBody.error.message).toContain(
      "method must be a string"
    );
    expect(response.parsedBody.id).toBe(123);
  });

  it("handles request with non-string method", async () => {
    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 456,
      method: 123,
    });
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.error.code).toBe(-32600);
    expect(response.parsedBody.error.message).toContain(
      "method must be a string"
    );
    expect(response.parsedBody.id).toBe(456);
  });

  it("handles unknown methods", async () => {
    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 789,
      method: "unknown/method",
    });
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.error.code).toBe(-32601);
    expect(response.parsedBody.error.message).toContain("Method not found");
  });
});

describe("MCP Server protocol methods", () => {
  it("handles initialize request", async () => {
    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
    });
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.id).toBe(1);
    expect(response.parsedBody.result.protocolVersion).toBe("2024-11-05");
    expect(response.parsedBody.result.serverInfo.name).toBe("glean-dictionary");
    expect(response.parsedBody.result.capabilities.tools).toBeDefined();
  });

  it("handles tools/list request", async () => {
    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.id).toBe(2);
    expect(response.parsedBody.result.tools).toBeInstanceOf(Array);
    expect(response.parsedBody.result.tools.length).toBeGreaterThan(0);

    // Verify tool schema structure
    const toolNames = response.parsedBody.result.tools.map((t) => t.name);
    expect(toolNames).toContain("list_apps");
    expect(toolNames).toContain("get_app");
    expect(toolNames).toContain("search_metrics");
    expect(toolNames).toContain("get_metric");
    expect(toolNames).toContain("get_ping");
  });

  it("handles notifications/initialized", async () => {
    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 3,
      method: "notifications/initialized",
    });
    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.id).toBe(3);
  });
});

describe("MCP Server tool calls", () => {
  beforeEach(async () => {
    global.fetch.mockReset();
    // Clear module-level caches between tests
    await callHandler("POST", {
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
    });
    global.fetch.mockReset();
  });

  it("handles tools/call for list_apps", async () => {
    // Mock the API responses
    global.fetch.mockImplementation((url) => {
      if (url.includes("app-listings")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                app_name: "test_app",
                app_description: "Test application",
                canonical_app_name: "Test App",
                deprecated: false,
                url: "https://example.com",
                v1_name: "test-app",
              },
            ]),
        });
      }
      if (url.includes("annotations")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: { name: "list_apps", arguments: {} },
    });

    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.id).toBe(10);
    expect(response.parsedBody.result.content).toBeInstanceOf(Array);
    expect(response.parsedBody.result.content[0].type).toBe("text");

    const resultData = JSON.parse(response.parsedBody.result.content[0].text);
    expect(resultData).toBeInstanceOf(Array);
    expect(resultData[0].app_name).toBe("test_app");
  });

  it("handles tool call errors gracefully", async () => {
    // Mock a failing API
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 11,
      method: "tools/call",
      params: { name: "list_apps", arguments: {} },
    });

    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.id).toBe(11);
    expect(response.parsedBody.result.isError).toBe(true);
    expect(response.parsedBody.result.content[0].type).toBe("text");

    const errorData = JSON.parse(response.parsedBody.result.content[0].text);
    expect(errorData.error).toContain("API error");
  });

  it("handles unknown tool name", async () => {
    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 12,
      method: "tools/call",
      params: { name: "nonexistent_tool", arguments: {} },
    });

    expect(response.statusCode).toBe(200);
    expect(response.parsedBody.id).toBe(12);
    expect(response.parsedBody.result.isError).toBe(true);

    const errorData = JSON.parse(response.parsedBody.result.content[0].text);
    expect(errorData.error).toContain("Unknown tool");
  });
});

describe("MCP Server library dependency resolution", () => {
  beforeEach(async () => {
    global.fetch.mockReset();
    // Clear module-level caches between tests
    await callHandler("POST", {
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
    });
    global.fetch.mockReset();
  });

  function mockFetchForDeps({
    appListings,
    libraryVariants,
    appMetrics = {},
    appPings = {},
    appTags = {},
    depEndpoints = {},
  }) {
    global.fetch.mockImplementation((url) => {
      if (url.includes("app-listings")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(appListings),
        });
      }
      if (url.includes("library-variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(libraryVariants),
        });
      }
      if (url.includes("annotations")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      // Match dependency and app endpoints: /glean/{v1_name}/{type}
      for (const [pattern, data] of Object.entries(depEndpoints)) {
        if (url.includes(pattern)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data),
          });
        }
      }
      // App's own endpoints
      if (url.includes("/glean/test-app/metrics")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(appMetrics),
        });
      }
      if (url.includes("/glean/test-app/pings")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(appPings),
        });
      }
      if (url.includes("/glean/test-app/tags")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(appTags),
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
  }

  const baseAppListings = [
    {
      app_name: "test_app",
      app_description: "Test application",
      canonical_app_name: "Test App",
      deprecated: false,
      url: "https://example.com",
      v1_name: "test-app",
      dependencies: ["glean-core"],
    },
  ];

  const baseLibraryVariants = [
    {
      dependency_name: "glean-core",
      v1_name: "glean-core",
    },
  ];

  it("get_ping resolves library dependency pings", async () => {
    mockFetchForDeps({
      appListings: baseAppListings,
      libraryVariants: baseLibraryVariants,
      appPings: {
        custom_ping: {
          history: [{ description: "App-defined ping" }],
        },
      },
      appMetrics: {},
      depEndpoints: {
        "/glean/glean-core/pings": {
          baseline: {
            history: [
              {
                description: "Baseline ping from glean-core",
                include_client_id: true,
                send_if_empty: false,
                bugs: ["https://bugzilla.mozilla.org/1"],
                data_reviews: ["https://example.com/review"],
                reasons: { dirty_startup: "reason" },
              },
            ],
          },
        },
        "/glean/glean-core/metrics": {
          "glean.baseline.duration": {
            history: [
              {
                type: "timespan",
                description: "Baseline duration",
                send_in_pings: ["baseline"],
              },
            ],
          },
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 20,
      method: "tools/call",
      params: { name: "get_ping", arguments: { app_name: "test_app", ping_name: "baseline" } },
    });

    expect(response.parsedBody.result.isError).toBeUndefined();
    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.name).toBe("baseline");
    expect(result.description).toBe("Baseline ping from glean-core");
    expect(result.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "glean.baseline.duration" }),
      ])
    );
  });

  it("get_app includes library dependency pings and metrics", async () => {
    mockFetchForDeps({
      appListings: baseAppListings,
      libraryVariants: baseLibraryVariants,
      appPings: {
        events: { history: [{ description: "Events ping" }] },
      },
      appMetrics: {
        "app.metric": {
          history: [{ type: "counter", description: "App metric", send_in_pings: ["events"] }],
        },
      },
      depEndpoints: {
        "/glean/glean-core/pings": {
          baseline: { history: [{ description: "Baseline ping" }] },
        },
        "/glean/glean-core/metrics": {
          "glean.baseline.duration": {
            history: [{ type: "timespan", description: "Duration", send_in_pings: ["baseline"] }],
          },
        },
        "/glean/glean-core/tags": {},
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 21,
      method: "tools/call",
      params: { name: "get_app", arguments: { app_name: "test_app" } },
    });

    const result = JSON.parse(response.parsedBody.result.content[0].text);
    const pingNames = result.pings.map((p) => p.name);
    expect(pingNames).toContain("baseline");
    expect(pingNames).toContain("events");
    expect(result.metrics_count).toBe(2);
  });

  it("search_metrics finds library dependency metrics", async () => {
    mockFetchForDeps({
      appListings: baseAppListings,
      libraryVariants: baseLibraryVariants,
      appMetrics: {},
      depEndpoints: {
        "/glean/glean-core/metrics": {
          "glean.baseline.duration": {
            history: [
              {
                type: "timespan",
                description: "Baseline duration",
                expires: "never",
                send_in_pings: ["baseline"],
              },
            ],
          },
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 22,
      method: "tools/call",
      params: {
        name: "search_metrics",
        arguments: { app_name: "test_app", query: "glean.baseline" },
      },
    });

    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.total).toBeGreaterThan(0);
    expect(result.metrics[0].name).toBe("glean.baseline.duration");
  });

  it("app metrics take precedence over library metrics", async () => {
    mockFetchForDeps({
      appListings: baseAppListings,
      libraryVariants: baseLibraryVariants,
      appMetrics: {
        "glean.baseline.duration": {
          history: [
            {
              type: "timespan",
              description: "App override of duration",
              expires: "never",
              send_in_pings: ["baseline"],
            },
          ],
        },
      },
      depEndpoints: {
        "/glean/glean-core/metrics": {
          "glean.baseline.duration": {
            history: [
              {
                type: "timespan",
                description: "Library version of duration",
                expires: "never",
                send_in_pings: ["baseline"],
              },
            ],
          },
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 23,
      method: "tools/call",
      params: {
        name: "get_metric",
        arguments: { app_name: "test_app", metric_name: "glean.baseline.duration" },
      },
    });

    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.description).toBe("App override of duration");
  });

  it("get_metric returns a library-only metric", async () => {
    mockFetchForDeps({
      appListings: baseAppListings,
      libraryVariants: baseLibraryVariants,
      appMetrics: {
        "app.clicks": {
          history: [
            { type: "counter", description: "App clicks", expires: "never", send_in_pings: ["events"] },
          ],
        },
      },
      depEndpoints: {
        "/glean/glean-core/metrics": {
          "glean.baseline.duration": {
            history: [
              {
                type: "timespan",
                description: "Baseline duration from library",
                expires: "never",
                send_in_pings: ["baseline"],
              },
            ],
          },
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 30,
      method: "tools/call",
      params: {
        name: "get_metric",
        arguments: { app_name: "test_app", metric_name: "glean.baseline.duration" },
      },
    });

    expect(response.parsedBody.result.isError).toBeUndefined();
    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.name).toBe("glean.baseline.duration");
    expect(result.description).toBe("Baseline duration from library");
    expect(result.type).toBe("timespan");
  });

  it("skips unresolvable dependency names without fallback", async () => {
    mockFetchForDeps({
      appListings: [
        {
          app_name: "test_app",
          app_description: "Test",
          canonical_app_name: "Test",
          deprecated: false,
          url: "https://example.com",
          v1_name: "test-app",
          dependencies: ["unknown-lib-1", "unknown-lib-2"],
        },
      ],
      libraryVariants: baseLibraryVariants,
      appPings: {
        events: { history: [{ description: "App events ping" }] },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 31,
      method: "tools/call",
      params: {
        name: "get_ping",
        arguments: { app_name: "test_app", ping_name: "baseline" },
      },
    });

    // baseline does NOT exist because unknown deps can't be resolved
    expect(response.parsedBody.result.isError).toBe(true);
  });

  it("returns only app data when dependencies array is empty", async () => {
    mockFetchForDeps({
      appListings: [
        {
          app_name: "test_app",
          app_description: "Test",
          canonical_app_name: "Test",
          deprecated: false,
          url: "https://example.com",
          v1_name: "test-app",
          dependencies: [],
        },
      ],
      libraryVariants: baseLibraryVariants,
      appPings: {
        events: { history: [{ description: "App events ping" }] },
      },
      appMetrics: {
        "app.clicks": {
          history: [
            {
              type: "counter",
              description: "App clicks",
              expires: "never",
              send_in_pings: ["events"],
            },
          ],
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 24,
      method: "tools/call",
      params: {
        name: "search_metrics",
        arguments: { app_name: "test_app" },
      },
    });

    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.total).toBe(1);
    expect(result.metrics[0].name).toBe("app.clicks");
  });

  it("returns only app data when dependencies field is undefined", async () => {
    mockFetchForDeps({
      appListings: [
        {
          app_name: "test_app",
          app_description: "Test",
          canonical_app_name: "Test",
          deprecated: false,
          url: "https://example.com",
          v1_name: "test-app",
          // no dependencies field at all
        },
      ],
      libraryVariants: baseLibraryVariants,
      appPings: {
        events: { history: [{ description: "App events ping" }] },
      },
      appMetrics: {
        "app.clicks": {
          history: [
            {
              type: "counter",
              description: "App clicks",
              expires: "never",
              send_in_pings: ["events"],
            },
          ],
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 25,
      method: "tools/call",
      params: {
        name: "search_metrics",
        arguments: { app_name: "test_app" },
      },
    });

    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.total).toBe(1);
    expect(result.metrics[0].name).toBe("app.clicks");
  });

  it("merges metrics from multiple library dependencies", async () => {
    mockFetchForDeps({
      appListings: [
        {
          app_name: "test_app",
          app_description: "Test",
          canonical_app_name: "Test",
          deprecated: false,
          url: "https://example.com",
          v1_name: "test-app",
          dependencies: ["glean-core", "gecko"],
        },
      ],
      libraryVariants: [
        { dependency_name: "glean-core", v1_name: "glean-core" },
        { dependency_name: "gecko", v1_name: "gecko" },
      ],
      appMetrics: {
        "app.clicks": {
          history: [{ type: "counter", description: "App clicks", expires: "never", send_in_pings: ["events"] }],
        },
      },
      depEndpoints: {
        "/glean/glean-core/metrics": {
          "glean.baseline.duration": {
            history: [{ type: "timespan", description: "From glean-core", expires: "never", send_in_pings: ["baseline"] }],
          },
        },
        "/glean/gecko/metrics": {
          "gecko.page.load_time": {
            history: [{ type: "timing_distribution", description: "From gecko", expires: "never", send_in_pings: ["metrics"] }],
          },
        },
      },
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 26,
      method: "tools/call",
      params: {
        name: "search_metrics",
        arguments: { app_name: "test_app" },
      },
    });

    const result = JSON.parse(response.parsedBody.result.content[0].text);
    const names = result.metrics.map((m) => m.name);
    expect(names).toContain("app.clicks");
    expect(names).toContain("glean.baseline.duration");
    expect(names).toContain("gecko.page.load_time");
    expect(result.total).toBe(3);
  });

  it("still returns app data when a dependency fetch fails", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes("app-listings")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                app_name: "test_app",
                app_description: "Test",
                canonical_app_name: "Test",
                deprecated: false,
                url: "https://example.com",
                v1_name: "test-app",
                dependencies: ["glean-core"],
              },
            ]),
        });
      }
      if (url.includes("library-variants")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { dependency_name: "glean-core", v1_name: "glean-core" },
            ]),
        });
      }
      if (url.includes("annotations")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      // App's own metrics succeed
      if (url.includes("/glean/test-app/metrics")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              "app.metric": {
                history: [{ type: "counter", description: "App metric", expires: "never", send_in_pings: ["events"] }],
              },
            }),
        });
      }
      // Dependency metrics fail with 500
      if (url.includes("/glean/glean-core/metrics")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        });
      }
      // Other app endpoints
      if (url.includes("/glean/test-app/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url.includes("/glean/glean-core/")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const response = await callHandler("POST", {
      jsonrpc: "2.0",
      id: 27,
      method: "tools/call",
      params: {
        name: "search_metrics",
        arguments: { app_name: "test_app" },
      },
    });

    expect(response.parsedBody.result.isError).toBeUndefined();
    const result = JSON.parse(response.parsedBody.result.content[0].text);
    expect(result.total).toBe(1);
    expect(result.metrics[0].name).toBe("app.metric");
  });
});
