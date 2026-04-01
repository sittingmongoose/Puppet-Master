## 5. MCP integration (in scope)

MCP tools enter the central tool registry and permission model. MCP server lifecycle is PM-owned.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md

### Spawn policy (lazy-load)

MCP servers MUST be spawned on the first tool call that requires them, never at PM startup. A startup timeout does not mark the server permanently broken; it marks the server `degraded` and starts a background readiness probe.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

### Startup, listTools, and stale-list behavior

- `startup_timeout_ms`: `10000` by default.
- On timeout, the server becomes `degraded`; PM retries one readiness probe in the background before treating the server as `unavailable` until user action.
- `listTools()` retries 3 times with 1-second backoff.
- If retries fail and a prior tool list exists, PM keeps the last-known tool list marked `stale`; a transient list failure MUST NOT permanently delete the server from the registry.
- Refresh triggers: explicit user refresh, config change, or periodic TTL refresh every 5 minutes.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Connection model

Each stdio server uses one persistent subprocess connection pool per configured server. PM MUST NOT spawn a new subprocess per tool call. HTTP/SSE MCP servers use a persistent client/session per endpoint.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

### Schema isolation and OAuth state

MCP schema handling is fail-safe:
- Detect `$ref` cycles with a visited-set.
- Maximum traversal depth: 32.
- Reject resolved schemas above 64 KiB.
- Provider-specific sanitizers MAY rewrite unsupported forms (for example Gemini-family `anyOf -> oneOf`, stripping unsupported `const` or encoding metadata) before presentation.
- Malformed schema output becomes a structured `mcp_schema_mismatch` diagnostic; it MUST NOT crash the registry.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md

OAuth/client state is keyed by provider + scope, not by a transient per-call server instance. Refresh and token-write paths use compare-and-swap / atomic update semantics so successful callbacks are not immediately clobbered by a second writer.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md

### Windows MCP subprocess behavior

Windows stdio MCP processes MUST be started with `CREATE_NEW_PROCESS_GROUP`. Graceful stop uses `CTRL_BREAK_EVENT`; if the process does not exit within 3 seconds, PM escalates to force termination.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

