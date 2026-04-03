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
- detect `$ref` cycles with a visited-set
- when a cycle edge is encountered, substitute `{}` at that edge, emit a structured warning that includes the ref path, and continue loading the registry entry
- maximum traversal depth: 32
- reject resolved schemas above 64 KiB
- provider-specific rewrites are deterministic and explicit. At minimum, compatibility bridges rewrite Gemini-family `anyOf` unions to `oneOf` when the target dialect rejects `anyOf`, strip `const` when the target surface does not permit it, and emit a structured warning that records each rewrite path and rewrite class.
- malformed or rejected schema output becomes a structured `mcp_schema_mismatch` diagnostic; it MUST NOT crash the registry

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

Cycle handling is intentionally lossy-but-safe: PM preserves registry availability and explicit warning visibility rather than recursing indefinitely or silently omitting the affected tool.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md

OAuth and client state is keyed by provider plus scope, not by a transient per-call or per-server instance. Refresh and token-write paths use compare-and-swap or other atomic update semantics so successful callbacks are not immediately clobbered by a second writer.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

OAuth callback listeners for MCP and other local callback flows bind only to `127.0.0.1`. If the configured callback port is unavailable, PM retries with an ephemeral loopback port. If loopback binding cannot be started, PM falls back to manual copy-paste or device-code flow rather than widening the bind host.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

Stable OAuth client identity is mandatory for MCP and other locally registered callback flows:
- dynamic client registrations or local OAuth client identifiers are keyed by `(provider_id, scope_set)` and reused across refresh/login attempts for that logical provider surface
- one shared local HTTP listener services callback flows for the same local auth environment; MCP servers that use the same provider/scope tuple MUST reuse that listener instead of minting parallel per-server listeners
- concurrent auth attempts share the same stored registration under file locking or equivalent compare-and-swap protection; PM MUST NOT mint a new client identifier on every callback attempt
- callback listeners may rebind ports when necessary, but listener replacement MUST NOT change client identity, token ownership, or provider/scope keying

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md
### Windows MCP subprocess behavior

Windows stdio MCP processes MUST be started with `CREATE_NEW_PROCESS_GROUP`. Graceful stop uses `CTRL_BREAK_EVENT`; if the process does not exit within 3 seconds, PM escalates to force termination.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

