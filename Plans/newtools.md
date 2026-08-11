# GUI Testing Tools & Framework Options -- Implementation Plan


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document describes:

- Extending the interviewer flow to discover and offer GUI/testing tools (existing and custom)
- Supporting headless GUI testing and full debug logs for non-web projects
- Integrating chosen tools into test strategy and execution plans so agents perform deeper, framework-appropriate testing

Implementation must follow the **DRY Method** (AGENTS.md): reuse-first, single source of truth for tool/framework data, tagging of reusable items. **Rollout:** All items in this plan (including Doctor platform versions, MCP Doctor check, and catalog version) are in scope for a single implementation; no phased rollout.

## Rewrite alignment (2026-02-21)
This plan remains authoritative for *what* tool discovery/testing support must exist, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- tool discovery, permissions, and validation live in the **central tool registry + policy engine** (not per-provider special cases)
- tool execution results normalize into the **unified event model** and store through seglog -> projections (redb/Tantivy)
- tool latency and errors from the unified event model feed analytics scan jobs and dashboard rollups
- UI wiring details should be re-expressed in Slint (not Iced) without changing feature semantics
- auth policy remains subscription-first, with Gemini API key as the explicit `key-exception` where the selected provider entry supports it; stale-canon one-provider `mixed-account` Gemini wording and Gemini CLI (`gemini_cli`) active-provider wording are retired in favor of Gemini Direct (`gemini`, key-only/API-key-backed) plus Antigravity CLI as the active Google-owned CLI-runtime route, with requested/effective auth/account identity kept consistent with the shared provider runtime
- for this task, deliverables remain **Plans-folder documentation updates for the Slint rebuild**; no legacy Iced runtime wiring is required

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

### Route, view-state, and automation-default alignment
Tooling summaries must not let shell view commands become target identity owners. `cmd.source_control.switch_subview` is a `/view-state` command for Source Control subview selection; repo, worktree, and `/worktree/compare` target identity stays in the route/open contract and its runtime object envelope. Stored `resume_url` fields in storage-plan and storage-plan.md remain valid resumability hints, but last-opened-view convenience state inside `project_state:v1:{project_id}`, project_state, and project_id must not become operational truth.

Open-resolution and route focus are GUI consumer behavior. `Project_Output_Artifacts`, `Project_Output_Artifacts.md`, Plans/Section15_MVP_Promoted_Features_Spec.md, /Section15_MVP_Promoted_Features_Spec.md, Plans/Tools.md, /Tools.md, Plans/newtools.md, /newtools.md, Plans/Orchestrator_Page.md, /Orchestrator_Page.md, and `/action` references remain adjacent owner or consumer docs; newtools summarizes only that concern-specific records, GUI open affordances, and `/open-resolution` focus must resolve through the shared object/surface route rather than through local tool prose.

Automation defaults are automation-first. `regular`, `visual_mode`, `visual_mode = auto`, Run_Modes, Run_Modes.md, optional HITL, and manual confirmations must map into one coherent mode policy where local visual runs are allowed but do not defeat the automation-first posture or `/HTE-by-default` migration rule. Surface rows should prefer one strong primary line, compact status chips, `/icons`, expandable `/detail`, deep-link pivots, canonical `/surface` target identity, and secondary `/sub-selection` focus rather than overloading the primary command.
## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::supports_effort()`)
   ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth
   ContractRef: Primitive:DRYRules, ContractName:Plans/orchestrator-subagent-integration.md

3. **Tool/Framework Data -- Single Source of Truth:**
   - ✅ **ALWAYS** use `DRY:DATA:gui_tool_catalog` as the single source of truth for tool/framework data
   - ❌ **NEVER** hardcode tool names, installation paths, or framework-specific behavior
   ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

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
8. [MCP Support and GUI Settings](#8-mcp-support-and-gui-settings) (8.1 GUI, 8.2 per-platform + discovery table, 8.3 provider transport/auth taxonomy)
9. [Custom Headless GUI Tool](#9-custom-headless-gui-tool)
10. [Integration with Test Strategy & Plans](#10-integration-with-test-strategy--plans)
11. [Implementation Checklist](#11-implementation-checklist)
12. [Gaps, Risks, and DRY Notes](#12-gaps-risks-and-dry-notes)
13. [Evidence-in-Chat Contract and Flow](#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat)
14. [Live Visualization Execution Architecture](#14-live-visualization-execution-architecture-research-live-visualization)
    - [14.5 Mobile Testing Stacks](#145-mobile-testing-stacks-research-mobile-testing-stacks)
    - [14.6 Preview, Build, Docker, and Actions Contracts](#146-preview-build-docker-and-actions-contracts)
    - [14.7 Docker runtime + DockerHub contract](#147-docker-runtime--dockerhub-contract)
    - [14.8 GitHub Actions settings + generation contract](#148-github-actions-settings--generation-contract)
    - [14.9 Automation migration contract](#149-automation-migration-contract-iced-era-tool-to-slint-era-tooling)
    - [14.10 Doctor and preflight matrix](#1410-doctor-and-preflight-matrix)
15. [References](#15-references)

---

## 1. Executive Summary

Today, the interviewer can generate **Playwright** requirements (an optional/fallback/project-native web test path) and wire them into the test strategy so agents run E2E tests. For **web-based GUIs**, the PM built-in browser automation is the primary native web test path; Playwright is optional, fallback, or project-native, not the native default. Many projects use native or framework-specific GUIs (e.g. Iced, Dioxus, Qt, Electron, Tauri). For those:

- There may be **existing tools** (e.g. Dioxus hot reload + web preview, Iced headless runner, framework-specific test utilities) that the interviewer should **discover and offer**.
- When no suitable tool exists, the interviewer should offer to **plan or build a custom headless GUI tool** that allows headless navigation and produces a **full debug log** after tests, so agents can run smoke tests and interpret results.

This plan adds:

1. **Discovery:** During the interview (especially Architecture and Testing phases), detect GUI stack and search a **single source of truth** for framework-specific tools (existing tools, docs, hot reload, headless options).
2. **User choice:** Present options to the user (use existing tools, plan to build custom tool, or both).
3. **Plan and test strategy:** Write into the generated plans/PRD and test strategy: get existing tools (if chosen), and/or plan to build the custom tool; then integrate tool usage into testing instructions so agents use them during execution.

Result: **More thorough and deeper testing** across web and non-web projects, with agents using the right tools per framework and a consistent path for custom headless + debug logging when needed.

**Success criteria (how we know the plan succeeded):** (1) When a non-web GUI framework is detected, the interview offers framework tools and the custom headless option from the catalog. (2) User choices are persisted and drive test strategy and PRD/plan content (tasks + instructions). (3) Agents receive test strategy that includes framework tools and/or custom headless instructions and evidence paths. (4) When the user chose custom headless, a Doctor check can verify the tool exists and runs (conditional on that choice). (5) MCP (e.g. Context7) is configurable for all supported providers via GUI and applied at run time. (6) Existing Playwright flow (optional/fallback/project-native web test path) and existing test strategy behavior remain unchanged when no new options are selected (no regression); PM built-in browser automation remains the primary native web test path.

---

## 2. Relationship to Other Plans

This plan extends the **interview** and **test strategy**; it does not replace them. New options (framework tools, custom headless) are **interview config** that must be wired like existing options and must align with orchestrator, Worktree, and cleanup behavior.

| Plan | How newtools fits |
|------|-------------------|
| **Plans/interview-subagent-integration.md** | **Phase 8 (Testing & Verification)** already uses qa-expert and test-automator. newtools adds **tool discovery and selection** inside that phase (GUI stack detection, catalog lookup, user options). New fields (`selected_framework_tools`, `plan_custom_headless_tool`, etc.) are **interview config** and must be wired into `InterviewOrchestratorConfig`, set from `gui_config.interview` in `app.rs`, and used at completion when generating test strategy and PRD -- same pattern as `generate_playwright_requirements`. Phase 5 document generation is extended so test strategy and plans include framework tools and custom headless instructions. |
| **Plans/orchestrator-subagent-integration.md** | **Interview config wiring:** Any new interview setting follows the same three-step checklist as in "Interviewer Enhancements and Config Wiring" and "Avoiding Built but Not Wired": add to execution config type, set at construction from `gui_config.interview`, use in interview runtime. **Test strategy** is already loaded and merged into node criteria by the orchestrator; newtools ensures the **new** tool instructions and debug-log paths are part of that merged context so agents see them. Evidence paths (e.g. `.puppet-master/evidence/`) stay as-is; custom headless tool writes evidence in the same style. |
| **Plans/WorktreeGitImprovement.md** | **Config:** New interview toggles live in the Interview tab and `gui_config.interview`; they are persisted and included in the **same Option B run-config build** as other GUI settings (no separate config file). **Worktrees:** When agents run in a worktree, the custom headless tool's evidence path follows the same policy (e.g. `.puppet-master/evidence/` under the workspace used for the run); no change to worktree creation/merge/cleanup. |
| **Plans/MiscPlan.md** | **Cleanup:** `.puppet-master/evidence/` is allowlisted; headless tool evidence is never removed by prepare/cleanup. **Interview output:** Test strategy and interview outputs stay under `.puppet-master/interview/`; newtools only extends **content** (framework tools, custom headless). **run_with_cleanup:** Interview and start_chain continue to use `run_with_cleanup`; newtools does not add new call sites. |

---

## 3. Problem Statement

- **Playwright** (optional/fallback/project-native for web) is the only GUI testing path currently surfaced in the interviewer flow, even though the PM built-in browser automation is the primary native web test path. The interview does not yet discover framework-specific tools for native GUIs.
- **Native/framework GUIs** (Rust/Iced, Dioxus, Qt, Flutter, etc.) have no standardized path in the interview: no discovery of framework-specific tools (e.g. Dioxus devtools, Iced headless runner), and no option to plan or build a project-specific headless tool with full debug output.
- Without a chosen tool or plan, agents cannot reliably run **smoke tests** or **GUI-level verification** on non-web projects, and testing remains shallow.

---

## 4. Goals

- **Discover existing tools:** Interviewer consults a single source of truth (e.g. a catalog or module) mapping GUI frameworks to existing tools (official or community: hot reload, web preview, headless runners, test harnesses).
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7
- **Offer options to the user:** Present: use existing tools only, plan/build custom headless tool only, or both. User choice is stored and drives what gets written into execution plans and test strategy.
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation
- **Custom headless tool option:** When chosen, execution plans MUST include: build (or adopt) a project-specific tool that supports headless GUI navigation and emits a **full debug log** after runs so agents can verify behavior and debug failures.
  ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md
- **Integrate into testing:** Selected tools (existing and/or custom) MUST be reflected in test strategy (e.g. test-strategy.md, test-strategy.json) and in PRD/execution plan language so **agents use the tools** during iterations for smoke and deeper GUI tests.
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading
- **DRY:** One place for framework→tool data; reuse existing interview phase flow, test strategy generator, and prompt/context loading.
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/interview-subagent-integration.md#dry-compliance

---

## 5. Design Overview

- **Where it happens:** Interview flow, primarily **Architecture & Technology** (to detect GUI stack) and **Testing & Verification** (to choose tools and coverage). Optionally use **Product/UX** phase for GUI type (web vs native).
- **Data flow:**
  1. During or after Architecture (and optionally UX), derive **GUI type** and **framework** (e.g. web, Iced, Dioxus, Qt, Flutter, Tauri, Electron).
  2. **Lookup** framework in a **single source of truth** (see §6) to get: existing tools (with names, install/setup, capabilities), and whether a custom headless tool is typically needed.
  3. In Testing phase (or a dedicated "GUI testing tools" step), **present options** to the user: existing tools, custom headless tool plan, or both.
  4. **Persist** user choices in interview state and config (e.g. "use_playwright", "use_framework_tools", "plan_custom_headless_tool", "selected_framework_tools").
     ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring
  5. On interview completion, **write into plans/PRD and test strategy:**
     - Tasks to **obtain/set up** existing tools when selected.
     - Tasks to **plan or build** the custom headless tool when selected (with requirement: headless navigation + full debug log after test runs).
     - **Testing instructions** that tell agents to use the PM built-in browser (primary web path) or Playwright (optional/fallback/project-native for web), selected framework tools, and/or the custom tool for smoke and GUI tests; reference debug log location and format where applicable.

---

## 6. Framework & Tool Discovery (DRY)

### 6.1 Single source of truth

Introduce a **single source of truth** for "GUI framework → available tools" so the interviewer (and any future automation) does not hardcode or duplicate this data.

- **Location (required):** `puppet-master-rs/src/interview/gui_tool_catalog.rs` per §12.5 "Catalog location". Tag as `// DRY:DATA:GuiToolCatalog`.
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2
- **Runtime‑mutable `GuiToolCatalog` (Resolved):**
  - `GuiToolCatalog` is composed of:
    1. **Base catalog** shipped with Puppet Master (curated defaults; DRY:DATA in code).
    2. **User overlay catalog** persisted in app settings (**non‑secret**; redb settings store) and editable via UI; export/import as JSON.
  - Merge precedence: **overlay wins** by stable IDs (`framework_id`, `tool_id`).
  - Research-populated entries are written to the **overlay** (never to the base catalog).
  ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2, PolicyRule:no_secrets_in_storage
- **Content:** A catalog (e.g. struct + const data or table) that for each supported framework (or "web" for the PM built-in browser as the primary web test path, with Playwright optional/fallback/project-native) provides:
  - **Framework ID** (e.g. `web`, `iced`, `dioxus`, `qt`, `flutter`, `tauri`, `electron`).
  - **Display name** and optional **detection hints** (e.g. Cargo.toml crate name, package.json deps).
  - **Existing tools:** list of entries, each with: name, description, install/setup summary, capabilities (e.g. "hot reload", "web preview", "headless test", "real-time dev UI"), and optional doc URL.
  - **Custom headless default:** whether to suggest "plan/build custom headless tool" by default for this framework (e.g. true for Iced when no headless runner in project; false for "web" because the PM built-in browser is the primary web test path and Playwright is optional/fallback/project-native).

**Examples to seed the catalog:**

| Framework | Existing tools (examples) | Custom headless suggestion |
|-----------|---------------------------|----------------------------|
| web       | PM built-in browser (primary), Playwright (optional/fallback/project-native) | No (PM built-in browser is the primary web test path) |
| dioxus    | Dioxus devtools (web preview, hot reload, hot patching) | Optional (if more than preview needed) |
| iced      | In-repo headless_runner (tiny-skia), GUI automation action catalog | Yes, if not already in project |
| qt        | Qt Test, Squish, etc. (research and list) | Often |
| flutter   | Flutter driver, integration_test | Optional |
| tauri     | WebDriver + front-end; Tauri test utils | Optional |
| electron  | Playwright (Electron support, optional/fallback/project-native), Spectron legacy | No (Playwright optional/fallback/project-native) |

Catalog MUST be **extensible** (add new frameworks/tools without changing interviewer flow logic). Implementation MUST provide **DRY:FN** helpers for "lookup by framework", "list tools for framework", "should suggest custom headless for framework".
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

### 6.2 Research as input only (no research-only outcome)

Research (Context7 MCP, web search) may be used to **inform** the catalog or the build plan, but MUST NOT be presented as a standalone research-only outcome. Options:
ContractRef: PolicyRule:Decision_Policy.md§4, Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

- **Catalog population:** When the base+overlay `GuiToolCatalog` has no or sparse data for a framework, research can **add or extend overlay entries** (validated) so the catalog remains the single source of truth and future runs see the data. The user is shown **catalog-backed options** (including newly added entries), not a separate research-only result.
- **Build plan input:** When the user chooses plan/build custom headless GUI tool for an unknown or sparse-catalog framework, research can **inform the design** of that tool. The deliverable is always the **plan to build the full-featured tool** (see §9); research only feeds that plan.

Implementation MUST NOT offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan. For unknown frameworks, the user still gets: catalog options (if research populated the catalog) and/or the option to plan/build the full-featured custom headless tool, with research used only to improve that plan.
ContractRef: PolicyRule:Decision_Policy.md§4

### 6.3 MCP and tool invocation

Some **existing tools** in the catalog (or used during research) rely on **MCP** (Model Context Protocol), e.g. Context7 for documentation lookup, Browser MCP for web testing. For selected tools to be callable when agents run:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager

- **All platforms:** MCP-backed tools MUST be supported and configurable for **all supported providers** (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). Canonical MCP configuration lives in Puppet Master; per-platform files are **derived adapters only** where a platform requires them (see §8.2). Implementation MUST ensure that when the user selects a catalog tool that uses MCP, Puppet Master can **set up and verify** that the tool is available and callable for the node's platform.
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager, Gate:GATE-005
- **Setup and verification:** Implementation MUST provide a way to configure MCP servers (including API keys where required) and to verify that tools are callable (e.g. Doctor check or pre-run check per §11 checklist item **Doctor (MCP)**). Implementation MUST document or implement how MCP config (including Context7 API key and enable/disable state) is passed into the runner or agent environment so that platform CLIs see the correct MCP servers when executing.
  ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005
- **Catalog metadata:** In the GUI tool catalog (§6.1), implementation MUST tag tools that require MCP (via `requires_mcp: bool` and `mcp_servers: Vec<String>` fields per §12.6.2 structured handoff) so the UI can show requirements (e.g. "Requires Context7 MCP" or "Requires Browser MCP"). When such a tool is selected, the run config or prompt builder MUST ensure the corresponding MCP settings are enabled and configured.
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager

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
     - **PM built-in browser** (when "web" is in detected frameworks): primary native web test path. **Playwright** is offered as an optional/fallback/project-native web test path: keep current "Generate Playwright requirements" behavior; present as one option.
     - **Framework tools:** For each detected non-web framework, list existing tools from the catalog; allow user to select which to use (e.g. "Dioxus devtools", "Iced headless runner if present").
     - **Custom headless tool:** Checkbox or option: "plan/build a custom headless GUI tool for the target project (headless navigation + full debug log for agent smoke tests)". Default can come from catalog ("custom headless default" per framework).
  3. **Persist** choices in interview config/state (e.g. `generate_playwright_requirements`, `selected_framework_tools: Vec<FrameworkToolChoice>`, `plan_custom_headless_tool: bool`). Ensure these are wired into `InterviewOrchestratorConfig` and used at completion when generating test strategy and plans (§10). At interview completion, write the Doctor-readable projection into project config: `tools.custom_headless` is written when `plan_custom_headless_tool == true` and removed when `plan_custom_headless_tool == false`.

### 7.3 UI for tool selection

- Reuse existing widgets per **DRY** (`docs/gui-widget-catalog.md`, `src/widgets/`). Use toggles, checkboxes, or multi-select for:
  - Playwright (existing, optional/fallback/project-native web test path); PM built-in browser is the primary web path.
  - Per-framework list of existing tools (select one or more).
  - "plan/build custom headless GUI tool" toggle.
- Tooltips or short help: explain that existing tools come from the catalog; custom tool is full-featured (headless runner, action catalog, full evidence) like Puppet Master's automation. No new one-off UI patterns; tag new reusable widgets with `// DRY:WIDGET:...`. Follow existing accessibility and widget patterns (selectable labels, keyboard navigation, screen reader considerations per `docs/gui-widget-catalog.md`).
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:docs/gui-widget-catalog.md

---

## 8. MCP Support and GUI Settings

This section is a consumer guide only. `Plans/MCP_Integration.md` is the current MCP SSOT.

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/FinalGUISpec.md

### 8.1 Owner document

- `Plans/MCP_Integration.md` is live canon now; it is not future-tense planned work
- naming, availability, credential binding, config schema, and supported flows defer to that owner

### 8.2 GUI/settings alignment

This GUI/settings alignment section mirrors the linked owner contract and stays aligned with it.

ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing

Core rules:
- Legacy `#8.2 GUI/settings alignment` references normalize to this section, with owner-routing back to `Plans/Tools.md` for provider stack, Firecrawl, and web-routing canon.
- This section is the consumer-only GUI/settings alignment landing for `Plans/newtools.md` §8; provider-capability canon lives in Plans/Tools.md sections 11 and 12, while MCP canon lives in `Plans/MCP_Integration.md`.
- global provider stack is user-changeable in Settings.
- per-operation priority reordering is NOT MVP.
- global MVP provider priority is not immutable product policy.
- row-level health/error disclosure and last-failure messaging remain visible in Settings.
- availability plus support-tier visibility in Settings and availability plus support-tier visibility in `/web help/autocomplete` remain mirrored here.
- MCP availability vocabulary points back to `Plans/MCP_Integration.md`.
- `/retire` for this consumer section means stale PM/OpenCode terminology residue is rewritten into PM-native web tool / MCP framing, with repaired owner references to `Plans/Tools.md` and `Plans/MCP_Integration.md`; OpenCode remains reference/provenance only.

Fields:
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
- {server_slug}_{tool_name}

Labels and values:
- GUI/settings alignment
- requested availability
- effective availability
- credential binding

Rules:
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
### 8.2.1 Cited-search landing

This cited-search and search-provider note is non-normative consumer guidance.

ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Required note:
- cited-search wording does not replace provider capability, routing, provenance, or billing canon owned elsewhere.
- Legacy cited-search references, including the heading alias `### 8.2.1 Cited-search and search-provider note`, the `§8.2.1 cited web search` shorthand, and the `cited web search contract`, resolve to this now-written Cited-search landing; these aliases are cross-reference compatibility only, not active search-provider canon.
- The MCP SSOT cross-reference and research session variant cross-reference remain consumer pointers to their owners, not local `newtools.md` canon.
- MCP/web-tooling (`/web-tooling`) guidance in this section is consumer alignment only; owner canon remains `Plans/Tools.md` and `Plans/MCP_Integration.md`.
- See Plans/newtools.md §8 for full list.
- Plans/MCP_Integration.md is live canon now; it is not future-tense planned work.
- Legacy TOC and ENTIRELY MISSING audit wording resolves to this now-written landing; keep that phrase as retired gap history, not active product canon.
- this section is non-normative consumer guidance, not the owner landing for search-provider canon.
- GUI/settings guidance for web-tool providers uses PM product language first: user-facing activity stays `Searching Web`, `Reading Site`, and `Site Reader`, while backend/provider names stay in support, routing, and recovery details.
- Exa-style search may expose a hosted/free-tier path that does not require an API key by default; an optional user API key belongs in global user settings, and rate-limit/fails or 429 states should show user-facing recovery guidance and fallback to another enabled provider before stopping.
- Agent web-search expectations are search, then read top results before answering; PM must not degrade LLM/web-research flows into search-only or instant-answer behavior by default.
- DuckDuckGo/DDG is not treated as a first-party-style full web-search provider unless an official/public full-search API is available; practical DDG wrappers or scraping-based adapters are fallback/compatibility options, not the primary provider contract.
- Site Reader v1 includes full browser interaction capability, not just passive structured reading.
### 8.3 Research session variant reference

Research-session behavior references the shared `research_session` contract in `Plans/Section15_MVP_Promoted_Features_Spec.md`; MCP settings do not redefine it.
## 9. Custom Headless GUI Tool

When the user chooses **"plan/build custom headless GUI tool"**:

### 9.1 Requirement: full-featured (like Puppet Master's automation)


The custom headless GUI tool must be **fully featured**, not minimal. Use **Puppet Master's** automation as the reference (`src/automation/`: headless runner, action catalog, evidence layout). The tool must provide:

- **Headless execution:** Runs without display (CI-friendly); uses software rendering or framework-specific headless mode (e.g. Iced tiny-skia, or framework's own headless API).
- **Action catalog:** A defined set of actions or scenarios so that smoke and regression flows can be scripted and repeated. Not a one-off script -- a reusable catalog the agent can extend and run.
  ContractRef: ContractName:AGENTS.md-action-catalog
  - **Full evidence output:** After each run, the tool MUST produce the **same depth of debug information** as Puppet Master's GUI automation: **Timeline** (e.g. `timeline.jsonl`), **Summary** (e.g. `summary.md`), **Artifacts** (screenshots or state dumps per step), and the canonical manifest described in **§13**. **Consistent paths:** Evidence under `.puppet-master/evidence/gui-automation/<run_id>/`. Optional: **ephemeral workspace clone** as in Puppet Master's headless runner.
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, ContractName:AGENTS.md-evidence

### 9.2 What gets written into plans


- **If get existing tool** (e.g. Iced headless runner already in repo that meets §9.1): Plan steps to **ensure the tool is available** (install/setup), document how to run it and where evidence is written, and reference it in test strategy.
- **If build custom:** Plan steps to **design and implement** a **full-featured** project-specific automation that meets §9.1 (headless runner, action catalog, full evidence: timeline, summary, artifacts). Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack. No minimal smoke harness -- the deliverable is a tool that matches the capability and evidence depth of Puppet Master's automation.
  ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md
- **If both:** Plan to use existing tools where they fit, and add or extend the custom tool for full coverage and evidence.

### 9.3 Reuse of existing automation (Puppet Master reference implementation)

Puppet Master's **headless runner** and **action catalog** in `src/automation/` (AGENTS.md) are the **reference implementation**. For **Iced projects**, the plan should reference reusing or porting that pattern. For other frameworks, the plan describes building or adopting a system that meets the **same contract**: action catalog, timeline + summary + artifacts, standard evidence paths.
ContractRef: ContractName:AGENTS.md, SchemaID:evidence.schema.json

---

## 10. Integration with Test Strategy & Plans

### 10.1 Test strategy (test-strategy.md, test-strategy.json)

- **Extend** test strategy outputs (`test-strategy.md` + `.puppet-master/interview/test-strategy.json`, schema `Plans/test_strategy.schema.json`) to include:
  - **Framework tools:** List of selected framework tool IDs and how they are used (e.g. "Run Dioxus devtools for live preview; use for manual smoke checks" or "Run Iced headless runner with action set X").
  - **Custom headless tool:** When selected, a dedicated section or items that state: "Use the project's headless GUI tool for smoke tests; read evidence at `.puppet-master/evidence/gui-automation/<run_id>/` (timeline, summary, manifest, artifacts) after each run."
  ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2
- **Test types:** Add or reuse test types (e.g. `headless_gui`, `framework_tool`) in addition to `playwright`, so that verification commands and criteria can reference "run headless tool" or "run framework tool X".
- **DRY:** Extend `test_strategy_generator` and `TestItem` (or equivalent) so that new options are generated from the **same** interview state (selected_framework_tools, plan_custom_headless_tool); no duplicate logic in views vs generator.

### 10.2 PRD / execution plans

- **Tasks in the PRD (or execution plan):**
  - "Obtain/set up &lt;existing tool&gt;" when the user selected that tool.
  - "Plan and implement custom headless GUI tool (headless navigation + full debug log)" when the user selected custom tool.
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json
- **Acceptance criteria** for testing nodes MUST reference: run the PM built-in browser (primary, if web) and/or Playwright (optional/fallback/project-native, if web), run selected framework tools, run custom headless tool and check debug log. Prompt builder already loads test strategy; implementation MUST ensure new instructions and paths are included in context so **agents use the tools** during iterations.
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, SchemaID:evidence.schema.json

### 10.3 Prompt and context

- **Prompt builder** already includes test strategy (§5.2 in interview plan, `load_interview_outputs`). Implementation MUST ensure new content (framework tools, custom headless, debug log path) is present in the excerpt so agents see when and how to use each tool and where to find the debug log.
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, ContractName:Plans/interview-subagent-integration.md#dry-compliance

---

## 11. Implementation Checklist

- [ ] **6.1** Add `gui_tool_catalog` module (or equivalent) as single source of truth; implement lookup by framework, list tools, "custom headless default" per framework; tag tools that require MCP. Tag `// DRY:DATA:GuiToolCatalog` and helpers `// DRY:FN:...`.
- [ ] **6.2** Define research as input-only: catalog population and/or build-plan input; no research-only user outcome.
- [ ] **6.3** MCP and tool invocation: ensure MCP is configurable and verifiable for all supported providers; document or implement how MCP config (enablement) and secrets (env/credential store) are applied at run start; tag catalog tools that require MCP; wire MCP config into runner/agent so selected tools are callable.
- [ ] **7.1** Add GUI stack detection (from Architecture/UX or feature_detector); store `detected_gui_frameworks` in interview state.
- [ ] **7.2** In Testing phase, call catalog (and optional research to populate catalog); build options (PM built-in browser primary for web, Playwright optional/fallback/project-native, framework tools, custom headless); persist user choices in interview config/state and wire into `InterviewOrchestratorConfig`.
- [ ] **7.3** Add UI for tool selection using existing widgets; tag new widgets; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes.
- [ ] **8.1** MCP settings in GUI: add **Settings → Advanced → MCP Configuration**; Context7 enabled by default; manage key via OS credential store; toggle to turn Context7 off; wire to GuiConfig and Option B run-config.
- [ ] **8.2** Per-platform MCP: implement central MCP registry + derived adapter config for `CliBridge` providers; `DirectApi` providers use the central tool registry (no provider-side MCP config files). Context7 key is resolved via env/credential store and injected in-memory. See §8.2 and provider transport/auth taxonomy (§8.3).
- [ ] **9** Document custom headless tool as **full-featured** (headless runner, action catalog, full evidence per §9.1); document how plans reference existing automation (e.g. Iced headless runner) vs building new.
- [ ] **10.1** Extend test strategy generator and schema for framework tools and custom headless; add test types and verification commands as needed.
- [ ] **10.2** Ensure PRD/plan generation includes tasks for get existing tools and plan/build custom tool when selected.
- [ ] **10.3** Ensure prompt builder includes new test strategy content (paths, instructions) so agents use the tools.
- [ ] **Doctor** Add a Doctor check that verifies the headless tool exists and runs when `plan_custom_headless_tool` was true (in scope for this plan). Resolve how Doctor discovers that the project planned a custom headless tool (§12.6).
- [ ] **Doctor (platform versions)** Add a Doctor check or small platform config report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions.
- [ ] **Doctor (MCP)** Add a Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check.
- [ ] **Catalog version / last-updated** Expose base catalog version + overlay `last_updated` so agents or docs can reference "catalog as of date X" when debugging tool availability.
- [ ] **DRY** All framework/tool data from catalog only; no hardcoded tool lists in views or prompts. Pre-completion: run AGENTS.md Pre-Completion Verification Checklist.
- [ ] **Gaps §12.6** Address additional gaps before or during implementation: Doctor input, test strategy schema duplication, MCP injection timing/cwd, Context7 key storage, catalog detection hints (e.g. Iced), Playwright/test-strategy wiring, verification command convention.

---

## 12. Gaps, Risks, and DRY Notes

### 12.1 Catalog maintenance

- The catalog will need periodic updates as frameworks and tools evolve. Prefer a single file or module so maintainers know where to add entries. For unknown frameworks, the user still gets the option to plan/build the **full-featured** custom headless tool (§9); research may populate the catalog or inform that build plan, but there is no research-only outcome.

### 12.2 Custom tool scope

- Building a custom headless GUI tool is a substantial task. The plan frames it as **full-featured** from the start (headless runner, action catalog, full evidence: timeline, summary, artifacts), using Puppet Master's automation as the reference. Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner from Puppet Master) when the project uses that stack; for other frameworks, the plan describes building or adopting an analogous **full-featured** system with the same contract. Do not frame the deliverable as a minimal smoke harness -- the goal is a tool that matches the capability and evidence depth of Puppet Master's automation.
ContractRef: ContractName:AGENTS.md, SchemaID:evidence.schema.json

### 12.3 DRY and AGENTS.md

- **Widgets:** Use `docs/gui-widget-catalog.md` and `src/widgets/` for any new interview UI; tag with `// DRY:WIDGET:...`.
- **Data:** All "framework → tools" and "should suggest custom headless" data lives in `GuiToolCatalog` (or equivalent); no duplication in phase prompts or views.
- **Test strategy:** Extend existing `test_strategy_generator` and types; do not duplicate "what tools to use" in multiple places.
- **Pre-completion:** Before marking tasks done: `cargo check`, `cargo test`, DRY checks, no hardcoded tool lists, scope respected.

### 12.4 Consistency with other plans

- **Interview plan** (`Plans/interview-subagent-integration.md`): Testing phase already uses qa-expert and test-automator; add "tool discovery and selection" as part of that phase; config wiring for new options follows "Interviewer Enhancements and Config Wiring" in orchestrator plan.
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-8-testing, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring
- **Orchestrator plan** (`Plans/orchestrator-subagent-integration.md`): Test strategy is already loaded and merged into node criteria; ensure new tool instructions and debug log paths are part of that merged context.
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading

### 12.5 Gaps, issues, and improvements (implementation notes)

The following gaps, ambiguities, and improvements should be resolved during implementation or in a follow-up plan update.

**GUI stack detection vs existing modules**

- The plan says "Use existing feature_detector / technology_matrix if available." In the codebase, `feature_detector` detects **features** (e.g. auth, API, payment) from interview text, not GUI frameworks. `technology_matrix` extracts technology entries (Language, Framework, etc.) from Architecture phase decisions and Q&A. GUI framework detection (web, iced, dioxus, etc.) is **not** currently provided. Implementation MUST add a dedicated **GUI framework detection** step: scan Architecture/UX output and/or project files using catalog detection hints (§6.1), OR extend `TechnologyExtractor` with GUI-framework patterns and derive `detected_gui_frameworks` from the technology matrix. The chosen approach MUST be documented in implementation evidence.
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§2

**Where do "get existing tools" and "plan/build custom tool" tasks live?**

- The plan says "Tasks in the PRD" for obtaining tools and building the custom headless tool. The PRD is produced by the **start_chain** (from requirements), not directly by the interview. Implementation MUST inject these tasks via one of: (1) acceptance criteria or new subtasks in the Testing phase when the PRD is generated (preferred: amend PRD generator to read `selected_framework_tools` and `plan_custom_headless_tool` from interview config and emit corresponding tasks), (2) as content in the requirements document the interview writes so the PRD generator includes them (fallback if PRD generator cannot read interview config), or (3) as a separate execution plan file (e.g. `.puppet-master/interview/gui-testing-plan.md`) that the orchestrator or agents MUST read (only if PRD cannot be amended). The chosen approach MUST be documented in implementation evidence and MUST NOT leave tasks unwired.
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4

**Interview state and config persistence**

- `InterviewState` (in `interview/state.rs`) has no `detected_gui_frameworks` field. `InterviewGuiConfig` / `InterviewOrchestratorConfig` do not yet have the new fields. Implementation MUST add `detected_gui_frameworks: Vec<String>` to `InterviewState`, add `selected_framework_tools: Vec<FrameworkToolChoice>` and `plan_custom_headless_tool: bool` to `InterviewGuiConfig` and `InterviewOrchestratorConfig`; wire them in `app.rs` (set from GUI config when building run config) and in the interview completion path (read when generating test strategy and PRD/execution plans).
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005

**Test strategy JSON schema and backward compatibility**

- The consumer of test-strategy.json is `NodeTree::load_test_strategy` in `core/node_tree.rs` (schema: `Plans/test_strategy.schema.json`). Implementation MUST extend additively: allow new `testType` values (e.g. `headless_gui`, `framework_tool`) and, if structured tool metadata is needed, add optional fields to `TestItem` and to the loader. Backward compatibility is REQUIRED: the loader MUST tolerate missing `headless_gui`/`framework_tool` items and optional tool metadata in existing test-strategy.json files (no migration of old files required; new fields are additive only).
  ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**Verification command for custom headless tool**

- Test items have a literal `verification_command`. For "run headless tool" the exact command is project-specific. The test strategy generator MUST emit a **deterministic convention-based command** when the project follows the documented naming convention (e.g. `cargo run --bin headless_runner` for Rust projects with a `headless_runner` binary; `npm run test:headless` when `package.json` defines it), OR mark the item as **EXAMPLE-only** with an explicit criterion-based instruction (e.g. criterion: "Run the project's headless GUI tool per test-strategy.md; verify evidence exists at `.puppet-master/evidence/gui-automation/timeline.jsonl`", verification_command: "# EXAMPLE: cargo run --bin custom_headless_tool -- --scenario=smoke"). The EXAMPLE marker signals to agents that the command is not executable as-is and must be adapted per project structure.
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4

**GuiToolCatalog persistence (Resolved — runtime-mutable overlay):**
- Base catalog is code-shipped defaults.
- Overlay catalog is stored in app settings (non-secret) and is editable + import/exportable.
- Overlay overrides base entries by stable IDs; overlay entries carry `source` + `last_updated`.
- All catalog update operations must pass structured validation (no duplicates, stable IDs, required fields present).
ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2

**Catalog location**

- Catalog MUST live in **interview** module (`src/interview/gui_tool_catalog.rs`) per PolicyRule:Decision_Policy.md§2 (no scope expansion). Automation stays focused on running tests; interview owns "what tools to offer." If automation later needs to branch by framework, it MUST depend on interview or a shared config layer (no duplication).
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Evidence path and STATE_FILES**

- Implementation MUST document the standard evidence path `.puppet-master/evidence/gui-automation/` in STATE_FILES.md when implementing so the target project's agents and the prompt builder have a single reference. The path MUST be added to the cleanup allowlist so evidence is never removed by prepare/cleanup.
  ContractRef: ContractName:STATE_FILES.md, ContractName:Plans/MiscPlan.md#cleanup, SchemaID:evidence.schema.json

**Doctor check**

- Implementation MUST add a Doctor check that verifies the headless tool exists and runs when `plan_custom_headless_tool` was true (in scope for this plan; see checklist item **Doctor** in §11). The check MUST be conditional: run only when the project planned a custom headless tool (see "Doctor check input" for detection contract).
  ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005

**YAML and config field names**

- Implementation MUST use consistent names for new interview fields in GUI config, YAML config, and `InterviewOrchestratorConfig`: `detected_gui_frameworks`, `selected_framework_tools`, `plan_custom_headless_tool`. These MUST be serialized in the same config shape used by Option B run-config build so GUI, YAML, and runtime see identical values.
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/WorktreeGitImprovement.md#option-b-run-config

### 12.6 Additional gaps, issues, and improvements

**Doctor check input (how Doctor knows "plan_custom_headless_tool" was true)**

- Doctor runs with `CheckRegistry` and receives working directory and selected platforms; it has no direct access to `gui_config.interview` or interview state.

**Custom Headless Tool Detection Contract (Resolved):**

Detection is deterministic and has explicit ownership:
1. **Writer (interview completion path):** After Testing phase choices are finalized, the interview completion pipeline writes `.puppet-master/config.json`:
   - If `plan_custom_headless_tool == true`, write `tools.custom_headless` as either a string path or object `{ "path": "...", "args": [...] }`.
   - If `plan_custom_headless_tool == false`, remove `tools.custom_headless`.
2. **Reader (Doctor):** Doctor checks for `tools.custom_headless` key in the project's `.puppet-master/config.json`.
3. If key exists:
   - Value must be a string (path to executable) or an object `{ "path": "...", "args": [...] }`.
   - Validate: file exists and is executable (`fs::metadata` + permission check).
   - If valid: register the tool in the tool registry with ToolID `CustomHeadlessTool`.
   - If invalid (file missing, not executable): log warning `tool.custom_headless.invalid`, skip registration, continue.
4. If key does not exist: skip (not an error). Emit `tool.custom_headless.skipped` seglog event on first Doctor run.
5. **Evidence:** Doctor check emits a seglog event (`doctor.custom_headless.checked`) recording the detection outcome. This event serves as the implementation evidence.

  ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2

**Test strategy schema duplication**

**Test strategy artifact schema (Resolved):**
- The machine-readable artifact is `.puppet-master/interview/test-strategy.json` with top-level fields `project`, `generatedAt`, `coverageLevel`, `items[]`.
- Canonical JSON Schema lives in `Plans/test_strategy.schema.json` (`SchemaID:pm.test_strategy.schema.v1`).
- Interview writes it; Orchestrator reads it; newtools extends it additively (new `testType` values + optional tool metadata fields).
  ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**MCP config injection timing and cwd**

- `CliBridge` platform CLIs (Cursor/Claude Code) are spawned with a working directory (project or worktree). Derived MCP adapter config (no secrets) MUST be present in the actual spawn cwd (preferred) or a user-level location before the CLI starts. Implementation MUST document: (1) whether adapter generation happens once at run-config build time (project root) OR at spawn-time generation for the actual cwd used by the platform runner, AND (2) how worktrees are handled so adapters are visible when project-local files are required. Preferred per PolicyRule:Decision_Policy.md§2 and Plans/WorktreeGitImprovement.md: generate adapters at spawn-time into the actual run directory (cwd) so worktree runs get correct MCP config; long-lived user/profile config may also be maintained where the provider supports it, but the central registry remains authoritative. `DirectApi` providers do not use provider-side MCP config files.
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2, SchemaID:evidence.schema.json

**API Key Storage (Resolved — credential-store-only):**
- Secrets (tokens/passwords/API keys) MUST NOT be written to:
  - seglog, redb, Tantivy, YAML config, `.puppet-master/config.json`, logs, evidence bundles, or state files.
- Allowed persistence: OS credential store only.
- Resolution precedence:
  1. Environment variables (CI/headless)
  2. OS credential store SecretId (interactive desktop)
- Config stores only non-secret enablement + preference fields; UI shows “Key stored/missing”, never the value.
ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

**Catalog detection hints and Iced**

- The catalog table suggests "detection hints (e.g. Cargo.toml crate name, package.json deps)." For Iced, Puppet Master's in-repo headless runner lives in `src/automation/` and is not a crate name; detection may need to scan for `headless_runner` or automation modules, or for a known path. Implementation MUST define detection rules per framework in the catalog so the interviewer reliably sets `detected_gui_frameworks`. For Iced, preferred detection: check `Cargo.toml` for `iced` dependency OR scan for `src/automation/headless_runner` or `src/automation/action_catalog.rs` (Puppet Master's pattern). The detection rules MUST be documented in the catalog module and MUST NOT miss Iced when the project uses Puppet Master's automation pattern.
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:AGENTS.md, PolicyRule:Decision_Policy.md§2

**Playwright vs "web" and test strategy generator**

- Today `write_test_strategy` is gated by `generate_playwright_requirements` in the orchestrator; `TestStrategyConfig` has `include_playwright` but no `include_framework_tools` or `plan_custom_headless_tool`. Extending test strategy for newtools requires: (1) pass the new interview flags (`selected_framework_tools`, `plan_custom_headless_tool`) into the completion path so `write_test_strategy` receives them, AND (2) extend `TestStrategyConfig` and the generator so markdown and JSON include framework tools and custom headless sections/items. Implementation MUST add these fields to `InterviewOrchestratorConfig` and wire from `gui_config.interview` in `app.rs` (see §2 table, same three-step checklist as other interview config).
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005

**Verification command and headless tool binary name**

- The plan specifies (§12.5 "Verification command for custom headless tool") that the test strategy generator MUST emit a deterministic convention-based command when the project follows the documented naming convention, OR mark the item as EXAMPLE-only. Implementation MUST document the convention (e.g. `cargo run --bin headless_runner` for Rust projects; `npm run test:headless` for Node projects) in AGENTS.md or STATE_FILES.md so both the generator and agents agree. When the convention is followed, the generator emits the stable command; when it is not, the generator emits an EXAMPLE marker plus a criterion-based instruction.
  ContractRef: ContractName:AGENTS.md, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§4

**Version compatibility and platform churn**

- §8.2 notes that platforms change rapidly. Implementation MUST add a Doctor check or a small "platform config" report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions. **In scope:** implement per checklist item **Doctor (platform versions)** in §11.
  ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005

**Backward compatibility for existing projects**

- Existing projects with test-strategy.md / test-strategy.json generated before newtools MUST continue to work: the loader in `node_tree` and the prompt builder MUST tolerate missing `headless_gui` / `framework_tool` items and optional tool metadata. No migration of old files is required; new fields are additive only. Implementation MUST verify backward compatibility via test cases or manual verification with a pre-newtools test-strategy.json file.
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**MCP Doctor check (in scope)**

- Implementation MUST add a dedicated Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check. See checklist item **Doctor (MCP)** in §11.
  ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005

**Catalog version or last-updated (in scope)**

- Implementation MUST provide a base catalog version and overlay last-updated metadata (e.g. `CATALOG_VERSION` const for the base + per-entry `last_updated` in overlay) so agents or docs can reference "catalog as of date X" when debugging tool availability. See checklist item **Catalog version / last-updated** in §11.
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, SchemaID:evidence.schema.json

---

## 12.7 Crews and Subagent Communication Enhancements for Tool Discovery

Tool-discovery crews must follow the reconciled PM crew model rather than older message-board and memory-file assumptions.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

Rules:
- crew members remain PM child runs.
- crew communication occurs through an attributable crew board when crew mode is enabled.
- crew findings must be persisted through canonical event/storage structures, not `.puppet-master/memory/*` files.
- if crew coordination is unavailable, the system may degrade to independent child runs or a single child, but should disclose that it degraded.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md
## 12.8 Lifecycle and Quality Enhancements for Tool Discovery

Tool-discovery lifecycle and quality features must align with canonical child-run, crew, and blocked-state behavior.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

Rules:
- use canonical blocked payload fields and runtime taxonomy.
- use canonical child-run or crew events instead of active-agent side files.
- continuity for tool-discovery workers comes from handoff bundles and canonical state, not child-memory files.
- targeted reroute, replacement, or cancellation must preserve canonical lineage.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md
## 13. Evidence-in-Chat Contract and Flow (research-evidence-media-chat)

This addendum defines how automation evidence should be captured and surfaced directly in chat (inline images, playable recordings/links, and structured metadata for test runs).

### 13.1 Evidence artifact contract (layout + schema + manifest)

**Canonical run layout (per run):**

```text
.puppet-master/evidence/gui-automation/<run_id>/
  manifest.json
  timeline.jsonl
  summary.md
  checks.json
  media/
    screenshots/
      step-001.png
      step-002.png
    recordings/
      run.webm
      run.mp4            # optional fallback transcode
    traces/
      trace.zip          # optional (framework/tool dependent)
    state/
      step-002-dom.html  # optional state dump
```

**Manifest contract (`manifest.json`):**
- `schema_id`, `run_id`, `scenario_id`, `started_at_utc`, `ended_at_utc`, `status`, `tool_name`, `tool_version`
- `timeline_path`, `summary_path`, `checks_path`
- `artifacts[]` list with stable IDs and media metadata:
  - `artifact_id`, `kind` (`screenshot|recording|trace|state|log`), `relative_path`, `mime_type`, `sha256`, `size_bytes`
  - optional render hints: `width`, `height`, `duration_ms`, `poster_path`
  - optional linking: `step_id`, `test_id`, `timeline_seq`, `created_at_utc`
- `chat_cards[]` (pre-ranked "top evidence") for fast rendering in chat:
  - `title`, `artifact_id`, `step_id`, `reason` (e.g., `assertion_failure`), `priority` (0-100)

**Timeline linkage (`timeline.jsonl`):** each event SHOULD reference `artifact_ids[]` so timeline, summary, and media are joinable without path guessing.

**Schema contract (Resolved):**
- `manifest.json` MUST validate against `Plans/gui_automation_manifest.schema.json` (`SchemaID:pm.gui_automation_manifest.schema.v1`).
- `Plans/evidence.schema.json` remains the evidence bundle schema and is **not** extended by this plan.
ContractRef: SchemaID:pm.gui_automation_manifest.schema.v1, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2

### 13.2 Chat rendering behavior + fallback behavior

**Preferred render order (per artifact):**
1. **Inline image card** for `image/*` screenshots/photos (PNG/JPEG/WebP) using markdown image syntax and alt text.[C5][C6]
2. **Inline video player** for `video/webm` or `video/mp4` when client supports it; include poster and controls.[C4]
3. **Playable link fallback** when inline video fails: show signed/local file link + metadata (`duration`, `size`, `sha256`).
4. **Download link fallback** for traces/zip/state dumps with short description.

**Rendering rules:**
- Always show a compact structured header before media:
  - `Run`, `Scenario`, `Status`, `Failed step`, `Timestamp`, `Tool version`.
- For failed tests, render **first failure screenshot + nearest recording segment** first.
- Limit inline payload size; prefer path/resource references over base64 in normal chat.
- If rendering fails, show deterministic fallback message:
  - `Media preview unavailable. Open artifact: <relative_path> (mime=<mime>, sha256=<hash>).`

**MCP-aware behavior:** if tool responses include MCP image/resource content, client can render directly from typed content (`type: image` or `type: resource`) with MIME-aware handling.[C3]

### 13.3 Tool-call and evidence-capture flow during test execution

**Flow (during automation):**
1. `gui_run_scenario` starts run, creates run folder, initializes `manifest.json` + `timeline.jsonl`.
2. For each action/step:
   - append `step.started` event
   - on checkpoint/failure, capture screenshot; append artifact + `step_id` linkage
   - if recording enabled, keep rolling capture and finalize on run end
   - append `step.passed|step.failed` with `artifact_ids[]`
3. On completion:
   - finalize recording (ensure context/runner close semantics for persisted video files).[C1]
   - write `summary.md` and `checks.json`
   - optionally write trace bundle (`trace.zip`) for failed/retried runs.[C2]
   - finalize manifest status and "chat_cards" selections.
4. Chat adapter reads only `manifest.json` first, then lazily loads referenced artifacts.

**Interop note:** for Playwright-based capture, keep attachment metadata (`contentType`, file path) aligned with report attachments semantics so artifacts remain portable across reporters.[C7]

### 13.4 Validation / Doctor checks for evidence usability

Add **Doctor (Evidence Media)** checks:

1. **Layout check:** required files exist (`manifest.json`, `timeline.jsonl`, `summary.md`) for latest run.
2. **Manifest integrity:**
   - every `artifacts[].relative_path` exists
   - MIME is valid for extension
   - `sha256` matches on disk
   - `timeline` references resolve to declared `artifact_id`
3. **Renderability check:**
   - at least one `image/*` artifact for failed runs
   - if recording enabled, at least one playable `video/webm|video/mp4` artifact or explicit `recording_disabled_reason`
   - fallback link generation succeeds for non-inline artifacts
4. **Chat-card quality gate:** at least one `chat_cards` entry for failure, with non-empty `reason`.
5. **Output:** emit `doctor.evidence_media.checked` event with PASS/FAIL + actionable remediation.

**Failure severity:**
- Missing manifest/timeline: **FAIL (block release/testing gate)**
- Missing media for failed run: **WARN** (unless policy requires mandatory video)
- Hash mismatch or broken paths: **FAIL**

---

## 14. Live Visualization Execution Architecture (research-live-visualization)

This section defines the deterministic architecture for **non-headless visual execution** so users can watch automation in real time across web, desktop, iOS, and Android while preserving the same evidence contract from §13.

### 14.1 End-to-end flow: tool selection → launch → interaction → evidence capture → chat display

**Unified orchestrator flow (all platforms):**
1. **Select provider/tool profile** from interview + detected stack:
   - `web.pm_browser.visible`
   - `web.playwright.attach_existing` (backend/compat path, not the primary product model)
   - `desktop.appium.windows` / `desktop.appium.mac2`
   - `ios.appium.xcuitest.simulator` (optional `ios.xcode.preview`)
   - `android.appium.uiautomator2.emulator`
2. **Preflight checks** run (see §14.2). If any hard dependency fails, degrade per §14.3.
3. **Launch visible target** and emit `live.session.started` with:
   - `run_id`, `platform`, `provider`, `pid/session_id`, `display_target`, `artifact_root`
   - `browser_session_id?` and `session_class?` when the visible target is the PM built-in browser
4. **Execute interactions** through the scenario/action catalog (same contract as headless; only backend driver differs).
5. **Capture evidence in parallel** (timeline + screenshots + optional recording/trace) into the shared runtime artifact pipeline.
6. **Stream progress to chat** with low-latency status cards:
   - current step, pass/fail, latest thumbnail, and open/focus hints for the live target
7. **Finalize run** with `manifest.json`, `summary.md`, `checks.json`, then emit `live.session.completed`.
8. **Render evidence in chat** using §13 media rules (inline image/video + deterministic fallback links).

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md

**Platform-specific launch contracts:**
- **Web apps (local browser run/attach):**
  - Primary product path: PM built-in browser `automation_session` for visible browser execution and watchable automation.
  - Backend/compat attach path: external Playwright/CDP attach when the user explicitly wants to watch an already-open browser/profile or when the implementation uses Playwright as a backend adapter.
  - Browser adapter lineage from `/browser-stack` research is reference material only: `wry`, platform engines `WebView2`, `WKWebView`, and `WebKitGTK` with `/X11/Wayland` constraints, `microsoft/playwright`, `Playwright MCP`, `playwright-mcp`, `packages/playwright/src/mcp`, `/playwright/src/mcp`, `cdpEndpoint`, attach-to-existing-browser, file-access, `/eval`, and `IPC` may inform backend adapters, evidence capture, profile/CDP options, and accessibility-snapshot practice; `/playwright` remains test/automation adapter lineage, not PM's visible browser product foundation.
  - The same reference-only lineage preserves Wry child webviews, JS init/eval, custom protocols, and DevTools support by feature/build mode; Playwright contributes navigation, clicks, typing, multi-tab flows, screenshots, tracing, and browser contexts across Linux/macOS/Windows; Playwright MCP provenance includes README/config/tests, capability buckets `core`, `network`, `pdf`, `storage`, `testing`, `vision`, `devtools`, and `config`, default core tools, optional capability-gated tools, persistent vs isolated profiles, snapshot modes, and output/session persistence knobs.
  - Evidence: screenshots/video/trace/structured snapshot semantics must map into the shared artifact contract regardless of backend implementation.
- **Desktop apps (native launch + visible state capture):**
  - Windows: Appium Windows Driver with `appium:app` (launch) or `appium:appTopLevelWindow` (attach existing window).
  - macOS: Appium `mac2` driver for native visible automation.
- **iOS (Xcode previews and/or simulator runs):**
  - Preview mode: Xcode previews for rapid visual iteration of UI states.
  - Automation mode: Appium XCUITest simulator session.
- **Android (emulator-driven runs):**
  - Launch emulator with deterministic AVD profile, then run UiAutomator2 session.
  - Optional direct emulator lifecycle via Android emulator CLI remains valid.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 14.2 Runtime dependencies and environment checks

Add Doctor preflight categories:
- `doctor.live_visualization`
- `doctor.browser.runtime` for the PM built-in browser runtime health required by visible browser sessions

**Required checks (deterministic):**
- **Common**
  - Node/npm available where JS-based providers or MCP servers need them
  - writable evidence/runtime artifact path
  - display availability check (`DISPLAY`/Wayland on Linux, desktop session on macOS/Windows) unless the selected provider explicitly supports an alternative
- **Web / PM built-in browser**
  - PM-managed bundled browser runtime is present, healthy, and version-matched
  - PM browser startup path is healthy for the current desktop session
  - editor-tab browser host and detached browser host can both be validated under the same PM browser abstraction
  - packaging/update/install metadata declares how the selected bundled runtime is installed, updated, verified, cached, removed, and remediated
  - Installer evidence must distinguish current full `/offline` app packaging from "download browser runtime during install" orchestration: Windows `NSIS` copies `puppet-master.exe`, `macOS` `DMG` wraps the app binary/resources, and Linux `DEB`/`/RPM` packages the built binary, desktop entry, and icon until an explicit browser-runtime `/install` bundle policy replaces that baseline.
  - if PM uses `wef`/`cargo-wef`, the auto-downloaded CEF binary distribution is version-pinned and integrity-checked before PM advertises visible browser capability
  - package-size budget for the selected CEF runtime is recorded; roughly ~1 GB additions are surfaced as release/installer metadata rather than hidden Doctor surprises
  - upstream experimental status for a browser wrapper is captured as implementation risk and does not create user-facing experimental runtime toggles
  - target dev server or requested page origin is reachable when the run expects local web content
- **Desktop**
  - Appium server reachable
  - Windows mode: WinAppDriver present/reachable
  - macOS mode: `appium driver list --installed` includes `mac2`
- **iOS**
  - Xcode CLI tools installed, simulator runtime exists
  - Appium XCUITest driver installed; WebDriverAgent prerequisites pass
  - if preview mode is selected, Xcode previews capability is present
- **Android**
  - Android SDK + emulator + adb available
  - requested AVD exists and boots within timeout
  - UiAutomator2 driver installed; device/emulator visible to adb

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Preflight output contract:** emit machine-readable failures as `{ code, severity, dependency, expected, observed, remediation }`.

PM browser runtime failures map to `runtime_unavailable` in requested/effective browser capability disclosure when a PM browser session is involved.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 14.3 Coexistence with headless mode (default/CI fallback policy)

Policy:
- **Default local policy:** `visual_mode = auto`
  - prefer visible mode when an interactive desktop session is available
  - fall back to headless if a required visible dependency is missing
- **CI default policy:** `visual_mode = headless` unless explicitly overridden
- **Manual override:**
  - `visual_mode = forced_visible` -> fail fast if visible prerequisites are missing
  - `visual_mode = forced_headless` -> skip all visible launch steps

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md

For browser-capable web runs:
- the visible path is the PM built-in browser `automation_session`
- missing PM browser runtime prerequisites surface as `runtime_unavailable`
- forced-visible mode must fail fast rather than silently swapping to a different browser product model
- headless fallback remains valid for CI or explicitly headless flows, but it does not redefine the visible browser UX contract

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Required run metadata fields:**
- `requested_visual_mode` (`auto|forced_visible|forced_headless`)
- `effective_visual_mode` (`visible|headless`)
- `fallback_reason` (nullable string enum such as `missing_display`, `runtime_unavailable`, `simulator_unavailable`, or `emulator_boot_timeout`)

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

### 14.4 Deterministic additions required in this plan file

Implementation MUST include these concrete schema/config entries:

1. **`InterviewGuiConfig` + `InterviewOrchestratorConfig` fields**
   - `live_visualization_enabled: bool`
   - `visual_mode: "auto" | "forced_visible" | "forced_headless"`
   - `visual_targets: { web?: bool, desktop?: bool, ios?: "preview"|"simulator"|"both", android?: bool }`

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

2. **`GuiToolCatalog` capability flags**
   - `supports_visible_run`
   - `supports_attach_existing`
   - `supports_recording`
   - `requires_display_server`
   - `supports_pm_built_in_browser_visible`
   - `supports_pm_browser_focus_or_reopen`

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md

3. **Test strategy schema extension (additive)**
   - `test_type` includes `visual_web`, `visual_desktop`, `visual_ios`, `visual_android`
   - optional `visual_launch_command`, `attach_command`, and `evidence_capture_mode`

ContractRef: SchemaID:pm.test_strategy.schema.v1, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

4. **Seglog events**
   - `live.session.started`
   - `live.step.updated`
   - `live.artifact.created`
   - `live.session.completed`
   - `live.session.degraded`
   - visible browser runs additionally carry `browser_session_id?` and `session_class?` when the target is the PM built-in browser

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

5. **Doctor checks**
   - `doctor.live_visualization`
   - `doctor.live_visualization.evidence`
   - `doctor.browser.runtime`

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md

6. **Chat renderer contract**
   - `live_run_card` remains the live status card type
   - open/focus actions for PM browser runs resolve through `browser_session_id` when present rather than raw path guessing
   - artifact links resolve through manifest IDs only

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

---

## 14.5 Mobile Testing Stacks (research-mobile-testing-stacks)

This section adds concrete, command-level defaults for iOS, Android, and Expo/React Native testing and preview workflows.

### 14.5.1 Practical comparison matrix

| Stack | Primary test frameworks | E2E/device testing | Live preview/emulator tooling | Artifact capture | Puppet Master integration strengths | Limits / caveats |
|---|---|---|---|---|---|---|
| **Swift / iOS** | XCTest (`XCTestCase`, assertions, `measure`) | XCUITest (native) + optional Appium XCUITest driver | SwiftUI `#Preview`, `@Previewable`, Xcode Canvas, iOS Simulator | XCTest attachments (project-side), simulator screenshots, Appium iOS screen recording | Best native signal quality; stable for app-internal assertions; easy simulator orchestration hooks | Needs macOS runners/Xcode; simulator orchestration is Apple-tooling specific |
| **Kotlin / Android** | Jetpack Compose testing (`createComposeRule`, semantics matchers) + Espresso instrumentation | UIAutomator / AndroidX instrumentation, optional Appium UiAutomator2 | Android Emulator + ADB; Compose preview/testing sync behavior | ADB/device screenshots & recordings, framework logs, CI artifacts | Strong for both view-level and device-level Android validation; good headless CI path | Fragmented stack (Compose vs View system); emulator/device matrix still needed |
| **Expo / React Native** | Jest/unit + framework-level integration tests | **Default:** Detox (gray-box, RN aware). **Fallbacks:** Maestro (flow-first) and Appium (cross-platform WebDriver) | Expo CLI (`expo start`, `expo run:ios`, `expo run:android`), simulator/emulator shortcuts (`i`/`a`) | Detox artifacts plugin (screenshots/video/logs), Maestro `takeScreenshot`, Appium screenshot/screen-record APIs | Highest reuse for RN teams; good dev-loop + CI parity; multiple E2E fallback choices | Detox setup can be strict; Expo managed/bare differences must be explicit in plans |

### 14.5.2 Recommended path + fallback per stack

1. **Swift/iOS**
   - **Default:** SwiftUI previews (`#Preview`, `@Previewable`) + XCTest/XCUITest on iOS Simulator.
   - **Fallback:** Appium XCUITest driver where cross-platform automation parity is required.

2. **Kotlin/Android**
   - **Default:** Compose UI tests + Espresso for instrumentation + targeted UIAutomator flows for system-level interactions.
   - **Fallback:** Appium UiAutomator2 for teams standardizing on WebDriver tooling.

3. **Expo/React Native**
   - **Default:** Expo CLI dev flow + Detox for E2E on simulator/emulator with artifacts enabled.
   - **Fallback:** Maestro for fast, declarative smoke flows; Appium for multi-platform automation parity.

### 14.5.3 Concrete workflow snippets to include in generated plans

#### A) Swift / iOS

```bash
# Preview/runtime iteration in Xcode (manual)
# Use #Preview and @Previewable in SwiftUI view files, then iterate in Canvas.

# Run unit/UI tests on simulator (CI or local)
xcodebuild test \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 16'

# Capture simulator screenshot artifact
xcrun simctl io booted screenshot .puppet-master/evidence/ios/sim.png
```

#### B) Kotlin / Android

```bash
# Run local JVM tests
./gradlew testDebugUnitTest

# Run instrumentation tests (Compose/Espresso/UIAutomator)
./gradlew connectedDebugAndroidTest

# Capture emulator artifacts
adb exec-out screencap -p > .puppet-master/evidence/android/screen.png
adb shell screenrecord /sdcard/test.mp4
adb pull /sdcard/test.mp4 .puppet-master/evidence/android/test.mp4
```

#### C) Expo / React Native

```bash
# Dev server + simulator/emulator loop
npx expo start      # then press i (iOS sim) or a (Android emulator)

# Native run commands (dev builds)
npx expo run:ios
npx expo run:android

# Detox (default E2E)
detox test -c ios.sim.debug
detox test -c android.emu.debug
```

```json
// detox.config.js artifact baseline
{
  "artifacts": {
    "rootDir": ".puppet-master/evidence/detox",
    "plugins": {
      "screenshot": { "enabled": true, "shouldTakeAutomaticSnapshots": true },
      "video": { "enabled": true },
      "log": { "enabled": true }
    }
  }
}
```

#### D) Fallback E2E snippets

```bash
# Maestro
maestro test flows/smoke.yaml

# Appium (driver-managed screenshots/recordings)
# Use session APIs or executeScript mobile commands in test runtime.
```

## 14.6 Preview, Build, Docker, and Actions Contracts

This section defines deterministic Slint-rebuild behavior for Preview/Build actions and their Docker/GitHub Actions integrations.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/Project_Output_Artifacts.md

### 14.6.1 Preview controls contract (Dashboard + Orchestrator)

**Required UX surfaces:**
- Dashboard Orchestrator Status card includes `PREVIEW`.
- Orchestrator Progress tab `widget.orchestrator_status` includes `Preview`.

**Deterministic behavior:**
1. Resolve preview target from selected stack and `visual_targets` in run config.
2. Launch one preview session per action press with generated `preview_session_id`.
3. Emit session events and evidence (`manifest.json`, `timeline.jsonl`, screenshot/video when available).
4. Show inline chat evidence card for latest preview state and media.
5. If media cannot be rendered inline, show deterministic fallback with clickable artifact path.

**Reserved UI command IDs (canonical):**
- `cmd.orchestrator.preview_open`
- `cmd.orchestrator.preview_stop`
- `cmd.orchestrator.open_preview_artifact`

ContractRef: UICommand:cmd.orchestrator.preview_open, UICommand:cmd.orchestrator.preview_stop, UICommand:cmd.orchestrator.open_preview_artifact, SchemaID:evidence.schema.json

### 14.6.2 Build controls and artifact reporting contract

**Required UX surfaces:**
- Dashboard Orchestrator Status card includes `BUILD`.
- Orchestrator Progress tab `widget.orchestrator_status` includes `Build`.

**Deterministic behavior:**
1. Build action resolves profile (`native`, `web`, `mobile`, `container`) from project stack + settings.
2. Build runs produce a normalized `build_result` payload with:
   - `build_id`
   - `build_profile`
   - `status`
   - `artifacts[]` (`path`, `kind`, `sha256`, `size_bytes`)
   - `logs_path`
3. GUI shows latest artifact list and "open path / copy path" action.
4. Chat shows concise build summary plus artifact links.

**Canonical output-path examples to preserve in docs/UI copy:**
- Linux installer outputs under `installer/linux/` (existing script contract).
- Multi-platform installer helper reports concrete installer paths per platform.

**Reserved UI command IDs (canonical):**
- `cmd.orchestrator.build_run`
- `cmd.orchestrator.open_build_artifact`

ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md

### 14.7 Docker runtime + DockerHub contract

Docker support is expressed through the Docker Manager surface.

Required Docker Manager contract coverage:
- containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes
- Docker as default runtime mode, Podman as alternate runtime mode inside the same surface
- requested vs effective auth capability disclosure for Docker Hub
- protected missing-repository creation and publish-side-effect separation
- doctor/preflight scopes must differentiate build-only, `compose-run`, and publish workflows, and receipt/deep-link attribution must stay app-wide for Source Control, GitHub Actions, Docker Manager, and Orchestrator surfaces in worktree-heavy projects
- `Plans/Containers_Registry_and_Unraid.md` owns the `Preflight and approval ordering contract`, `Kubernetes enablement rules`, `Kubernetes doctor checks`, `Future-scope placeholders` for registry promotion, drift detection, access intelligence, and project-focused K8s deep linkage, and the `Event registration contract`; `Plans/Contracts_V0.md` remains the registration authority for Docker/Unraid events and Kubernetes event names.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Doctor / preflight rules remain canonical here:
- `doctor.docker.engine`
- `doctor.docker.compose`
- `doctor.docker.buildx`
- `doctor.dockerhub.auth.capability`
- `doctor.dockerhub.repo.access`
- Kubernetes-specific runtime checks when Kubernetes subview actions are invoked

`doctor.registry.auth` is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/storage-plan.md

Result payload minima remain authoritative here and must be reused by other docs:
- `docker_auth_result`
- `docker_publish_result`
- `unraid_template_result`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 14.8 GitHub Actions settings + generation contract

GitHub Actions generation and readiness must align with the live GitHub Actions surface.

Required Settings > Advanced coverage:
- workflow template selection
- trigger and matrix controls
- required-secrets readiness checklist
- preview/apply generation flow

Required GitHub Actions surface alignment:
- generated workflows are visible from the `Workflows` subview
- current-branch run behavior and workflow dispatch use the same repository and branch context
- admin readiness for secrets, variables, and environments reuses the same capability/auth model as the live GitHub Actions Settings subview
- `doctor.actions.workflow-ready` remains the canonical readiness gate for workflow generation/apply flows
- repository workflow files under `.github/workflows/` / `github/workflows/` are the runtime source of truth after preview `/save` or apply; `generated-workflow` and generated required-secrets `/configuration` lists are historical hints and must not override current repo `/worktree` workflow `YAML`, hosted `/variables/environments`, or `GitHub Actions > Current Branch` context
- repo-level Actions `/admin` operations create project-scoped `/receipt` records for secret `/update/delete`, variable `/update/delete`, environment `/update/delete/update-rules`, workflow pin `/unpin`, and readiness-check execution; receipts may `/link` a `run_id` through `github_api` evidence but never store secret values or reversible `value-derived` material

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md

### 14.9 Automation migration contract (Iced-era tool to Slint-era tooling)

The existing Iced automation implementation remains a reference pattern, while rewrite deliverables target Slint runtime semantics.

**Required migration boundaries:**
- Keep evidence schema compatibility (`manifest/timeline/media`) across automation backends.
- Introduce backend abstraction so preview/build automation can run with Slint UI surfaces.
- Keep headless and visible modes both supported in the new backend.
- Preserve doctor/preflight checks for automation dependencies and media capture capability.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md#2, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:evidence.schema.json

### 14.10 Doctor and preflight matrix

The Slint rebuild must expose deterministic readiness checks before Preview/Build/Docker/Actions flows execute.

| Check ID | Scope | Required signal | Failure behavior |
|---|---|---|---|
| `doctor.preview.visual-runtime` | preview | Display/runtime dependency available for selected mode (`visible` vs `headless`) | Block preview start; show explicit missing dependency and fallback option |
| `doctor.mobile.ios-simulator` | mobile iOS | Simulator toolchain reachable (`xcodebuild`, `simctl`) | Mark iOS preview/test path unavailable; suggest fallback target |
| `doctor.mobile.android-emulator` | mobile Android | Emulator/ADB reachable | Mark Android preview/test path unavailable; suggest fallback target |
| `doctor.docker.engine` | docker local | Docker daemon reachable and responsive | Block docker preview/build path; show remediation steps |
| `doctor.docker.compose` | docker local | Compose config resolves and service graph validates | Block compose launch; show config error details |
| `doctor.dockerhub.auth.capability` | docker publish | DockerHub auth validated into the requested effective capability set | Block publish; preserve local build results |
| `doctor.actions.workflow-ready` | GitHub Actions | Workflow template validates and required secrets are declared | Block workflow apply; show missing/invalid fields |
| `doctor.evidence.media` | evidence/chat | Manifest + media artifacts are readable and hash-valid | Keep run result, mark evidence degraded with explicit fallback message |
| `doctor.browser.runtime` | PM built-in browser | PM-managed bundled CEF-class runtime is present, healthy, version-matched, and backed by packaging/update/install metadata; `wef`/`cargo-wef` auto-downloaded CEF cache passes integrity checks when that path is selected | Mark visible browser sessions unavailable with `runtime_unavailable`; show remediation and keep source/native surfaces usable |
| `doctor.mcp.context7` | MCP / docs | Context7 enablement is on and a usable key resolves from env or credential store; server can list tools | Keep run usable, but mark Context7-backed tools unavailable and surface remediation |
| `doctor.mcp.provider-ready` | MCP / provider bridge | For each selected provider, MCP bridge/adapters are present and the configured server set exposes the expected tool names | Mark MCP-backed tools unavailable for that provider; do not silently advertise missing tools |
| `doctor.websearch.cited` | cited web search | `websearch_cited` result contract passes a dry-run/provider health check for the configured provider order | Keep run usable, but disable cited web search with explicit config/auth/timeout reason |
| `doctor.gui.custom-headless` | custom GUI tool | When `plan_custom_headless_tool = true`, configured tool path exists, is executable, and produces canonical evidence layout | Mark custom headless path unavailable and point to config/evidence contract remediation |
| `doctor.gui_tool_catalog.freshness` | framework tool catalog | Base catalog version plus overlay `last_updated` metadata are present and readable | Keep run usable, but warn that tool recommendations may be stale and show the recorded snapshot date |

ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json

### 14.10A Debug automation and diagnostic tooling

Tool discovery for Debug Mode must cover more than browser automation. The platform needs enough metadata to select reproduction, instrumentation, trace, and verification tooling automatically.

Debug target mapping rules:
- When the user points Debug Mode at an app or website, PM classifies the target as workspace-built (/workspace), browser/website, or black-box binary/app before choosing tooling. Workspace-built targets may combine temporary server/workspace instrumentation with the local collector; browser/website targets combine server/workspace instrumentation with PM-controlled built-in browser repro automation and capture of console, network summaries, DOM, and /screenshot-style evidence. For black-box targets or user-pasted artifacts where source instrumentation is unavailable, fallback inputs are attach logs, DAP/session tooling, external captures, and attach-to-chat bundles, but PM's native browser stack remains preferred over OSS-style agent-plus-browser patterns for permissions, session identity, and assistant-side evidence packaging.
- The Debug target registry records the selected target shape, including launch config, URL, attach PID, browser session, or imported evidence bundle; PM routes each registered target to the collector through log sink, built-in browser session plus agent tools, DAP adapter, or manual attach intake as applicable.
- The grounded PM Debug core is **H + I + J + E + A**: H points PM at a target; I keeps debug inside the overlay/runtime architecture instead of creating a new runtime mode; J sends evidence through the existing runtime-artifact and seglog pipeline; E covers assistant/session inspection in a Copilot-like way; and A allows temporary instrumentation in MVP only under an explicit instrumentation contract. For MVP web/debug repro, the preferred path is **PM built-in browser + `automation_session`**; process/test/dev-server correlation uses `dev_session_id` / existing `output-problems-ports` linkage, including `/test/dev-server` loops. Classical DAP debugging remains a separate related adapter/surface rather than the primary web repro mode. Cursor-like temporary instrumentation remains in MVP only when the instrumentation contract covers visibility, cleanup, rollback, failure handling, evidence routing, and failed-cleanup escalation.
- Research-grade adapters are explicit advanced options: DAP/session tools with debugger perturbation in the InspectCoder direction, and execution trace to LLM analysis in the snooper-style direction. They are useful evidence and remediation accelerators, but higher novelty and implementation risk keep them behind normal target-registry and policy checks.
- Browser/session automation defaults to an ephemeral automation profile/session. If a target requires authentication and no valid automation session exists, Debug moves to `attention_required` rather than silently reusing an unrelated user profile.
- External Playwright or Browser MCP tooling remains documented for newtools, interview-subagent-integration, interview, test strategy, and generic tool discovery; it is orthogonal to the promoted named-action browser contract unless a product surface explicitly bridges it.
- tool-emitted debug evidence enters chat only through a bounded, user-visible attach model. Ordinary browser capture remains explicit-user-attach, while active Debug investigations may attach agent/session traces and runtime bundles automatically or semi-automatically only when the visible debug-context rules allow it.

#### Enterprise host/trust policy, host declaration preflight, and governance denials

Debug, MCP, custom-plugin, networked-tool, `/shell/debugger`, and `/tunnel/browser` actions run through shared `/trust/proxy/governance` preflight before execution. Every `/custom/plugin/networked` tool profile declares contacted hosts and `/domains` before dispatch; if a run expands to an undeclared host, domain, proxy target, or remote authority, the action returns `blocked_preflight` rather than silently broadening the session permission. Governance denials preserve a machine-readable `deny-code` family for GitHub, registry, Kubernetes, and runtime host-policy checks, while the older permission-era source wording is lineage only. Host/trust decisions that are meant to survive restart must be explicit `/durable` permission or trust records, not inferred from a transient debug run.

#### Debug automation profile instrumentation scope

The Debug automation profile classifies temporary instrumentation scope as exactly `env_config_activation`, `ephemeral_tool_install`, `wrapper_launcher`, `temporary_source_patch`, and `debugger_or_profiler_attach`. Each scope records whether the change is temporary or durable, the expected cleanup path, the sensitive-runtime impact, and the recovery behavior if cleanup fails. `wrapper_launcher` and `debugger_or_profiler_attach` are stricter than read-only inspection because they can perturb process timing, credentials, environment, or attach permissions; `temporary_source_patch` requires a revert path before execution; `ephemeral_tool_install` requires an install location, provenance, and cleanup path before dispatch.

Required discovery outputs are:
- preferred local or remote dev/test runner
- browser automation stack and visibility mode support
- structured log and trace collectors
- source-map or symbolization support where relevant
- DAP adapter availability for the target language/runtime
- temporary instrumentation install / rollback path when framework-native tracing is missing
- target discovery / environment preparation capability that detects stack/runtime, prepares dev session, browser session, debugger attach, or imported bundle intake, and installs/activates tracers or debug tooling when required by the selected policy

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md

Selection order:
- project-native or repo-declared tooling first
- already-installed environment tooling second
- temporary, investigation-scoped tooling /install only when a cleanup path exists and policy allows it
- imported evidence bundles and manual attach remain fallback inputs, not the primary happy path
- escalation continues through non-invasive readback/capture, permitted non-invasive tracers or debugger attachments, temporary instrumentation patches only after lower tiers are insufficient, tentative durable fix, automated verification, and instrumentation removal; unresolved cleanup enters explicit cleanup-recovery before any new mutation-capable loop starts

ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md

Additional doctor checks for Debug Mode:

| Check ID | Scope | Required signal | Failure behavior |
|---|---|---|---|
| `doctor.debug.browser-runtime` | web/debug | Browser runtime and visible automation path are available | keep Debug usable, but hide browser-target automation and explain fallback |
| `doctor.debug.dap-adapter` | debugger | Target DAP adapter or equivalent inspect bridge is reachable | keep investigation usable, but mark classical debugger attach unavailable |
| `doctor.debug.log-trace-pipeline` | evidence | Structured log or trace capture path is readable and bounded | keep run usable, but mark evidence degraded with explicit reason |
| `doctor.debug.instrumentation-scope` | instrumentation | Temporary instrumentation can be written and later removed within declared scope | block instrumentation step and fall back to non-invasive evidence capture |
| `doctor.debug.remote-host` | remote | Remote host satisfies required CLI / tracer / permission prerequisites for PM-managed debug actions | keep thread usable, but block remote debug execution and show remediation |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

## 15. References

- **AGENTS.md:** DRY Method, widget catalog, platform_specs, Pre-Completion Verification Checklist; headless rendering (tiny-skia), automation (headless runner, action catalog); Context7 MCP; platform CLI commands.
- **Plans/interview-subagent-integration.md:** Interview phases (Testing & Verification), test strategy, `generate_playwright_requirements`, Phase 5 document generation, DRY for interview code (§5.2).
- **Plans/orchestrator-subagent-integration.md:** Interview config wiring, test strategy loading in prompts; CLI-native subagent invocation and platform capability manager (§Strategy 4, Subagent Invoker).
- **puppet-master-rs/src/interview/test_strategy_generator.rs:** TestStrategyConfig, TestItem, write_test_strategy, test-strategy.md / test-strategy.json.
- **puppet-master-rs/src/core/prompt_builder.rs:** Load test strategy into iteration context.
- **puppet-master-rs/src/automation/:** Headless runner, action catalog, evidence (timeline, summary).
- **MCP / Context7:** Context7 API keys (https://context7.com/docs/howto/api-keys): Bearer token in `Authorization` header. Cursor CLI MCP (https://cursor.com/docs/cli/mcp); Claude Code MCP (https://code.claude.com/docs/en/mcp); Codex MCP (https://developers.openai.com/codex/mcp). Puppet Master owns MCP centrally per §8.2; `DirectApi` providers do not rely on provider-side MCP config files.
- **[C1] Playwright video persistence and modes:** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/videos.mdx
- **[C2] Playwright tracing + show-trace:** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/trace-viewer-intro.mdx
- **[C3] MCP typed content (image/resource) and tool outputs:** https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- **[C4] HTML video with multi-source + fallback link:** https://github.com/mdn/content/blob/main/files/en-us/web/html/reference/elements/video/index.md
- **[C5] CommonMark image syntax (`![alt](url)`):** https://spec.commonmark.org/0.31.2/index
- **[C6] `img` alt/fallback behavior:** https://github.com/mdn/content/blob/main/files/en-us/web/html/reference/elements/img/index.md
- **[C7] Playwright test attachments (`testInfo.attach`, contentType/path):** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/api/class-testinfo.mdx
- **[LV1] Context7 MCP - Playwright docs (`--headed`, screenshots/videos/traces):** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/running-tests.mdx
- **[LV2] Context7 MCP - Playwright BrowserType launch/headed API:** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/api/class-browsertype.mdx
- **[LV3] Context7 MCP - Appium desktop setup (`appium setup desktop`, `mac2`, screenshot API):** https://github.com/appium/appium/blob/master/packages/appium/docs/en/reference/api/webdriver.md
- **[LV4] Context7 MCP - Appium Windows driver (`app`, `appTopLevelWindow` attach):** https://github.com/appium/appium-windows-driver/blob/master/README.md
- **[LV5] Context7 MCP - Appium XCUITest simulator capability sets + screen recording:** https://appium.github.io/appium-xcuitest-driver/latest/reference/execute-methods
- **[LV6] Apple Developer - Xcode previews:** https://developer.apple.com/documentation/xcode/previewing-your-apps-interface-in-xcode
- **[LV7] Context7 MCP - Appium UiAutomator2 emulator capabilities + MediaProjection recording:** https://github.com/appium/appium-uiautomator2-driver/blob/master/README.md
- **[LV8] Android Developers - emulator command line:** https://developer.android.com/studio/run/emulator-commandline
- **[MOB1] Apple SwiftUI docs (`#Preview`, `@Previewable`, previews in Xcode):** https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/preview%28_%3Abody%3A%29 ; https://developer.apple.com/documentation/swiftui/previewable%28%29 ; https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/previews-in-xcode
- **[MOB2] XCTest basics and CLI selection (Context7: swift-corelibs-xctest):** https://context7.com/swiftlang/swift-corelibs-xctest/llms.txt ; https://github.com/swiftlang/swift-corelibs-xctest/blob/main/README.md
- **[MOB3] Appium XCUITest driver capabilities and WDA attach guidance:** https://appium.github.io/appium-xcuitest-driver/latest/reference/capabilities ; https://appium.github.io/appium-xcuitest-driver/latest/guides/attach-to-running-wda
- **[MOB4] Jetpack Compose testing (synchronization, semantics, APIs):** https://developer.android.com/develop/ui/compose/testing/synchronization ; https://developer.android.com/develop/ui/compose/testing/common-patterns ; https://developer.android.com/develop/ui/compose/testing/apis
- **[MOB5] Android testing samples (Espresso + UiAutomator):** https://github.com/android/testing-samples/blob/main/README.md
- **[MOB6] Expo dev/build workflows (`expo start`, `expo run:*`):** https://docs.expo.dev/develop/development-builds/use-development-builds ; https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build ; https://docs.expo.dev/bare/using-expo-cli
- **[MOB7] Detox artifacts and simulator/emulator run configs:** https://github.com/wix/detox/blob/master/docs/config/artifacts.mdx ; https://github.com/wix/detox/blob/master/docs/guide/developing-while-writing-tests.md
- **[MOB8] Maestro cloud/CI + flow screenshot capture:** https://github.com/mobile-dev-inc/maestro-docs/blob/main/cli/cloud.md ; https://context7.com/mobile-dev-inc/maestro-docs/llms.txt
- **[MOB9] Appium screenshot/screen-record APIs and mobile execute commands:** https://github.com/appium/appium/blob/master/packages/appium/docs/zh/guides/migrating-2-to-3.md ; https://context7.com/appium/appium/llms.txt
- **[DOCKER1] Docker Build and Push Action (`build-push-action`):** https://github.com/docker/build-push-action
- **[DOCKER2] Docker Login Action (`login-action`):** https://github.com/docker/login-action
- **[DOCKER3] Docker Setup Buildx Action (`setup-buildx-action`):** https://github.com/docker/setup-buildx-action
- **[DOCKER4] Docker Scout Action (`scout-action`):** https://github.com/docker/scout-action
- **[DOCKER5] Docker CLI reference:** https://docs.docker.com/reference/cli/docker/
- **[DOCKER6] Docker VS Code extension (reference patterns only):** https://github.com/docker/vscode-extension

### 14.7A DockerHub browser auth, repository management, and Unraid publishing addendum
#### Validation and side-effect boundary matrix

This subsection is authoritative for Build vs Push vs Unraid follow-on behavior.

- `doctor.docker.engine`, `doctor.docker.compose`, `doctor.docker.buildx`, and `doctor.dockerhub.auth.capability` block local Docker build/publish entry points when failing.
- `doctor.dockerhub.repo.access` blocks remote image push when the selected namespace/repository cannot be read or created as required.
- `doctor.unraid.template-repo` does **not** block local Docker image push; it blocks only managed template-repo update / commit / push stages.
- `doctor.unraid.ca-profile` in `needs_review` state does **not** block local Docker image push; it blocks auto-push of the managed template repo and requires visible remediation.
- `push_policy = after_build` MUST dispatch `cmd.orchestrator.push_image` as a separate remote side-effect step after a successful local build result exists.
- Permission-guard or confirmation blocks MUST resolve to `*.blocked` outcomes, not `*.failed`, so runtime failure remains distinct from intentional non-execution.

#### Normative override for §14.7

This subsection is authoritative wherever §14.7 still reads like a PAT-only contract.

- Supported `requested_auth_mode` values are at least `browser` and `pat`.
- Validation MUST resolve requested auth into:
  - `effective_auth_provider_state`
  - `effective_capabilities[]`
  - validated account identity
  - degraded reason when capability is partial
- Namespace/repository discovery and repository creation MUST use the validated effective capability set; the app MUST NOT assume browser login or PAT implies full management access.
- If publish is requested and the target repository does not exist, repository creation MUST be guarded by an explicit confirmation that shows namespace, repository, and privacy. This confirmation is mandatory and cannot be bypassed by YOLO/autonomy behavior.
- Successful publish produces `docker_publish_result`; successful follow-on XML generation / template repo update produces `unraid_template_result`.

#### Canonical doctor / preflight additions for DockerHub + Unraid

#### Canonical doctor ID and action-scope override

- `doctor.registry.auth` is deprecated for DockerHub-specific flows and MUST be treated as an alias of `doctor.dockerhub.auth.capability` only until old references are removed.
- Build-only actions require `doctor.docker.engine` and `doctor.docker.buildx`; they do not require `doctor.docker.compose` or runtime port-availability checks unless the selected build path depends on compose.
- Run/preview actions require `doctor.docker.compose` when compose is the selected runtime path and require port-availability checks only when a user-facing access URL is expected.
- Publish requires `doctor.dockerhub.auth.capability` and `doctor.dockerhub.repo.access`; publish MUST NOT fail solely because compose validation is irrelevant to the selected publish path.

| Check ID | Scope | Required signal | Failure behavior |
|---|---|---|---|
| `doctor.docker.buildx` | docker build | Buildx reachable and usable for the selected build path | Block container build/publish; show remediation |
| `doctor.dockerhub.auth.capability` | docker auth | Requested auth validates into effective capability set and account identity | Block repo browsing/creation/publish; show degraded reason |
| `doctor.dockerhub.repo.access` | docker publish | Selected namespace/repository can be read or created as required | Block publish; preserve local build result |
| `doctor.unraid.template-repo` | unraid managed publishing | Template repo path/remote/branch settings validate and working copy state is safe | Block managed follow-on push/update; keep local publish result |
| `doctor.unraid.ca-profile` | unraid maintainer metadata | `ca_profile.xml` exists or can be generated and any missing public metadata is surfaced as review-required | Allow local generation with warning; block auto-push while review is required |

#### Result payload minima

- `docker_auth_result` MUST include: `requested_auth_mode`, `effective_auth_provider_state`, `effective_capabilities[]`, `effective_account_identity`, `last_validation_timestamp`, `last_validation_host`, `degraded_reason?`
- `docker_publish_result` MUST include: `publish_result_id`, `registry_host`, `namespace`, `repository`, `tags[]`, `digests[]`, `platforms[]`, `sanitized_logs_path`
- `unraid_template_result` MUST include: `publish_result_id`, `template_xml_path`, `template_repo_id`, `maintainer_slug`, `commit_status`, `push_status`, `ca_profile_state`, `review_state`

`unraid_template_result.commit_status` enum:
- `not_attempted`
- `committed`
- `skipped_review_required`
- `skipped_unrelated_changes`
- `failed`

`unraid_template_result.push_status` enum:
- `not_attempted`
- `skipped_auto_push_disabled`
- `push_in_progress`
- `completed`
- `failed`

`unraid_template_result.review_state` enum:
- `clean`
- `needs_review`

`unraid_template_result.ca_profile_state` enum:
- `existing_user_managed`
- `auto_generated_needs_review`
- `project_override_active`

This addendum expands §14.7 so Docker support is first-class rather than limited to basic runtime defaults.

**Normative separation of responsibilities:**
- Use Docker CLI / Buildx for local runtime, image build, login, and push execution.
- Use Docker Hub API only for namespace/repository discovery and repository creation when Puppet Master needs app-managed listing/creation behavior.
- Do not treat DockerHub as a storage location for Unraid XML.

**Expanded runtime/publish flow:**
1. Detect whether the active project is Docker-related.
2. Resolve `requested_auth_mode` and validate `effective_capabilities`.
3. Allow browser/device login or PAT-based auth, with PAT remaining the recommended explicit path.
4. If push is requested and the target repository is missing, gate repository creation behind a mandatory confirmation dialog that shows namespace, repository name, and privacy. This step cannot be bypassed by YOLO/autonomy modes.
5. Build with `docker buildx build`.
6. Run containers for preview/testing when requested and surface user-facing access points when available.
7. Push to DockerHub using the selected namespace/repository/tag set.
8. After successful publish, generate/update Unraid XML by default unless the user disabled it.
9. If managed template-repo workflow is enabled, update the template repo, auto-commit by default, and expose a one-click push UI action while keeping auto-push disabled by default.

**Doctor/preflight additions required by this addendum:**
- `doctor.docker.buildx` — Buildx reachable and usable for the selected build path.
- `doctor.dockerhub.auth.capability` — requested auth validated into effective capability set.
- `doctor.dockerhub.repo.access` — selected namespace/repository can be read, selected, or created as required.
- `doctor.unraid.template-repo` — template repo configuration is valid when managed template publishing is enabled.
- `doctor.unraid.ca-profile` — `ca_profile.xml` exists or can be generated and is surfaced as needing review when auto-generated.

**Evidence/result contract additions:**
- `docker_auth_result` records requested mode, effective capability set, account identity, validation timestamp, and degraded reason if any.
- `docker_publish_result` records registry host, namespace, repository, pushed tags, digest(s), platform list, and sanitized logs path.
- `unraid_template_result` records XML output path, target template repo, maintainer folder, commit status, push status, and whether `ca_profile.xml` was auto-generated or user-edited.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, PolicyRule:no_secrets_in_storage, SchemaID:evidence.schema.json

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/newtools.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### N2-002 - Plan-Only GUI Testing Scope

```yaml
plan_unit_id: N2-002
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Plans/newtools.md is a plan document only for interviewer GUI/testing tool discovery, headless GUI testing/debug logs, and test strategy integration. The single rollout includes Doctor platform versions, MCP Doctor check, and catalog version coverage.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_only_gui_testing_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: plan_only_gui_testing_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0002
preserved_exact_tokens:
- PLAN DOCUMENT ONLY
- Doctor platform versions
- MCP Doctor check
- catalog version
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-003 - Rewrite Tool Registry And Event Alignment

```yaml
plan_unit_id: N2-003
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool discovery, permissions, validation, execution results, storage, latency, errors, analytics, and dashboard rollups align to the central tool registry, policy engine, unified event model, and seglog -> projections through redb/Tantivy.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_tool_registry_event_alignment
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: rewrite_tool_registry_event_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0003
preserved_exact_tokens:
- central tool registry + policy engine
- unified event model
- seglog -> projections (redb/Tantivy)
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
```

### N2-004 - Slint Delivery And Provider Auth Alignment

```yaml
plan_unit_id: N2-004
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: UI wiring is Slint-era only, no legacy Iced runtime wiring is required. Subscription-first auth preserves Gemini Direct gemini, Antigravity CLI as the active Google-owned CLI-runtime route, key-exception semantics where supported, and gemini_cli only as retired/source-lineage vocabulary while retiring stale one-provider mixed-account Gemini wording.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slint_provider_auth_alignment
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: slint_provider_auth_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0003
preserved_exact_tokens:
- Slint
- no legacy Iced runtime wiring
- Gemini Direct
- gemini
- Antigravity CLI
- Gemini CLI
- gemini_cli
- key-exception
- mixed-account
negative_constraints:
- Legacy Iced runtime wiring is not required for this task.
- Do not preserve Gemini CLI or gemini_cli as an active provider route.
compatibility_only_notes:
- Deliverables remain Plans-folder documentation updates for the Slint rebuild.
- Gemini CLI and gemini_cli are retained only as retired/source-lineage vocabulary.
stale_retired_dispositions:
- Stale one-provider mixed-account Gemini wording is retired in favor of Gemini Direct plus Antigravity CLI, with Gemini CLI active-provider wording retired.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
```

### N2-005 - Route/View-State Target Identity Boundary

```yaml
plan_unit_id: N2-005
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: cmd.source_control.switch_subview remains a /view-state command. Repo, worktree, /worktree/compare, route/open target identity, and the runtime object envelope remain the operational target identity owners.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_view_state_target_identity_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: route_view_state_target_identity_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0004
preserved_exact_tokens:
- cmd.source_control.switch_subview
- /view-state
- /worktree/compare
- route/open contract
negative_constraints:
- Tooling summaries must not let shell view commands become target identity owners.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-006 - Open-Resolution And Automation Defaults

```yaml
plan_unit_id: N2-006
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Open-resolution focus resolves through shared object/surface routing. regular, visual_mode, visual_mode = auto, optional HITL, and /HTE-by-default remain one automation-first mode policy with compact status chips, icons, detail, deep-link pivots, surface identity, and sub-selection focus.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: open_resolution_automation_defaults
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: open_resolution_automation_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0004
preserved_exact_tokens:
- /open-resolution
- regular
- visual_mode
- visual_mode = auto
- /HTE-by-default
- /icons
- /detail
- /surface
- /sub-selection
negative_constraints:
- Local visual runs must not defeat the automation-first posture.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-007 - DRY Method Compliance Anchor

```yaml
plan_unit_id: N2-007
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: All implementation in this plan follows Primitive:DRYRules and Plans/DRY_Rules.md#7.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_method_compliance_anchor
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dry_method_compliance_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0005
preserved_exact_tokens:
- DRY Method Compliance
- Primitive:DRYRules
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-008 - Platform And Subagent Registry DRY

```yaml
plan_unit_id: N2-008
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Implementation uses platform_specs:: and subagent_registry:: helpers and never hardcodes platform CLI commands, binary names, models, auth, capabilities, or subagent names.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_subagent_registry_dry
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: platform_subagent_registry_dry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0006
preserved_exact_tokens:
- 'platform_specs::'
- 'subagent_registry::'
- DRY:DATA:subagent_registry
negative_constraints:
- Never hardcode platform CLI commands, binary names, models, auth, capabilities, or subagent names.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/orchestrator-subagent-integration.md'
```

### N2-009 - GuiToolCatalog SSOT

```yaml
plan_unit_id: N2-009
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: DRY:DATA:gui_tool_catalog is the single source of truth for framework/tool data. Tool names, installation paths, and framework-specific behavior are not duplicated in views, prompts, or flow logic.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_tool_catalog_ssot
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_tool_catalog_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0006
preserved_exact_tokens:
- DRY:DATA:gui_tool_catalog
- Tool/Framework Data -- Single Source of Truth
negative_constraints:
- Never hardcode tool names, installation paths, or framework-specific behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-010 - Reusable Tagging And Widget Reuse

```yaml
plan_unit_id: N2-010
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Reusable functions, data structures, widgets, and helpers are tagged. New interview UI checks docs/gui-widget-catalog.md, reuses src/widgets/, and requires UI-DRY-EXCEPTION for bespoke UI.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: reusable_tagging_widget_reuse
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: reusable_tagging_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0006
preserved_exact_tokens:
- DRY:FN
- DRY:DATA
- DRY:WIDGET
- DRY:HELPER
- docs/gui-widget-catalog.md
- src/widgets/
- UI-DRY-EXCEPTION
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-011 - Non-Web GUI Testing Summary

```yaml
plan_unit_id: N2-011
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: PM built-in browser automation is the primary web-based GUI test path; Playwright is optional, fallback, or project-native, not the native default. Native/framework GUIs such as Iced, Dioxus, Qt, Electron, and Tauri need discoverable existing tools or a custom headless GUI tool with full debug logs.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_web_gui_testing_summary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: non_web_gui_testing_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0008
preserved_exact_tokens:
- Playwright
- web-based GUIs
- Iced
- Dioxus
- Qt
- Electron
- Tauri
- full debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-012 - Interview Discovery Choice Flow

```yaml
plan_unit_id: N2-012
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The interview detects GUI stack, discovers existing framework tools, presents user choices for existing tools, custom headless tools, or both, and writes the selected choices into generated plans and test strategy.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_discovery_choice_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_discovery_choice_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0008
preserved_exact_tokens:
- Discovery
- User choice
- Plan and test strategy
- existing tools
- custom headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-013 - Success Criteria And No Regression

```yaml
plan_unit_id: N2-013
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Success requires detected non-web GUI frameworks to offer catalog/custom options, persisted choices to drive strategy and PRD content, agents to receive evidence paths, Doctor to check custom headless when chosen, MCP to be configurable, and unselected flows to preserve existing Playwright (optional/fallback/project-native web test path) behavior while PM built-in browser automation remains the primary native web test path.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: success_criteria_no_regression
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: success_criteria_no_regression
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0008
preserved_exact_tokens:
- Success criteria
- Doctor
- MCP
- Existing Playwright-only flow
- no regression
negative_constraints:
- Existing Playwright-only flow and existing test strategy behavior remain unchanged when no new options are selected.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-014 - Interview And Orchestrator Integration

```yaml
plan_unit_id: N2-014
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: newtools extends interview and test strategy without replacing them. New settings wire through InterviewOrchestratorConfig, gui_config.interview, interview completion, test strategy generation, and orchestrator-loaded node criteria.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_orchestrator_integration
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_orchestrator_integration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0009
preserved_exact_tokens:
- InterviewOrchestratorConfig
- gui_config.interview
- test strategy
- node criteria
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md'
```

### N2-015 - Worktree Config Cleanup Boundary

```yaml
plan_unit_id: N2-015
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Interview toggles live in the Interview tab and gui_config.interview, use the same Option B run-config build, keep worktree evidence under the run workspace, preserve .puppet-master/evidence/ cleanup allowlisting, and add no run_with_cleanup call sites.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_config_cleanup_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: worktree_config_cleanup_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0009
preserved_exact_tokens:
- Option B run-config
- .puppet-master/evidence/
- run_with_cleanup
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md'
- 'ContractRef: ContractName:Plans/MiscPlan.md'
```

### N2-016 - Non-Web GUI Testing Gap

```yaml
plan_unit_id: N2-016
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The current Playwright-as-default interviewer path leaves native/framework GUIs without reliable smoke tests or GUI-level verification, and does not yet treat PM built-in browser automation as the primary native web test path.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_web_gui_testing_gap
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: non_web_gui_testing_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0010
preserved_exact_tokens:
- Playwright
- Native/framework GUIs
- smoke tests
- GUI-level verification
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-017 - Discovery And Choice Goals

```yaml
plan_unit_id: N2-017
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Goals preserve one-catalog discovery of framework tools and user options to select existing tools, custom headless tool planning/building, or both.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: discovery_choice_goals
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: discovery_choice_goals
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0011
preserved_exact_tokens:
- Discover existing tools
- Offer options to the user
- framework tools
- custom headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation'
```

### N2-018 - Custom Headless Evidence Goal

```yaml
plan_unit_id: N2-018
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: When chosen, execution plans include a project-specific tool that supports headless GUI navigation and emits a full debug log after runs so agents can verify behavior and debug failures.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_headless_evidence_goal
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: custom_headless_evidence_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0011
preserved_exact_tokens:
- Custom headless tool option
- headless GUI navigation
- full debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md'
```

### N2-019 - Testing And DRY Integration Goal

```yaml
plan_unit_id: N2-019
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Selected tools and custom headless instructions appear in test strategy, PRD/execution plan language, and agent instructions while framework/tool data stays in one catalog and existing interview, generator, and prompt/context flows are reused.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: testing_dry_integration_goal
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: testing_dry_integration_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0011
preserved_exact_tokens:
- Integrate into testing
- DRY
- test strategy
- PRD
- agents use the tools
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading'
```

### N2-020 - Design Flow

```yaml
plan_unit_id: N2-020
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The design flow derives GUI type/framework, looks up available tools in the catalog, presents Testing-phase options, persists choices, and writes setup/build/testing instructions at interview completion.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: design_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: design_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0012
preserved_exact_tokens:
- GUI type
- framework
- Lookup
- Testing phase
- Persist user choices
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring'
```

### N2-021 - Interview Persistence And Completion Outputs

```yaml
plan_unit_id: N2-021
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Interview state/config persists use_playwright (the optional/fallback/project-native web test path, not the primary web path), use_framework_tools, plan_custom_headless_tool, and selected_framework_tools. Completion writes tasks for existing tool setup, custom headless build/adoption, and testing instructions with debug-log paths.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_persistence_completion_outputs
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_persistence_completion_outputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0012
preserved_exact_tokens:
- use_playwright
- use_framework_tools
- plan_custom_headless_tool
- selected_framework_tools
- debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-022 - Catalog Location And Base Data

```yaml
plan_unit_id: N2-022
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The required GuiToolCatalog location is puppet-master-rs/src/interview/gui_tool_catalog.rs and it is tagged as // DRY:DATA:GuiToolCatalog.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_location_base_data
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_location_base_data
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- puppet-master-rs/src/interview/gui_tool_catalog.rs
- // DRY:DATA:GuiToolCatalog
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
```

### N2-023 - Runtime-Mutable Overlay

```yaml
plan_unit_id: N2-023
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GuiToolCatalog combines a shipped base catalog with a non-secret redb settings overlay editable via UI and JSON import/export. Overlay wins by framework_id and tool_id, and research-populated entries are written to overlay only.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_mutable_catalog_overlay
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: runtime_mutable_catalog_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- Base catalog
- User overlay catalog
- redb settings store
- export/import as JSON
- overlay wins
- framework_id
- tool_id
negative_constraints:
- Research-populated entries are written to the overlay, never to the base catalog.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2, PolicyRule:no_secrets_in_storage'
```

### N2-024 - Catalog Schema And Seed Entries

```yaml
plan_unit_id: N2-024
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Catalog content preserves framework IDs web, iced, dioxus, qt, flutter, tauri, electron, detection hints, existing tool entries, custom headless default, and the compatibility-only Spectron legacy seed row.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_schema_seed_entries
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_schema_seed_entries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- web
- iced
- dioxus
- qt
- flutter
- tauri
- electron
- Spectron legacy
negative_constraints: []
compatibility_only_notes:
- Spectron legacy is retained as compatibility-only seed vocabulary.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-025 - Catalog Extensibility Helpers

```yaml
plan_unit_id: N2-025
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The catalog is extensible without changing interviewer flow logic and provides DRY helpers for lookup by framework, listing tools for a framework, and deciding whether to suggest custom headless.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_extensibility_helpers
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_extensibility_helpers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- lookup by framework
- list tools for framework
- should suggest custom headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
```

### N2-026 - Research Input-Only Constraint

```yaml
plan_unit_id: N2-026
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Context7 MCP and web search may inform catalog population or build plans but must not be presented as standalone research-only outcomes; unknown frameworks still get catalog-backed options and/or the full-featured custom-headless option.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_input_only_constraint
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: research_input_only_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0015
preserved_exact_tokens:
- Context7 MCP
- web search
- research-only outcome
negative_constraints:
- Research MUST NOT be presented as a standalone research-only outcome.
- Implementation MUST NOT offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-027 - MCP All-Provider Boundary

```yaml
plan_unit_id: N2-027
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: MCP-backed tools are supported and configurable for Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, and Gemini through Puppet Master owned configuration; per-platform files are derived adapters only where required.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_all_provider_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_all_provider_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0016
preserved_exact_tokens:
- Cursor
- Claude Code
- OpenCode
- Codex
- GitHub Copilot
- Gemini
- derived adapters
negative_constraints:
- Per-platform MCP files are derived adapters only, not canonical configuration owners.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-028 - MCP Setup And Verification

```yaml
plan_unit_id: N2-028
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Implementation configures and verifies MCP servers and API-key enablement so platform CLIs see selected tools at run time through config files, env vars, flags, or runtime adapters as appropriate.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_setup_verification
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_setup_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0016
preserved_exact_tokens:
- MCP
- API-key enablement
- config files
- env vars
- runtime adapters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-029 - MCP Catalog Metadata And UI Disclosure

```yaml
plan_unit_id: N2-029
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Catalog tools expose requires_mcp and mcp_servers so UI, run config, and prompt builder can disclose and enable required MCP servers when selected.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_catalog_metadata_ui_disclosure
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_catalog_metadata_ui_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0016
preserved_exact_tokens:
- requires_mcp
- mcp_servers
- UI
- run config
- prompt builder
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager'
```

### N2-030 - GUI Framework Detection State

```yaml
plan_unit_id: N2-030
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Architecture, UX, and project dependency inputs produce detected_gui_frameworks: Vec<String> for subsequent GUI testing tool flow.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_framework_detection_state
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_framework_detection_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0018
preserved_exact_tokens:
- 'detected_gui_frameworks: Vec<String>'
- Architecture
- UX
- feature_detector
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-031 - Testing-Phase Options

```yaml
plan_unit_id: N2-031
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Testing & Verification looks up detected GUI frameworks in GuiToolCatalog, optionally research-populates sparse catalog entries, and offers the PM built-in browser (primary for web), Playwright (optional/fallback/project-native for web), framework tools, and custom headless options.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: testing_phase_options
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: testing_phase_options
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0019
preserved_exact_tokens:
- Testing & Verification
- GuiToolCatalog
- Playwright
- Framework tools
- Custom headless tool
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-032 - Choice Persistence And Doctor Projection

```yaml
plan_unit_id: N2-032
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: selected_framework_tools and plan_custom_headless_tool persist in interview config/state, and completion writes or removes the Doctor-readable project config projection tools.custom_headless.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: choice_persistence_doctor_projection
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: choice_persistence_doctor_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0019
preserved_exact_tokens:
- selected_framework_tools
- plan_custom_headless_tool
- tools.custom_headless
- Doctor-readable projection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-033 - Tool Selection UI Reuse

```yaml
plan_unit_id: N2-033
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The tool-selection UI reuses existing widgets and accessible toggles, checkboxes, or multi-select controls for Playwright (optional/fallback/project-native for web), per-framework existing tools, and the custom-headless option with tooltips and no one-off UI patterns; the PM built-in browser remains the primary web test path.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_selection_ui_reuse
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_selection_ui_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0020
preserved_exact_tokens:
- Playwright
- multi-select
- custom headless GUI tool
- DRY:WIDGET
- keyboard navigation
- screen reader
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:docs/gui-widget-catalog.md'
```

### N2-034 - MCP Consumer Boundary

```yaml
plan_unit_id: N2-034
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Section 8 is consumer guidance only. Plans/MCP_Integration.md is the current MCP SSOT and owns naming, availability, credential binding, config schema, and supported flows.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_consumer_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0022
preserved_exact_tokens:
- MCP Support and GUI Settings
- Plans/MCP_Integration.md
- live canon now
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP naming, availability, credential binding, config schema, and supported flows.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-035 - GUI Settings Provider Availability Mirror

```yaml
plan_unit_id: N2-035
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GUI/settings alignment mirrors Plans/Tools.md and Plans/MCP_Integration.md. The global provider stack is user-changeable, per-operation priority reordering is not MVP, global MVP provider priority is not immutable policy, and row-level health/error disclosure remains visible.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_settings_provider_availability_mirror
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_settings_provider_availability_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0023
preserved_exact_tokens:
- GUI/settings alignment
- global provider stack
- per-operation priority reordering is NOT MVP
- row-level health/error disclosure
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Tools.md owns provider stack, Firecrawl, and web-routing canon.
- Plans/MCP_Integration.md owns MCP availability vocabulary.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing'
```

### N2-036 - Firecrawl Defaults And Status Vocabulary

```yaml
plan_unit_id: N2-036
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Settings guidance preserves authenticated/expired/not_authenticated, connected/disabled/needs_auth/needs_client_registration/failed, LoggedIn/LoggedOut/AuthExpired/AuthFailed, {server_slug}_{tool_name}, provider ID firecrawl, display Firecrawl, priority below Exa/Tavily and above DDG, and default disabled.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_status_vocabulary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: firecrawl_status_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0023
preserved_exact_tokens:
- authenticated
- expired
- not_authenticated
- connected
- disabled
- needs_auth
- needs_client_registration
- failed
- LoggedIn
- LoggedOut
- AuthExpired
- AuthFailed
- '{server_slug}_{tool_name}'
- firecrawl
- Firecrawl
- Exa
- Tavily
- DDG
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-037 - Cited-Search Compatibility Boundary

```yaml
plan_unit_id: N2-037
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Cited-search wording is non-normative consumer guidance. Legacy aliases resolve here for cross-reference compatibility only and do not replace provider capability, routing, provenance, or billing canon.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cited_search_compatibility_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: cited_search_compatibility_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0024
preserved_exact_tokens:
- cited-search
- cited web search contract
- Legacy TOC
- ENTIRELY MISSING
negative_constraints:
- Cited-search wording does not replace provider capability, routing, provenance, or billing canon.
compatibility_only_notes:
- Legacy cited-search aliases resolve to this landing for cross-reference compatibility only.
- Legacy TOC and ENTIRELY MISSING audit wording is retired gap history, not active product canon.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
```

### N2-038 - Web-Tool Search Behavior And Site Reader

```yaml
plan_unit_id: N2-038
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Web-tool consumer guidance preserves user-facing activities Searching Web, Reading Site, and Site Reader; hosted/free-tier Exa-style search; agent search-then-read expectations; DDG fallback/compatibility status; and Site Reader v1 full browser interaction.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_tool_search_site_reader
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: web_tool_search_site_reader
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0024
preserved_exact_tokens:
- Searching Web
- Reading Site
- Site Reader
- Exa
- DuckDuckGo/DDG
- Site Reader v1
negative_constraints:
- PM must not degrade LLM/web-research flows into search-only or instant-answer behavior by default.
- DuckDuckGo/DDG wrappers or scraping adapters are fallback/compatibility options, not the primary provider contract.
compatibility_only_notes:
- DDG wrappers or scraping-based adapters are fallback/compatibility options.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-039 - Research Session Variant Pointer

```yaml
plan_unit_id: N2-039
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Research-session behavior references the shared research_session contract in Plans/Section15_MVP_Promoted_Features_Spec.md; MCP settings do not redefine it.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_session_variant_pointer
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: research_session_variant_pointer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0025
preserved_exact_tokens:
- research_session
- Plans/Section15_MVP_Promoted_Features_Spec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Section15_MVP_Promoted_Features_Spec.md owns research_session behavior.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-040 - Headless Execution And Action Catalog

```yaml
plan_unit_id: N2-040
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Chosen custom headless GUI tools run without display in CI-friendly mode and provide a reusable action catalog or scenario set for smoke and regression flows rather than one-off scripts.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: headless_execution_action_catalog
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: headless_execution_action_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0027
preserved_exact_tokens:
- Headless execution
- CI-friendly
- Action catalog
- not a one-off script
negative_constraints:
- The custom headless GUI tool must not be a one-off script.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md-action-catalog'
```

### N2-041 - Full Evidence Output

```yaml
plan_unit_id: N2-041
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Each custom headless run emits Timeline timeline.jsonl, Summary summary.md, artifacts such as screenshots or state dumps per step, the canonical manifest described in Section 13, and evidence under .puppet-master/evidence/gui-automation/<run_id>/.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: full_evidence_output
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: full_evidence_output
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0027
preserved_exact_tokens:
- Timeline
- timeline.jsonl
- Summary
- summary.md
- Artifacts
- screenshots
- state dumps
- .puppet-master/evidence/gui-automation/<run_id>/
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, ContractName:AGENTS.md-evidence'
```

### N2-042 - Plan Outputs For Existing Custom Both

```yaml
plan_unit_id: N2-042
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated plans document setup/use of selected existing tools, design and implementation of full-featured custom headless tools, or combined coverage using existing tools where they fit and custom tooling for full coverage and evidence.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_outputs_existing_custom_both
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: plan_outputs_existing_custom_both
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0028
preserved_exact_tokens:
- If get existing tool
- If build custom
- If both
- full-featured
negative_constraints:
- Custom headless deliverables are not minimal smoke harnesses.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md'
```

### N2-043 - Puppet Master Automation Reference

```yaml
plan_unit_id: N2-043
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Puppet Master src/automation/ headless runner and action catalog are the reference implementation for Iced projects and analogous framework automation systems.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_automation_reference
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: puppet_master_automation_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0029
preserved_exact_tokens:
- src/automation/
- headless runner
- action catalog
- Iced
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md, SchemaID:evidence.schema.json'
```

### N2-044 - Test Strategy Tool Evidence Outputs

```yaml
plan_unit_id: N2-044
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: test-strategy.md and .puppet-master/interview/test-strategy.json include selected framework tool IDs, custom headless evidence instructions, debug-log paths, and usage notes for agents.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_strategy_tool_evidence_outputs
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: test_strategy_tool_evidence_outputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0031
preserved_exact_tokens:
- test-strategy.md
- .puppet-master/interview/test-strategy.json
- selected framework tool IDs
- debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2'
```

### N2-045 - Test Types And DRY Generator

```yaml
plan_unit_id: N2-045
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Test strategy generation adds or reuses headless_gui and framework_tool test types through the same interview state and generator, without duplicating tool-selection logic in views and generators.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_types_dry_generator
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: test_types_dry_generator
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0031
preserved_exact_tokens:
- headless_gui
- framework_tool
- test_strategy_generator
- TestItem
negative_constraints:
- Do not duplicate what tools to use across views and generators.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-046 - PRD Execution Plan Tasks And Acceptance Criteria

```yaml
plan_unit_id: N2-046
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: PRD or execution plans include obtain/setup tasks for selected tools and custom-headless design/build tasks when selected. Acceptance criteria require the PM built-in browser (primary, if web) and/or Playwright (optional/fallback/project-native, if web), selected framework tools, and custom headless runs plus debug-log checks as applicable.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prd_execution_acceptance_criteria
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: prd_execution_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0032
preserved_exact_tokens:
- Obtain/set up
- Plan and implement custom headless GUI tool
- Acceptance criteria
- debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, SchemaID:evidence.schema.json'
```

### N2-047 - Prompt Context Injection

```yaml
plan_unit_id: N2-047
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Prompt builder includes framework tools, custom headless instructions, debug-log paths, and other new test strategy content in the loaded test strategy excerpt so agents know when and how to use each tool.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prompt_context_injection
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: prompt_context_injection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0033
preserved_exact_tokens:
- Prompt builder
- load_interview_outputs
- debug log path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, ContractName:Plans/interview-subagent-integration.md#dry-compliance'
```

### N2-048 - In-Window Implementation Checklist Mirror

```yaml
plan_unit_id: N2-048
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Lines 386-400 of the implementation checklist mirror covered requirements for GuiToolCatalog, research input-only, MCP invocation, GUI stack detection, Testing-phase options, tool-selection UI, MCP settings, custom headless, test strategy, PRD/execution plans, prompt context, and the custom-headless Doctor check. This checklist mirror is not WorkNode or task-manifest creation.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source lines 386-400 remain losslessly available for exact-text audit.
- The checklist items covered by this window remain represented as PlanUnit mirror coverage only.
- newtools-S0034 lines 401-408 are covered by N2-049 after Phase 2B batch 105.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: implementation_checklist_mirror_partial
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: implementation_checklist_mirror_partial
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0034
preserved_exact_tokens:
- Implementation Checklist
- '6.1'
- '6.2'
- '6.3'
- '7.1'
- '7.2'
- '7.3'
- '8.1'
- '8.2'
- '9'
- '10.1'
- '10.2'
- '10.3'
- Doctor
negative_constraints:
- This checklist mirror does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-049 - Residual Implementation Checklist Quality Gates

```yaml
plan_unit_id: N2-049
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Lines 401-405 of the implementation checklist require Doctor platform version reporting, an MCP Doctor check, catalog version/overlay last_updated, DRY-only catalog data with no hardcoded tool lists, and closure of the listed Section 12.6 gaps. This is checklist mirror coverage only and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_checklist_quality_gates
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: residual_checklist_quality_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0034
preserved_exact_tokens:
- Doctor (platform versions)
- Doctor (MCP)
- Catalog version / last-updated
- DRY
- Gaps §12.6
negative_constraints:
- This checklist mirror creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-050 - Catalog Maintenance And Unknown Framework Fallback

```yaml
plan_unit_id: N2-050
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool catalog maintenance stays centralized in one file or module. Unknown frameworks still offer the option to plan/build the full-featured custom headless tool; research may populate the catalog or inform that plan, but there is no research-only user outcome.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_maintenance_unknown_framework_fallback
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_maintenance_unknown_framework_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0036
preserved_exact_tokens:
- full-featured
- research-only outcome
negative_constraints:
- Unknown framework handling must not become a research-only outcome.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-051 - Full-Featured Custom Headless Tool Scope

```yaml
plan_unit_id: N2-051
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Custom headless GUI tools are substantial, full-featured systems with headless runner, action catalog, timeline, summary, and artifacts. Puppet Master automation is the reference for Iced; other frameworks need analogous evidence depth, and the deliverable must not be framed as a minimal smoke harness.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: full_featured_custom_headless_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: full_featured_custom_headless_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0037
preserved_exact_tokens:
- full-featured
- headless runner
- action catalog
- timeline
- summary
- artifacts
- Iced
- minimal smoke harness
negative_constraints:
- Do not frame the deliverable as a minimal smoke harness.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md, SchemaID:evidence.schema.json'
```

### N2-052 - Interview Widget Reuse

```yaml
plan_unit_id: N2-052
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: New interview UI uses docs/gui-widget-catalog.md and src/widgets/ and tags widgets with // DRY:WIDGET:... .
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_widget_reuse
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0038
preserved_exact_tokens:
- docs/gui-widget-catalog.md
- src/widgets/
- // DRY:WIDGET
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-053 - Tool Data And Test Strategy DRY Gates

```yaml
plan_unit_id: N2-053
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Framework/tool data lives only in GuiToolCatalog or equivalent, test strategy behavior extends existing generator/types instead of duplicating tool-use rules, and pre-completion requires cargo check, cargo test, DRY checks, no hardcoded tool lists, and scope respected.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_data_test_strategy_dry_gates
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_data_test_strategy_dry_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0038
preserved_exact_tokens:
- GuiToolCatalog
- test_strategy_generator
- cargo check
- cargo test
- no hardcoded tool lists
negative_constraints:
- Framework/tool data must not be hardcoded outside the catalog.
- Test strategy behavior must not duplicate tool-use rules across multiple places.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-054 - Interview Testing Phase Consistency

```yaml
plan_unit_id: N2-054
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The interview plan Testing phase already uses qa-expert and test-automator; newtools adds tool discovery and selection as part of that phase, with config wiring following orchestrator config wiring.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_testing_phase_consistency
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_testing_phase_consistency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0039
preserved_exact_tokens:
- qa-expert
- test-automator
- tool discovery and selection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-8-testing, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring'
```

### N2-055 - Orchestrator Test Strategy Merge Consistency

```yaml
plan_unit_id: N2-055
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Orchestrator test strategy loading and node-criteria merging must include new tool instructions and debug-log paths in the merged context.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_test_strategy_merge_consistency
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: orchestrator_test_strategy_merge_consistency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0039
preserved_exact_tokens:
- test strategy
- node criteria
- debug log paths
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading'
```

### N2-056 - GUI Framework Detection Gap

```yaml
plan_unit_id: N2-056
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Implementation must add a dedicated GUI framework detection step from Architecture/UX output, project files, or catalog detection hints, or extend TechnologyExtractor with GUI-framework patterns and derive detected_gui_frameworks; the chosen approach must be documented in implementation evidence.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_framework_detection_gap
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_framework_detection_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- feature_detector
- technology_matrix
- TechnologyExtractor
- detected_gui_frameworks
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§2'
```

### N2-057 - PRD Tool Task Injection Path

```yaml
plan_unit_id: N2-057
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tasks for obtaining selected tools and building custom headless tooling must be injected through the PRD generator, requirements document fallback, or separate .puppet-master/interview/gui-testing-plan.md only if PRD cannot be amended; the implementation must document the chosen path and must not leave tasks unwired.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prd_tool_task_injection_path
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: prd_tool_task_injection_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- PRD generator
- .puppet-master/interview/gui-testing-plan.md
- tasks unwired
negative_constraints:
- Implementation must not leave tool setup or custom-headless tasks unwired.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4'
```

### N2-058 - Interview State And Config Persistence

```yaml
plan_unit_id: N2-058
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'InterviewState gains detected_gui_frameworks: Vec<String>, while InterviewGuiConfig and InterviewOrchestratorConfig gain selected_framework_tools: Vec<FrameworkToolChoice> and plan_custom_headless_tool: bool; app.rs and interview completion wire those values into test strategy and PRD/execution-plan generation.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_state_config_persistence
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_state_config_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- InterviewState
- 'detected_gui_frameworks: Vec<String>'
- InterviewGuiConfig
- InterviewOrchestratorConfig
- 'selected_framework_tools: Vec<FrameworkToolChoice>'
- 'plan_custom_headless_tool: bool'
- app.rs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-059 - Additive Test Strategy Schema Compatibility

```yaml
plan_unit_id: N2-059
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: NodeTree::load_test_strategy and Plans/test_strategy.schema.json extend additively for headless_gui, framework_tool, and optional tool metadata while preserving backward compatibility for existing files and requiring no migration of old files.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: additive_test_strategy_schema_compatibility
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: additive_test_strategy_schema_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- NodeTree::load_test_strategy
- Plans/test_strategy.schema.json
- headless_gui
- framework_tool
- no migration of old files required
negative_constraints: []
compatibility_only_notes:
- Backward compatibility is required for existing test-strategy files.
- No migration of old files is required.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2'
```

### N2-060 - Custom Headless Verification Command Convention

```yaml
plan_unit_id: N2-060
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The test strategy generator emits a deterministic convention-based command when the project follows documented naming, or an EXAMPLE-only command with criterion-based instructions when the executable command is project-specific.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_headless_verification_command_convention
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: custom_headless_verification_command_convention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- verification_command
- cargo run --bin headless_runner
- npm run test:headless
- EXAMPLE-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4'
```

### N2-061 - Runtime-Mutable GuiToolCatalog Overlay

```yaml
plan_unit_id: N2-061
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The base catalog is code-shipped defaults; the overlay is stored in non-secret app settings, is editable/importable/exportable, overrides base entries by stable IDs, carries source and last_updated, and all updates pass structured validation.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_mutable_gui_tool_catalog_overlay
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: runtime_mutable_gui_tool_catalog_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- Resolved — runtime-mutable overlay
- stable IDs
- last_updated
- structured validation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2'
```

### N2-062 - Catalog Module Ownership Boundary

```yaml
plan_unit_id: N2-062
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The catalog must live in src/interview/gui_tool_catalog.rs; automation stays focused on running tests, and any later framework branching depends on interview or shared config rather than duplicating catalog data.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_module_ownership_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_module_ownership_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- src/interview/gui_tool_catalog.rs
- interview owns what tools to offer
- automation runs tests
negative_constraints:
- Framework/tool catalog data must not be duplicated in automation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Interview owns what tools to offer; automation remains focused on running tests.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
```

### N2-063 - GUI Automation Evidence Path State Files

```yaml
plan_unit_id: N2-063
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: .puppet-master/evidence/gui-automation/ must be documented in STATE_FILES.md and added to the cleanup allowlist so generated evidence is never removed by prepare/cleanup.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_automation_evidence_path_state_files
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_automation_evidence_path_state_files
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- .puppet-master/evidence/gui-automation/
- STATE_FILES.md
- cleanup allowlist
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:STATE_FILES.md, ContractName:Plans/MiscPlan.md#cleanup, SchemaID:evidence.schema.json'
```

### N2-064 - Conditional Custom Headless Doctor Check

```yaml
plan_unit_id: N2-064
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor conditionally verifies that the custom headless tool exists and runs when plan_custom_headless_tool was true, using the Section 12.6 detection contract as input.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: conditional_custom_headless_doctor_check
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: conditional_custom_headless_doctor_check
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- Doctor check
- plan_custom_headless_tool
- detection contract
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-065 - Consistent Interview Config Field Names

```yaml
plan_unit_id: N2-065
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GUI config, YAML config, and InterviewOrchestratorConfig use the same field names detected_gui_frameworks, selected_framework_tools, and plan_custom_headless_tool, serialized through the Option B run-config shape.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: consistent_interview_config_field_names
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: consistent_interview_config_field_names
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- detected_gui_frameworks
- selected_framework_tools
- plan_custom_headless_tool
- Option B run-config
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/WorktreeGitImprovement.md#option-b-run-config'
```

### N2-066 - Custom Headless Detection Contract

```yaml
plan_unit_id: N2-066
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Interview completion writes .puppet-master/config.json with tools.custom_headless only when plan_custom_headless_tool == true; Doctor reads that key, validates string/object shape and executable path, registers CustomHeadlessTool only when valid, warns and skips invalid values, skips cleanly when absent, and emits doctor.custom_headless.checked.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_headless_detection_contract
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: custom_headless_detection_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- tools.custom_headless
- CustomHeadlessTool
- tool.custom_headless.invalid
- tool.custom_headless.skipped
- doctor.custom_headless.checked
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2'
```

### N2-067 - Test Strategy Artifact Schema Ownership

```yaml
plan_unit_id: N2-067
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: .puppet-master/interview/test-strategy.json has top-level project, generatedAt, coverageLevel, and items[]; Plans/test_strategy.schema.json remains canonical schema pm.test_strategy.schema.v1; interview writes it, orchestrator reads it, and newtools extends it additively.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_strategy_artifact_schema_ownership
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: test_strategy_artifact_schema_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- .puppet-master/interview/test-strategy.json
- project
- generatedAt
- coverageLevel
- items[]
- pm.test_strategy.schema.v1
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2'
```

### N2-068 - MCP Adapter Injection CWD Boundary

```yaml
plan_unit_id: N2-068
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: CliBridge provider MCP adapter config is derived from the central registry and generated before CLI start in the actual spawn cwd, preferably at spawn time so worktree runs see correct project-local files; DirectApi providers do not use provider-side MCP config files.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_adapter_injection_cwd_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_adapter_injection_cwd_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- CliBridge
- actual spawn cwd
- worktree
- DirectApi
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The central MCP registry remains authoritative; provider-side files are derived adapters only.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2, SchemaID:evidence.schema.json'
```

### N2-069 - Credential-Store-Only API Key Storage

```yaml
plan_unit_id: N2-069
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Secrets must not be written to seglog, redb, Tantivy, YAML config, .puppet-master/config.json, logs, evidence bundles, or state files. Allowed persistence is OS credential store only, with environment variables first and credential-store SecretId second, and UI shows only key stored/missing.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: credential_store_only_api_key_storage
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: credential_store_only_api_key_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- seglog
- redb
- Tantivy
- .puppet-master/config.json
- OS credential store
- SecretId
- Key stored/missing
negative_constraints:
- Secrets must not be written to seglog, redb, Tantivy, YAML config, .puppet-master/config.json, logs, evidence bundles, or state files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
```

### N2-070 - Iced Catalog Detection Hints

```yaml
plan_unit_id: N2-070
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Catalog detection rules must reliably set detected_gui_frameworks; for Iced, preferred detection checks Cargo.toml for iced or scans for src/automation/headless_runner or src/automation/action_catalog.rs, and must not miss Puppet Master automation pattern.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: iced_catalog_detection_hints
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: iced_catalog_detection_hints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- Cargo.toml
- iced
- src/automation/headless_runner
- src/automation/action_catalog.rs
negative_constraints:
- Detection must not miss Iced when the Puppet Master automation pattern is present.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:AGENTS.md, PolicyRule:Decision_Policy.md§2'
```

### N2-071 - Playwright And Framework Tool Strategy Wiring

```yaml
plan_unit_id: N2-071
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: write_test_strategy, TestStrategyConfig, InterviewOrchestratorConfig, and app.rs must pass selected_framework_tools and plan_custom_headless_tool through interview completion so markdown and JSON include framework tools and custom headless sections/items.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: playwright_framework_tool_strategy_wiring
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: playwright_framework_tool_strategy_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- write_test_strategy
- TestStrategyConfig
- InterviewOrchestratorConfig
- app.rs
- selected_framework_tools
- plan_custom_headless_tool
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-072 - Headless Tool Binary Convention Documentation

```yaml
plan_unit_id: N2-072
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The generator and agents share documented command conventions in AGENTS.md or STATE_FILES.md, emitting stable commands when conventions are followed and EXAMPLE markers plus criterion-based instructions otherwise.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: headless_tool_binary_convention_documentation
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: headless_tool_binary_convention_documentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- AGENTS.md
- STATE_FILES.md
- EXAMPLE
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§4'
```

### N2-073 - Doctor Platform Version Report

```yaml
plan_unit_id: N2-073
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor or a small platform config report records CLI version per platform, such as agent --version or codex --version, so support can correlate behavior with platform churn.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: doctor_platform_version_report
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: doctor_platform_version_report
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- agent --version
- codex --version
- platform churn
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-074 - Existing Test Strategy Backward Compatibility

```yaml
plan_unit_id: N2-074
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Existing pre-newtools test-strategy.md and test-strategy.json continue to work; loader and prompt builder tolerate missing headless_gui and framework_tool items and optional tool metadata, with verification by tests or manual pre-newtools fixture.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: existing_test_strategy_backward_compatibility
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: existing_test_strategy_backward_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- test-strategy.md
- test-strategy.json
- headless_gui
- framework_tool
negative_constraints: []
compatibility_only_notes:
- No migration of old files is required.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md§2'
```

### N2-075 - MCP Doctor Reachability Check

```yaml
plan_unit_id: N2-075
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor verifies configured MCP servers such as Context7 are reachable or can list tools per selected platform, complementing the headless-tool check.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_doctor_reachability_check
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_doctor_reachability_check
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- Context7
- list tools
- headless-tool check
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-076 - Catalog Version And Overlay Metadata

```yaml
plan_unit_id: N2-076
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The catalog exposes a base CATALOG_VERSION and overlay last_updated metadata so agents and docs can reference catalog freshness while debugging tool availability.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_version_overlay_metadata
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_version_overlay_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- CATALOG_VERSION
- last_updated
- catalog freshness
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, SchemaID:evidence.schema.json'
```

### N2-077 - Tool Discovery Crew Communication Boundary

```yaml
plan_unit_id: N2-077
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool-discovery crews follow PM child-run behavior, communicate through an attributable crew board when enabled, persist findings through canonical event/storage structures rather than .puppet-master/memory/*, and disclose degradation to independent child runs or a single child when crew coordination is unavailable.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_discovery_crew_communication_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_discovery_crew_communication_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0042
preserved_exact_tokens:
- crew board
- .puppet-master/memory/*
- child runs
negative_constraints:
- Crew findings must not be persisted through .puppet-master/memory/* files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Crew findings are persisted through canonical event/storage structures.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md'
```

### N2-078 - Tool Discovery Lifecycle Canon

```yaml
plan_unit_id: N2-078
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool-discovery lifecycle and quality features use canonical blocked payload fields, runtime taxonomy, child-run or crew events, handoff bundles, canonical state, and lineage-preserving reroute, replacement, or cancellation instead of active-agent or child-memory side files.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_discovery_lifecycle_canon
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_discovery_lifecycle_canon
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0043
preserved_exact_tokens:
- blocked payload fields
- runtime taxonomy
- handoff bundles
- canonical lineage
negative_constraints:
- Tool discovery continuity must not depend on active-agent side files or child-memory files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical state and events own tool-discovery continuity.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md'
```

### N2-079 - GUI Automation Evidence Run Layout

```yaml
plan_unit_id: N2-079
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Each GUI automation run stores manifest.json, timeline.jsonl, summary.md, checks.json, screenshots, recordings, traces, and optional state dumps under .puppet-master/evidence/gui-automation/<run_id>/.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_automation_evidence_run_layout
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_automation_evidence_run_layout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0045
preserved_exact_tokens:
- manifest.json
- timeline.jsonl
- summary.md
- checks.json
- run.webm
- run.mp4
- trace.zip
- .puppet-master/evidence/gui-automation/<run_id>/
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-080 - Manifest Metadata And Chat Cards

```yaml
plan_unit_id: N2-080
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: manifest.json records run identity, timing, status, tool name/version, artifact paths, stable artifact metadata including hashes and render hints, optional step/test/timeline linkage, and pre-ranked chat_cards[] for fast chat rendering.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: manifest_metadata_chat_cards
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: manifest_metadata_chat_cards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0045
preserved_exact_tokens:
- schema_id
- artifact_id
- mime_type
- sha256
- chat_cards[]
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-081 - Timeline Linkage And Manifest Schema Boundary

```yaml
plan_unit_id: N2-081
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: timeline.jsonl events should reference artifact_ids[]; manifest.json validates against Plans/gui_automation_manifest.schema.json with SchemaID:pm.gui_automation_manifest.schema.v1, and Plans/evidence.schema.json remains unextended by this plan.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: timeline_manifest_schema_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: timeline_manifest_schema_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0045
preserved_exact_tokens:
- artifact_ids[]
- Plans/gui_automation_manifest.schema.json
- SchemaID:pm.gui_automation_manifest.schema.v1
- Plans/evidence.schema.json
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/evidence.schema.json remains the evidence bundle schema and is not extended by this plan.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.gui_automation_manifest.schema.v1, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2'
```

### N2-082 - Chat Evidence Media Render Order

```yaml
plan_unit_id: N2-082
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Chat renders evidence media in order: inline image card for image artifacts, inline video player for supported WebM/MP4 with poster and controls, playable link fallback for video failure, and download link fallback for traces, zips, and state dumps.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_evidence_media_render_order
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: chat_evidence_media_render_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0046
preserved_exact_tokens:
- Inline image card
- Inline video player
- Playable link fallback
- Download link fallback
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-083 - Chat Rendering Rules And MCP Typed Content

```yaml
plan_unit_id: N2-083
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Chat evidence shows a compact structured header, prioritizes first failure screenshot plus nearest recording segment, avoids base64 in normal chat, uses deterministic preview fallback text, and may render MCP type: image or type: resource content with MIME-aware handling.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_rendering_mcp_typed_content
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: chat_rendering_mcp_typed_content
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0046
preserved_exact_tokens:
- Media preview unavailable
- 'type: image'
- 'type: resource'
negative_constraints:
- Normal chat should prefer path/resource references over base64.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-084 - GUI Scenario Evidence Capture Lifecycle

```yaml
plan_unit_id: N2-084
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: gui_run_scenario creates the run folder, initializes manifest/timeline, records step start/pass/fail events with artifact linkage, captures screenshots and optional recordings/traces, writes summary/checks, finalizes chat_cards, and lets chat load artifacts lazily from the manifest.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_scenario_evidence_capture_lifecycle
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_scenario_evidence_capture_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0047
preserved_exact_tokens:
- gui_run_scenario
- step.started
- step.passed|step.failed
- artifact_ids[]
- chat_cards
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-085 - Playwright Evidence Attachment Interop

```yaml
plan_unit_id: N2-085
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Playwright-based capture keeps attachment metadata such as contentType and file path aligned with report attachment semantics so evidence remains portable across reporters.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: playwright_evidence_attachment_interop
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: playwright_evidence_attachment_interop
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0047
preserved_exact_tokens:
- Playwright
- contentType
- report attachments
negative_constraints: []
compatibility_only_notes:
- Playwright attachment metadata is compatibility/interoperability guidance.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-086 - Evidence Media Doctor Checks

```yaml
plan_unit_id: N2-086
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor Evidence Media checks validate required layout files, artifact path/hash/MIME integrity, timeline artifact references, renderability for failed runs, fallback link generation, chat-card quality, and emit doctor.evidence_media.checked with PASS/FAIL and remediation.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_media_doctor_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: evidence_media_doctor_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0048
preserved_exact_tokens:
- doctor.evidence_media.checked
- chat_cards
- PASS/FAIL
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-087 - Evidence Media Failure Severity

```yaml
plan_unit_id: N2-087
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Evidence media failures classify missing manifest/timeline as FAIL, missing failed-run media as WARN unless policy requires mandatory video, and hash mismatch or broken paths as FAIL.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_media_failure_severity
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: evidence_media_failure_severity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0048
preserved_exact_tokens:
- FAIL
- WARN
- Hash mismatch
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-088 - Live Visualization Execution Scope

```yaml
plan_unit_id: N2-088
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Live visualization defines non-headless visual execution for web, desktop, iOS, and Android so users can watch automation in real time while preserving the Section 13 evidence contract.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_execution_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_execution_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0049
preserved_exact_tokens:
- non-headless visual execution
- web
- desktop
- iOS
- Android
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-089 - Live Visualization Unified Orchestrator Flow

```yaml
plan_unit_id: N2-089
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Unified live visualization selects a provider/tool profile, runs preflight, launches a visible target, emits live.session.started, executes scenario actions, captures evidence in parallel, streams progress to chat, finalizes manifest/summary/checks, emits live.session.completed, and renders evidence using Section 13 media rules.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_unified_orchestrator_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_unified_orchestrator_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0050
preserved_exact_tokens:
- live.session.started
- live.session.completed
- web.pm_browser.visible
- desktop.appium.windows
- ios.appium.xcuitest.simulator
- android.appium.uiautomator2.emulator
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md'
```

### N2-090 - Visible Web Browser Product Boundary

```yaml
plan_unit_id: N2-090
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Web live visualization primary product path is PM built-in browser automation_session; external Playwright/CDP attach is backend/compat only, /browser-stack lineage is reference material only, and evidence from any backend maps into the shared artifact contract.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_web_browser_product_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visible_web_browser_product_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0050
preserved_exact_tokens:
- automation_session
- Playwright/CDP
- /browser-stack
- wry
- WebView2
- WKWebView
- WebKitGTK
negative_constraints:
- Playwright remains adapter lineage, not PM visible browser product foundation.
compatibility_only_notes:
- External Playwright/CDP attach is backend/compat path only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-091 - Native And Mobile Visible Providers

```yaml
plan_unit_id: N2-091
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Desktop automation uses Appium Windows Driver or mac2; iOS supports Xcode previews and Appium XCUITest simulator sessions; Android launches a deterministic emulator/AVD and runs UiAutomator2, with optional direct emulator lifecycle via Android emulator CLI.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_mobile_visible_providers
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: native_mobile_visible_providers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0050
preserved_exact_tokens:
- Appium Windows Driver
- mac2
- Xcode previews
- XCUITest
- UiAutomator2
- Android emulator CLI
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-092 - Live Visualization Doctor Categories And Common Checks

```yaml
plan_unit_id: N2-092
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor preflight adds doctor.live_visualization and doctor.browser.runtime, and common checks cover Node/npm availability, writable evidence/runtime artifact path, and display availability unless the selected provider supports an alternative.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_doctor_common_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_doctor_common_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- doctor.live_visualization
- doctor.browser.runtime
- DISPLAY
- Wayland
- Node/npm
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-093 - PM Browser Runtime Preflight And Packaging Boundary

```yaml
plan_unit_id: N2-093
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: PM built-in browser preflight verifies bundled runtime health/version, startup, editor-tab and detached hosts, packaging/update/install metadata, offline packaging distinction, optional wef/cargo-wef CEF integrity, package-size budget around 1 GB, experimental-status risk capture without user-facing experimental toggles, and target page reachability.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pm_browser_runtime_packaging_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: pm_browser_runtime_packaging_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- PM built-in browser
- wef
- cargo-wef
- CEF
- ~1 GB
- /offline
negative_constraints:
- Implementation risk for experimental browser wrappers must not create user-facing experimental runtime toggles.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-094 - Native And Mobile Preflight Dependencies

```yaml
plan_unit_id: N2-094
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Desktop, iOS, and Android preflight checks cover Appium server, WinAppDriver, installed mac2 driver, Xcode CLI tools, simulator runtime, XCUITest driver/WebDriverAgent prerequisites, Xcode previews capability when selected, Android SDK/emulator/adb, requested AVD boot, and UiAutomator2 device visibility.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_mobile_preflight_dependencies
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: native_mobile_preflight_dependencies
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- Appium server
- WinAppDriver
- mac2
- Xcode CLI tools
- WebDriverAgent
- Android SDK
- adb
- AVD
- UiAutomator2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-095 - Preflight Failure Payload And Runtime Capability Mapping

```yaml
plan_unit_id: N2-095
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Preflight failures emit code, severity, dependency, expected, observed, and remediation fields; PM browser runtime failures map to runtime_unavailable in requested/effective browser capability disclosure when a PM browser session is involved.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preflight_failure_payload_runtime_mapping
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preflight_failure_payload_runtime_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- code
- severity
- dependency
- expected
- observed
- remediation
- runtime_unavailable
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
```

### N2-096 - Visual Mode Fallback Policy

```yaml
plan_unit_id: N2-096
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Lines 790-800 define visual_mode policy: local default auto prefers visible mode with interactive desktop and falls back to headless on missing visible dependencies; CI defaults to headless; forced_visible fails fast on missing prerequisites; forced_headless skips visible launch steps. Lines 801-817 of newtools-S0052 are covered by N2-097 and N2-098 after Phase 2B batch 106.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visual_mode_fallback_policy
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visual_mode_fallback_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0052
preserved_exact_tokens:
- visual_mode = auto
- visual_mode = headless
- visual_mode = forced_visible
- visual_mode = forced_headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- newtools-S0052 is split across N2-096, N2-097, and N2-098 after Phase 2B batch 106.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-097 - Browser-Capable Visible Run Contract

```yaml
plan_unit_id: N2-097
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Browser-capable web runs use the PM built-in browser automation_session as the visible path. Missing PM browser runtime prerequisites surface as runtime_unavailable; forced_visible fails fast rather than silently swapping to a different browser product model; headless fallback remains valid for CI or explicitly headless flows but does not redefine the visible browser UX contract.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_visible_run_contract
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: browser_visible_run_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0052
preserved_exact_tokens:
- PM built-in browser
- automation_session
- runtime_unavailable
- forced_visible
- headless fallback
- visible browser UX contract
negative_constraints:
- forced_visible mode must fail fast rather than silently swapping to a different browser product model.
- Headless fallback must not redefine the visible browser UX contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-098 - Visual Mode Run Metadata

```yaml
plan_unit_id: N2-098
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Runs record requested_visual_mode, effective_visual_mode, and nullable fallback_reason so visual/headless behavior is auditable across auto, forced_visible, and forced_headless modes.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visual_mode_run_metadata
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visual_mode_run_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0052
preserved_exact_tokens:
- requested_visual_mode
- auto|forced_visible|forced_headless
- effective_visual_mode
- visible|headless
- fallback_reason
- missing_display
- runtime_unavailable
- simulator_unavailable
- emulator_boot_timeout
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
```

### N2-099 - Live Visualization Config Fields

```yaml
plan_unit_id: N2-099
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Implementation MUST include InterviewGuiConfig and InterviewOrchestratorConfig fields live_visualization_enabled: bool, visual_mode: "auto" | "forced_visible" | "forced_headless", and visual_targets: { web?: bool, desktop?: bool, ios?: "preview"|"simulator"|"both", android?: bool }.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_config_fields
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_config_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- Implementation MUST include
- InterviewGuiConfig
- InterviewOrchestratorConfig
- 'live_visualization_enabled: bool'
- 'visual_mode: "auto" | "forced_visible" | "forced_headless"'
- 'visual_targets: { web?: bool, desktop?: bool, ios?: "preview"|"simulator"|"both", android?: bool }'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
```

### N2-100 - GuiToolCatalog Capability Flags

```yaml
plan_unit_id: N2-100
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GuiToolCatalog entries expose capability flags supports_visible_run, supports_attach_existing, supports_recording, requires_display_server, supports_pm_built_in_browser_visible, and supports_pm_browser_focus_or_reopen.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_tool_catalog_capability_flags
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_tool_catalog_capability_flags
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- GuiToolCatalog
- supports_visible_run
- supports_attach_existing
- supports_recording
- requires_display_server
- supports_pm_built_in_browser_visible
- supports_pm_browser_focus_or_reopen
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-101 - Additive Visual Test Strategy Schema

```yaml
plan_unit_id: N2-101
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The additive test strategy schema extension includes test_type values visual_web, visual_desktop, visual_ios, and visual_android, plus optional visual_launch_command, attach_command, and evidence_capture_mode fields.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visual_test_strategy_schema
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visual_test_strategy_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- test_type
- visual_web
- visual_desktop
- visual_ios
- visual_android
- visual_launch_command
- attach_command
- evidence_capture_mode
negative_constraints: []
compatibility_only_notes:
- The schema extension is additive.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
```

### N2-102 - Live Visualization Seglog Events

```yaml
plan_unit_id: N2-102
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Live visualization emits live.session.started, live.step.updated, live.artifact.created, live.session.completed, and live.session.degraded events; visible PM built-in browser targets additionally carry browser_session_id? and session_class? when available.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_seglog_events
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_seglog_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- live.session.started
- live.step.updated
- live.artifact.created
- live.session.completed
- live.session.degraded
- browser_session_id?
- session_class?
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-103 - Live Visualization Doctor Checks

```yaml
plan_unit_id: N2-103
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor coverage for live visualization preserves doctor.live_visualization, doctor.live_visualization.evidence, and doctor.browser.runtime checks.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_doctor_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_doctor_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- doctor.live_visualization
- doctor.live_visualization.evidence
- doctor.browser.runtime
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-104 - Chat Renderer Live Run Contract

```yaml
plan_unit_id: N2-104
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The chat renderer keeps live_run_card as the live status card type; PM browser open/focus actions resolve through browser_session_id when present rather than raw path guessing; artifact links resolve through manifest IDs only.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_renderer_live_run_contract
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: chat_renderer_live_run_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- live_run_card
- browser_session_id
- raw path guessing
- manifest IDs only
negative_constraints:
- Open/focus actions for PM browser runs resolve through browser_session_id when present rather than raw path guessing.
- Artifact links resolve through manifest IDs only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
```

### N2-105 - Mobile Testing Stack Defaults Scope

```yaml
plan_unit_id: N2-105
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Mobile Testing Stacks section adds concrete command-level defaults for iOS, Android, and Expo/React Native testing and preview workflows.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mobile_testing_stack_defaults_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mobile_testing_stack_defaults_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0054
preserved_exact_tokens:
- 14.5 Mobile Testing Stacks
- research-mobile-testing-stacks
- iOS
- Android
- Expo/React Native
- testing and preview workflows
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-106 - Mobile Testing Comparison Matrix

```yaml
plan_unit_id: N2-106
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'The comparison matrix preserves Swift/iOS XCTest, XCUITest, SwiftUI #Preview, @Previewable, Xcode Canvas, and iOS Simulator; Kotlin/Android Jetpack Compose testing, createComposeRule, Espresso, UIAutomator, Appium UiAutomator2, Android Emulator, and ADB; and Expo/React Native Jest/unit, Detox default, Maestro/Appium fallbacks, Expo CLI, Detox artifacts, screenshots, video, and logs.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mobile_testing_comparison_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mobile_testing_comparison_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0055
preserved_exact_tokens:
- XCTest
- XCUITest
- '#Preview'
- '@Previewable'
- Xcode Canvas
- iOS Simulator
- Jetpack Compose testing
- createComposeRule
- Espresso
- UIAutomator
- Appium UiAutomator2
- Expo / React Native
- Detox
- Maestro
- Appium
- Detox artifacts plugin
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-107 - Mobile Stack Default And Fallback Paths

```yaml
plan_unit_id: N2-107
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Recommended mobile paths are SwiftUI previews plus XCTest/XCUITest on iOS Simulator with Appium XCUITest fallback; Compose UI tests plus Espresso and UIAutomator with Appium UiAutomator2 fallback; and Expo CLI plus Detox with Maestro/Appium fallbacks for Expo/React Native.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mobile_stack_default_fallback_paths
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mobile_stack_default_fallback_paths
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0056
preserved_exact_tokens:
- SwiftUI previews
- '#Preview'
- '@Previewable'
- XCTest/XCUITest
- Appium XCUITest driver
- Compose UI tests
- Espresso
- UIAutomator
- Appium UiAutomator2
- Expo CLI
- Detox
- Maestro
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-108 - Swift IOS Generated Plan Snippets

```yaml
plan_unit_id: N2-108
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Generated Swift/iOS plans preserve the manual Xcode preview loop using #Preview and @Previewable, xcodebuild test with -scheme MyApp and -destination platform=iOS Simulator,name=iPhone 16, and simulator screenshot capture to .puppet-master/evidence/ios/sim.png.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: swift_ios_generated_plan_snippets
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: swift_ios_generated_plan_snippets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0058
preserved_exact_tokens:
- '#Preview'
- '@Previewable'
- xcodebuild test
- -scheme MyApp
- -destination 'platform=iOS Simulator,name=iPhone 16'
- xcrun simctl io booted screenshot .puppet-master/evidence/ios/sim.png
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-109 - Kotlin Android Generated Plan Snippets

```yaml
plan_unit_id: N2-109
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated Kotlin/Android plans preserve ./gradlew testDebugUnitTest, ./gradlew connectedDebugAndroidTest, adb exec-out screencap -p, adb shell screenrecord /sdcard/test.mp4, and adb pull /sdcard/test.mp4 .puppet-master/evidence/android/test.mp4.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: kotlin_android_generated_plan_snippets
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: kotlin_android_generated_plan_snippets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0059
preserved_exact_tokens:
- ./gradlew testDebugUnitTest
- ./gradlew connectedDebugAndroidTest
- adb exec-out screencap -p
- .puppet-master/evidence/android/screen.png
- adb shell screenrecord /sdcard/test.mp4
- adb pull /sdcard/test.mp4 .puppet-master/evidence/android/test.mp4
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-110 - Expo React Native Generated Plan Commands

```yaml
plan_unit_id: N2-110
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated Expo/React Native plans preserve npx expo start with i/a simulator shortcuts, npx expo run:ios, npx expo run:android, detox test -c ios.sim.debug, and detox test -c android.emu.debug.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: expo_react_native_generated_plan_commands
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: expo_react_native_generated_plan_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0060
preserved_exact_tokens:
- npx expo start
- press i
- a (Android emulator)
- npx expo run:ios
- npx expo run:android
- detox test -c ios.sim.debug
- detox test -c android.emu.debug
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-111 - Detox Artifact Config Baseline

```yaml
plan_unit_id: N2-111
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Detox artifact baseline preserves detox.config.js with artifacts.rootDir .puppet-master/evidence/detox and enabled screenshot, video, and log plugins, including shouldTakeAutomaticSnapshots.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: detox_artifact_config_baseline
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: detox_artifact_config_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0060
preserved_exact_tokens:
- detox.config.js
- rootDir
- .puppet-master/evidence/detox
- screenshot
- shouldTakeAutomaticSnapshots
- video
- log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-112 - Fallback E2E Snippets

```yaml
plan_unit_id: N2-112
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Fallback E2E snippets preserve maestro test flows/smoke.yaml and Appium driver-managed screenshots/recordings through session APIs or executeScript mobile commands in the test runtime.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: fallback_e2e_snippets
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: fallback_e2e_snippets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0061
preserved_exact_tokens:
- maestro test flows/smoke.yaml
- Appium
- session APIs
- executeScript
- mobile commands
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-113 - Preview Build Docker Actions Scope

```yaml
plan_unit_id: N2-113
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Preview, Build, Docker, and Actions contracts define deterministic Slint-rebuild behavior for Preview/Build actions and their Docker/GitHub Actions integrations.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preview_build_docker_actions_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preview_build_docker_actions_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0062
preserved_exact_tokens:
- 14.6 Preview, Build, Docker, and Actions Contracts
- Slint-rebuild
- Preview/Build actions
- Docker/GitHub Actions integrations
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/Project_Output_Artifacts.md'
```

### N2-114 - Preview UX And Session Behavior

```yaml
plan_unit_id: N2-114
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Preview controls require Dashboard Orchestrator Status to include PREVIEW and Orchestrator Progress widget.orchestrator_status to include Preview. Preview resolves from selected stack and visual_targets, launches one preview_session_id per action, emits manifest.json, timeline.jsonl, screenshots/video when available, and shows inline chat evidence or a deterministic clickable artifact fallback.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preview_ux_session_behavior
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preview_ux_session_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0063
preserved_exact_tokens:
- PREVIEW
- widget.orchestrator_status
- Preview
- visual_targets
- preview_session_id
- manifest.json
- timeline.jsonl
- screenshot/video
- clickable artifact path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.preview_open, UICommand:cmd.orchestrator.preview_stop, UICommand:cmd.orchestrator.open_preview_artifact, SchemaID:evidence.schema.json'
```

### N2-115 - Preview UI Command IDs

```yaml
plan_unit_id: N2-115
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Reserved canonical preview UI command IDs are cmd.orchestrator.preview_open, cmd.orchestrator.preview_stop, and cmd.orchestrator.open_preview_artifact.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preview_ui_command_ids
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preview_ui_command_ids
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0063
preserved_exact_tokens:
- cmd.orchestrator.preview_open
- cmd.orchestrator.preview_stop
- cmd.orchestrator.open_preview_artifact
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These command IDs are canonical and reserved.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.preview_open, UICommand:cmd.orchestrator.preview_stop, UICommand:cmd.orchestrator.open_preview_artifact, SchemaID:evidence.schema.json'
```

### N2-116 - Build Controls And Artifact UI

```yaml
plan_unit_id: N2-116
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Build controls require Dashboard Orchestrator Status to include BUILD and Orchestrator Progress widget.orchestrator_status to include Build. Build action resolves native, web, mobile, or container profile from project stack and settings; GUI shows latest artifact list with open path / copy path action; chat shows a concise build summary plus artifact links.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: build_controls_artifact_ui
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: build_controls_artifact_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0064
preserved_exact_tokens:
- BUILD
- widget.orchestrator_status
- Build
- native
- web
- mobile
- container
- open path / copy path
- artifact links
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md'
```

### N2-117 - Build Result Payload Minima

```yaml
plan_unit_id: N2-117
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Build runs produce a normalized build_result payload containing build_id, build_profile, status, artifacts[] with path, kind, sha256, and size_bytes, plus logs_path.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: build_result_payload_minima
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: build_result_payload_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0064
preserved_exact_tokens:
- build_result
- build_id
- build_profile
- status
- artifacts[]
- path
- kind
- sha256
- size_bytes
- logs_path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md'
```

### N2-118 - Build Output Examples And Commands

```yaml
plan_unit_id: N2-118
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Build output examples and commands preserve Linux installer outputs under installer/linux/, multi-platform installer helper concrete path reporting, and reserved canonical command IDs cmd.orchestrator.build_run and cmd.orchestrator.open_build_artifact.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: build_output_examples_commands
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: build_output_examples_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0064
preserved_exact_tokens:
- installer/linux/
- Multi-platform installer helper
- cmd.orchestrator.build_run
- cmd.orchestrator.open_build_artifact
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md'
```

### N2-119 - Docker Manager Runtime Auth Surface

```yaml
plan_unit_id: N2-119
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker support is expressed through the Docker Manager surface covering containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes. Docker is the default runtime mode and Podman is an alternate runtime mode inside the same surface; requested vs effective auth capability disclosure, protected missing-repository creation, and publish-side-effect separation remain required.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_runtime_auth_surface
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_manager_runtime_auth_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0065
preserved_exact_tokens:
- Docker Manager
- containers
- images
- compose
- registries
- build/bake
- Publish / Unraid
- project-focused Kubernetes
- Docker as default runtime mode
- Podman as alternate runtime mode
- requested vs effective auth capability disclosure
- protected missing-repository creation
- publish-side-effect separation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns the Preflight and approval ordering contract, Kubernetes enablement rules, Kubernetes doctor checks, Future-scope placeholders, project-focused K8s deep linkage, and the Event registration contract.
- Plans/Contracts_V0.md remains the registration authority for Docker/Unraid events and Kubernetes event names.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
```

### N2-120 - Docker Doctor Preflight And Deprecated Alias

```yaml
plan_unit_id: N2-120
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker doctor/preflight rules preserve doctor.docker.engine, doctor.docker.compose, doctor.docker.buildx, doctor.dockerhub.auth.capability, doctor.dockerhub.repo.access, and Kubernetes-specific runtime checks when Kubernetes subview actions are invoked. doctor.registry.auth is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_doctor_preflight_deprecated_alias
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_doctor_preflight_deprecated_alias
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0065
preserved_exact_tokens:
- doctor.docker.engine
- doctor.docker.compose
- doctor.docker.buildx
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- Kubernetes-specific runtime checks
- doctor.registry.auth
- deprecated alias
- MUST NOT remain the visible canonical term
negative_constraints:
- doctor.registry.auth is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.
compatibility_only_notes: []
stale_retired_dispositions:
- doctor.registry.auth is deprecated for DockerHub-specific flows.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/storage-plan.md'
```

### N2-121 - Docker Result Payload Minima

```yaml
plan_unit_id: N2-121
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Docker result payload minima remain authoritative and must be reused by other docs: docker_auth_result, docker_publish_result, and unraid_template_result.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_result_payload_minima
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_result_payload_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0065
preserved_exact_tokens:
- docker_auth_result
- docker_publish_result
- unraid_template_result
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Result payload minima remain authoritative here and must be reused by other docs.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-122 - GitHub Actions Settings Controls

```yaml
plan_unit_id: N2-122
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Settings > Advanced coverage for GitHub Actions includes workflow template selection, trigger and matrix controls, required-secrets readiness checklist, and preview/apply generation flow.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_actions_settings_controls
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: github_actions_settings_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0066
preserved_exact_tokens:
- Settings > Advanced
- workflow template selection
- trigger and matrix controls
- required-secrets readiness checklist
- preview/apply generation flow
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-123 - GitHub Actions Surface Readiness Alignment

```yaml
plan_unit_id: N2-123
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated workflows are visible from the Workflows subview; current-branch run behavior and workflow dispatch use the same repository and branch context; admin readiness for secrets, variables, and environments reuses the live GitHub Actions Settings capability/auth model; doctor.actions.workflow-ready remains the canonical readiness gate.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_actions_surface_readiness_alignment
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: github_actions_surface_readiness_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0066
preserved_exact_tokens:
- Workflows
- current-branch
- workflow dispatch
- same repository and branch context
- secrets
- variables
- environments
- doctor.actions.workflow-ready
- canonical readiness gate
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-124 - GitHub Workflow Source Truth And Receipts

```yaml
plan_unit_id: N2-124
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Repository workflow files under .github/workflows/ / github/workflows/ are the runtime source of truth after preview /save or apply; generated-workflow and generated required-secrets /configuration lists are historical hints and must not override current repo /worktree workflow YAML, hosted /variables/environments, or GitHub Actions > Current Branch context. Repo-level Actions /admin operations create project-scoped /receipt records and may /link a run_id through github_api evidence but never store secret values or reversible value-derived material.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_workflow_source_truth_receipts
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: github_workflow_source_truth_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0066
preserved_exact_tokens:
- .github/workflows/
- github/workflows/
- /save
- generated-workflow
- /configuration
- /worktree
- YAML
- /variables/environments
- GitHub Actions > Current Branch
- /admin
- /receipt
- /link
- run_id
- github_api
- secret values
- value-derived
negative_constraints:
- generated-workflow and generated required-secrets /configuration lists must not override current repo /worktree workflow YAML, hosted /variables/environments, or GitHub Actions > Current Branch context.
- Receipts never store secret values or reversible value-derived material.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-125 - Iced To Slint Automation Migration Boundary

```yaml
plan_unit_id: N2-125
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The existing Iced automation implementation remains a reference pattern while rewrite deliverables target Slint runtime semantics. Migration preserves manifest/timeline/media evidence schema compatibility, introduces backend abstraction for Slint UI surfaces, supports both headless and visible modes, and preserves doctor/preflight checks for automation dependencies and media capture capability.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: iced_slint_automation_migration_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: iced_slint_automation_migration_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0067
preserved_exact_tokens:
- Iced automation implementation
- reference pattern
- Slint runtime semantics
- manifest/timeline/media
- backend abstraction
- headless
- visible
- doctor/preflight
negative_constraints: []
compatibility_only_notes:
- Keep evidence schema compatibility (manifest/timeline/media) across automation backends.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md#2, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:evidence.schema.json'
```

### N2-126 - Core Preview Build Docker Actions Doctor Matrix

```yaml
plan_unit_id: N2-126
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Doctor/preflight matrix preserves deterministic readiness checks before Preview/Build/Docker/Actions flows execute, including doctor.preview.visual-runtime, doctor.mobile.ios-simulator, doctor.mobile.android-emulator, doctor.docker.engine, doctor.docker.compose, doctor.dockerhub.auth.capability, doctor.actions.workflow-ready, and doctor.evidence.media with their block, degrade, remediation, and fallback behaviors.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: core_preview_build_docker_actions_doctor_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: core_preview_build_docker_actions_doctor_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0068
preserved_exact_tokens:
- doctor.preview.visual-runtime
- doctor.mobile.ios-simulator
- doctor.mobile.android-emulator
- doctor.docker.engine
- doctor.docker.compose
- doctor.dockerhub.auth.capability
- doctor.actions.workflow-ready
- doctor.evidence.media
- Block
- Keep run result
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json'
```

### N2-127 - Browser And Custom GUI Doctor Matrix

```yaml
plan_unit_id: N2-127
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Browser and custom GUI Doctor checks preserve doctor.browser.runtime for PM-managed bundled CEF-class runtime health, wef/cargo-wef CEF cache integrity, runtime_unavailable failure behavior, doctor.gui.custom-headless for plan_custom_headless_tool = true evidence layout, and doctor.gui_tool_catalog.freshness last_updated metadata warnings.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_custom_gui_doctor_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: browser_custom_gui_doctor_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0068
preserved_exact_tokens:
- doctor.browser.runtime
- PM-managed bundled CEF-class runtime
- wef
- cargo-wef
- runtime_unavailable
- doctor.gui.custom-headless
- plan_custom_headless_tool = true
- doctor.gui_tool_catalog.freshness
- last_updated
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- doctor.gui_tool_catalog.freshness warns when catalog metadata may be stale.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json'
```

### N2-128 - MCP And Cited Websearch Doctor Matrix

```yaml
plan_unit_id: N2-128
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: MCP and cited websearch Doctor checks preserve doctor.mcp.context7, doctor.mcp.provider-ready, doctor.websearch.cited, and websearch_cited dry-run/provider health behavior; missing tools are not silently advertised and unavailable cited search surfaces explicit config, auth, or timeout reasons.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_cited_websearch_doctor_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_cited_websearch_doctor_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0068
preserved_exact_tokens:
- doctor.mcp.context7
- doctor.mcp.provider-ready
- doctor.websearch.cited
- websearch_cited
- configured provider order
- do not silently advertise missing tools
negative_constraints:
- MCP-backed tools must not be silently advertised when missing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json'
```

### N2-129 - Debug Target Classification And Routing

```yaml
plan_unit_id: N2-129
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug Mode classifies targets as workspace-built /workspace, browser/website, or black-box binary/app before choosing tooling. The Debug target registry records launch config, URL, attach PID, browser session, or imported evidence bundle and routes each target to the collector through log sink, built-in browser session plus agent tools, DAP adapter, or manual attach intake.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_target_classification_routing
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_target_classification_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0069
preserved_exact_tokens:
- Debug Mode
- /workspace
- browser/website
- black-box binary/app
- Debug target registry
- launch config
- URL
- attach PID
- browser session
- imported evidence bundle
- collector
- DAP adapter
- manual attach intake
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-130 - Grounded PM Debug Core And Web Repro Path

```yaml
plan_unit_id: N2-130
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'The grounded PM Debug core is H + I + J + E + A: PM points at a target, stays inside the overlay/runtime architecture rather than creating a new runtime mode, sends evidence through runtime-artifact and seglog pipelines, supports assistant/session inspection, and allows MVP temporary instrumentation only under an explicit instrumentation contract. MVP web/debug repro prefers PM built-in browser + automation_session with dev_session_id and output-problems-ports linkage, including /test/dev-server loops; classical DAP remains a separate adapter/surface.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: grounded_pm_debug_core_web_repro
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: grounded_pm_debug_core_web_repro
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0069
preserved_exact_tokens:
- H + I + J + E + A
- overlay/runtime architecture
- new runtime mode
- runtime-artifact
- seglog
- temporary instrumentation
- PM built-in browser + automation_session
- dev_session_id
- output-problems-ports
- /test/dev-server
- Classical DAP
negative_constraints:
- Debug Mode must stay inside the overlay/runtime architecture instead of creating a new runtime mode.
- Classical DAP debugging remains a separate related adapter/surface rather than the primary web repro mode.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-131 - Debug Adapters Auth Session And Evidence Attach Constraints

```yaml
plan_unit_id: N2-131
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Research-grade adapters remain advanced options behind target-registry and policy checks; browser/session automation defaults to an ephemeral automation profile/session and moves to attention_required when authentication is required and no valid automation session exists. External Playwright or Browser MCP remains orthogonal to the promoted named-action browser contract unless explicitly bridged, and tool-emitted debug evidence enters chat only through bounded user-visible attach rules.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_adapters_auth_evidence_attach_constraints
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_adapters_auth_evidence_attach_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0069
preserved_exact_tokens:
- Research-grade adapters
- advanced options
- ephemeral automation profile/session
- attention_required
- External Playwright
- Browser MCP
- orthogonal
- promoted named-action browser contract
- bounded, user-visible attach model
negative_constraints:
- If a target requires authentication and no valid automation session exists, Debug moves to attention_required rather than silently reusing an unrelated user profile.
- External Playwright or Browser MCP tooling remains orthogonal unless a product surface explicitly bridges it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-132 - Enterprise Host Trust Preflight

```yaml
plan_unit_id: N2-132
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug, MCP, custom-plugin, networked-tool, /shell/debugger, and /tunnel/browser actions run through shared /trust/proxy/governance preflight. Every /custom/plugin/networked tool profile declares contacted hosts and /domains before dispatch; undeclared hosts, domains, proxy targets, or remote authorities return blocked_preflight. Governance denials preserve deny-code families, and restart-persistent host/trust decisions must be explicit /durable permission or trust records rather than inferred from transient debug runs.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: enterprise_host_trust_preflight
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: enterprise_host_trust_preflight
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0070
preserved_exact_tokens:
- /trust/proxy/governance
- /shell/debugger
- /tunnel/browser
- /custom/plugin/networked
- /domains
- blocked_preflight
- deny-code
- /durable
negative_constraints:
- Undeclared host, domain, proxy target, or remote authority expansion returns blocked_preflight rather than silently broadening session permission.
- Host/trust decisions that survive restart must be explicit /durable permission or trust records, not inferred from transient debug runs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-133 - Debug Instrumentation Scope Taxonomy

```yaml
plan_unit_id: N2-133
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Debug automation profile classifies temporary instrumentation scope exactly as env_config_activation, ephemeral_tool_install, wrapper_launcher, temporary_source_patch, and debugger_or_profiler_attach. Each scope records temporary/durable status, cleanup path, sensitive-runtime impact, and cleanup-failure recovery; wrapper_launcher and debugger_or_profiler_attach are stricter than read-only inspection, temporary_source_patch requires a revert path, and ephemeral_tool_install requires install location, provenance, and cleanup path before dispatch.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_instrumentation_scope_taxonomy
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_instrumentation_scope_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- env_config_activation
- ephemeral_tool_install
- wrapper_launcher
- temporary_source_patch
- debugger_or_profiler_attach
- cleanup path
- sensitive-runtime impact
- revert path
- install location
- provenance
negative_constraints:
- temporary_source_patch requires a revert path before execution.
- ephemeral_tool_install requires an install location, provenance, and cleanup path before dispatch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
```

### N2-134 - Debug Discovery Outputs

```yaml
plan_unit_id: N2-134
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Required Debug discovery outputs include preferred local or remote dev/test runner, browser automation stack and visibility mode support, structured log and trace collectors, source-map or symbolization support, DAP adapter availability, temporary instrumentation install/rollback path, and target discovery/environment preparation capability for dev session, browser session, debugger attach, imported bundle intake, and policy-selected tracing/debug tooling.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_discovery_outputs
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_discovery_outputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- preferred local or remote dev/test runner
- browser automation stack and visibility mode support
- structured log and trace collectors
- source-map or symbolization support
- DAP adapter availability
- temporary instrumentation install / rollback path
- target discovery / environment preparation capability
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
```

### N2-135 - Debug Selection And Cleanup Escalation Order

```yaml
plan_unit_id: N2-135
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug selection order uses project-native or repo-declared tooling first, already-installed environment tooling second, temporary investigation-scoped tooling /install only when cleanup path and policy allow it, and imported evidence bundles/manual attach as fallback inputs. Escalation proceeds through non-invasive capture, permitted non-invasive tracers or debugger attachments, temporary instrumentation patches only after lower tiers are insufficient, tentative durable fix, automated verification, instrumentation removal, and cleanup-recovery before any new mutation-capable loop starts.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_selection_cleanup_escalation_order
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_selection_cleanup_escalation_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- project-native or repo-declared tooling first
- already-installed environment tooling second
- temporary, investigation-scoped tooling /install
- cleanup path
- imported evidence bundles
- manual attach
- non-invasive readback/capture
- temporary instrumentation patches
- cleanup-recovery
- mutation-capable loop
negative_constraints:
- Temporary investigation-scoped tooling /install is allowed only when a cleanup path exists and policy allows it.
- Unresolved cleanup enters explicit cleanup-recovery before any new mutation-capable loop starts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md'
```

### N2-136 - Debug Mode Doctor Checks

```yaml
plan_unit_id: N2-136
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug Mode doctor checks preserve doctor.debug.browser-runtime, doctor.debug.dap-adapter, doctor.debug.log-trace-pipeline, doctor.debug.instrumentation-scope, and doctor.debug.remote-host with their hide, degrade, block, fallback, and remediation behaviors.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_mode_doctor_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_mode_doctor_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- doctor.debug.browser-runtime
- doctor.debug.dap-adapter
- doctor.debug.log-trace-pipeline
- doctor.debug.instrumentation-scope
- doctor.debug.remote-host
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
```

### N2-137 - Docker Unraid Side-Effect Gate Matrix

```yaml
plan_unit_id: N2-137
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'The Docker/Unraid validation matrix gates side effects by action scope: Docker engine, compose, buildx, and DockerHub auth block local Docker build/publish entry points when failing; dockerhub repo access blocks remote image push; Unraid template-repo and ca-profile checks block only managed template-repo follow-on stages or auto-push while preserving local Docker image push results and visible remediation.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_unraid_side_effect_gate_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_unraid_side_effect_gate_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0074
preserved_exact_tokens:
- doctor.docker.engine
- doctor.docker.compose
- doctor.docker.buildx
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- doctor.unraid.template-repo
- doctor.unraid.ca-profile
- needs_review
- local Docker image push
- auto-push
- visible remediation
negative_constraints:
- doctor.unraid.template-repo does not block local Docker image push.
- doctor.unraid.ca-profile in needs_review state does not block local Docker image push.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-138 - After-Build Push And Blocked Outcome Semantics

```yaml
plan_unit_id: N2-138
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: push_policy = after_build dispatches cmd.orchestrator.push_image as a separate remote side-effect step only after a successful local build result exists. Permission-guard or confirmation blocks resolve to *.blocked outcomes rather than *.failed so intentional non-execution remains distinct from runtime failure.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: after_build_push_blocked_outcome_semantics
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: after_build_push_blocked_outcome_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0074
preserved_exact_tokens:
- push_policy = after_build
- cmd.orchestrator.push_image
- separate remote side-effect step
- successful local build result
- '*.blocked'
- '*.failed'
negative_constraints:
- Permission-guard or confirmation blocks MUST resolve to *.blocked outcomes, not *.failed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-139 - DockerHub Auth Mode Resolution

```yaml
plan_unit_id: N2-139
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Where section 14.7 reads like a PAT-only contract, requested_auth_mode supports at least browser and pat. Validation MUST resolve requested auth into effective_auth_provider_state, effective_capabilities[], validated account identity, and degraded reason when capability is partial.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dockerhub_auth_mode_resolution
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dockerhub_auth_mode_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
preserved_exact_tokens:
- requested_auth_mode
- browser
- pat
- Validation MUST resolve
- effective_auth_provider_state
- effective_capabilities[]
- validated account identity
- degraded reason
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-140 - Effective Capability Repository Creation Guard

```yaml
plan_unit_id: N2-140
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Namespace/repository discovery and repository creation MUST use the validated effective capability set; the app MUST NOT assume browser login or PAT implies full management access. If publish is requested and the target repository does not exist, repository creation is guarded by an explicit confirmation showing namespace, repository, and privacy; this confirmation is mandatory and cannot be bypassed by YOLO/autonomy behavior.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_capability_repository_creation_guard
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: effective_capability_repository_creation_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
preserved_exact_tokens:
- Namespace/repository discovery
- repository creation
- MUST use the validated effective capability set
- MUST NOT assume browser login or PAT implies full management access
- explicit confirmation
- namespace
- repository
- privacy
- mandatory
- YOLO/autonomy behavior
negative_constraints:
- The app MUST NOT assume browser login or PAT implies full management access.
- Repository creation confirmation is mandatory and cannot be bypassed by YOLO/autonomy behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-141 - DockerHub Auth Alias Retirement

```yaml
plan_unit_id: N2-141
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: doctor.registry.auth is deprecated for DockerHub-specific flows and MUST be treated as an alias of doctor.dockerhub.auth.capability only until old references are removed.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dockerhub_auth_alias_retirement
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dockerhub_auth_alias_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0077
preserved_exact_tokens:
- doctor.registry.auth
- deprecated
- doctor.dockerhub.auth.capability
- only until old references are removed
negative_constraints:
- doctor.registry.auth is deprecated for DockerHub-specific flows.
compatibility_only_notes: []
stale_retired_dispositions:
- doctor.registry.auth is deprecated for DockerHub-specific flows and is compatibility-only until old references are removed.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-142 - Docker Action-Scope Preflight Rules

```yaml
plan_unit_id: N2-142
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker action-scope rules keep build-only actions limited to doctor.docker.engine and doctor.docker.buildx unless compose is selected; Run/preview actions require doctor.docker.compose when compose is the selected runtime path and port availability only when a user-facing access URL is expected; Publish requires doctor.dockerhub.auth.capability and doctor.dockerhub.repo.access and must not fail solely because compose validation is irrelevant.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_action_scope_preflight_rules
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_action_scope_preflight_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0077
preserved_exact_tokens:
- Build-only actions
- doctor.docker.engine
- doctor.docker.buildx
- doctor.docker.compose
- Run/preview actions
- user-facing access URL
- Publish
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- MUST NOT fail solely because compose validation is irrelevant
negative_constraints:
- Publish MUST NOT fail solely because compose validation is irrelevant to the selected publish path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-143 - DockerHub Unraid Doctor Table Rows

```yaml
plan_unit_id: N2-143
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Canonical DockerHub/Unraid Doctor rows preserve doctor.docker.buildx, doctor.dockerhub.auth.capability, doctor.dockerhub.repo.access, doctor.unraid.template-repo, and doctor.unraid.ca-profile with their required signals and block/warn/follow-on failure behaviors.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dockerhub_unraid_doctor_table_rows
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dockerhub_unraid_doctor_table_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0076
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0077
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- doctor.docker.buildx
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- doctor.unraid.template-repo
- doctor.unraid.ca-profile
- Block container build/publish
- Block repo browsing/creation/publish
- Block publish; preserve local build result
- Block managed follow-on push/update
- Allow local generation with warning
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- newtools-S0076 is a structural doctor/preflight heading; its concrete doctor rows are represented here.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-144 - Docker Auth Result Payload Minimum

```yaml
plan_unit_id: N2-144
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: docker_auth_result MUST include requested_auth_mode, effective_auth_provider_state, effective_capabilities[], effective_account_identity, last_validation_timestamp, last_validation_host, and degraded_reason?. Evidence/result contract additions record requested mode, effective capability set, account identity, validation timestamp, and degraded reason if any.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_auth_result_payload_minimum
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_auth_result_payload_minimum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- docker_auth_result
- MUST include
- requested_auth_mode
- effective_auth_provider_state
- effective_capabilities[]
- effective_account_identity
- last_validation_timestamp
- last_validation_host
- degraded_reason?
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The payload token is introduced by the normative override and expanded in the Result payload minima section.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-145 - Docker Publish Result Payload Minimum

```yaml
plan_unit_id: N2-145
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: docker_publish_result MUST include publish_result_id, registry_host, namespace, repository, tags[], digests[], platforms[], and sanitized_logs_path. Evidence/result contract additions record registry host, namespace, repository, pushed tags, digest(s), platform list, and sanitized logs path.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_publish_result_payload_minimum
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_publish_result_payload_minimum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- docker_publish_result
- publish_result_id
- registry_host
- namespace
- repository
- tags[]
- digests[]
- platforms[]
- sanitized_logs_path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The payload token is introduced by the normative override and expanded in the Result payload minima section.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-146 - Unraid Template Result Payload And Enums

```yaml
plan_unit_id: N2-146
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: unraid_template_result MUST include publish_result_id, template_xml_path, template_repo_id, maintainer_slug, commit_status, push_status, ca_profile_state, and review_state. Its enums preserve commit_status values not_attempted, committed, skipped_review_required, skipped_unrelated_changes, failed; push_status values not_attempted, skipped_auto_push_disabled, push_in_progress, completed, failed; review_state values clean and needs_review; and ca_profile_state values existing_user_managed, auto_generated_needs_review, and project_override_active.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unraid_template_result_payload_enums
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: unraid_template_result_payload_enums
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- unraid_template_result
- template_xml_path
- template_repo_id
- maintainer_slug
- commit_status
- push_status
- ca_profile_state
- review_state
- not_attempted
- committed
- skipped_review_required
- skipped_unrelated_changes
- failed
- skipped_auto_push_disabled
- push_in_progress
- completed
- clean
- needs_review
- existing_user_managed
- auto_generated_needs_review
- project_override_active
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The payload token is introduced by the normative override and expanded in the Result payload minima section.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-147 - Docker CLI Buildx API Responsibility Split

```yaml
plan_unit_id: N2-147
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'DockerHub/Unraid responsibilities are separated: Docker CLI / Buildx performs local runtime, image build, login, and push execution; Docker Hub API is used only for namespace/repository discovery and repository creation when Puppet Master needs app-managed listing/creation behavior; DockerHub is not a storage location for Unraid XML.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_cli_buildx_api_responsibility_split
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_cli_buildx_api_responsibility_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- Docker CLI / Buildx
- local runtime
- image build
- login
- push execution
- Docker Hub API
- namespace/repository discovery
- repository creation
- Do not treat DockerHub as a storage location for Unraid XML
negative_constraints:
- Do not treat DockerHub as a storage location for Unraid XML.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-148 - Expanded DockerHub Auth Creation Flow

```yaml
plan_unit_id: N2-148
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The expanded DockerHub flow detects whether the active project is Docker-related, resolves requested_auth_mode, validates effective_capabilities, allows browser/device login or PAT-based auth with PAT remaining the recommended explicit path, and gates missing-repository creation behind a mandatory confirmation dialog showing namespace, repository name, and privacy that cannot be bypassed by YOLO/autonomy modes.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: expanded_dockerhub_auth_creation_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: expanded_dockerhub_auth_creation_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- Detect whether the active project is Docker-related
- requested_auth_mode
- effective_capabilities
- browser/device login
- PAT-based auth
- PAT remaining the recommended explicit path
- mandatory confirmation dialog
- namespace
- repository name
- privacy
- YOLO/autonomy modes
negative_constraints:
- Missing-repository creation confirmation cannot be bypassed by YOLO/autonomy modes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-149 - Buildx Preview Push And Unraid Follow-On Flow

```yaml
plan_unit_id: N2-149
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The expanded runtime/publish flow builds with docker buildx build, runs containers for preview/testing and surfaces user-facing access points when available, pushes to DockerHub using the selected namespace/repository/tag set, generates or updates Unraid XML by default unless disabled, and for managed template-repo workflows updates the repo, auto-commits by default, exposes a one-click push UI action, and keeps auto-push disabled by default.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: buildx_preview_push_unraid_follow_on_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: buildx_preview_push_unraid_follow_on_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- docker buildx build
- preview/testing
- user-facing access points
- Push to DockerHub
- namespace/repository/tag set
- generate/update Unraid XML by default unless the user disabled it
- managed template-repo workflow
- auto-commit by default
- one-click push UI action
- auto-push disabled by default
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-150 - Docker Unraid Evidence ContractRef Overlay

```yaml
plan_unit_id: N2-150
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker/Unraid evidence/result contract additions preserve docker_auth_result, docker_publish_result, and unraid_template_result summary semantics and retain the final ContractRef overlay to Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md, PolicyRule:no_secrets_in_storage, and SchemaID:evidence.schema.json.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_unraid_evidence_contractref_overlay
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_unraid_evidence_contractref_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- Evidence/result contract additions
- docker_auth_result
- docker_publish_result
- unraid_template_result
- PolicyRule:no_secrets_in_storage
- SchemaID:evidence.schema.json
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md, FinalGUISpec, Orchestrator_Page, and evidence schema remain cross-doc consumers/authorities through the preserved ContractRef.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, PolicyRule:no_secrets_in_storage, SchemaID:evidence.schema.json'
```

### N2-001 - GUI Testing Tools Retired Source-Preserving Bridge

```yaml
plan_unit_id: N2-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/newtools.md
canonical_text: N2-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 107 because newtools-S0001 through newtools-S0078 are covered by N2-002 through N2-150 or explicit structural, reference-only, retired, and migration-coverage dispositions. N2-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained newtools PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- N2-002
- N2-003
- N2-004
- N2-005
- N2-006
- N2-007
- N2-008
- N2-009
- N2-010
- N2-011
- N2-012
- N2-013
- N2-014
- N2-015
- N2-016
- N2-017
- N2-018
- N2-019
- N2-020
- N2-021
- N2-022
- N2-023
- N2-024
- N2-025
- N2-026
- N2-027
- N2-028
- N2-029
- N2-030
- N2-031
- N2-032
- N2-033
- N2-034
- N2-035
- N2-036
- N2-037
- N2-038
- N2-039
- N2-040
- N2-041
- N2-042
- N2-043
- N2-044
- N2-045
- N2-046
- N2-047
- N2-048
- N2-049
- N2-050
- N2-051
- N2-052
- N2-053
- N2-054
- N2-055
- N2-056
- N2-057
- N2-058
- N2-059
- N2-060
- N2-061
- N2-062
- N2-063
- N2-064
- N2-065
- N2-066
- N2-067
- N2-068
- N2-069
- N2-070
- N2-071
- N2-072
- N2-073
- N2-074
- N2-075
- N2-076
- N2-077
- N2-078
- N2-079
- N2-080
- N2-081
- N2-082
- N2-083
- N2-084
- N2-085
- N2-086
- N2-087
- N2-088
- N2-089
- N2-090
- N2-091
- N2-092
- N2-093
- N2-094
- N2-095
- N2-096
- N2-097
- N2-098
- N2-099
- N2-100
- N2-101
- N2-102
- N2-103
- N2-104
- N2-105
- N2-106
- N2-107
- N2-108
- N2-109
- N2-110
- N2-111
- N2-112
- N2-113
- N2-114
- N2-115
- N2-116
- N2-117
- N2-118
- N2-119
- N2-120
- N2-121
- N2-122
- N2-123
- N2-124
- N2-125
- N2-126
- N2-127
- N2-128
- N2-129
- N2-130
- N2-131
- N2-132
- N2-133
- N2-134
- N2-135
- N2-136
- N2-137
- N2-138
- N2-139
- N2-140
- N2-141
- N2-142
- N2-143
- N2-144
- N2-145
- N2-146
- N2-147
- N2-148
- N2-149
- N2-150
unblocks: []
acceptance_criteria:
- N2-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 107.
- newtools-S0001 through newtools-S0078 product coverage is owned by N2-002 through N2-150 or explicit structural, reference-only, retired, and migration-coverage dispositions.
- N2-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0072
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0073
preserved_exact_tokens:
- N2-001
- GUI Testing Tools Residual Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- 15. References
- 14.7A DockerHub browser auth, repository management, and Unraid publishing addendum
- Result payload minima
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- N2-001 must not re-own newtools-S0001 through newtools-S0078 after Phase 2B batch 107.
- N2-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- N2-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former N2-001 residual source-preserving bridge is retired by Phase 2B batch 107.
owner_boundary_notes:
- N2-002 through N2-150 and explicit coverage dispositions own newtools product coverage after bridge retirement.
- newtools-S0072 is reference-only lineage/provenance coverage after bridge retirement.
- newtools-S0073 is a structural addendum heading after bridge retirement.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally/reference dispositioned and is now retired.
```

## Migration Coverage

Original hash: `e71a3c15b076255cc614c4ef56c333212e88f0cb72c6d02b58af24ebe454f904`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batches 104 through 107 atomized source spans `newtools-S0002` through `newtools-S0078` into fine-grained PlanUnits `N2-002` through `N2-150`, except for structural, reference-only, and migration-lineage dispositions. `newtools-S0001`, `newtools-S0007`, `newtools-S0013`, `newtools-S0017`, `newtools-S0030`, `newtools-S0035`, `newtools-S0057`, `newtools-S0072`, `newtools-S0073`, and `newtools-S0076` are structurally or reference-only dispositioned; `newtools-S0034` is fully covered by `N2-048` and `N2-049`; `newtools-S0052` is split across `N2-096`, `N2-097`, and `N2-098`. `N2-001` is retired to migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical newtools spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Framework And Tool Catalog Entry Schemas

Repairs row `sfk-88d1096d2627a98e841dc23e`.

`FrameworkEntry` fields: `framework_id`, `display_name`, `language_family`, `default_tool_ids[]`, `detection_patterns[]`, `install_strategy`, `support_state`, `owner_doc_ref`, and `schema_version`.

`ToolEntry` fields: `tool_id`, `display_name`, `framework_id?`, `command_ref?`, `capability_tags[]`, `default_enabled`, `support_classification`, `requires_credentials`, `health_check_id?`, `policy_refs[]`, and `schema_version`.

### Action Catalog And Scenario File Contract

Repairs row `sfk-4d4d2855408c239af5a00ef3`.

- Action catalog records use `action_id`, `display_name`, `scenario_file`, `trigger_kind`, `required_tool_ids[]`, `input_schema_ref`, `output_schema_ref?`, `permission_class`, `default_enabled`, and `owner_doc_ref`.
- Scenario files use JSON with top-level fields `scenario_id`, `schema_version`, `steps[]`, `fixtures[]?`, `expected_results[]`, and `cleanup[]?`.
- Step fields are `step_id`, `action_id`, `inputs`, `timeout_ms`, `retry_policy_ref?`, and `on_failure`.

### Doctor Check Registry

Repairs row `sfk-daa3fd5eb054bd8c6be82b8d`.

Canonical doctor check ids include `doctor.mcp.context7`, `doctor.registry.auth`, `doctor.dockerhub.auth.capability`, `doctor.docker.buildx`, `doctor.debug.launch_config`, `doctor.debug.browser_session`, and `doctor.debug.attach_pid`.

Each doctor check record fields: `check_id`, `owner_doc_ref`, `input_schema_ref?`, `success_state`, `failure_codes[]`, `remediation_action_ids[]`, `credential_scope?`, `network_required`, `cache_ttl_seconds`, and `support_state`.

### Preflight Failure Enums

Repairs row `sfk-8d03b002e270c0c2db010037`.

- `severity` values are `info`, `warning`, `blocked`, and `fatal`.
- `code` values are `dependency_missing`, `dependency_version_unsupported`, `credential_missing`, `permission_denied`, `network_unavailable`, `policy_blocked`, `host_unreachable`, `runtime_unavailable`, `schema_invalid`, and `unknown`.
- Preflight failure fields are `code`, `severity`, `dependency?`, `expected?`, `observed?`, `remediation`, `owner_doc_ref`, and `retryable`.

### Manifest Render Hints

Repairs row `sfk-181db601e331e0d9b1cd52c7`.

`manifest.json` fields are `manifest_id`, `schema_version`, `tool_ids[]`, `framework_ids[]`, `render_hints`, `policy_refs[]`, `credential_refs[]?`, and `generated_at_utc`.

`render_hints` fields are `group_by`, `sort_order`, `compact_labels`, `show_health_badges`, `default_filter?`, and `empty_state_copy_id?`.

### Shared Trust Proxy Deny Codes

Repairs row `sfk-c5e20efd85f389d003c5cf07`.

Canonical deny-code families are `permission_denied`, `credential_missing`, `trust_proxy_unavailable`, `network_forbidden`, `policy_blocked`, `registry_auth_failed`, `capability_unverified`, and `unsafe_target`. These deny codes must map to the corresponding permission or preflight reason before a tool action can surface as retryable.

### Instrumentation Scope And Debug Target Storage

Repairs rows `sfk-d832771f93a3e3541cd1b774` and `sfk-18048251633869d004e48189`.

- Instrumentation scope records use storage key `instrumentation_scope.v1:{project_id}:{scope_id}` with fields `scope_id`, `project_id`, `target_ref`, `status`, `temporary`, `cleanup_path?`, `created_at_utc`, `expires_at_utc?`, and `owner_doc_ref`.
- Debug target registry records use storage key `debug_target.v1:{project_id}:{target_id}` with fields `target_id`, `target_kind`, `launch_config_ref?`, `url?`, `attach_pid?`, `browser_session_ref?`, `permission_snapshot_id?`, `last_verified_at_utc?`, and `support_state`.

### Split Recommendation Closure And Deprecated Registry Auth Constraint

Repairs rows `sfk-69876bef3b441cb17b89d231` and `sfk-db7708202eb32b69931bb737`.

- `split_recommended: true` on N2-096 through N2-140 is a planning-quality signal, not a buildability claim. A row may remain unsplit only when it has an explicit `split_deferred_reason`, `owner_doc_ref`, and `reopen_condition`.
- The canonical registry auth constraint is: `doctor.registry.auth` is deprecated for DockerHub auth; use `doctor.dockerhub.auth.capability` for DockerHub-specific capability checks. Any N2-120/N2-141 duplicate wording must normalize to that single sentence.


## Platform capability catalog and evaluation contract

Status: `STATICALLY_MATERIALIZED`; no runtime or validator execution is claimed.

Platform capability identity comes only from `Plans/platform_capability_catalog.json` and its closed schema. A `PlatformCapabilityRef` requires `ref_type=platform_capability_catalog_entry`, `catalog_id=pm.platform_capability_catalog`, `catalog_schema_version=1.0.0`, integer `catalog_revision>=1`, and one exact active `capability_id`. Aliases are migration-reader inputs only.

Evaluation freezes the active revision, validates evidence against the entry, rejects duplicate same-source disagreement, and selects `live_runtime_discovery`, then `provider_policy_snapshot`, then `static_platform_baseline`. Lower-precedence valid evidence remains provenance and cannot override. The v2 writer is `Plans/event_payload_platform_capability_evaluated.schema.json#`; the exact v1 object is reader-only at `#/$defs/platform_capability_evaluated_1_0_0_compatibility_reader`. Storage binding is `MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0`; unprovable migration quarantines without checkpoint advance.
