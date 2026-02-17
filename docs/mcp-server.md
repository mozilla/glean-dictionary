# Glean Dictionary MCP Server

An MCP (Model Context Protocol) server that exposes Mozilla's Glean telemetry
metadata to AI assistants like Claude.

## Why MCP?

The Glean Dictionary is a Single Page Application (SPA) - metrics are loaded
dynamically via JavaScript. Web scraping tools and AI web fetchers only see an
empty HTML shell, not the actual content. The MCP server provides direct,
structured API access to the underlying telemetry metadata.

## Endpoint

```
https://dictionary.telemetry.mozilla.org/mcp
```

## Tools

| Tool             | Description                                           |
| ---------------- | ----------------------------------------------------- |
| `list_apps`      | List all Glean applications (~50 apps)                |
| `get_app`        | Get app details: metrics count, pings, tags, channels |
| `search_metrics` | Search metrics by name/description with pagination    |
| `get_metric`     | Get full metric definition with annotations           |
| `get_ping`       | Get ping details and all metrics it contains          |

## Example Queries

Once connected, you can ask Claude:

- "What metrics does Firefox Desktop collect about search?"
- "Show me all event metrics in Fenix"
- "What's in the baseline ping for Firefox iOS?"
- "List all deprecated Glean applications"

## Local Testing

1. Start the dev server:

   ```bash
   npx netlify dev
   ```

2. Test the endpoint:

   ```bash
   # List available tools
   curl -X POST http://localhost:8888/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

   # List apps
   curl -X POST http://localhost:8888/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_apps","arguments":{}}}'

   # Search metrics
   curl -X POST http://localhost:8888/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_metrics","arguments":{"app_name":"fenix","query":"startup"}}}'
   ```

3. Connect Claude Code locally:

   ```bash
   claude mcp add --transport http glean-dictionary-local http://localhost:8888/mcp
   ```

4. After deployment, connect to production:
   ```bash
   claude mcp add --transport http glean-dictionary https://dictionary.telemetry.mozilla.org/mcp
   ```

## Telemetry

The MCP server sends lightweight Glean telemetry to track usage. We can't use
the Glean JS SDK because `@mozilla/glean` only ships browser bundles — there's
no Node.js entry point. Instead, we handcraft a minimal events ping and POST it
directly to the ingestion endpoint (see `.netlify/telemetry.js`).

**Events:**

| Event            | Extras                             | Description                    |
| ---------------- | ---------------------------------- | ------------------------------ |
| `mcp.initialize` | `client_name`, `client_version`    | Fired on each MCP `initialize` |
| `mcp.tool_call`  | `tool_name`, `app_name`, `success` | Fired on each `tools/call`     |

Pings are submitted under the same `glean_dictionary` app ID as the frontend,
with `app_channel` set from the Netlify `CONTEXT` env var (`production`,
`deploy-preview`, or `development`).

**Environment variables** (all optional):

| Variable               | Default                                  | Description                             |
| ---------------------- | ---------------------------------------- | --------------------------------------- |
| `GLEAN_APPLICATION_ID` | `glean-dictionary-dev`                   | App ID in the submission URL            |
| `GLEAN_INGESTION_URL`  | `https://incoming.telemetry.mozilla.org` | Ingestion endpoint                      |
| `GLEAN_DEBUG_VIEW_TAG` | _(unset)_                                | Adds `X-Debug-ID` header for debug view |
| `CONTEXT`              | _(unset)_                                | Netlify build context → `app_channel`   |

**Debug pings locally:**

```bash
GLEAN_DEBUG_VIEW_TAG=mcp-test npx netlify dev
```

Then check https://debug-ping-preview.firebaseapp.com/pings/mcp-test after
making MCP calls.

## Data Sources

- **Probeinfo API**: `probeinfo.telemetry.mozilla.org` - metrics, pings, apps
- **Glean Annotations**: `mozilla.github.io/glean-annotations` - commentary and
  warnings
