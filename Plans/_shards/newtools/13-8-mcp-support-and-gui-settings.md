## 8. MCP Support and GUI Settings

### 8.1 MCP settings in the GUI

Add **MCP settings** to the Config view so users can enable and configure MCP servers used by catalog tools and by the interview (e.g. Context7, Browser MCP). Placement: a new subsection **Config → MCP** (or under **Advanced → MCP / Tools**) so all MCP-related controls live in one place. Use the same GuiConfig and Option B run-config build as other tabs so one Save persists MCP settings.

**Context7 (default on, API key, toggle off):**

- **Context7 (enabled by default; secret stored securely):**
  - Context7 enablement is stored as **non-secret** config: `mcp.context7.enabled: bool` (default `true`).
  - The **API key value** MUST be stored **only** in the OS credential store (masked input in UI; never written to YAML/redb/seglog/evidence/state files).
  - UI actions:
    - `Save key` → write to credential store SecretId `pm.secret.mcp.context7.api_key`
    - `Clear key` → delete that SecretId
    - UI shows status only: `Key stored` / `Missing` (never display the key).
  - Resolution precedence (highest wins):
    1. Env var `CONTEXT7_API_KEY`
    2. Credential store SecretId `pm.secret.mcp.context7.api_key`
  - If Context7 is enabled but key is missing, Doctor reports **WARN** and Context7 tools are omitted from the active tool set for that run.
  - **Contract:** Secrets MUST NOT be persisted anywhere except OS credential store.
  ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

**Other MCP servers:**

- The same MCP settings area can list or link other MCP servers (e.g. gui-automation, context7-local) if they need to be enabled/disabled or configured from the GUI. Minimally, ensure Context7 is covered as above; extend to other servers as needed.

**Wiring:**

- Add `McpGuiConfig` (or `mcp` block) to `GuiConfig` with **non-secret** fields such as `context7_enabled: bool` (default `true`) and per-server enablement/preferences only. Secret values (API keys/tokens) are resolved at run start from env/credential store and injected **in-memory** into the MCP client/server process environment; they MUST NOT be written to YAML/redb/seglog/evidence/state files. If a platform requires per-project/per-user MCP config files, they are generated as **derived adapters** (no secrets in files) at run start.
  ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, PolicyRule:Decision_Policy.md§2

### 8.2 MCP and all platforms

Ensure MCP configuration is applied in a way that works for **all five platforms**.

**MCP responsibility by ProviderTransport (Resolved):**
- **Canonical configuration lives in Puppet Master** (Settings → Advanced → MCP Configuration; central tool registry + policy engine).
- **DirectApi providers (Codex/Copilot/Gemini):** MCP tools are registered and executed by Puppet Master’s tool registry (no provider-side MCP config files).
- **CliBridge providers (Cursor/Claude Code):** if the CLI requires MCP config files, Puppet Master generates **derived adapter config** in the run CWD that points to Puppet Master–managed MCP bridge endpoints (no secrets in files).
- Doctor verifies availability per provider and surfaces clear “available/unavailable” signals.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md, PolicyRule:Decision_Policy.md§2

**Per-platform MCP adapter locations (discovery snapshot; platforms change rapidly -- re-verify at implementation time):**

| Platform     | ProviderTransport | Project / workspace config | User config          | Format |
|-------------|-------------------|----------------------------|----------------------|--------|
| Cursor      | `CliBridge`       | `.cursor/mcp.json`         | `~/.cursor/mcp.json` | JSON   |
| Claude Code | `CliBridge`       | `.mcp.json` (cwd)          | `~/.claude.json`     | JSON   |
| Codex       | `DirectApi`       | N/A (central MCP registry) | N/A                  | N/A    |
| Gemini      | `DirectApi`       | N/A (central MCP registry) | N/A                  | N/A    |
| Copilot     | `DirectApi`       | N/A (central MCP registry) | N/A                  | N/A    |

**Context7:** Key is resolved via env/credential store and injected **in-memory** into the MCP client/server process environment; it MUST NOT appear in config files (including derived adapter files).  
ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage

**Cited web search (shared by Assistant, Interview, Orchestrator):** See **§8.2.1** for full detail; summary here:

- Web search used by the **Assistant** (chat), **Interview**, and **Orchestrator** must be **cited**: inline citations and a **Sources:** list (URLs and titles). Single shared implementation; run config and MCP/tool wiring (this section) expose it to the platform CLI for the active tier.
- When the agent performs a web search, the Session or run output must **show what was searched** (query and, where appropriate, a short summary) per Plans/assistant-chat-design.md §13 (activity transparency).

#### 8.2.1 Cited web search -- detailed specification

**Scope and requirements**

- **Surfaces:** Assistant (chat), Interview (research/validation), Orchestrator (iteration research). Same capability and config for all three; no separate "interview-only" or "assistant-only" web search.
- **Output format (mandatory):**
  - **Inline citations:** Answer text references sources by marker (e.g. `[1]`, `[2]`) so the user can match claims to sources.
  - **Sources list:** A dedicated **Sources:** block (or equivalent) with each marker, human-readable title, and URL. Example:
    ```
    Sources:
    [1] Example Source (https://example.com/page1)
    [2] Another Source (https://example.com/page2)
    ```
  - Define a **convention or schema** (e.g. markdown subsection, or structured fields in tool result) so the GUI can reliably detect and render links (e.g. clickable URLs in chat, copyable list in run log).
- **Activity transparency:** For every web search call, the UI must show at least the **search query** (and, where appropriate, provider used or result count). See Plans/assistant-chat-design.md §13.

**Architecture options**

- **Option A -- MCP server:** Run or wrap a cited-web-search service as an MCP server; register it in Puppet Master’s central MCP registry (and generate derived adapter config for `CliBridge` platforms per §8.2). The agent invokes a tool (e.g. `websearch_cited`) provided by that server. **Pro:** Same mechanism as Context7; one shared implementation across surfaces. **Con:** Another server to start/configure; `CliBridge` platforms require derived adapter config formats (JSON).
- **Option B -- Bundled / custom tool:** Implement cited web search inside Puppet Master (as a built-in tool behind the central tool registry) and expose it uniformly through the Provider/tool boundary. **Pro:** Single codebase; no extra MCP server. **Con:** For `CliBridge` providers, the provider runtime may still require MCP or an equivalent tool-bridge mechanism to surface the tool to the CLI model runtime.
- **Option C -- Platform-native only:** Rely on each platform's built-in web search (e.g. Claude's web_search tool, OpenAI Responses API) where available, and document "no cited search" or "fallback to uncited" for platforms without it. **Pro:** No new infra. **Con:** Inconsistent UX and capability across platforms; some platforms may not support cited output format; contradicts "single implementation" and "cited" requirement.
- **Recommendation:** Prefer **Option A (MCP)** so one cited-web-search MCP server is the single implementation; Puppet Master registers it centrally and generates derived adapters for `CliBridge` providers. This matches OpenCode’s pattern: central runtime config starts/attaches MCP servers and exposes tools uniformly; Puppet Master mirrors this with a central MCP registry + tool policy. If a platform does not support the tool surface, document the gap and provide a clear user message (e.g. "Cited web search not available for this platform in this run").

**Provider, auth, and model selection**

- **Providers:** Support at least one of: Google (e.g. Gemini API), OpenAI (Responses API / web search), OpenRouter (routing to a model that supports web search). opencode-websearch-cited uses a **dedicated model per provider** for the "grounding" step (e.g. `gemini-2.5-flash`, `gpt-5.2`, `x-ai/grok-4.1-fast`). That model is **separate** from the chat/orchestrator model: the main agent sends a tool call, the web-search implementation calls the provider's search API with the chosen model, then returns cited text to the agent.
- **Auth:** Provider API keys (Google/OpenAI/OpenRouter) are secrets:
  - Resolution precedence: env var → OS credential store SecretId (per provider)
  - Config stores only: enablement, provider order, model selection, timeouts (non-secret)
  - Never persist key values to YAML/redb/seglog/evidence/state files
  - SecretIds:
    - `pm.secret.websearch.google.api_key`
    - `pm.secret.websearch.openai.api_key`
    - `pm.secret.websearch.openrouter.api_key`
  ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage
- **Model selection and fallback:** Define a **provider + model** preference order (e.g. try Google → OpenAI → OpenRouter). If the user has configured a preferred provider/model for web search (e.g. in Config → MCP / Tools), use that first. On failure (rate limit, auth error, timeout), fall back to the next provider if configured, or surface a clear error and suggest "Switch web search provider/model in Config" or "Check API key for &lt;provider&gt;". Avoid burning the user's chat/orchestrator model quota for search if a dedicated search model is available.
- **Config surface:** Add GUI controls (e.g. under Config → MCP / Tools) to enable/disable cited web search, choose provider (and optionally model), and manage API keys via credential-store actions (`Save key`/`Clear key`, masked input; status only). Persist **non-secret** preferences in the same GuiConfig/run-config pipeline as other MCP settings so Assistant, Interview, and Orchestrator all see identical behavior.
  ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, PolicyRule:Decision_Policy.md§2

**Errors, rate limits, and timeouts**

- **Rate limits:** Provider-specific. When the search API returns 429 or "quota exceeded", do not retry indefinitely. Surface a user-visible message (e.g. in chat or run log): "Web search rate limit reached. Try again later or switch provider/model in Config." Optionally suggest switching platform or model per Plans/assistant-chat-design.md §12 (rate limit handling).
- **Auth failures:** If the configured API key is missing or rejected, fail the tool call with a clear message (e.g. "Web search unavailable: invalid or missing API key for &lt;provider&gt;. Check Config → MCP / Tools and credential store."). Do not fall back to another provider's key without user consent (privacy/cost).
- **Timeouts:** Set a reasonable timeout for the search call (e.g. 30-60 s). On timeout, return a structured error to the agent and show the user "Web search timed out. You can retry or try a different query."
- **No results / empty:** Define behavior when the provider returns zero results (e.g. return "No results found for this query" with no Sources list, or a short message so the agent can respond appropriately). Avoid leaving the user with no feedback.

**Security and privacy**

- **Query content:** Search queries may contain sensitive or PII. Do not log full query text in plaintext in shared or persistent logs (e.g. progress.txt, evidence logs) unless the user has opted in. Prefer logging only "Web search performed" and length or hash, or redact. Same for search results: avoid dumping full response bodies into public artifacts.
- **API keys:** Never expose keys in UI labels, tool results, or error messages. Resolve via env/credential store only; Doctor or pre-run checks can verify "key is set" without echoing the value.
  ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage
- **Outbound requests:** The search implementation issues outbound HTTP requests to third-party APIs. Document which domains are contacted (e.g. Google, OpenAI, OpenRouter) so security reviews and firewalls can allowlist. Consider a setting to disable web search entirely (e.g. in air-gapped or high-compliance environments).

**Per-platform considerations**

- **`CliBridge` providers (Cursor, Claude Code):** Derived adapter config (per §8.2) must include the cited-web-search MCP server when enabled, using the same adapter path as Context7.
- **`DirectApi` providers (Codex, Gemini, Copilot):** No provider-side MCP config files; Puppet Master’s tool registry exposes the cited-web-search tool directly for that run.
- Verify tool availability per provider at run start (Doctor/preflight). If a provider does not surface the tool, show "Cited web search not available" in Doctor or run setup.  
  ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md#doctor, Gate:GATE-005
- **Headless / CI:** In non-interactive runs (e.g. orchestrator in CI), ensure the MCP server can run without a display and that auth uses env vars or credential store, not interactive login. Timeouts and rate limits are especially important in automated runs.

**Related references (adapt or wire as needed)**

- [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited) -- LLM-grounded web search with **inline citations** and **Sources:** list; `websearch_cited` tool; Google, OpenAI, OpenRouter. Primary reference for cited output format and provider config.
- [opencode-websearch](https://www.npmjs.com/package/opencode-websearch) (npm) -- Anthropic web_search tool and OpenAI Responses API; model selection (`auto`/`always`). Useful for provider wiring and fallback behavior.
- [Opencode-Google-AI-Search-Plugin](https://github.com/IgorWarzocha/Opencode-Google-AI-Search-Plugin) -- `google_ai_search_plus`; Google AI Mode (SGE) via Playwright; markdown + sources. Alternative when API-based search is not desired or for Google-specific UX.

**Gaps and potential problems**

| Gap / risk | Description | Mitigation |
|------------|-------------|------------|
| **Platform MCP support varies** | Not all five platforms may expose MCP tools to the model in the same way; some may strip or rename tools. | Test each platform with a minimal "echo" MCP tool; document which platforms actually invoke `websearch_cited` (or chosen name). Doctor check: "Cited web search available" per platform. |
| **Dual-model cost and latency** | Cited search often uses a second model (grounding) in addition to the chat model; adds latency and cost. | Document in Config that web search may use a separate model and quota; allow user to disable or choose a cheaper/faster search model. Show usage in usage/analytics if available. |
| **Provider order and fallback** | If Google is first and fails, falling back to OpenAI may surprise the user (different cost, different index). | Make provider order explicit in config; on fallback, optionally show "Used &lt;provider&gt; (fallback after &lt;first&gt; failed)." |
| **Stale or wrong citations** | LLM grounding can hallucinate or misattach citations. | Treat citations as best-effort; consider adding "Verify sources" in UI (open URL). Do not promise "all citations are accurate." |
| **Query injection / prompt leakage** | User or agent content in the query could be sent to a third-party API. | Sanitize or truncate query length; avoid sending full conversation context to the search provider unless intended. Document what is sent. |
| **No results / low-quality results** | Some queries return nothing or irrelevant results; agent might still "answer" from prior context. | Require that when the tool returns no results, the agent is instructed (via tool result or system prompt) to say so and not invent sources. |
| **Format fragmentation** | opencode-websearch-cited, opencode-websearch, and Google-AI-Search-Plugin output formats differ. | Define a **single** canonical format (inline [N] + Sources list) and normalize adapter output to it before returning to the agent so UI and prompts are consistent. |
| **Orchestrator / Interview context** | In orchestrator or interview, the "user" is the system; search may be triggered by internal prompts. | Ensure activity transparency still shows "what was searched" in the run log or Session so audits and debugging are possible. |
| **Key sprawl** | User must set API key(s) for search in addition to platform auth. | Reuse platform provider auth where possible (e.g. same OpenAI key for chat and search if supported); document clearly which keys are required for cited web search. |

### 8.3 Provider transport/auth taxonomy and MCP

Puppet Master routes runs by **ProviderTransport** (SSOT: `Plans/Contracts_V0.md`):
- **Cursor, Claude Code:** `CliBridge` (CLI-bridged; spawn local CLI)
- **Codex, GitHub Copilot, Gemini:** `DirectApi` (direct-provider auth/calls; **no** Puppet Master CLI install/runtime flow)
- **OpenCode:** `ServerBridge` (HTTP/SSE to local server)

MCP is configured centrally (Puppet Master registry); `CliBridge` providers use derived adapter config and `DirectApi` providers use the central tool registry directly.

**Transport terminology and auth taxonomy (normative):**

| Platform(s) | ProviderTransport | ProviderAuthMethod (examples; SSOT in `Plans/Contracts_V0.md`) | Contract rule |
|---|---|---|---|
| Cursor, Claude Code | `CliBridge` | `CliInteractive` | CLI-bridged only |
| Codex | `DirectApi` | `OAuthBrowser` / `OAuthDeviceCode` / `ApiKey` | Direct-provider auth/calls |
| GitHub Copilot | `DirectApi` | `OAuthDeviceCode` | Direct-provider auth/calls |
| Gemini | `DirectApi` | `OAuthBrowser` / `ApiKey` / `GoogleCredentials` | Direct-provider auth/calls |
| OpenCode | `ServerBridge` | (server credentials) + provider-native auth inside OpenCode | Server-bridged; do not label optional |

**Policy:** Do not introduce SDK install/runtime flows in this plan. Use the transport/auth taxonomy above for provider routing and auth handling.

**When to use which:** Prefer the unified provider contract for all tiers. If additional provider telemetry is needed, call official provider endpoints directly (usage/quota/account surfaces) while preserving normalized event output.

---

