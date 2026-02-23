# GUI Testing Tools & Framework Options -- Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document describes:

- Extending the interviewer flow to discover and offer GUI/testing tools (existing and custom)
- Supporting headless GUI testing and full debug logs for non-web projects
- Integrating chosen tools into test strategy and execution plans so agents perform deeper, framework-appropriate testing

Implementation must follow the **DRY Method** (AGENTS.md): reuse-first, single source of truth for tool/framework data, tagging of reusable items. **Rollout:** All items in this plan (including Doctor platform versions, MCP Doctor check, and catalog version) are in scope for a single implementation; no phased rollout.

## Rewrite alignment (2026-02-21)

This plan remains authoritative for *what* tool discovery/testing support must exist, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- Tool discovery, permissions, and validation should live in the **central tool registry + policy engine** (not per-provider special cases)
- Tool execution results should be normalized into the **unified event model** and stored in seglog → projections (redb/Tantivy)
- **Tool latency and errors** from the unified event model are consumed by **analytics scan jobs** (scan seglog for tool latency distributions and error rates); rollups are stored in redb and exposed on the dashboard (e.g. tool performance and error-rate summaries).
- UI wiring details should be re-expressed in Slint (not Iced) without changing feature semantics
- Auth policy reminder: subscription-first; **Gemini API key is the explicit allowed exception** (subscription-backed)

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::supports_effort()`)

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth

3. **Tool/Framework Data -- Single Source of Truth:**
   - ✅ **ALWAYS** use `DRY:DATA:gui_tool_catalog` as the single source of truth for tool/framework data
   - ❌ **NEVER** hardcode tool names, installation paths, or framework-specific behavior

4. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

5. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Relationship to Other Plans](#2-relationship-to-other-plans)
3. [Problem Statement](#3-problem-statement)
4. [Goals](#4-goals)
5. [Design Overview](#5-design-overview)
6. [Framework & Tool Discovery (DRY)](#6-framework--tool-discovery-dry)
7. [Interviewer Flow Changes](#7-interviewer-flow-changes)
8. [MCP Support and GUI Settings](#8-mcp-support-and-gui-settings) (8.1 GUI, 8.2 per-platform + discovery table, 8.3 CLI vs SDK)
9. [Custom Headless GUI Tool](#9-custom-headless-gui-tool)
10. [Integration with Test Strategy & Plans](#10-integration-with-test-strategy--plans)
11. [Implementation Checklist](#11-implementation-checklist)
12. [Gaps, Risks, and DRY Notes](#12-gaps-risks-and-dry-notes)
13. [References](#13-references)

---

## 1. Executive Summary

Today, the interviewer can generate **Playwright** requirements and wire them into the test strategy so agents run E2E tests. Playwright only applies to **web-based GUIs**. Many projects use native or framework-specific GUIs (e.g. Iced, Dioxus, Qt, Electron, Tauri). For those:

- There may be **existing tools** (e.g. Dioxus hot reload + web preview, Iced headless runner, framework-specific test utilities) that the interviewer should **discover and offer**.
- When no suitable tool exists, the interviewer should offer to **plan or build a custom headless GUI tool** that allows headless navigation and produces a **full debug log** after tests, so agents can run smoke tests and interpret results.

This plan adds:

1. **Discovery:** During the interview (especially Architecture and Testing phases), detect GUI stack and search a **single source of truth** for framework-specific tools (existing tools, docs, hot reload, headless options).
2. **User choice:** Present options to the user (use existing tools, plan to build custom tool, or both).
3. **Plans and test strategy:** Write into the generated plans/PRD and test strategy: get existing tools (if chosen), and/or plan to build the custom tool; then integrate tool usage into testing instructions so agents use them during execution.

Result: **More thorough and deeper testing** across web and non-web projects, with agents using the right tools per framework and a consistent path for custom headless + debug logging when needed.

**Success criteria (how we know the plan succeeded):** (1) When a non-web GUI framework is detected, the interview offers framework tools and the custom headless option from the catalog. (2) User choices are persisted and drive test strategy and PRD/plan content (tasks + instructions). (3) Agents receive test strategy that includes framework tools and/or custom headless instructions and evidence paths. (4) When the user chose custom headless, a Doctor check can verify the tool exists and runs (conditional on that choice). (5) MCP (e.g. Context7) is configurable for all five platforms via GUI and applied at run time. (6) Existing Playwright-only flow and existing test strategy behavior remain unchanged when no new options are selected (no regression).

---

## 2. Relationship to Other Plans

This plan extends the **interview** and **test strategy**; it does not replace them. New options (framework tools, custom headless) are **interview config** that must be wired like existing options and must align with orchestrator, Worktree, and cleanup behavior.

| Plan | How newtools fits |
|------|-------------------|
| **Plans/interview-subagent-integration.md** | **Phase 8 (Testing & Verification)** already uses qa-expert and test-automator. newtools adds **tool discovery and selection** inside that phase (GUI stack detection, catalog lookup, user options). New fields (`selected_framework_tools`, `plan_custom_headless_tool`, etc.) are **interview config** and must be wired into `InterviewOrchestratorConfig`, set from `gui_config.interview` in `app.rs`, and used at completion when generating test strategy and PRD -- same pattern as `generate_playwright_requirements`. Phase 5 document generation is extended so test strategy and plans include framework tools and custom headless instructions. |
| **Plans/orchestrator-subagent-integration.md** | **Interview config wiring:** Any new interview setting follows the same three-step checklist as in "Interviewer Enhancements and Config Wiring" and "Avoiding Built but Not Wired": add to execution config type, set at construction from `gui_config.interview`, use in interview runtime. **Test strategy** is already loaded and merged into tier criteria by the orchestrator; newtools ensures the **new** tool instructions and debug-log paths are part of that merged context so agents see them. Evidence paths (e.g. `.puppet-master/evidence/`) stay as-is; custom headless tool writes evidence in the same style. |
| **Plans/WorktreeGitImprovement.md** | **Config:** New interview toggles live in the Interview tab and `gui_config.interview`; they are persisted and included in the **same Option B run-config build** as other GUI settings (no separate config file). **Worktrees:** When agents run in a worktree, the custom headless tool's evidence path follows the same policy (e.g. `.puppet-master/evidence/` under the workspace used for the run); no change to worktree creation/merge/cleanup. |
| **Plans/MiscPlan.md** | **Cleanup:** `.puppet-master/evidence/` is allowlisted; headless tool evidence is never removed by prepare/cleanup. **Interview output:** Test strategy and interview outputs stay under `.puppet-master/interview/`; newtools only extends **content** (framework tools, custom headless). **run_with_cleanup:** Interview and start_chain continue to use `run_with_cleanup`; newtools does not add new call sites. |

---

## 3. Problem Statement

- **Playwright** is the only GUI testing path currently offered in the interviewer flow. It is limited to projects with a web UI.
- **Native/framework GUIs** (Rust/Iced, Dioxus, Qt, Flutter, etc.) have no standardized path in the interview: no discovery of framework-specific tools (e.g. Dioxus devtools, Iced headless runner), and no option to plan or build a project-specific headless tool with full debug output.
- Without a chosen tool or plan, agents cannot reliably run **smoke tests** or **GUI-level verification** on non-web projects, and testing remains shallow.

---

## 4. Goals

- **Discover existing tools:** Interviewer consults a single source of truth (e.g. a catalog or module) mapping GUI frameworks to existing tools (official or community: hot reload, web preview, headless runners, test harnesses).
- **Offer options to the user:** Present: use existing tools only, plan/build custom headless tool only, or both. User choice is stored and drives what gets written into plans and test strategy.
- **Custom headless tool option:** When chosen, plans include: build (or adopt) a project-specific tool that supports headless GUI navigation and emits a **full debug log** after runs so agents can verify behavior and debug failures.
- **Integrate into testing:** Selected tools (existing and/or custom) are reflected in test strategy (e.g. test-strategy.md, test-strategy.json) and in PRD/plan language so **agents use the tools** during iterations for smoke and deeper GUI tests.
- **DRY:** One place for framework→tool data; reuse existing interview phase flow, test strategy generator, and prompt/context loading.

---

## 5. Design Overview

- **Where it happens:** Interview flow, primarily **Architecture & Technology** (to detect GUI stack) and **Testing & Verification** (to choose tools and coverage). Optionally use **Product/UX** phase for GUI type (web vs native).
- **Data flow:**
  1. During or after Architecture (and optionally UX), derive **GUI type** and **framework** (e.g. web, Iced, Dioxus, Qt, Flutter, Tauri, Electron).
  2. **Lookup** framework in a **single source of truth** (see §6) to get: existing tools (with names, install/setup, capabilities), and whether a custom headless tool is typically needed.
  3. In Testing phase (or a dedicated "GUI testing tools" step), **present options** to the user: existing tools, custom headless tool plan, or both.
  4. **Persist** user choices in interview state and config (e.g. "use_playwright", "use_framework_tools", "plan_custom_headless_tool", "selected_framework_tools").
  5. On interview completion, **write into plans/PRD and test strategy:**
     - Tasks to **obtain/set up** existing tools when selected.
     - Tasks to **plan or build** the custom headless tool when selected (with requirement: headless navigation + full debug log after test runs).
     - **Testing instructions** that tell agents to use Playwright (web), selected framework tools, and/or the custom tool for smoke and GUI tests; reference debug log location and format where applicable.

---

## 6. Framework & Tool Discovery (DRY)

### 6.1 Single source of truth

Introduce a **single source of truth** for "GUI framework → available tools" so the interviewer (and any future automation) does not hardcode or duplicate this data.

- **Location (suggested):** `puppet-master-rs/src/interview/gui_tool_catalog.rs` (or `automation/gui_tool_catalog.rs` if shared with headless runner). Tag as `// DRY:DATA:GuiToolCatalog`.
- **Content:** A catalog (e.g. struct + const data or table) that for each supported framework (or "web" for Playwright) provides:
  - **Framework ID** (e.g. `web`, `iced`, `dioxus`, `qt`, `flutter`, `tauri`, `electron`).
  - **Display name** and optional **detection hints** (e.g. Cargo.toml crate name, package.json deps).
  - **Existing tools:** list of entries, each with: name, description, install/setup summary, capabilities (e.g. "hot reload", "web preview", "headless test", "real-time dev UI"), and optional doc URL.
  - **Custom headless default:** whether to suggest "plan/build custom headless tool" by default for this framework (e.g. true for Iced when no headless runner in project; false for "web" when Playwright suffices).

**Examples to seed the catalog:**

| Framework | Existing tools (examples) | Custom headless suggestion |
|-----------|---------------------------|----------------------------|
| web       | Playwright (E2E, browsers) | No (Playwright is the standard) |
| dioxus    | Dioxus devtools (web preview, hot reload, hot patching) | Optional (if more than preview needed) |
| iced      | In-repo headless_runner (tiny-skia), GUI automation action catalog | Yes, if not already in project |
| qt        | Qt Test, Squish, etc. (research and list) | Often |
| flutter   | Flutter driver, integration_test | Optional |
| tauri     | WebDriver + front-end; Tauri test utils | Optional |
| electron  | Playwright (Electron support), Spectron legacy | No when Playwright used |

Catalog should be **extensible** (add new frameworks/tools without changing interviewer flow logic). Use **DRY:FN** helpers for "lookup by framework", "list tools for framework", "should suggest custom headless for framework".

### 6.2 Research as input only (no research-only outcome)

Research (Context7 MCP, web search) may be used to **inform** the catalog or the build plan, but must **not** be presented as a standalone research-only outcome. Options:

- **Catalog population:** When the catalog has no or sparse data for a framework, research can **add or extend catalog entries** so the catalog remains the single source of truth and future runs see the data. The user is shown **catalog-backed options** (including newly added entries), not a separate research-only result.
- **Build plan input:** When the user chooses plan/build custom headless GUI tool for an unknown or sparse-catalog framework, research can **inform the design** of that tool. The deliverable is always the **plan to build the full-featured tool** (see §9); research only feeds that plan.

Do **not** offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan. For unknown frameworks, the user still gets: catalog options (if research populated the catalog) and/or the option to plan/build the full-featured custom headless tool, with research used only to improve that plan.

### 6.3 MCP and tool invocation

Some **existing tools** in the catalog (or used during research) rely on **MCP** (Model Context Protocol), e.g. Context7 for documentation lookup, Browser MCP for web testing. For selected tools to be callable when agents run:

- **All platforms:** MCP must be supported and configurable for **all five platforms** (Cursor, Codex, Claude Code, Gemini, GitHub Copilot). Each platform has its own MCP config location and semantics (e.g. Cursor: `.cursor/mcp.json`, project or user; Claude: `~/.claude.json` or project `.mcp.json`; Codex: MCP server mode; etc.). The plan must ensure that when the user selects a catalog tool that uses MCP, we can **set up and verify** that the tool is available and callable for the tier's platform.
- **Setup and verification:** Provide a way to configure MCP servers (including API keys where required) and to verify that tools are callable (e.g. Doctor check or pre-run check). Document or implement how MCP config (including Context7 API key and enable/disable state) is passed into the runner or agent environment so that platform CLIs see the correct MCP servers when executing.
- **Catalog metadata:** In the GUI tool catalog (§6.1), tag tools that require MCP so the UI can show requirements (e.g. "Requires Context7 MCP" or "Requires Browser MCP"). When such a tool is selected, the run config or prompt builder should ensure the corresponding MCP settings are enabled and configured.

---

## 7. Interviewer Flow Changes

### 7.1 GUI stack detection

- **Inputs:** Architecture phase output (tech stack, dependencies), optionally UX phase (web vs native vs both). Use existing feature_detector / technology_matrix if available.
- **Output:** One or more **GUI framework IDs** (e.g. `["web"]`, `["iced"]`, `["dioxus","web"]` for Dioxus+web).
- **Storage:** Add to interview state (e.g. `detected_gui_frameworks: Vec<String>`). Use this for the rest of the flow.

### 7.2 Testing phase: tool discovery and user options

- After (or as part of) the **Testing & Verification** phase:
  1. **Lookup** detected GUI frameworks in the **GuiToolCatalog** (§6). If catalog is sparse for a framework, research may run to **populate or extend the catalog** (§6.2); the user is never shown a research-only result.
  2. **Build options:**
     - **Playwright** (when "web" is in detected frameworks): keep current "Generate Playwright requirements" behavior; present as one option.
     - **Framework tools:** For each detected non-web framework, list existing tools from the catalog; allow user to select which to use (e.g. "Dioxus devtools", "Iced headless runner if present").
     - **Custom headless tool:** Checkbox or option: "Plan/build a custom headless GUI tool for this project (headless navigation + full debug log for agent smoke tests)". Default can come from catalog ("custom headless default" per framework).
  3. **Persist** choices in interview config/state (e.g. `generate_playwright_requirements`, `selected_framework_tools: Vec<FrameworkToolChoice>`, `plan_custom_headless_tool: bool`). Ensure these are wired into `InterviewOrchestratorConfig` and used at completion when generating test strategy and plans (§10).

### 7.3 UI for tool selection

- Reuse existing widgets per **DRY** (`docs/gui-widget-catalog.md`, `src/widgets/`). Use toggles, checkboxes, or multi-select for:
  - Playwright (existing).
  - Per-framework list of existing tools (select one or more).
  - "Plan/build custom headless GUI tool" toggle.
- Tooltips or short help: explain that existing tools come from the catalog; custom tool is full-featured (headless runner, action catalog, full evidence) like this project's. No new one-off UI patterns; tag new reusable widgets with `// DRY:WIDGET:...`. Follow existing accessibility and widget patterns (selectable labels, keyboard navigation, screen reader considerations per `docs/gui-widget-catalog.md`).

---

## 8. MCP Support and GUI Settings

### 8.1 MCP settings in the GUI

Add **MCP settings** to the Config view so users can enable and configure MCP servers used by catalog tools and by the interview (e.g. Context7, Browser MCP). Placement: a new subsection **Config → MCP** (or under **Advanced → MCP / Tools**) so all MCP-related controls live in one place. Use the same GuiConfig and Option B run-config build as other tabs so one Save persists MCP settings.

**Context7 (default on, API key, toggle off):**

- **Context7** is **enabled by default** so documentation lookup and research can use it without extra setup.
- Provide a **Context7 API key** field: a dedicated input (e.g. password-style or masked) where the user can store the Context7 API key. Persist it in config (e.g. `mcp.context7.api_key` or `mcp.context7.apiKey`); document that this value should not be committed to version control and consider storing it in a user-level or secure store if the project is shared.
- Provide a **toggle to turn Context7 off** so users can disable Context7 MCP when not needed. When off, the API key may still be stored but Context7 is not passed to the platform CLI or not included in MCP server list for the run.

**Other MCP servers:**

- The same MCP settings area can list or link other MCP servers (e.g. gui-automation, context7-local) if they need to be enabled/disabled or configured from the GUI. Minimally, ensure Context7 is covered as above; extend to other servers as needed.

**Wiring:**

- Add `McpGuiConfig` (or `mcp` block) to `GuiConfig` with fields such as `context7_enabled: bool` (default `true`), `context7_api_key: Option<String>`. When building the run config (Option B), include MCP settings so that interview and orchestrator runs pass the correct MCP config (and Context7 API key when set) to the platform runner. Platform-specific MCP config files (e.g. `.cursor/mcp.json`, `.mcp.json`) may be generated or updated from these GUI values when the run starts, or the runner may receive env vars / args that point the CLI at the right MCP config.

### 8.2 MCP and all platforms

Ensure MCP configuration and the Context7 API key (when enabled) are applied in a way that works for **all five platforms**. Document per-platform behavior: which config file or env var each CLI reads, and how Puppet Master can inject or update that config so agents can call MCP tools (including Context7) regardless of which platform is selected for the tier.

**MCP config locations (discovery snapshot; platforms change rapidly -- re-verify at implementation time):**

| Platform     | Project / workspace config       | User config                | Format |
|-------------|-----------------------------------|----------------------------|--------|
| Cursor      | `.cursor/mcp.json`                | `~/.cursor/mcp.json`       | JSON   |
| Claude Code | `.mcp.json` (cwd)                 | `~/.claude.json`           | JSON   |
| Codex       | `.codex/config.toml`              | `~/.codex/config.toml`     | TOML   |
| Gemini      | `.gemini/settings.json`           | `~/.gemini/settings.json`  | JSON   |
| Copilot     | `.copilot/mcp-config.json`, `.vscode/mcp.json` (workspace, v0.0.410+) | `~/.copilot/mcp-config.json` | JSON   |

**Context7:** API key is sent as `Authorization: Bearer <key>`; store in config (e.g. `mcp.context7.api_key`), do not commit; inject into MCP client headers when generating platform config. Platforms ship frequent CLI updates; prefer discovering config at runtime or documenting and verifying in Doctor.

**Cited web search (shared by Assistant, Interview, Orchestrator):** See **§8.2.1** for full detail; summary here:

- Web search used by the **Assistant** (chat), **Interview**, and **Orchestrator** must be **cited**: inline citations and a **Sources:** list (URLs and titles). Single shared implementation; run config and MCP/tool wiring (this section) expose it to the platform CLI for the active tier.
- When the agent performs a web search, the thread or run output must **show what was searched** (query and, where appropriate, a short summary) per Plans/assistant-chat-design.md §13 (activity transparency).

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

- **Option A -- MCP server:** Run or wrap a cited-web-search service as an MCP server; register it in each platform's MCP config (see table in §8.2) alongside Context7. The agent invokes a tool (e.g. `websearch_cited`) provided by that server. **Pro:** Same mechanism as Context7; works with any platform that supports MCP. **Con:** Another server to start, configure, and keep in sync with platform config; per-platform MCP config format differs (JSON vs TOML).
- **Option B -- Bundled / custom tool:** Implement cited web search inside Puppet Master (or as a Rust/TS module the runner invokes) and expose it to the platform via whatever "custom tool" mechanism each CLI supports (if any). **Pro:** Single codebase; no extra process. **Con:** Not all platforms expose a generic "add custom tool" API; may require MCP anyway for Cursor/Claude/Codex/Gemini/Copilot.
- **Option C -- Platform-native only:** Rely on each platform's built-in web search (e.g. Claude's web_search tool, OpenAI Responses API) where available, and document "no cited search" or "fallback to uncited" for platforms without it. **Pro:** No new infra. **Con:** Inconsistent UX and capability across platforms; some platforms may not support cited output format; contradicts "single implementation" and "cited" requirement.
- **Recommendation:** Prefer **Option A (MCP)** so one cited-web-search MCP server is the single implementation; Puppet Master's run config injects it into each platform's MCP list (same as Context7). If a platform does not support MCP or tool discovery, document the gap and provide a clear user message (e.g. "Cited web search not available for this platform in this run").

**Provider, auth, and model selection**

- **Providers:** Support at least one of: Google (e.g. Gemini API), OpenAI (Responses API / web search), OpenRouter (routing to a model that supports web search). opencode-websearch-cited uses a **dedicated model per provider** for the "grounding" step (e.g. `gemini-2.5-flash`, `gpt-5.2`, `x-ai/grok-4.1-fast`). That model is **separate** from the chat/orchestrator model: the main agent sends a tool call, the web-search implementation calls the provider's search API with the chosen model, then returns cited text to the agent.
- **Auth:** Each provider needs its own auth (API key or OAuth). Store in config (e.g. `websearch_cited.google_api_key`, `websearch_cited.openai_api_key`, or reuse existing provider auth if the CLI already has it). **Do not** hardcode keys; do not commit keys to the project. Prefer user-level or secure store for shared machines. Document which env vars or config keys each provider expects.
- **Model selection and fallback:** Define a **provider + model** preference order (e.g. try Google → OpenAI → OpenRouter). If the user has configured a preferred provider/model for web search (e.g. in Config → MCP / Tools), use that first. On failure (rate limit, auth error, timeout), fall back to the next provider if configured, or surface a clear error and suggest "Switch web search provider/model in Config" or "Check API key for &lt;provider&gt;". Avoid burning the user's chat/orchestrator model quota for search if a dedicated search model is available.
- **Config surface:** Add GUI controls (e.g. under Config → MCP / Tools) to enable/disable cited web search, choose provider (and optionally model), and set API keys. Persist in the same GuiConfig/run-config pipeline as other MCP settings so Assistant, Interview, and Orchestrator all see the same config.

**Errors, rate limits, and timeouts**

- **Rate limits:** Provider-specific. When the search API returns 429 or "quota exceeded", do not retry indefinitely. Surface a user-visible message (e.g. in chat or run log): "Web search rate limit reached. Try again later or switch provider/model in Config." Optionally suggest switching platform or model per Plans/assistant-chat-design.md §12 (rate limit handling).
- **Auth failures:** If the configured API key is missing or rejected, fail the tool call with a clear message (e.g. "Web search unavailable: invalid or missing API key for &lt;provider&gt;. Check Config → MCP / Tools."). Do not fall back to another provider's key without user consent (privacy/cost).
- **Timeouts:** Set a reasonable timeout for the search call (e.g. 30-60 s). On timeout, return a structured error to the agent and show the user "Web search timed out. You can retry or try a different query."
- **No results / empty:** Define behavior when the provider returns zero results (e.g. return "No results found for this query" with no Sources list, or a short message so the agent can respond appropriately). Avoid leaving the user with no feedback.

**Security and privacy**

- **Query content:** Search queries may contain sensitive or PII. Do not log full query text in plaintext in shared or persistent logs (e.g. progress.txt, evidence logs) unless the user has opted in. Prefer logging only "Web search performed" and length or hash, or redact. Same for search results: avoid dumping full response bodies into public artifacts.
- **API keys:** Never expose keys in UI labels, tool results, or error messages. Store and pass via config/env only; Doctor or pre-run checks can verify "key is set" without echoing the value.
- **Outbound requests:** The search implementation issues outbound HTTP requests to third-party APIs. Document which domains are contacted (e.g. Google, OpenAI, OpenRouter) so security reviews and firewalls can allowlist. Consider a setting to disable web search entirely (e.g. in air-gapped or high-compliance environments).

**Per-platform considerations**

- **Cursor, Claude Code, Codex, Gemini, Copilot:** Each discovers MCP servers from its own config (see §8.2 table). The cited-web-search MCP server must be **injected** into that config when the user has enabled it, using the same injection path as Context7. Verify that each CLI actually **calls** the tool (some may filter tools by name or capability). If a platform does not support MCP or does not surface the tool to the model, document it and show "Cited web search not available" in Doctor or run setup.
- **Headless / CI:** In non-interactive runs (e.g. orchestrator in CI), ensure the MCP server can run without a display and that auth uses env vars or config, not interactive login. Timeouts and rate limits are especially important in automated runs.

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
| **Orchestrator / Interview context** | In orchestrator or interview, the "user" is the system; search may be triggered by internal prompts. | Ensure activity transparency still shows "what was searched" in the run log or thread so audits and debugging are possible. |
| **Key sprawl** | User must set API key(s) for search in addition to platform auth. | Reuse platform provider auth where possible (e.g. same OpenAI key for chat and search if supported); document clearly which keys are required for cited web search. |

### 8.3 CLI vs SDK and MCP

Puppet Master today invokes **platform CLIs** (e.g. `agent -p "..."`, `claude -p "..."`, `codex exec`, `gemini -p "..."`, `copilot -p "..."`). MCP is configured per platform via the table above; the runner must write or point each CLI at the right project/user config (and Context7 API key when enabled).

**Codex SDK** (`@openai/codex-sdk`): TypeScript; wraps the `codex` CLI (spawns it, JSONL over stdin/stdout). Thread-centric API: `startThread()`, `resumeThread(id)`, `thread.run()` / `thread.runStreamed()`. MCP is **not** configured in the SDK API; it is read from Codex TOML config. When using the SDK for programmatic Codex, ensure the CLI's config (e.g. `~/.codex/config.toml`) contains the desired MCP servers (e.g. Context7). Doctor or pre-run checks should verify MCP when tools depend on it.

**GitHub Copilot SDK** (`@github/copilot-sdk`, Python/Go/.NET): Talks to Copilot CLI via JSON-RPC; can start the CLI or connect to `copilot --headless --port N`. Session-centric: `createSession({ mcpServers: { ... } })`. MCP (including Context7) can be passed **per session** in code; no need to touch `~/.copilot/mcp-config.json` or `.vscode/mcp.json` when using the SDK. For CLI-only runs, Puppet Master still injects config into those files or env.

**When to use which:** Prefer **CLI invocation** for tier runs (same as today) so one code path works for all platforms. Use **SDKs** only where the orchestrator or interview explicitly needs programmatic control (e.g. subagent integration per orchestrator plan). When using an SDK, document how MCP/Context7 is applied (Codex: TOML; Copilot: session `mcpServers`).

---

## 9. Custom Headless GUI Tool

When the user chooses **"plan/build custom headless GUI tool"**:

### 9.1 Requirement: full-featured (like this project)

The custom headless GUI tool must be **fully featured**, not minimal. Use **this project's** automation as the reference (Puppet Master's `src/automation/`: headless runner, action catalog, evidence layout). The tool must provide:

- **Headless execution:** Runs without display (CI-friendly); uses software rendering or framework-specific headless mode (e.g. Iced tiny-skia, or framework's own headless API).
- **Action catalog:** A defined set of actions or scenarios so that smoke and regression flows can be scripted and repeated. Not a one-off script -- a reusable catalog the agent can extend and run.
- **Full evidence output:** After each run, the tool must produce the **same depth of debug information** as Puppet Master's GUI automation: **Timeline** (e.g. `timeline.jsonl`), **Summary** (e.g. `summary.md`), **Artifacts** (screenshots or state dumps per step). **Consistent paths:** Evidence under a standard location (e.g. `.puppet-master/evidence/gui-automation/...`). Optional: **ephemeral workspace clone** as in this project's headless runner.

### 9.2 What gets written into plans

- **If get existing tool** (e.g. Iced headless runner already in repo that meets §9.1): Plan steps to **ensure the tool is available** (install/setup), document how to run it and where evidence is written, and reference it in test strategy.
- **If build custom:** Plan steps to **design and implement** a **full-featured** project-specific automation that meets §9.1 (headless runner, action catalog, full evidence: timeline, summary, artifacts). Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack. No minimal smoke harness -- the deliverable is a tool that matches the capability and evidence depth of this project's automation.
- **If both:** Plan to use existing tools where they fit, and add or extend the custom tool for full coverage and evidence.

### 9.3 Reuse of existing automation (this project)

Puppet Master's **headless runner** and **action catalog** in `src/automation/` (AGENTS.md) are the **reference implementation**. For **Iced projects**, the plan should reference reusing or porting that pattern. For other frameworks, the plan describes building or adopting a system that meets the **same contract**: action catalog, timeline + summary + artifacts, standard evidence paths.

---

## 10. Integration with Test Strategy & Plans

### 10.1 Test strategy (test-strategy.md, test-strategy.json)

- **Extend** `TestStrategyConfig` (and any JSON schema) to include:
  - **Framework tools:** List of selected framework tool IDs and how they are used (e.g. "Run Dioxus devtools for live preview; use for manual smoke checks" or "Run Iced headless runner with action set X").
  - **Custom headless tool:** When selected, a dedicated section or items that state: "Use the project's headless GUI tool for smoke tests; read debug log at `<path>` after each run."
- **Test types:** Add or reuse test types (e.g. `headless_gui`, `framework_tool`) in addition to `playwright`, so that verification commands and criteria can reference "run headless tool" or "run framework tool X".
- **DRY:** Extend `test_strategy_generator` and `TestItem` (or equivalent) so that new options are generated from the **same** interview state (selected_framework_tools, plan_custom_headless_tool); no duplicate logic in views vs generator.

### 10.2 PRD / execution plans

- **Tasks in the PRD (or plan):**
  - "Obtain/set up &lt;existing tool&gt;" when the user selected that tool.
  - "Plan and implement custom headless GUI tool (headless navigation + full debug log)" when the user selected custom tool.
- **Acceptance criteria** for testing tiers should reference: run Playwright (if web), run selected framework tools, run custom headless tool and check debug log. Prompt builder already loads test strategy; ensure new instructions and paths are included in context so **agents use the tools** during iterations.

### 10.3 Prompt and context

- **Prompt builder** already includes test strategy (§5.2 in interview plan, `load_interview_outputs`). Ensure new content (framework tools, custom headless, debug log path) is present in the excerpt so agents see when and how to use each tool and where to find the debug log.

---

## 11. Implementation Checklist

- [ ] **6.1** Add `gui_tool_catalog` module (or equivalent) as single source of truth; implement lookup by framework, list tools, "custom headless default" per framework; tag tools that require MCP. Tag `// DRY:DATA:GuiToolCatalog` and helpers `// DRY:FN:...`.
- [ ] **6.2** Define research as input-only: catalog population and/or build-plan input; no research-only user outcome.
- [ ] **6.3** MCP and tool invocation: ensure MCP is configurable and verifiable for all five platforms; document or implement how MCP config (including Context7 API key and enable/disable) is passed into the runner/agent; tag catalog tools that require MCP; wire MCP config into runner/agent so selected tools are callable.
- [ ] **7.1** Add GUI stack detection (from Architecture/UX or feature_detector); store `detected_gui_frameworks` in interview state.
- [ ] **7.2** In Testing phase, call catalog (and optional research to populate catalog); build options (Playwright, framework tools, custom headless); persist user choices in interview config/state and wire into `InterviewOrchestratorConfig`.
- [ ] **7.3** Add UI for tool selection using existing widgets; tag new widgets; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes.
- [ ] **8.1** MCP settings in GUI: add Config → MCP (or Advanced → MCP); Context7 enabled by default, Context7 API key field, toggle to turn Context7 off; wire to GuiConfig and Option B run-config.
- [ ] **8.2** Per-platform MCP: document or implement how each platform (Cursor, Codex, Claude Code, Gemini, Copilot) gets MCP config and Context7 API key so Context7 works for all five; see §8.2 discovery table and SDK integration (§8.3).
- [ ] **9** Document custom headless tool as **full-featured** (headless runner, action catalog, full evidence per §9.1); document how plans reference existing automation (e.g. Iced headless runner) vs building new.
- [ ] **10.1** Extend test strategy generator and schema for framework tools and custom headless; add test types and verification commands as needed.
- [ ] **10.2** Ensure PRD/plan generation includes tasks for get existing tools and plan/build custom tool when selected.
- [ ] **10.3** Ensure prompt builder includes new test strategy content (paths, instructions) so agents use the tools.
- [ ] **Doctor** Add a Doctor check that verifies the headless tool exists and runs when `plan_custom_headless_tool` was true (in scope for this plan). Resolve how Doctor discovers that the project planned a custom headless tool (§12.6).
- [ ] **Doctor (platform versions)** Add a Doctor check or small platform config report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions.
- [ ] **Doctor (MCP)** Add a Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check.
- [ ] **Catalog version** If the catalog is static, add a version or last-updated timestamp so agents or docs can reference "catalog as of date X" when debugging tool availability.
- [ ] **DRY** All framework/tool data from catalog only; no hardcoded tool lists in views or prompts. Pre-completion: run AGENTS.md Pre-Completion Verification Checklist.
- [ ] **Gaps §12.6** Address additional gaps before or during implementation: Doctor input, test strategy schema duplication, MCP injection timing/cwd, Context7 key storage, catalog detection hints (e.g. Iced), Playwright/test-strategy wiring, verification command convention.

---

## 12. Gaps, Risks, and DRY Notes

### 12.1 Catalog maintenance

- The catalog will need periodic updates as frameworks and tools evolve. Prefer a single file or module so maintainers know where to add entries. For unknown frameworks, the user still gets the option to plan/build the **full-featured** custom headless tool (§9); research may populate the catalog or inform that build plan, but there is no research-only outcome.

### 12.2 Custom tool scope

- Building a custom headless GUI tool is a substantial task. The plan frames it as **full-featured** from the start (headless runner, action catalog, full evidence: timeline, summary, artifacts), using this project's automation as the reference. Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack; for other frameworks, the plan describes building or adopting an analogous **full-featured** system with the same contract. Do not frame the deliverable as a minimal smoke harness -- the goal is a tool that matches the capability and evidence depth of this project's automation.

### 12.3 DRY and AGENTS.md

- **Widgets:** Use `docs/gui-widget-catalog.md` and `src/widgets/` for any new interview UI; tag with `// DRY:WIDGET:...`.
- **Data:** All "framework → tools" and "should suggest custom headless" data lives in `GuiToolCatalog` (or equivalent); no duplication in phase prompts or views.
- **Test strategy:** Extend existing `test_strategy_generator` and types; do not duplicate "what tools to use" in multiple places.
- **Pre-completion:** Before marking tasks done: `cargo check`, `cargo test`, DRY checks, no hardcoded tool lists, scope respected.

### 12.4 Consistency with other plans

- **Interview plan** (`Plans/interview-subagent-integration.md`): Testing phase already uses qa-expert and test-automator; add "tool discovery and selection" as part of that phase; config wiring for new options follows "Interviewer Enhancements and Config Wiring" in orchestrator plan.
- **Orchestrator plan** (`Plans/orchestrator-subagent-integration.md`): Test strategy is already loaded and merged into tier criteria; ensure new tool instructions and debug log paths are part of that merged context.

### 12.5 Gaps, issues, and improvements (implementation notes)

The following gaps, ambiguities, and improvements should be resolved during implementation or in a follow-up plan update.

**GUI stack detection vs existing modules**

- The plan says "Use existing feature_detector / technology_matrix if available." In the codebase, `feature_detector` detects **features** (e.g. auth, API, payment) from interview text, not GUI frameworks. `technology_matrix` extracts technology entries (Language, Framework, etc.) from Architecture phase decisions and Q&A. GUI framework detection (web, iced, dioxus, etc.) is **not** currently provided. Either add a dedicated **GUI framework detection** step (e.g. scan Architecture/UX output and/or project files using catalog detection hints) or extend `TechnologyExtractor` with GUI-framework patterns and derive `detected_gui_frameworks` from that. Document the chosen approach.

**Where do "get existing tools" and "plan/build custom tool" tasks live?**

- The plan says "Tasks in the PRD" for obtaining tools and building the custom headless tool. The PRD is produced by the **start_chain** (from requirements), not directly by the interview. Define **where** these tasks are injected: (1) as acceptance criteria or new subtasks in the Testing phase when the PRD is generated (or a post-interview step that amends the PRD), (2) as content in the requirements document the interview writes so the PRD generator includes them, or (3) as a separate plan file (e.g. `.puppet-master/interview/gui-testing-plan.md`) that the orchestrator or agents read. Without this, implementers may leave the tasks unwired.

**Interview state and config persistence**

- `InterviewState` (in `interview/state.rs`) has no `detected_gui_frameworks` field. `InterviewGuiConfig` / `InterviewOrchestratorConfig` do not yet have the new fields. Add `detected_gui_frameworks` to state and the new toggles/lists to GUI config, YAML config, and `InterviewOrchestratorConfig`; wire them in `app.rs` and in the interview completion path so test strategy and PRD/plan generation read them.

**Test strategy JSON schema and backward compatibility**

- The consumer of test-strategy.json is `TierTree::load_test_strategy` in `core/tier_node.rs`. Prefer extending the existing schema: use `test_type` values `headless_gui` and `framework_tool`, and put tool-specific instructions in `criterion` and `verification_command`. If structured tool metadata is needed, add optional fields to `TestItem` and to the loader; document backward compatibility.

**Verification command for custom headless tool**

- Test items have a literal `verification_command`. For "run headless tool" the exact command is project-specific. Either emit a **placeholder** command plus a clear criterion (e.g. "Run the project's headless GUI tool per test-strategy.md; check evidence at `.puppet-master/evidence/gui-automation/...`") or define a **convention** (e.g. script name or binary) and document it so the generator can emit a stable command. Prefer placeholder for flexibility unless the project adopts a standard name.

**Catalog: static vs runtime-mutable**

- If the catalog is **static** (e.g. Rust const data), research cannot mutate it at runtime; it can only produce suggestions for maintainers. Decide whether the catalog is (A) static only, with research suggesting new entries for human curation, or (B) runtime-mutable (e.g. JSON under `.puppet-master/`). If (B), document format, precedence, and allowlist so it is not cleaned by prepare/cleanup.

**Catalog location**

- Recommend **interview** for the catalog so automation stays focused on running tests and the interview owns "what tools to offer." If automation later needs to branch by framework, it can depend on interview or a shared config layer.

**Evidence path and STATE_FILES**

- Document the standard path `.puppet-master/evidence/gui-automation/...` in STATE_FILES.md (or AGENTS.md) when implementing so the target project's agents and the prompt builder have a single reference.

**Doctor check**

- Add a Doctor check that verifies the headless tool exists and runs when `plan_custom_headless_tool` was true (in scope for this plan; see checklist item **Doctor** in §11).

**YAML and config field names**

- Use consistent names for new interview fields in GUI and YAML and ensure they are serialized in the same config shape used by Option B run-config build.

### 12.6 Additional gaps, issues, and improvements

**Doctor check input (how Doctor knows "plan_custom_headless_tool" was true)**

- Doctor runs with `CheckRegistry` and receives working directory and selected platforms; it has no direct access to `gui_config.interview` or interview state. To run the headless-tool check only when the project planned a custom headless tool, Doctor must infer from disk: e.g. (1) read `test-strategy.json` and treat presence of a `headless_gui` or custom-headless test type (or a dedicated metadata flag) as the trigger, (2) have the interview write a small flag or config under `.puppet-master/` (e.g. `.puppet-master/interview/gui-testing-plan.json` with `plan_custom_headless_tool: true`), or (3) scan test-strategy.md for a "custom headless GUI tool" section. Define the contract so the Doctor check is conditional and does not run when the project never chose the custom headless option.

**Test strategy schema duplication**

- Test strategy JSON is defined in two places: `interview/test_strategy_generator.rs` (`TestItem`, `TestStrategyJson`) and `core/tier_node.rs` (private `TestStrategyItem`, `TestStrategyJson`). The loader in `tier_node` only uses `source_phase_id` and `criterion` today. When adding `headless_gui` / `framework_tool` test types or optional tool metadata, either (1) add fields to both schemas and keep them in sync, or (2) consolidate to a single shared type (e.g. in `types` or re-export from `interview`) and have `tier_node` use it. Document the choice to avoid drift.

**MCP config injection timing and cwd**

- Platform CLIs are spawned with a working directory (project or worktree). MCP config must be present in that cwd (or in the user's home) before the CLI starts. If Puppet Master "injects" by writing project-level files (e.g. `.cursor/mcp.json`, `.mcp.json`), it must write into the **run directory** (the cwd passed to the platform runner), which may be a worktree. Document whether injection happens once at run-config build time (project root) or at spawn time (actual cwd), and how worktrees are handled so MCP is visible to the agent.

**Context7 API key storage and security**

- The plan says persist API key in config and "consider storing it in a user-level or secure store if the project is shared." Implementation should decide: (1) project-only (simple but risky if repo is shared), (2) user-level override (e.g. env var or `~/.puppet-master/mcp-secrets` not in repo), or (3) both with clear precedence. If user-level exists, document it in AGENTS.md and ensure Option B run-config can read it without committing secrets.

**Catalog detection hints and Iced**

- The catalog table suggests "detection hints (e.g. Cargo.toml crate name, package.json deps)." For Iced, the in-repo headless runner lives in `src/automation/` and is not a crate name; detection may need to scan for `headless_runner` or automation modules, or for a known path. Define detection rules per framework so the interviewer reliably sets `detected_gui_frameworks` and does not miss Iced when the project uses this repo's pattern.

**Playwright vs "web" and test strategy generator**

- Today `write_test_strategy` is gated by `generate_playwright_requirements` in the orchestrator; `TestStrategyConfig` has `include_playwright` but no `include_framework_tools` or `plan_custom_headless_tool`. Extending test strategy for newtools requires (1) passing the new interview flags into the completion path so `write_test_strategy` (or equivalent) receives `selected_framework_tools` and `plan_custom_headless_tool`, and (2) extending `TestStrategyConfig` and the generator so markdown and JSON include framework tools and custom headless sections/items. The orchestrator's `InterviewOrchestratorConfig` does not yet have these fields; add them and wire from `gui_config.interview` in `app.rs` (see §2 table).

**Verification command and headless tool binary name**

- The plan suggests a placeholder verification command or a convention. If the project's custom headless tool is a binary (e.g. `cargo run --bin headless_runner` or a script), the test strategy could reference that convention so the generator emits a stable command when the convention is followed. Document the convention (e.g. in AGENTS.md or STATE_FILES) so both the generator and agents agree.

**Version compatibility and platform churn**

- §8.2 notes that platforms change rapidly. Consider adding a Doctor check or a small "platform config" report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions. **In scope:** implement per checklist item **Doctor (platform versions)** in §11.

**Backward compatibility for existing projects**

- Existing projects with test-strategy.md / test-strategy.json generated before newtools should continue to work: the loader in `tier_node` and the prompt builder should tolerate missing `headless_gui` / `framework_tool` items and optional tool metadata. No migration of old files is required; new fields are additive.

**MCP Doctor check (in scope)**

- Add a dedicated Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check. See checklist item **Doctor (MCP)** in §11.

**Catalog version or last-updated (in scope)**

- If the catalog is static, add a version or last-updated timestamp so agents or docs can reference "catalog as of date X" when debugging tool availability. See checklist item **Catalog version** in §11.

---

## 12.5 Crews and Subagent Communication Enhancements for Tool Discovery

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance the **tool discovery and research flow** to enable better coordination between research subagents.

### 1. Research Crews for Parallel Tool Discovery

**Concept:** When the interview performs tool research (e.g., via Context7 MCP, web search, catalog lookup), use crews to coordinate multiple researchers working in parallel.

**Benefits:**
- **Parallel research:** Multiple research subagents can research different tools simultaneously (e.g., `ux-researcher` researches UX tools, `qa-expert` researches testing tools, `test-automator` researches automation tools)
- **Coordinated catalog updates:** Researchers can coordinate catalog entries to avoid duplicates and ensure consistency
- **Conflict resolution:** Researchers can discuss conflicting tool recommendations via crew messages
- **Shared findings:** Research findings are shared via crew messages before catalog update

**BeforeResearch crew creation responsibilities:**

- **Determine research subagents:** Identify which research subagents are needed based on GUI framework and research scope (e.g., Iced framework → `ux-researcher` + `qa-expert` + `test-automator`)
- **Create research crew:** Create crew with selected research subagents, crew_id = `tool-research-{research_id}`
- **Assign research domains:** Divide research scope among crew members (e.g., `ux-researcher` → UX tools, `qa-expert` → testing tools, `test-automator` → automation tools)
- **Initialize research coordination:** Set up message board for research crew with research_id context

**DuringResearch crew coordination responsibilities:**

- **Coordinate research assignments:** Crew members post their assigned research domains to message board to avoid overlap
- **Share research findings:** Crew members post discovered tools to message board as they find them
- **Resolve conflicts:** If crew members find conflicting information about the same tool, they discuss via message board
- **Coordinate catalog entry proposals:** Before proposing catalog entries, crew members post proposed entries to message board for review

**AfterResearch crew completion responsibilities:**

- **Validate research results:** Crew members review each other's research results before catalog update
- **Merge research findings:** Combine findings from all crew members into unified catalog entries
- **Archive research messages:** Archive research crew messages to `.puppet-master/memory/tool-research-{research_id}-messages.json`
- **Disband research crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/interview/research_engine.rs` to create research crews, coordinate research operations, and disband crews after research completes. Integration details match interview plan §4 "Research Crews for Tool Discovery" (see that section for full code examples).

**Integration with research engine:**

In `src/interview/research_engine.rs`, when `execute_research_ai_call` is called for tool research:

```rust
impl ResearchEngine {
    pub async fn execute_research_ai_call(
        &self,
        prompt: &str,
        working_dir: &Path,
        framework: Option<&str>,
    ) -> Result<ResearchResult> {
        // Determine if research should use crew (multiple subagents needed)
        let research_subagents = self.select_research_subagents_for_framework(framework)?;
        
        if research_subagents.len() > 1 {
            // Create research crew and execute parallel research
            self.execute_research_with_crew(prompt, working_dir, framework, &research_subagents).await
        } else {
            // Single-subagent research (no crew)
            self.execute_single_research(prompt, working_dir, framework).await
        }
    }
    
    fn select_research_subagents_for_framework(
        &self,
        framework: Option<&str>,
    ) -> Result<Vec<(String, String)>> {
        // Select research subagents based on framework
        // E.g., Iced → ux-researcher + qa-expert + test-automator
        // E.g., Dioxus → ux-researcher + test-automator
        match framework {
            Some("iced") | Some("Iced") => Ok(vec![
                ("ux-researcher".to_string(), "ux-researcher-1".to_string()),
                ("qa-expert".to_string(), "qa-expert-1".to_string()),
                ("test-automator".to_string(), "test-automator-1".to_string()),
            ]),
            Some("dioxus") | Some("Dioxus") => Ok(vec![
                ("ux-researcher".to_string(), "ux-researcher-1".to_string()),
                ("test-automator".to_string(), "test-automator-1".to_string()),
            ]),
            _ => Ok(vec![("qa-expert".to_string(), "qa-expert-1".to_string())]),
        }
    }
}
```

**Error handling:**

- **Research crew creation failure:** If crew creation fails, log warning and fall back to single-subagent research
- **Research coordination failure:** If message board access fails during research, log warning and continue (crew members work independently)
- **Research validation failure:** If validation fails, log warning and proceed with unvalidated results

### 2. Crew Coordination for Catalog Updates

**Concept:** When research populates or extends the catalog, crew members coordinate to ensure catalog entries are consistent and complete.

**Benefits:**
- **Consistency:** Crew members can review each other's catalog entries
- **Completeness:** Crew members can suggest additional tools or capabilities
- **Validation:** Crew members can validate catalog entries before persistence

**BeforeCatalogUpdate crew coordination responsibilities:**

- **Post proposed catalog entries:** Crew members post proposed catalog entries to crew message board with `message_type` = `Update`
- **Review proposed entries:** Other crew members review proposed entries and post comments/questions via message board
- **Resolve conflicts:** If crew members propose conflicting entries for the same tool, they discuss via message board to reach consensus

**DuringCatalogUpdate crew coordination responsibilities:**

- **Validate entry format:** Crew members validate that proposed entries match `ToolCatalogEntry` schema
- **Check for duplicates:** Crew members check if proposed entries duplicate existing catalog entries
- **Suggest improvements:** Crew members suggest improvements to proposed entries (e.g., additional capabilities, better descriptions)

**AfterCatalogUpdate crew coordination responsibilities:**

- **Confirm catalog update:** Crew members confirm that catalog was updated correctly
- **Archive coordination messages:** Archive catalog coordination messages to `.puppet-master/memory/catalog-update-{update_id}-messages.json`
- **Update crew status:** Mark crew as having completed catalog update coordination

**Implementation:** Extend `src/interview/gui_tool_catalog.rs` to coordinate catalog updates via crew message board before persisting entries.

**Integration with catalog:**

In `src/interview/gui_tool_catalog.rs`, extend catalog update operations:

```rust
impl GuiToolCatalog {
    pub async fn add_entry_with_crew_coordination(
        &self,
        entry: ToolCatalogEntry,
        crew_id: Option<&str>,
    ) -> Result<()> {
        if let Some(crew_id) = crew_id {
            // Post proposed entry to crew for review
            let proposal_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "catalog-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Update,
                subject: "Proposed catalog entry".to_string(),
                content: serde_json::to_string_pretty(&entry)?,
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, proposal_message).await?;
            
            // Wait for crew review (or timeout after 10 seconds)
            let review_responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Answer,
                chrono::Duration::seconds(10),
            ).await?;
            
            // Apply review feedback
            let validated_entry = self.apply_review_feedback(&entry, &review_responses)?;
            
            // Add validated entry to catalog
            self.add_entry(validated_entry).await?;
            
            // Post confirmation to crew
            let confirmation_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "catalog-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Catalog entry added".to_string(),
                content: format!("Catalog entry for {} added successfully", entry.tool_name),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, confirmation_message).await?;
        } else {
            // No crew coordination, add entry directly
            self.add_entry(entry).await?;
        }
        
        Ok(())
    }
    
    fn apply_review_feedback(
        &self,
        entry: &ToolCatalogEntry,
        review_responses: &[AgentMessage],
    ) -> Result<ToolCatalogEntry> {
        let mut updated_entry = entry.clone();
        
        for review in review_responses {
            // Parse review feedback and apply suggestions
            // E.g., if review suggests additional capabilities, add them
            // E.g., if review suggests better description, update it
            // Implementation depends on review message format
        }
        
        Ok(updated_entry)
    }
}
```

**Error handling:**

- **Crew coordination failure:** If crew coordination fails, log warning and proceed with direct catalog update (no coordination)
- **Review timeout:** If crew review times out, log warning and proceed with original entry (no review feedback applied)
- **Review feedback parsing failure:** If review feedback cannot be parsed, log warning and proceed with original entry

## 12.6 Lifecycle and Quality Enhancements for Tool Discovery

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance the **tool discovery and research flow** to improve reliability, quality, and continuity.

### 1. Hook-Based Lifecycle for Tool Research Operations

**Concept:** Apply hook-based lifecycle middleware to tool discovery and research operations. Run **BeforeResearch** and **AfterResearch** hooks when the interview performs tool research (e.g., via Context7 MCP, web search, catalog lookup).

**BeforeResearch hook responsibilities:**

- **Track active research subagent:** Record which subagent is performing research (e.g., `ux-researcher` for UX tool research, `qa-expert` for testing tool research).
- **Inject research context:** Add detected GUI framework, current phase decisions, known tool gaps, and catalog state to research prompt.
- **Load cross-session memory:** Load prior tool choices and framework decisions from `.puppet-master/memory/` and inject into research context.
- **Prune stale catalog entries:** Clean up old catalog research results older than threshold.

**AfterResearch hook responsibilities:**

- **Validate research output format:** Check that research output matches structured handoff contract (see orchestrator plan §2).
- **Update catalog:** If research populated or extended the catalog (§6.2), validate catalog entry format and persist to catalog.
- **Save memory:** Persist tool choices and framework decisions to `.puppet-master/memory/tech-choices.json`.
- **Safe error handling:** Guarantee structured output even on research failure.

**Implementation:** Extend `src/interview/research_engine.rs` to call hooks before and after research operations. Use the same hook registry pattern as orchestrator hooks, but with research-specific contexts (`BeforeResearchContext`, `AfterResearchContext`).

### 2. Structured Handoff Validation for Tool Catalog Updates

**Concept:** When research populates or extends the catalog (§6.2), enforce structured format for catalog entries. Use structured handoff format for research results.

**Catalog entry format:**

```rust
pub struct ToolCatalogEntry {
    pub framework_id: String,
    pub tool_name: String,
    pub description: String,
    pub install_setup: String,
    pub capabilities: Vec<String>,
    pub doc_url: Option<String>,
    pub requires_mcp: bool,
    pub mcp_servers: Vec<String>, // e.g., ["context7", "browser"]
    pub research_source: String, // e.g., "context7", "web", "manual"
    pub research_timestamp: DateTime<Utc>,
}
```

**Validation:** When research adds catalog entries, validate entry format matches `ToolCatalogEntry`. On validation failure, request one retry; after retry, proceed with partial entry but mark catalog as "incomplete."

**Integration:** Extend `src/interview/gui_tool_catalog.rs` to validate entries when research adds them. Use `validate_subagent_output()` pattern adapted for catalog entries.

### 3. Cross-Session Memory for Tool Choices

**Concept:** Persist tool choices (selected framework tools, custom headless tool plans) to `.puppet-master/memory/` so future interview runs or orchestrator runs can load prior tool decisions.

**What to persist:**

- **Tool choices:** Selected framework tools per framework (from user selection in Testing phase).
- **Custom headless tool plans:** Whether custom headless tool was planned, design decisions, evidence paths.
- **Framework decisions:** Detected GUI frameworks and their tool capabilities.

**When to persist:**

- **At Testing phase completion:** Save selected framework tools and custom headless tool plan.
- **At interview completion:** Save all accumulated tool choices.

**When to load:**

- **At interview start:** Load prior tool choices and inject into Testing phase context.
- **At Testing phase start:** Load relevant tool choices for detected frameworks.

**Integration:** Use the same `MemoryManager` from orchestrator plan. In interview orchestrator, call `memory_manager.save_tech_choice()` at Testing phase completion with tool choice entries.

### 4. Active Agent Tracking for Tool Research

**Concept:** Track which subagent is performing tool research at each operation. Store in interview state and expose for logging and debugging.

**Tracking:**

- **Per research operation:** `active_research_subagent: Option<String>` in research context.
- **Persistence:** Write to `.puppet-master/interview/research-subagents.json` (updated on each research operation).

**Use cases:**

- **Logging:** "Research operation: active subagent = ux-researcher, framework = dioxus"
- **Debugging:** "Why did this research fail? Check active research subagent logs."
- **Audit trails:** "Which subagents performed tool research? See research-subagents.json."

### 5. Remediation Loop for Tool Catalog Validation

**Concept:** When catalog validation finds Critical or Major issues (e.g., missing required fields, invalid MCP server names), block catalog update and enter a remediation loop. Re-run research until Critical/Major findings are resolved.

**Severity levels:**

- **Critical:** Missing required fields (framework_id, tool_name), invalid MCP server names -- **block catalog update**.
- **Major:** Missing optional but recommended fields (doc_url, capabilities) -- **block catalog update**.
- **Minor:** Formatting issues, incomplete descriptions -- **log and proceed**.
- **Info:** Suggestions for improvement -- **log and proceed**.

**Remediation loop:**

1. Catalog validator runs after research adds entry.
2. Parse findings from validation output.
3. Filter Critical/Major findings.
4. If Critical/Major exist:
   - Mark catalog entry as "incomplete."
   - Re-run research with remediation request (e.g., "Missing required field 'tool_name'. Please provide complete catalog entry.").
   - Re-run validator.
   - Repeat until Critical/Major resolved or max retries (e.g., 2).
   - If max retries reached, skip entry or mark as "needs manual review."
5. If only Minor/Info findings: log, mark entry complete, proceed.

**Integration:** Extend catalog validation in `src/interview/gui_tool_catalog.rs` to use remediation loop pattern from orchestrator plan.

### Implementation Notes

- **Where:** Extend `src/interview/research_engine.rs` with hook integration; extend `src/interview/gui_tool_catalog.rs` with structured validation; reuse `src/core/memory.rs` for persistence.
- **What:** Add BeforeResearch/AfterResearch hooks; validate catalog entries with structured format; persist tool choices to memory; track active research subagents.
- **When:** Hooks run automatically at research boundaries; memory persists at Testing phase completion; remediation loop runs when catalog validation finds Critical/Major issues.

**Cross-reference:** See orchestrator plan "Lifecycle and Quality Features" for full implementation details. See orchestrator plan "Puppet Master Crews" for how research crews can coordinate tool discovery operations.

## 13. References

- **AGENTS.md:** DRY Method, widget catalog, platform_specs, Pre-Completion Verification Checklist; headless rendering (tiny-skia), automation (headless runner, action catalog); Context7 MCP; platform CLI commands.
- **Plans/interview-subagent-integration.md:** Interview phases (Testing & Verification), test strategy, `generate_playwright_requirements`, Phase 5 document generation, DRY for interview code (§5.2).
- **Plans/orchestrator-subagent-integration.md:** Interview config wiring, test strategy loading in prompts; Codex SDK / Copilot SDK and platform capability manager (§Strategy 4, Subagent Invoker).
- **puppet-master-rs/src/interview/test_strategy_generator.rs:** TestStrategyConfig, TestItem, write_test_strategy, test-strategy.md / test-strategy.json.
- **puppet-master-rs/src/core/prompt_builder.rs:** Load test strategy into iteration context.
- **puppet-master-rs/src/automation/:** Headless runner, action catalog, evidence (timeline, summary).
- **MCP / Context7:** Context7 API keys (https://context7.com/docs/howto/api-keys): Bearer token in `Authorization` header. Cursor CLI MCP (https://cursor.com/docs/cli/mcp); Claude Code MCP (https://code.claude.com/docs/en/mcp); Codex MCP (https://developers.openai.com/codex/mcp); Gemini/Copilot: config paths in §8.2 table.
- **Codex SDK:** https://developers.openai.com/codex/sdk/; TypeScript README https://github.com/openai/codex/tree/main/sdk/typescript. Thread API; MCP via CLI config (TOML).
- **GitHub Copilot SDK:** https://github.com/github/copilot-sdk/tree/main/docs (getting-started, mcp/overview, compatibility). Session `mcpServers`; `copilot --headless`; CLI vs SDK feature matrix in compatibility.md.
