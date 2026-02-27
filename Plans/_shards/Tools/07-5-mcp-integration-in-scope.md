## 5. MCP integration (in scope)

MCP is **in scope** for this document: MCP-discovered tools are first-class entries in the central tool registry and subject to the same permission model. Per-platform MCP config paths, GUI (Context7, cited web search), and server lifecycle are in **newtools.md** (§8) and AGENTS.md; here we define integration with the registry and policy.

### 5.1 Registry and policy

- **Discovery:** When a run starts, the runner (or Provider) discovers MCP tools from the platform's MCP config (injected from GUI/config per newtools §8). Each MCP tool is **registered** in the central registry with a stable name (e.g. server name + tool name, or a normalized id).
- **Permission model:** MCP tools use the same allow/deny/ask. Wildcards apply: e.g. `context7_*: allow`, `websearch_cited: ask`. Deny takes precedence.
- **Normalization:** MCP tool invocations and results are normalized into the same event model as built-in tools (seglog), so analytics (latency, error rate) and dashboard rollups include MCP tools.

### 5.2 Naming and precedence

- **Name collisions:** If an MCP tool has the same name as a built-in (e.g. `read`), policy must define precedence (e.g. built-in wins, or namespace: `mcp_context7_read`). Prefer namespacing MCP tools by server so that `mymcp_*` wildcards work.
- **Visibility:** Only tools from **enabled** MCP servers (per run config) appear in the registry for that run. Disabling Context7 in GUI should remove Context7 tools from the set the agent can see.

### 5.3 Where MCP is specified elsewhere

- **Config paths, GUI, Context7, cited web search:** newtools.md §8, §8.1, §8.2, §8.2.1.
- **Platform CLI flags and config format:** AGENTS.md; §7 below (compact table).

---

