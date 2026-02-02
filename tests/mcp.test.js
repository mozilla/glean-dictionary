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
  beforeEach(() => {
    // Reset fetch mock
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
