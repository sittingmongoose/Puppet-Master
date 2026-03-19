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
- auth policy remains subscription-first, with Gemini API key as the explicit allowed exception; Gemini itself is one provider with mixed OAuth/API-key account pools and requested/effective auth/account identity that must remain consistent with the shared provider runtime
- for this task, deliverables remain **Plans-folder documentation updates for the Slint rebuild**; no legacy Iced runtime wiring is required

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
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

Today, the interviewer can generate **Playwright** requirements and wire them into the test strategy so agents run E2E tests. Playwright only applies to **web-based GUIs**. Many projects use native or framework-specific GUIs (e.g. Iced, Dioxus, Qt, Electron, Tauri). For those:

- There may be **existing tools** (e.g. Dioxus hot reload + web preview, Iced headless runner, framework-specific test utilities) that the interviewer should **discover and offer**.
- When no suitable tool exists, the interviewer should offer to **plan or build a custom headless GUI tool** that allows headless navigation and produces a **full debug log** after tests, so agents can run smoke tests and interpret results.

This plan adds:

1. **Discovery:** During the interview (especially Architecture and Testing phases), detect GUI stack and search a **single source of truth** for framework-specific tools (existing tools, docs, hot reload, headless options).
2. **User choice:** Present options to the user (use existing tools, plan to build custom tool, or both).
3. **Plan and test strategy:** Write into the generated plans/PRD and test strategy: get existing tools (if chosen), and/or plan to build the custom tool; then integrate tool usage into testing instructions so agents use them during execution.

Result: **More thorough and deeper testing** across web and non-web projects, with agents using the right tools per framework and a consistent path for custom headless + debug logging when needed.

**Success criteria (how we know the plan succeeded):** (1) When a non-web GUI framework is detected, the interview offers framework tools and the custom headless option from the catalog. (2) User choices are persisted and drive test strategy and PRD/plan content (tasks + instructions). (3) Agents receive test strategy that includes framework tools and/or custom headless instructions and evidence paths. (4) When the user chose custom headless, a Doctor check can verify the tool exists and runs (conditional on that choice). (5) MCP (e.g. Context7) is configurable for all supported providers via GUI and applied at run time. (6) Existing Playwright-only flow and existing test strategy behavior remain unchanged when no new options are selected (no regression).

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
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7
- **Offer options to the user:** Present: use existing tools only, plan/build custom headless tool only, or both. User choice is stored and drives what gets written into execution plans and test strategy.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation
- **Custom headless tool option:** When chosen, execution plans MUST include: build (or adopt) a project-specific tool that supports headless GUI navigation and emits a **full debug log** after runs so agents can verify behavior and debug failures.  
  ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md#automation
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
     - **Testing instructions** that tell agents to use Playwright (web), selected framework tools, and/or the custom tool for smoke and GUI tests; reference debug log location and format where applicable.

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

- **All platforms:** MCP-backed tools MUST be supported and configurable for **all supported providers** (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). Canonical MCP configuration lives in Puppet Master; per-platform files are **derived adapters only** where a platform requires them (see §8.2). Implementation MUST ensure that when the user selects a catalog tool that uses MCP, Puppet Master can **set up and verify** that the tool is available and callable for the tier's platform.  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager, Gate:GATE-005
- **Setup and verification:** Implementation MUST provide a way to configure MCP servers (including API keys where required) and to verify that tools are callable (e.g. Doctor check or pre-run check per §11 checklist item **Doctor (MCP)**). Implementation MUST document or implement how MCP config (including Context7 API key and enable/disable state) is passed into the runner or agent environment so that platform CLIs see the correct MCP servers when executing.  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005
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
     - **Playwright** (when "web" is in detected frameworks): keep current "Generate Playwright requirements" behavior; present as one option.
     - **Framework tools:** For each detected non-web framework, list existing tools from the catalog; allow user to select which to use (e.g. "Dioxus devtools", "Iced headless runner if present").
     - **Custom headless tool:** Checkbox or option: "plan/build a custom headless GUI tool for the target project (headless navigation + full debug log for agent smoke tests)". Default can come from catalog ("custom headless default" per framework).
  3. **Persist** choices in interview config/state (e.g. `generate_playwright_requirements`, `selected_framework_tools: Vec<FrameworkToolChoice>`, `plan_custom_headless_tool: bool`). Ensure these are wired into `InterviewOrchestratorConfig` and used at completion when generating test strategy and plans (§10). At interview completion, write the Doctor-readable projection into project config: `tools.custom_headless` is written when `plan_custom_headless_tool == true` and removed when `plan_custom_headless_tool == false`.

### 7.3 UI for tool selection

- Reuse existing widgets per **DRY** (`docs/gui-widget-catalog.md`, `src/widgets/`). Use toggles, checkboxes, or multi-select for:
  - Playwright (existing).
  - Per-framework list of existing tools (select one or more).
  - "plan/build custom headless GUI tool" toggle.
- Tooltips or short help: explain that existing tools come from the catalog; custom tool is full-featured (headless runner, action catalog, full evidence) like Puppet Master's automation. No new one-off UI patterns; tag new reusable widgets with `// DRY:WIDGET:...`. Follow existing accessibility and widget patterns (selectable labels, keyboard navigation, screen reader considerations per `docs/gui-widget-catalog.md`).  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:docs/gui-widget-catalog.md

---

## 8. MCP Support and GUI Settings
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

MCP support is a host-managed runtime capability surface.

### GUI responsibilities
- list configured servers
- enable/disable servers
- edit command/args/env and per-server settings
- test connection and show explicit health state
- expose provider/platform compatibility and scope where relevant
- show requested state and effective availability when they differ

### Runtime rules
- server configuration is not a config-passthrough-only feature
- effective tool availability depends on server health, platform/provider support, project scope, Persona/permission state, and policy
- unhealthy servers do not silently succeed; they surface unavailable/blocked/degraded state explicitly
- MCP server configs installed from the catalog follow the same lifecycle and validation rules as manually created entries
## 9. Custom Headless GUI Tool

When the user chooses **"plan/build custom headless GUI tool"**:

### 9.1 Requirement: full-featured (like Puppet Master's automation)

The custom headless GUI tool must be **fully featured**, not minimal. Use **Puppet Master's** automation as the reference (`src/automation/`: headless runner, action catalog, evidence layout). The tool must provide:

- **Headless execution:** Runs without display (CI-friendly); uses software rendering or framework-specific headless mode (e.g. Iced tiny-skia, or framework's own headless API).
- **Action catalog:** A defined set of actions or scenarios so that smoke and regression flows can be scripted and repeated. Not a one-off script -- a reusable catalog the agent can extend and run.  
  ContractRef: ContractName:AGENTS.md#automation-action-catalog
  - **Full evidence output:** After each run, the tool MUST produce the **same depth of debug information** as Puppet Master's GUI automation: **Timeline** (e.g. `timeline.jsonl`), **Summary** (e.g. `summary.md`), **Artifacts** (screenshots or state dumps per step), and the canonical manifest described in **§13**. **Consistent paths:** Evidence under `.puppet-master/evidence/gui-automation/<run_id>/`. Optional: **ephemeral workspace clone** as in Puppet Master's headless runner.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, ContractName:AGENTS.md#automation-evidence

### 9.2 What gets written into plans

- **If get existing tool** (e.g. Iced headless runner already in repo that meets §9.1): Plan steps to **ensure the tool is available** (install/setup), document how to run it and where evidence is written, and reference it in test strategy.
- **If build custom:** Plan steps to **design and implement** a **full-featured** project-specific automation that meets §9.1 (headless runner, action catalog, full evidence: timeline, summary, artifacts). Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack. No minimal smoke harness -- the deliverable is a tool that matches the capability and evidence depth of Puppet Master's automation.  
  ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md#automation
- **If both:** Plan to use existing tools where they fit, and add or extend the custom tool for full coverage and evidence.

### 9.3 Reuse of existing automation (Puppet Master reference implementation)

Puppet Master's **headless runner** and **action catalog** in `src/automation/` (AGENTS.md) are the **reference implementation**. For **Iced projects**, the plan should reference reusing or porting that pattern. For other frameworks, the plan describes building or adopting a system that meets the **same contract**: action catalog, timeline + summary + artifacts, standard evidence paths.  
ContractRef: ContractName:AGENTS.md#automation, SchemaID:evidence.schema.json

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
- **Acceptance criteria** for testing tiers MUST reference: run Playwright (if web), run selected framework tools, run custom headless tool and check debug log. Prompt builder already loads test strategy; implementation MUST ensure new instructions and paths are included in context so **agents use the tools** during iterations.  
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
- [ ] **7.2** In Testing phase, call catalog (and optional research to populate catalog); build options (Playwright, framework tools, custom headless); persist user choices in interview config/state and wire into `InterviewOrchestratorConfig`.
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
ContractRef: ContractName:AGENTS.md#automation, SchemaID:evidence.schema.json

### 12.3 DRY and AGENTS.md

- **Widgets:** Use `docs/gui-widget-catalog.md` and `src/widgets/` for any new interview UI; tag with `// DRY:WIDGET:...`.
- **Data:** All "framework → tools" and "should suggest custom headless" data lives in `GuiToolCatalog` (or equivalent); no duplication in phase prompts or views.
- **Test strategy:** Extend existing `test_strategy_generator` and types; do not duplicate "what tools to use" in multiple places.
- **Pre-completion:** Before marking tasks done: `cargo check`, `cargo test`, DRY checks, no hardcoded tool lists, scope respected.

### 12.4 Consistency with other plans

- **Interview plan** (`Plans/interview-subagent-integration.md`): Testing phase already uses qa-expert and test-automator; add "tool discovery and selection" as part of that phase; config wiring for new options follows "Interviewer Enhancements and Config Wiring" in orchestrator plan.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-8-testing, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring
- **Orchestrator plan** (`Plans/orchestrator-subagent-integration.md`): Test strategy is already loaded and merged into tier criteria; ensure new tool instructions and debug log paths are part of that merged context.  
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

- The consumer of test-strategy.json is `TierTree::load_test_strategy` in `core/tier_node.rs` (schema: `Plans/test_strategy.schema.json`). Implementation MUST extend additively: allow new `testType` values (e.g. `headless_gui`, `framework_tool`) and, if structured tool metadata is needed, add optional fields to `TestItem` and to the loader. Backward compatibility is REQUIRED: the loader MUST tolerate missing `headless_gui`/`framework_tool` items and optional tool metadata in existing test-strategy.json files (no migration of old files required; new fields are additive only).  
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
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005

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

  ContractRef: ContractName:Plans/MiscPlan.md#doctor, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2

**Test strategy schema duplication**

**Test strategy artifact schema (Resolved):**
- The machine-readable artifact is `.puppet-master/interview/test-strategy.json` with top-level fields `project`, `generatedAt`, `coverageLevel`, `items[]`.
- Canonical JSON Schema lives in `Plans/test_strategy.schema.json` (`SchemaID:pm.test_strategy.schema.v1`).
- Interview writes it; Orchestrator reads it; newtools extends it additively (new `testType` values + optional tool metadata fields).
  ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**MCP config injection timing and cwd**

- `CliBridge` platform CLIs (Cursor/Claude Code) are spawned with a working directory (project or worktree). Derived MCP adapter config (no secrets) MUST be present in the actual spawn cwd (preferred) or a user-level location before the CLI starts. Implementation MUST document: (1) whether adapter generation happens once at run-config build time (project root) OR at spawn time (actual cwd used by platform runner), AND (2) how worktrees are handled so adapters are visible to the agent when running in a worktree. Preferred per PolicyRule:Decision_Policy.md§2 and Plans/WorktreeGitImprovement.md: generate adapters at spawn time into the actual run directory (cwd) so worktree runs get correct MCP config. `DirectApi` providers do not use provider-side MCP config files.  
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
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:AGENTS.md#automation, PolicyRule:Decision_Policy.md§2

**Playwright vs "web" and test strategy generator**

- Today `write_test_strategy` is gated by `generate_playwright_requirements` in the orchestrator; `TestStrategyConfig` has `include_playwright` but no `include_framework_tools` or `plan_custom_headless_tool`. Extending test strategy for newtools requires: (1) pass the new interview flags (`selected_framework_tools`, `plan_custom_headless_tool`) into the completion path so `write_test_strategy` receives them, AND (2) extend `TestStrategyConfig` and the generator so markdown and JSON include framework tools and custom headless sections/items. Implementation MUST add these fields to `InterviewOrchestratorConfig` and wire from `gui_config.interview` in `app.rs` (see §2 table, same three-step checklist as other interview config).  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005

**Verification command and headless tool binary name**

- The plan specifies (§12.5 "Verification command for custom headless tool") that the test strategy generator MUST emit a deterministic convention-based command when the project follows the documented naming convention, OR mark the item as EXAMPLE-only. Implementation MUST document the convention (e.g. `cargo run --bin headless_runner` for Rust projects; `npm run test:headless` for Node projects) in AGENTS.md or STATE_FILES.md so both the generator and agents agree. When the convention is followed, the generator emits the stable command; when it is not, the generator emits an EXAMPLE marker plus a criterion-based instruction.  
  ContractRef: ContractName:AGENTS.md, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§4

**Version compatibility and platform churn**

- §8.2 notes that platforms change rapidly. Implementation MUST add a Doctor check or a small "platform config" report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions. **In scope:** implement per checklist item **Doctor (platform versions)** in §11.  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005

**Backward compatibility for existing projects**

- Existing projects with test-strategy.md / test-strategy.json generated before newtools MUST continue to work: the loader in `tier_node` and the prompt builder MUST tolerate missing `headless_gui` / `framework_tool` items and optional tool metadata. No migration of old files is required; new fields are additive only. Implementation MUST verify backward compatibility via test cases or manual verification with a pre-newtools test-strategy.json file.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**MCP Doctor check (in scope)**

- Implementation MUST add a dedicated Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check. See checklist item **Doctor (MCP)** in §11.  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005

**Catalog version or last-updated (in scope)**

- Implementation MUST provide a base catalog version and overlay last-updated metadata (e.g. `CATALOG_VERSION` const for the base + per-entry `last_updated` in overlay) so agents or docs can reference "catalog as of date X" when debugging tool availability. See checklist item **Catalog version / last-updated** in §11.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, SchemaID:evidence.schema.json

---

## 12.7 Crews and Subagent Communication Enhancements for Tool Discovery

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

## 12.8 Lifecycle and Quality Enhancements for Tool Discovery

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

ContractRef: ContractName:Plans/test-strategy.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

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
| `doctor.registry.auth` | docker publish | Registry auth validated for selected provider (`dockerhub` default) | Block publish; preserve local build results |
| `doctor.actions.workflow-ready` | GitHub Actions | Workflow template validates and required secrets are declared | Block workflow apply; show missing/invalid fields |
| `doctor.evidence.media` | evidence/chat | Manifest + media artifacts are readable and hash-valid | Keep run result, mark evidence degraded with explicit fallback message |
| `doctor.mcp.context7` | MCP / docs | Context7 enablement is on and a usable key resolves from env or credential store; server can list tools | Keep run usable, but mark Context7-backed tools unavailable and surface remediation |
| `doctor.mcp.provider-ready` | MCP / provider bridge | For each selected provider, MCP bridge/adapters are present and the configured server set exposes the expected tool names | Mark MCP-backed tools unavailable for that provider; do not silently advertise missing tools |
| `doctor.websearch.cited` | cited web search | `websearch_cited` result contract passes a dry-run/provider health check for the configured provider order | Keep run usable, but disable cited web search with explicit config/auth/timeout reason |
| `doctor.gui.custom-headless` | custom GUI tool | When `plan_custom_headless_tool = true`, configured tool path exists, is executable, and produces canonical evidence layout | Mark custom headless path unavailable and point to config/evidence contract remediation |
| `doctor.gui_tool_catalog.freshness` | framework tool catalog | Base catalog version plus overlay `last_updated` metadata are present and readable | Keep run usable, but warn that tool recommendations may be stale and show the recorded snapshot date |

ContractRef: ContractName:Plans/MiscPlan.md#doctor, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json

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
