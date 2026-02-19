# GUI Testing Tools & Framework Options — Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document describes:

- Extending the interviewer flow to discover and offer GUI/testing tools (existing and custom)
- Supporting headless GUI testing and full debug logs for non-web projects
- Integrating chosen tools into test strategy and execution plans so agents perform deeper, framework-appropriate testing

Implementation must follow the **DRY Method** (AGENTS.md): reuse-first, single source of truth for tool/framework data, tagging of reusable items.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Relationship to Other Plans](#2-relationship-to-other-plans)
3. [Problem Statement](#3-problem-statement)
4. [Goals](#4-goals)
5. [Design Overview](#5-design-overview)
6. [Framework & Tool Discovery (DRY)](#6-framework--tool-discovery-dry)
7. [Interviewer Flow Changes](#7-interviewer-flow-changes)
8. [Custom Headless GUI Tool](#8-custom-headless-gui-tool)
9. [Integration with Test Strategy & Plans](#9-integration-with-test-strategy--plans)
10. [Implementation Checklist](#10-implementation-checklist)
11. [Gaps, Risks, and DRY Notes](#11-gaps-risks-and-dry-notes)
12. [References](#12-references)

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

---

## 2. Relationship to Other Plans

This plan extends the **interview** and **test strategy**; it does not replace them. New options (framework tools, custom headless) are **interview config** that must be wired like existing options and must align with orchestrator, Worktree, and cleanup behavior.

| Plan | How newtools fits |
|------|-------------------|
| **Plans/interview-subagent-integration.md** | **Phase 8 (Testing & Verification)** already uses qa-expert and test-automator. newtools adds **tool discovery and selection** inside that phase (GUI stack detection, catalog lookup, user options). New fields (`selected_framework_tools`, `plan_custom_headless_tool`, etc.) are **interview config** and must be wired into `InterviewOrchestratorConfig`, set from `gui_config.interview` in `app.rs`, and used at completion when generating test strategy and PRD — same pattern as `generate_playwright_requirements`. Phase 5 document generation is extended so test strategy and plans include framework tools and custom headless instructions. |
| **Plans/orchestrator-subagent-integration.md** | **Interview config wiring:** Any new interview setting follows the same three-step checklist as in "Interviewer Enhancements and Config Wiring" and "Avoiding Built but Not Wired": add to execution config type, set at construction from `gui_config.interview`, use in interview runtime. **Test strategy** is already loaded and merged into tier criteria by the orchestrator; newtools ensures the **new** tool instructions and debug-log paths are part of that merged context so agents see them. Evidence paths (e.g. `.puppet-master/evidence/`) stay as-is; custom headless tool writes evidence in the same style. |
| **Plans/WorktreeGitImprovement.md** | **Config:** New interview toggles live in the Interview tab and `gui_config.interview`; they are persisted and included in the **same Option B run-config build** as other GUI settings (no separate config file). **Worktrees:** When agents run in a worktree, the custom headless tool’s evidence path follows the same policy (e.g. `.puppet-master/evidence/` under the workspace used for the run); no change to worktree creation/merge/cleanup. |
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
  3. In Testing phase (or a dedicated “GUI testing tools” step), **present options** to the user: existing tools, custom headless tool plan, or both.
  4. **Persist** user choices in interview state and config (e.g. “use_playwright”, “use_framework_tools”, “plan_custom_headless_tool”, “selected_framework_tools”).
  5. On interview completion, **write into plans/PRD and test strategy:**
     - Tasks to **obtain/set up** existing tools when selected.
     - Tasks to **plan or build** the custom headless tool when selected (with requirement: headless navigation + full debug log after test runs).
     - **Testing instructions** that tell agents to use Playwright (web), selected framework tools, and/or the custom tool for smoke and GUI tests; reference debug log location and format where applicable.

---

## 6. Framework & Tool Discovery (DRY)

### 6.1 Single source of truth

Introduce a **single source of truth** for “GUI framework → available tools” so the interviewer (and any future automation) does not hardcode or duplicate this data.

- **Location (suggested):** `puppet-master-rs/src/interview/gui_tool_catalog.rs` (or `automation/gui_tool_catalog.rs` if shared with headless runner). Tag as `// DRY:DATA:GuiToolCatalog`.
- **Content:** A catalog (e.g. struct + const data or table) that for each supported framework (or “web” for Playwright) provides:
  - **Framework ID** (e.g. `web`, `iced`, `dioxus`, `qt`, `flutter`, `tauri`, `electron`).
  - **Display name** and optional **detection hints** (e.g. Cargo.toml crate name, package.json deps).
  - **Existing tools:** list of entries, each with: name, description, install/setup summary, capabilities (e.g. “hot reload”, “web preview”, “headless test”, “real-time dev UI”), and optional doc URL.
  - **Custom headless default:** whether to suggest “plan/build custom headless tool” by default for this framework (e.g. true for Iced when no headless runner in project; false for “web” when Playwright suffices).

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

Catalog should be **extensible** (add new frameworks/tools without changing interviewer flow logic). Use **DRY:FN** helpers for “lookup by framework”, “list tools for framework”, “should suggest custom headless for framework”.

### 6.2 Research as input only (no research-only outcome)

Research (Context7 MCP, web search) may be used to **inform** the catalog or the build plan, but must **not** be presented as a standalone research-only outcome. Options:

- **Catalog population:** When the catalog has no or sparse data for a framework, research can **add or extend catalog entries** so the catalog remains the single source of truth and future runs see the data. The user is shown **catalog-backed options** (including newly added entries), not a separate research-only result.
- **Build plan input:** When the user chooses plan/build custom headless GUI tool for an unknown or sparse-catalog framework, research can **inform the design** of that tool. The deliverable is always the **plan to build the full-featured tool** (see §8); research only feeds that plan.

Do **not** offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan. For unknown frameworks, the user still gets: catalog options (if research populated the catalog) and/or the option to plan/build the full-featured custom headless tool, with research used only to improve that plan.

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
     - **Playwright** (when “web” is in detected frameworks): keep current “Generate Playwright requirements” behavior; present as one option.
     - **Framework tools:** For each detected non-web framework, list existing tools from the catalog; allow user to select which to use (e.g. “Dioxus devtools”, “Iced headless runner if present”).
     - **Custom headless tool:** Checkbox or option: “Plan/build a custom headless GUI tool for this project (headless navigation + full debug log for agent smoke tests)”. Default can come from catalog (“custom headless default” per framework).
  3. **Persist** choices in interview config/state (e.g. `generate_playwright_requirements`, `selected_framework_tools: Vec<FrameworkToolChoice>`, `plan_custom_headless_tool: bool`). Ensure these are wired into `InterviewOrchestratorConfig` and used at completion (§9).

### 7.3 UI for tool selection

- Reuse existing widgets per **DRY** (`docs/gui-widget-catalog.md`, `src/widgets/`). Use toggles, checkboxes, or multi-select for:
  - Playwright (existing).
  - Per-framework list of existing tools (select one or more).
  - “Plan/build custom headless GUI tool” toggle.
- Tooltips or short help: explain that existing tools come from the catalog; custom tool is full-featured (headless runner, action catalog, full evidence) like this project's. No new one-off UI patterns; tag new reusable widgets with `// DRY:WIDGET:...`.

---

## 8. Custom Headless GUI Tool

When the user chooses **“plan/build custom headless GUI tool”**:

### 8.1 Requirement: full-featured (like this project)

The custom headless GUI tool must be **fully featured**, not minimal. Use **this project's** automation as the reference (Puppet Master's `src/automation/`: headless runner, action catalog, evidence layout). The tool must provide:

- **Headless execution:** Runs without display (CI-friendly); uses software rendering or framework-specific headless mode (e.g. Iced tiny-skia, or framework’s own headless API).
- **Action catalog:** A defined set of actions or scenarios so that smoke and regression flows can be scripted and repeated. Not a one-off script — a reusable catalog the agent can extend and run.
- **Full evidence output:** After each run, the tool must produce the **same depth of debug information** as Puppet Master's GUI automation: **Timeline** (e.g. `timeline.jsonl`), **Summary** (e.g. `summary.md`), **Artifacts** (screenshots or state dumps per step). **Consistent paths:** Evidence under a standard location (e.g. `.puppet-master/evidence/gui-automation/...`). Optional: **ephemeral workspace clone** as in this project's headless runner.

### 8.2 What gets written into plans

- **If get existing tool** (e.g. Iced headless runner already in repo that meets §8.1): Plan steps to **ensure the tool is available** (install/setup), document how to run it and where evidence is written, and reference it in test strategy.
- **If build custom:** Plan steps to **design and implement** a **full-featured** project-specific automation that meets §8.1 (headless runner, action catalog, full evidence: timeline, summary, artifacts). Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack. No minimal smoke harness — the deliverable is a tool that matches the capability and evidence depth of this project's automation.
- **If both:** Plan to use existing tools where they fit, and add or extend the custom tool for full coverage and evidence.

### 8.3 Reuse of existing automation (this project)

Puppet Master's **headless runner** and **action catalog** in `src/automation/` (AGENTS.md) are the **reference implementation**. For **Iced projects**, the plan should reference reusing or porting that pattern. For other frameworks, the plan describes building or adopting a system that meets the **same contract**: action catalog, timeline + summary + artifacts, standard evidence paths.

---

## 9. Integration with Test Strategy & Plans

### 9.1 Test strategy (test-strategy.md, test-strategy.json)

- **Extend** `TestStrategyConfig` (and any JSON schema) to include:
  - **Framework tools:** List of selected framework tool IDs and how they are used (e.g. “Run Dioxus devtools for live preview; use for manual smoke checks” or “Run Iced headless runner with action set X”).
  - **Custom headless tool:** When selected, a dedicated section or items that state: “Use the project’s headless GUI tool for smoke tests; read debug log at `<path>` after each run.”
- **Test types:** Add or reuse test types (e.g. `headless_gui`, `framework_tool`) in addition to `playwright`, so that verification commands and criteria can reference “run headless tool” or “run framework tool X”.
- **DRY:** Extend `test_strategy_generator` and `TestItem` (or equivalent) so that new options are generated from the **same** interview state (selected_framework_tools, plan_custom_headless_tool); no duplicate logic in views vs generator.

### 9.2 PRD / execution plans

- **Tasks in the PRD (or plan):**
  - “Obtain/set up &lt;existing tool&gt;” when the user selected that tool.
  - “Plan and implement custom headless GUI tool (headless navigation + full debug log)” when the user selected custom tool.
- **Acceptance criteria** for testing tiers should reference: run Playwright (if web), run selected framework tools, run custom headless tool and check debug log. Prompt builder already loads test strategy; ensure new instructions and paths are included in context so **agents use the tools** during iterations.

### 9.3 Prompt and context

- **Prompt builder** already includes test strategy (§5.2 in interview plan, `load_interview_outputs`). Ensure new content (framework tools, custom headless, debug log path) is present in the excerpt so agents see when and how to use each tool and where to find the debug log.

---

## 10. Implementation Checklist

- [ ] **6.1** Add `gui_tool_catalog` module (or equivalent) as single source of truth; implement lookup by framework, list tools, “custom headless default” per framework. Tag `// DRY:DATA:GuiToolCatalog` and helpers `// DRY:FN:...`.
- [ ] **6.2** Define research as input-only: catalog population and/or build-plan input; no research-only user outcome.
- [ ] **7.1** Add GUI stack detection (from Architecture/UX or feature_detector); store `detected_gui_frameworks` in interview state.
- [ ] **7.2** In Testing phase, call catalog (and optional research to populate catalog); build options (Playwright, framework tools, custom headless); persist user choices in interview config/state and wire into `InterviewOrchestratorConfig`.
- [ ] **7.3** Add UI for tool selection using existing widgets; tag new widgets; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes.
- [ ] **8** Document custom headless tool as **full-featured** (headless runner, action catalog, full evidence per §8.1); document how plans reference existing automation (e.g. Iced headless runner) vs building new.
- [ ] **9.1** Extend test strategy generator and schema for framework tools and custom headless; add test types and verification commands as needed.
- [ ] **9.2** Ensure PRD/plan generation includes tasks for get existing tools and plan/build custom tool when selected.
- [ ] **9.3** Ensure prompt builder includes new test strategy content (paths, instructions) so agents use the tools.
- [ ] **DRY** All framework/tool data from catalog only; no hardcoded tool lists in views or prompts. Pre-completion: run AGENTS.md Pre-Completion Verification Checklist.

---

## 11. Gaps, Risks, and DRY Notes

### 11.1 Catalog maintenance

- The catalog will need periodic updates as frameworks and tools evolve. Prefer a single file or module so maintainers know where to add entries. For unknown frameworks, the user still gets the option to plan/build the **full-featured** custom headless tool (§8); research may populate the catalog or inform that build plan, but there is no research-only outcome.

### 11.2 Custom tool scope

- Build a custom headless GUI tool is a substantial task. The plan frames it as **full-featured** from the start (headless runner, action catalog, full evidence: timeline, summary, artifacts), using this project's automation as the reference. Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack; for other frameworks, the plan describes building or adopting an analogous **full-featured** system with the same contract. Do not frame the deliverable as a minimal smoke harness — the goal is a tool that matches the capability and evidence depth of this project's automation.

### 11.3 DRY and AGENTS.md

- **Widgets:** Use `docs/gui-widget-catalog.md` and `src/widgets/` for any new interview UI; tag with `// DRY:WIDGET:...`.
- **Data:** All “framework → tools” and “should suggest custom headless” data lives in `GuiToolCatalog` (or equivalent); no duplication in phase prompts or views.
- **Test strategy:** Extend existing `test_strategy_generator` and types; do not duplicate “what tools to use” in multiple places.
- **Pre-completion:** Before marking tasks done: `cargo check`, `cargo test`, DRY checks, no hardcoded tool lists, scope respected.

### 11.4 Consistency with other plans

- **Interview plan** (`Plans/interview-subagent-integration.md`): Testing phase already uses qa-expert and test-automator; add “tool discovery and selection” as part of that phase; config wiring for new options follows “Interviewer Enhancements and Config Wiring” in orchestrator plan.
- **Orchestrator plan** (`Plans/orchestrator-subagent-integration.md`): Test strategy is already loaded and merged into tier criteria; ensure new tool instructions and debug log paths are part of that merged context.

### 11.5 Gaps, issues, and improvements (implementation notes)

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

**Doctor check (optional)**

- A future Doctor check could verify that the headless tool exists and runs when `plan_custom_headless_tool` was true. Optional for v1.

**YAML and config field names**

- Use consistent names for new interview fields in GUI and YAML and ensure they are serialized in the same config shape used by Option B run-config build.

---

## 12. References

- **AGENTS.md:** DRY Method, widget catalog, platform_specs, Pre-Completion Verification Checklist; headless rendering (tiny-skia), automation (headless runner, action catalog).
- **Plans/interview-subagent-integration.md:** Interview phases (Testing & Verification), test strategy, `generate_playwright_requirements`, Phase 5 document generation, DRY for interview code (§5.2).
- **Plans/orchestrator-subagent-integration.md:** Interview config wiring, test strategy loading in prompts.
- **puppet-master-rs/src/interview/test_strategy_generator.rs:** TestStrategyConfig, TestItem, write_test_strategy, test-strategy.md / test-strategy.json.
- **puppet-master-rs/src/core/prompt_builder.rs:** Load test strategy into iteration context.
- **puppet-master-rs/src/automation/:** Headless runner, action catalog, evidence (timeline, summary).
