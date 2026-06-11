# Puppet Master GUI Specification -- Slint Rewrite


## Canonical owner-section requirements


These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Concern record family definition


### Concern routing and object-first search behavior

Global search labels distinguish `Search in this tab` from `Search Orchestrator`: the former is local tab filtering, while the latter is object-first, cross-tab, and route-aware so concern, evidence, history, ledger, and graph results land on the canonical object route rather than a page-local text match.

The active split names `Orchestrator search` as object-first, run-aware, cross-tab routing and `tab-local search` as local `/filtering` within the active tab or `/view`.


### Concern action policy and authority model
- Concern surfaces map `Progress`, `Seams`, `Evidence`, `History`, and `Ledger` views onto concern-linked `/evidence`, `/package` rollups, exact source references, `/split/supersession`, and acknowledgment `/dismissal` rationale instead of flattening concern history into one summary row.
- Concern record surfaces expose a canonical record schema with `/routing`, `/blocked/remediation`, `/corroboration/graph`, `/recovery`, and relationship links to reviews and graph patches; structural actions use `/split/supersession` instead of local free-text history.
- Concern lineage transitions use `merge`, `split`, and `superseded`; when one concern is reframed into several precise concerns, the original resolves with `resolution_kind = split` and retained lineage refs rather than being overwritten.
- Concern updates append new `/evidence` and can raise `/attention`; two duplicate concerns merge into one retained id and `/redirect` the `merged-away` ids, while an older framing replaced by a `/newer` concern is `resolved` with `resolution_kind = superseded`.
- Object-specific context menus show only operational actions valid for the current object state and use canonical labels from runtime semantics; mutation actions never appear because a generic shell menu has a matching verb.
- Structural concern actions such as `merge`, `split`, and `supersede` use guided flows instead of one-click menus because they change `/history/ledger` interpretation and lineage, not only presentation state.
### Projection trust and action gating

Projection-backed surfaces display `projection_freshness` and `projection_health` as the runtime trust grammar. Preview/browser `/UI` keeps `trust_tier` under `/browser`; runtime `/degraded` copy never reuses `trust_tier` as degraded trust. Artifact provenance `/trust` disclosure derives from persisted receipts and canonical refs, so reports remain inspectable after the live worktree or provider session is gone. `projection-backed` panels expose `trust state` and `last updated` as first-class UI fields.

Shared attention labels include `Waiting on user approval`, `Seam integration blocked`, `Graph patch required`, `Recovery in progress`, `Provider/account pressure`, and `Projection trust degraded`; each label carries owner route, projection state, and `/account` or provider context when relevant instead of acting as free-text status.

Projection-backed surfaces use `freshness_state` values `current`, `refreshing`, `stale`, `degraded`, and `unavailable`; `/current` projections may allow normal read/write interaction, while `stale` or `/degraded` surfaces narrow mutation-bearing actions, disable them, or require direct canonical/current revalidation before execution.

Visible projection trust grammar includes `last_updated_at`, `data_source_kind`, `degraded_reason`, and `action_gate_reason` so operators can see whether a blocked or disabled action comes from freshness, source quality, or an authoritative runtime gate.


### Progress-only widget hostability
- `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) six-tab `Tiers` carry-through is stale: widget-based tabs `1, 2, 4, 5, 6`, `widget.tier_tree`, `widget.current_task`, `widget.progress_bars`, `tier_id`, `request_id`, `requested_persona_id`, `effective_persona_id`, `provider`, `model`, and `PuppetMasterEvent` / `PuppetMasterEvent::TierChanged` / `PuppetMasterEvent::UserInteractionRequired` / `TierChanged` / `UserInteractionRequired` inputs are compatibility signals, while new live-state UI uses native Orchestrator surfaces and explicit `HITL` runtime objects.
- `Plans/Widget_System.md` (`/Widget_System.md`) tier-centric `Orch/Tiers` and `/Tiers` entries, `widget.agent_terminal`, `widget.completed_prose`, `widget.tier_tree`, older `TierChanged` / `IterationStart` pushes, and `/task/subtask`-oriented `widget.current_task` remain compatibility vocabulary; only `Progress` is widget-hosted in the current Orchestrator model.
- Legacy `GUI` inventory entries such as `/current-task`, `7.7 Tiers`, tier-oriented Settings, `Orchestrator tabs`, `wizard_attention_required`, `resume_url`, and phase-task-subtask progress bars stay searchable compatibility copy, but primary navigation moves to native graph/package/lane/seam surfaces rather than treating `Tiers` as canonical.
- Legacy Progress widget catalog fields such as `widget.current_task`, `widget.progress_bars`, `widget.cta_stack`, `widget.agent_terminal`, and `widget.completed_prose` plus `PuppetMasterEvent`, `PuppetMasterEvent::UserInteractionRequired`, `UserInteractionRequired`, `tier_id`, `/tasks`, `/task/subtask`, and `/objective/elapsed` are compatibility inputs only; native Orchestrator views own live progress display.
- `Plans/Widget_System.md` / `/Widget_System.md` migrates `dashboard_layout:v1` to `widget_layout:v1:dashboard`; `widget_layout` is the active layout family while `dashboard_layout` and `dashboard_layout:v1` remain backup/migration names.
- `Widget_System` / `Widget_System.md` keeps `/Tiers`, `Orch/Tiers`, `Orch/Evidence`, `Orch/History`, `Orch/Ledger`, `/Evidence`, `/History`, and `/Ledger` as legacy widget-composed catalog aliases only; only `Progress` remains widget-composed in native Orchestrator.
- Widget persistence scope is explicit: `dashboard` layout may stay app-global, `orchestrator:progress` is project-scoped or app-default plus project override, and `usage` declares app-wide versus project-scoped mode rather than silently reusing one layout.
- `Orchestrator_Page` / `Orchestrator_Page.md` Progress widgets that still center active-tier or tier-targeted terminal semantics are legacy inputs; `widget.agent_terminal`, `widget.completed_prose`, `widget.current_task`, `widget.progress_bars`, `/task/subtask`, and `/objective/platform/model` resolve through native Progress and runtime views.
- The widget layout migration has one explicit persistence-rule: active layout state writes through `widget_layout`, while retired layout keys are read-only migration backups.
- FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling.
### Shared escalation ladder

Blocked-notice consumers keep `## Unified Thread Blocked-State Lifecycle`, `### Multi-episode display`, and `### 7.3 Shared route and open behavior` as owner-anchor / owner-heading carry-through, but `gap-002`, `exact_items`, `stale-survivor`, and `GUI` cleanup must expose `blocked_sequence`, `approval_scope_key`, `report_ref`, `startup_recovered`, `action_available`, and `escalation_level` instead of leaving those fields in a skeletal blocked-notice flow.

`Plans/Run_Graph_View.md` (`/Run_Graph_View.md`) `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` actions use `blocked_sequence` and ordered `allowed_action_ids[]`; legacy `hitl_request_id` is compatibility display metadata, not a second `HITL` approval identity.

`Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`) graph HITL command examples with `{ request_id, node_id, rationale }` and `{ request_id, node_id, rationale, resolution? }` map to the same runtime approval identity; `request_id` and `node_id` are routing/lineage args, not a replacement for `blocked_sequence`.


### Action-surface policy
- Bulk live actions such as `/remove`, `/recovery`, archive/prune, or worktree cleanup choose `light`, `strong`, or `hard_gate` confirmation based on blocked/recovery lineage and target preview; destructive `remove` defaults to `strong`, and blocked-lineage recovery can escalate to `hard_gate`.
- A `hard_gate` confirmation must show runtime-defined allowed actions, why the gate exists, the exact consequence of each allowed action, and no hidden alternative path.
- Runtime mutation and `/recovery` surfaces require `/schema/gate` preconditions for `allowed_action_ids`, `allowed_action_ids[]`, freshness `/trust`, account capability, and `/runtime` capability before the GUI exposes mutation controls.
- Bulk actions default to navigation, triage, and low-risk state updates; live execution mutations stay narrow unless the runtime exposes an explicit safe batch semantic for that exact action.
- Stale visibility is not action authority: when projection trust drops, `/recovery` controls and `allowed_action_ids[]` may become invalid, and destructive or topology-changing actions require stronger gating rather than ordinary undo.
- `Plans/Tools.md` (`/Tools.md`) DAE tool-event reconstruction requires richer event payloads and reconciled outcome taxonomy before GUI surfaces can replay DAE tool-event history as authoritative runtime state.
### Glossary and help governance
- The canonical term system owns stable object `/state/action` names from docs and `/runtime/contracts`; the help entry system owns explainer pages or `/cards`; the contextual help system owns inline tooltips, badges, hover copy, and small "what is this?" affordances.
### Notification routing policy

Notification and attention copy use the shared state/action label set: `alert-level`, `event-family`, backbone event, `/action`, and condition-aging taxonomy terms are routed through `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`), and `Plans/Glossary.md` (`/Glossary.md`) rather than ad hoc local labels.

Alert-state semantics remain explicit across Dashboard and attention-surface copy for `attention_required` and `blocked` states: `resolved` means the underlying condition changed; `dismissed` or `/acknowledged` only hides or confirms presentation while the condition may still exist, and active blockers must never appear unblocked through dismissal alone.

Local attention surfaces normalize through the shared notification model: Dashboard `Action Required`, thread badges, run-graph `/node` badges, warnings `/toasts/banners`, tray `/system` notifications, rate-limit banners, and blocked versus attention-required copy all preserve severity, source, and owner route instead of inventing local alert state.

Tab badges stay sparse and purposeful: the `Progress` badge represents meaningful `/action-required` count, while other tabs prefer targeted counts or simple dot-badges rather than noisy unread-like counters.


### Canonical route payload

Route payloads may target `source_control`, `github_actions`, `docker_manager`, or `document_pane`; panel-local subviews and `/selectors` refine the landing inside that destination, and remembered state supplies defaults only when the route does not override them.

Object-first deep-link recipes normalize `/message`, scheduler `/blocking/safe-point/remediation/attempt`, and `/package/lane/worktree/concern/promotion/graph` lineage through one route shape; `Plans/assistant-chat-design.md`, `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/WorktreeGitImprovement.md` consume the same object-first routing instead of inventing an SCM-local navigation identity.

`Contracts_V0` / `Contracts_V0.md` owns the canonical route payload and target model, including the `object_kind` enum; `Glossary.md` carries the user-facing `object_kind` vocabulary so help and downstream copy do not drift.


### Project summary projection


### Project attention projection

`project_summary` is a current-state projection overwritten by projector updates, while `project_attention_item` rows keep active versus resolved `/dismissed/quieted` semantics; when a source record owns durable history, the attention row may remain projection-level but preserves a stable `source_object_ref`.

`Contracts_V0` / `Contracts_V0.md` and `storage-plan` / `storage-plan.md` contradictions are resolved by shared families for `remediation.resolved`, concrete-account display, `/actor` dimensions in effective `/runtime` records, route-payload schema, and project-summary / project-attention projections rather than GUI-local inventions.


### Requested concrete-account fields

Provider dispatch surfaces show a concrete-account request separately from policy: `Prompt_Pipeline.md`, `CLI_Bridged_Providers.md`, `Models_System.md`, and `Prompt_Pipeline`/`Models_System` references must surface `ProviderRequestEnvelope`, `account_switch_reason`, `/account`, `execution-role`, `/model/variant`, role-scoped pool selection, and requested concrete-account intent.

`Plans/Multi-Account.md` / `/Multi-Account.md` binds operational identity and role-scoped pools into the shared runtime grammar, while `Plans/assistant-chat-design.md` / `/assistant-chat-design.md` surfaces thread-level `/account/role` switching and `/trust` disclosure without minting chat-local account truth.

Operational identities may display provider/account identity and `/account` source metadata, but the GUI must not imply shared token ownership across accounts, providers, or execution roles.

Requested-account event-schema precision is a visible GUI contract: identity projections expose account fields, requested concrete-account truth, role `/actor` identity, operational identity, switch-history, and trust-state anywhere a user-facing GUI surface claims to show runtime truth.

`Plans/Prompt_Pipeline.md` / `/Prompt_Pipeline.md` locks requested `/effective` identity semantics, including concrete-account intent, while tier-era override ownership is compatibility vocabulary only.


### Execution role and operational identity

Operational identity is distinct from provider-account identity: `Multi-Account.md`, `/registry/Kubernetes`, `/runtime/storage`, and side-effect surfaces expose operational-identity blocks beside provider-account displays rather than collapsing GitHub, registry, or Kubernetes actors into one provider credential.

Orchestrator worker identity rows from `Orchestrator_Page` / `Orchestrator_Page.md` that list `requested_persona_id`, `effective_persona_id`, provider, model, `attempt_id`, or `session_id` must also expose `execution_role` and operational target context before the GUI treats them as complete runtime identity.

`Plans/GitHub_Integration.md` (`/GitHub_Integration.md`) `Worktrees` copy must present lane-backed operational identity instead of centering raw worktree rows when the Source Control surface is showing branch, lane, package, or worktree state.


### Projection freshness vs projection health


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Dismissed vs resolved rationale enforcement
### Blocked-owner eight-kind taxonomy and escalation ladder surfaces


### Recommended minimum concern record shape


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Authoritative specification for AI agent implementation
**Tech Stack:** Rust + Slint 1.15.1 (.slint markup compiled via slint_build)
**Renderer:** Default winit + Skia; fallback winit + FemtoVG-wgpu; emergency software renderer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack and Renderer](#2-tech-stack-and-renderer)
3. [Master Layout](#3-master-layout)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Panel System](#5-panel-system)
6. [Theme System](#6-theme-system)
7. [Views Specification](#7-views-specification)
8. [Widget Catalog](#8-widget-catalog)
9. [State Management](#9-state-management)
10. [UX Patterns](#10-ux-patterns)
11. [Anti-Flickering and Scroll Preservation](#11-anti-flickering-and-scroll-preservation)
12. [Responsive Design](#12-responsive-design)
13. [Accessibility](#13-accessibility)
14. [Slint File Organization](#14-slint-file-organization)
15. [Persistence](#15-persistence)
16. [Migration Mapping](#16-migration-mapping)
17. [Risks and Mitigations](#17-risks-and-mitigations)
18. [Promoted Features](#18-promoted-features-formerly-future-considerations)
19. [Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls](#19-persona-editor-compatibility-disclosure-and-surface-level-persona-controls-2026-03-06)
20. [Appendix A: Cross-References](#appendix-a-cross-references)
21. [Appendix B: Locked Decisions Summary](#appendix-b-locked-decisions-summary)

---

## 1. Executive Summary

This document is the authoritative GUI specification for the Puppet Master desktop application, replacing the current Iced-based GUI with a Slint 1.15.1 implementation. The design follows an IDE-shell layout (Activity Bar + Primary Content + Side Panel + Bottom Panel) with three user-facing theme families (Retro Dark, Retro Light, Basic Modern) backed by deterministic built-in palette variants plus user-created custom themes, detachable panels, and a rearrangeable dashboard.

The current GUI uses a two-row header with 16 flat navigation buttons above a single full-width content area. This wastes screen real estate and forces constant page-switching. The new layout follows a three-column IDE shell inspired by VS Code / JetBrains, dressed in the existing retro-futuristic aesthetic.

Key changes from the current Iced GUI:
- **Layout:** Single-page-at-a-time replaced with persistent IDE shell (Activity Bar, Primary Content, Side Panel, Bottom Panel)
- **Navigation:** 16 flat buttons replaced with 5-group Activity Bar + Command Palette
- **Settings restructure:** Old `Settings` becomes `App Settings`; old `Config` becomes `Settings`; Login and Doctor merge into unified Settings
- **New views:** Usage page, File Manager panel, editor surface, Chat panel, Agent Activity pane, Artifacts, Source Control, GitHub Actions, Docker Manager, and Run & Debug side-panel surfaces
- **Bottom runtime zone:** Terminal, Problems, Output, Ports, and the classical **Debugger** / **DAP Debugger** live here; normal browsing and HTML preview remain editor-tab or detached-window browser surfaces rather than bottom-panel tabs
- Coarse surface vocabulary treats primary-content pages `/views`, side-panel destinations, bottom-panel surfaces, and Orchestrator tabs as shell categories, not interchangeable route identities.
- **Themes:** Three theme families with full extensibility and deterministic built-in variants
- **Real-time:** Event-driven updates via Rust channels and `invoke_from_event_loop`, not polling
- **Panels:** Chat and File Manager are detachable; shell state remains identity-safe when re-docked
- **Project bar:** Instant project switching from title bar with full state preservation and reload
- **Language detection:** Auto-detect project languages, display badges, and suggest LSP/tool presets
- **Sound effects:** Optional audio feedback for key events via `rodio`
- **Catalog and sync:** Community content catalog with install/update/remove flows and config export/import bundles
- **SSH remote editing:** Edit files on remote hosts via SSH/SFTP with connection management and offline resilience
- **Debug workflows:** Assistant Debug Mode is a first-class chat workflow overlay; the classical DAP surface remains a separate debugger surface
- **Product name:** `Puppet Master`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md

## 2. Tech Stack and Renderer


### 2.1 Core Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Language | Rust | All logic, state management, and Slint bridge code |
| UI Framework | Slint 1.15.1 | `.slint` markup files compiled via `slint_build` in `build.rs` |
| Default Renderer | winit + Skia | Best quality and performance |
| Fallback Renderer | winit + FemtoVG-wgpu | When Skia is unavailable |
| Emergency Renderer | Software renderer | Headless/CI environments |
| Persistence (layout) | redb | Durable KV store for layout state, preferences, editor state |
| Persistence (events) | seglog | Canonical event ledger for usage, chat, orchestrator events |
| Search | Tantivy | Full-text search index over seglog projections |

### 2.2 What Is NOT Used

No React, JavaScript, TypeScript, HTML, or CSS. The entire GUI is Rust + Slint `.slint` markup.

### 2.3 Build Integration

```rust
// build.rs
fn main() {
    let config = slint_build::CompilerConfiguration::new()
        .with_style("cosmic".into());
    slint_build::compile_with_config("ui/app.slint", config).unwrap();
}
```

The `cosmic` base style is used because it supports `ColorScheme` toggling and has a neutral appearance that does not conflict with custom theming. All visual differences are driven by a `Theme` global in `.slint` rather than the base style.

### 2.4 Backend Selection

Provider CLI backend eligibility is separate from Slint renderer selection: Cursor CLI must be re-evaluated as an ACP-capable first-class CLI backend, not only a stream-json bridge, before GUI diagnostics classify it as a legacy stream transport.


Backend is chosen at startup; all windows use the same backend. Selection uses `slint::BackendSelector::new().select()` with `SLINT_BACKEND` environment variable override. Cargo features control which renderers are compiled in (e.g., `default = ["renderer-skia"]`, optional `renderer-femtovg`).

Deterministic selection order:
1. Explicit valid `SLINT_BACKEND` override wins.
2. Otherwise use the persisted app preference if it maps to a compiled-in backend.
3. Otherwise use compiled default order: `winit + Skia` → `winit + FemtoVG-wgpu` → emergency software renderer.

Failure handling:
- An invalid override or unavailable preferred backend MUST emit a startup diagnostic and fall through deterministically to the next compiled-in backend.
- The selected backend MUST be shown in diagnostics/setup surfaces so fallback behavior is inspectable.

```rust
// main.rs entry point
fn main() -> Result<(), Box<dyn std::error::Error>> {
    slint::BackendSelector::new().select()?;
    let ui = AppWindow::new()?;
    // ... state init, bridge wiring, effects generation
    ui.run()?;
    Ok(())
}
```

---

## 3. Master Layout

### 3.1 IDE Shell Structure


```
+-----------------------------------------------------------------+
|  TITLE BAR: Puppet Master  [project v] [theme] [gear]           |  28px
+------+------------------------------------------+---------------+
|      |                                          |               |
| ACT  |   PRIMARY CONTENT AREA                   | SIDE PANEL    |
| BAR  |   (active page view)                     | Activity-bar  |
|      |                                          | surface slot  |
| 48px |                                          | 240-480px     |
|      |                                          |               |
|      +------------------------------------------+               |
|      |  BOTTOM PANEL (collapsible)              |               |
|      |  Terminal / Problems / Output             |               |
|      |  120-300px                                |               |
+------+------------------------------------------+---------------+
|  STATUS BAR: [mode] [platform v] [model v] [ctx: 42k/128k]     |  24px
+-----------------------------------------------------------------+
```

### 3.2 Structural Zones

| Zone | Slint Container | Size | Behavior |
|------|----------------|------|----------|
| **Title bar** | `HorizontalLayout` | height: 28px fixed | App name (Orbitron Bold 14px), compact current-project context, theme toggle, settings gear |
| **Activity bar** | `VerticalLayout` | width: 48px fixed | Icon-only vertical nav; always visible |
| **Primary content** | `VerticalLayout` (flex: 1) | fills remaining space | Active page view; scrollable internally per page |
| **Side panel** | `VerticalLayout` | width: 240-480px, resizable | Hosts the currently selected activity-bar side-panel surface; one visible at a time; detachable where supported |
| **Bottom panel** | `VerticalLayout` | height: 120-300px, collapsible | Terminal, Problems, Output tabs |
| **Status bar** | `HorizontalLayout` | height: 24px fixed | Chat mode, platform/model dropdowns, context usage, orchestrator status, and regex-index progress / refresh disclosure |

`FinalGUISpec.md §3.1` is the shell confirmation for right-hand side-panel occupants: the side panel is the Activity Bar surface slot with a 240-480px width budget. Legacy labels such as `/File`, `/Source`, `/GitHub`, and `/etc` are migration labels for occupants or groups, not separate page surfaces that bypass the right-hand side-panel model.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

**Status bar - Indexing indicator:**

When a sparse n-gram index build or refresh is in progress for any active project, the status bar shows an index-state indicator.
- Show only for work lasting >2 seconds so sub-second incremental updates do not flash.
- First build for a project: display `Building search index - first build may take several minutes` with progress percentage when available.
- Later rebuilds: display `Indexing` or `Refreshing index` with project-sensitive progress.
- If a stale-but-valid snapshot is still serving grep or Search, the indicator may show refresh progress, but the UI must not imply that Search is fully unindexed.
- The indicator disappears on completion or cancellation.
- The Search results pane, not the status bar, owns the subtle `(unindexed)` annotation when a query truly fell back to raw ripgrep.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

### 3.3 System Tray

When "minimize to tray" is enabled in Settings/General:
- **Close button** minimizes to tray instead of quitting (Quit via tray menu or File > Quit)
- **Tray icon:** Puppet Master icon; changes to accent color when orchestrator is running
- **Left-click tray icon:** Restore/focus the main window
- **Right-click tray menu:** Show/Hide | Pause/Resume Orchestrator | Quit
- **Tray notifications:** HITL approval required, run complete, rate limit hit (respects system notification settings)

### 3.4 Project Bar (Title Bar)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

The title bar no longer owns primary project switching.

Canonical shell rule:
- project switching is a workspace-tab operation surfaced through the Projects view, project/session browser, command palette, and dedicated switch commands
- the active workspace tab changes project by default
- a separate command opens the target project in a new workspace tab
- the title bar may show compact current-project context, but it is not a project bar and does not own the multi-project shell model

Required visible behavior:
- current project name/path summary for the active workspace tab
- badge when the active project has background activity, blocked items, or unsaved shell state that needs attention
- keyboard entrypoint for instant project switch
- responsive collapse without losing the command-palette project switch path

Non-canonical after this section:
- title-bar dropdown/strip as the primary project-switch shell
- shell semantics that assume only one active project context exists in the application at a time
### 3.5 Spacing and Density

**Global spacing tokens** (base design tokens; independent of UI scaling):

| Token | Base (px) | Use |
|-------|-----------|-----|
| `XS` | 2 | Between icon and label in the same control |
| `SM` | 4 | Between controls in the same toolbar row |
| `MD` | 8 | Panel internal padding; gap between stacked cards |
| `LG` | 12 | Section separator within a page |
| `XL` | 16 | Gap between major layout zones (panel to panel) |

**Border widths:**
- Primary panel borders: 2px (reduced from current 3px for density)
- Active/selected indicator: 3px left-edge accent stripe
- Dividers within panels: 1px

**Hard shadow:** Offset `(2, 2)` on major containers; `(4, 4)` on floating/detached windows. No blur (retro aesthetic).

**Density metric:** At 1920x1080, the primary content area is at minimum 900px wide when both side panel and bottom panel are open. At 1280x720, the side panel auto-collapses to an icon tab, and the bottom panel collapses to its header row.

### 3.6 Space Accounting (1920x1080 reference)

```
Title bar:      28px
Status bar:     24px
Activity bar:   48px wide
Side panel:     380px wide (default)
Bottom panel:   160px tall (default)
Primary content: 1920 - 48 - 380 = 1492px wide
                 1080 - 28 - 24 - 160 = 868px tall
```

At 1280x720 with collapsed panels:
```
Side panel:     48px (icon tab)
Bottom panel:   24px (header only)
Primary content: 1280 - 48 - 48 = 1184px wide
                  720 - 28 - 24 - 24 = 644px tall
```

---

## 4. Navigation Architecture


### 4.1 Activity Bar

The activity bar is the canonical entry point for persistent right-hand side-panel operational surfaces.

Required side-panel items for this feature set:
- `search`
- `chat`
- `files`
- `source_control`
- `github_actions`
- `docker_manager`
- `artifacts`
- `run_debug`

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

Required shell rules:
- Search, File Manager, Source Control, GitHub Actions, Docker Manager, Artifacts, Chat, and Run & Debug occupy the single right-hand side-panel slot defined by the shell.
- None of those surfaces are described as canonical primary-content pages unless the statement is explicitly about a routed detail page launched from the surface.
- Activity-bar labels, tooltips, shortcuts, and command IDs MUST use the same surface vocabulary across shell chrome, command palette, and wiring tables.
- Detachable side-panel surfaces return to the same right-hand slot when re-docked.
- The bottom runtime zone remains terminal/output/problems/debug/ports territory; normal browsing and HTML preview remain editor/workspace-tab hosted.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

Canonical side-panel descriptions:

| Panel ID | Canonical label | Purpose |
|---|---|---|
| `search` | Search | Project-wide find-in-files and replace-in-files with persistent query/result state |
| `files` | File Manager | Project tree, local tree filter, file actions, and editor handoff |
| `source_control` | Source Control | Git-first repo state, changes, history, graph, branches/stash, and worktrees |
| `github_actions` | GitHub Actions | GitHub-hosted workflows, runs, logs, dispatch, and admin settings |
| `docker_manager` | Docker Manager | Containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes |
| `artifacts` | Artifacts | Runtime/browser/build artifacts and cross-surface evidence navigation |
| `chat` | Assistant Chat | Threaded assistant workflows, context management, and activity transparency |
| `run_debug` | Run & Debug | Runtime diagnostics, problems, debug, output, and ports entry surface |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

#### GitHub Actions side-panel owner

GitHub Actions is the `github_actions` side-panel owner for shell entry, label, command-palette surface ID, detachable side-panel state, and route-open behavior for `Current Branch`, `Workflows`, and `Settings`. This shell-surface owner-boundary stops at the hosted workflow/admin contract: `Plans/GitHub_Integration.md` owns those semantics, while FinalGUISpec keeps shell summaries, disabled-state copy, cross-surface CTAs, and panel restore behavior aligned with that owner.

#### Run & Debug side-panel owner

Run & Debug is the `run_debug` side-panel owner for runtime diagnostics entry, Problems, Output, Debug Console, and Ports reveal/focus behavior. This shell-surface owner-boundary does not create duplicate runtime records; its actions reveal or focus the canonical bottom runtime zone panes while preserving linked dev-session identity, historical/live badges, and recovery outcome context.

#### Search side-panel owner

Search is a one-visible-at-a-time search-surface side-panel occupant under `FinalGUISpec.md §4.1` with explicit `/open-focus` behavior, not a hand-waved overlay or `/gap`. It owns `/user-search` and `/content-search` UI for project code-search and file-content-search results, grep-result and grep-style rows, minimum match options for case, `/word/regex`, optional path/file scope, virtualized result rows, and replace-in-files when MVP replace remains enabled. `FinalGUISpec.md §15.3` and the Search panel use shared `/routing`, `/evidence/ledger`, and file-opening rules so content-search rows open through the same `OpenFile` path/range highlight flow as chat, File Manager, and LSP opens.

Search is also the `search-owner` for the full indexing control surface: enable/disable index, rebuild/re-anchor, large-file threshold default 10 MB, generated-file index-exclusion patterns, follow-symlinks toggle, and visible indexed/stale/unindexed/fallback state. If the user turns OFF indexing while a build is in progress, PM cancels the builder with `CancellationToken`, removes partial generation state, and on `re-enable` starts a fresh build. Settings may persist global defaults, but Search exposes the project-scoped same-freshness and `/freshness/degradation` control and status copy users need before interpreting results.

Remote search freshness copy cross-references `Plans/GitHub_Integration.md` (`/GitHub_Integration.md`) for the SSH file-watcher channel; the regex-index dirty layer and Tantivy code index subscribe to the same notification channel, so the GUI must not imply duplicate watcher setup.

`Tantivy` provides full-text indexing, but Orchestrator search cannot rely on full-text alone: search rows that target Orchestrator-owned content also expose object/record identity and a `/record` route target so result opening, inspectors, and audit views land on the canonical runtime object rather than only on a text match.

Search-seam ownership is already-specified rather than a new universal bucket: `FinalGUISpec.md §4.2` owns command-palette `fuzzy-search` across pages, commands, `/commands/files/recent`, recent items, files, symbols, runs, artifacts, and chat threads; `FileManager.md §1` owns local structural tree search and type-ahead; `assistant-chat-design.md §10` owns `Chat History Search`, `chatsearch`, `codesearch`, `logsearch`, and agent-callable project-only retrieval; `Tools.md` owns the project-scoped codesearch backend for file-content; `LSPSupport.md` owns `Go to symbol`, `Find references`, the `References panel`, symbol-aware mention support, and `/code-intelligence`; Search owns content-search, find-in-files, replace-in-files, and grep-style results.

GUI search ownership has explicit Activity Bar, side-panel, command-family, and detachable-panel IDs. `search_panel_state` and `cmd.search.*` result IDs may carry recent-file, `/modified`, or symbol-aware metadata, but those are routing facts for the canonical-doc search owner rather than an under-specified second File Manager or LSP search surface.

The GUI concept artifact `Concepts/PuppetMasterDashComp.html` (`/PuppetMasterDashComp.html`) is historical design evidence for the side-panel model, not a live owner path. Its labels `GITHUB ACTIONS`, `DOCKER MANAGE`, and `SOURCE CONTROL` map to the canonical GitHub Actions, Docker Manager, and Source Control panels. `DOCKER MANAGE` / `Docker Manage` copy migrates to Docker Manager. A separate `UNRAID` panel/icon is retired by the concept-vs-plan reconciliation: Unraid behavior lives in Docker Manager > `Publish / Unraid`, preserving the accepted direction without adding another activity-bar slot.

Panel-ownership is resolved before any plan-doc rewrite, shortcut map, or command-palette migration changes shell navigation. The activity bar MUST NOT expose a `Git` icon that opens `GITHUB ACTIONS`: `GITHUB ACTIONS` belongs to panel ID `github_actions`, and `SOURCE CONTROL` / `CONTROL` belongs to panel ID `source_control`. Older combined Git/GitHub or `Git (GitHub)` docs are migration evidence only. `cmd.panel.switch` and any `/shortcut` aliases use canonical side-panel IDs (`source_control`, `github_actions`, `docker_manager`) and preserve the separation between local SCM and hosted workflow administration. `unraid` does not survive as a first-class panel ID or first-class shell shortcut; any compatibility alias opens `docker_manager` with `Publish / Unraid` focused.

Account-switch propagation is visible at the shell boundary. When the effective account changes, Source Control, GitHub Actions, Docker Manager, Kubernetes, receipts, and blocked-state projections hard-refresh or clear stale selections; Orchestrator CTAs are reclassified against the new requested/effective authority; background observation continues read-only or is marked interrupted until revalidation finishes. Export/share copy follows account-identity redaction separate from token secrecy: account handles, namespace ownership, kube user/context names, and SSH usernames/host aliases are masked by default unless the export profile explicitly permits disclosure.

Help/copy inventory is authored by namespace instead of improvised in each surface. `source_control`, `github_actions`, `docker_manager`, `kubernetes`, `receipts`, `blocked_state`, and `requested_effective` each provide empty states, disabled-state explainers, first-use disclosure copy, expert variants, and eli5 variants. Worktree-native SCM first-use teaching triggers on the first worktree-backed run, conflict, orphan recovery, or compare-review open, and the persistent "what worktrees mean here" entry is reachable from Source Control and Orchestrator.

`Critical workflow pinning / health badges` appears as a GitHub Actions affordance, with dashboard and Orchestrator mirrors only linking back to the owner surface. `GitHub Actions > Workflows` owns pin and unpin, including `cmd.github.actions.pin`, `cmd.github.actions.unpin`, pinned-workflow state, the persisted pinned workflow list, `/build/deploy` and `/deploy` badge mapping, noisy-workflow suppression, `/event/storage` provenance, stale-pin warnings, and the over-pinning tradeoff.

#### Cross-Surface Scaling, Discoverability, And Panel State

Graph-heavy and stream-heavy surfaces have a `/table` or list equivalent with full keyboard and `/screen-reader` parity; `/graph` views are never the only path to the same information. Source Control History and Graph on monorepos, `/Graph/Worktrees`, GitHub Actions run lists and `/job/step` logs, Docker asset explorers with many `/containers/tags`, Kubernetes workload `/log/watch` views, and receipt/history panes define `initial_window`, `page_size`, `max_live_rows`, `max_in_memory_rows`, load-older behavior, `/filter-first` rules, and pause plus `/follow/search/jump-to-latest` behavior for streams/logs.

Deep and advanced subviews stay discoverable through persistent visible subview affordances, Command Palette coverage, and explicit Customize or `/Show` Advanced actions. This applies to Source Control History/Graph/Worktrees, Actions Current Branch/`/Workflows/Settings`, Docker Manager `Networks`/`Volumes`/`Contexts`/`Kubernetes` (`/Volumes/Contexts/Kubernetes`), and receipt-driven deep links from Orchestrator. Progressive disclosure defaults record `default-open`, `default-collapsed`, pinned sections, remembered expansion state, and simplified summary mode versus full detail mode so `/scaling` does not erase user orientation.

Panel-specific UX state must not be `co-mingled` with global policy settings. Settings > Branching / Health owns global Git/worktree policy, recovery, and correctness controls; Settings > Advanced owns GitHub Actions generation/template controls and Docker/registry defaults. Per-panel expansion, filter, selected row, `/worktree`, `/template`, `/registry`, and restore state are panel-specific records with their own storage contract and restore behavior.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Orchestrator_Page.md

### 4.2 Command Palette

`Ctrl+K` (primary) or `Ctrl+P` (alternative) opens a centered overlay (~500-600px wide, top third of window) with fuzzy search across project navigation targets, commands, recent items, and explicit open targets.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Prefix modes:
- no prefix: pages, commands, recent items, files, and explicit open targets
- `>`: commands only
- `@`: file and symbol mention flow for chat/context entry
- `/`: reserved slash commands

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/LSPSupport.md

Boundary rules:
- The command palette is a transient project-scoped navigation/command surface, not the owner of persistent find-in-files results.
- The Search side panel owns persistent project text search, replace-in-files, scope filters, and query-session result state.
- The command palette may launch or focus Search through `cmd.search.show`, but it does not keep the persistent result list after dismissal.
- File Manager search remains a local tree filter/type-ahead only.
- LSP symbol, reference, and diagnostic surfaces retain semantic ownership even when the command palette hosts a launcher or quick-open affordance.
- The broad `universal-search` surface is `Ctrl+K` / command-palette search over settings, pages, commands, files, symbols, recent items, runs, artifacts, and chat threads; `Open setting: {name}` remains settings deep-link copy. Dedicated editor `/code-intelligence` keeps `Ctrl+Shift+O`, symbol/ref navigation, and `/repair` flows separate; Assistant Chat owns `Chat History Search`, `chatsearch`, `codesearch`, and `logsearch` rather than turning the Search side panel into a chat-domain index.
- The command palette quick-open file search (`Ctrl+K` / `Ctrl+P`) searches across the full project navigation targets, not scoped to the active worktree. This is distinct from File Manager search, which follows the current file manager root, and from chat `@file` resolution, which resolves relative to the thread's `working_directory` when a worktree is bound.
- Auto-retrieval (Tantivy search, `@file` resolution) remains project-scoped, not worktree-scoped; GUI search surfaces may expose the results, but they must not imply that the retrieval corpus was narrowed to only the active worktree.
- The Search command-family is canonical at the GUI shell boundary: `cmd.search.show { project_id, focus?: "query"|"results"|"replace", workspace_tab_id? }`; `cmd.search.find_in_files { project_id, query, include_globs?, exclude_globs?, regex?, case_sensitive?, whole_word? }`; `cmd.search.replace_in_files` as the `- canonical replace-in-files action -`; `cmd.search.open_result` with `result_ref` that `- opens the file/location through the canonical open-file contract -`; plus `cmd.search.next_result`, `cmd.search.prev_result`, `cmd.search.toggle_regex`, `cmd.search.toggle_case_sensitive`, `cmd.search.toggle_whole_word`, `cmd.search.clear_scope`, `cmd.search.expand_all`, `cmd.search.collapse_all`, `cmd.search.replace_one`, and `cmd.search.replace_all`.
- Search-domain GUI taxonomy stays explicit: Command Palette owns project-scoped broad-search / universal navigation, including recent-file and quick-open targeting for `/commands/files`; Search side panel owns find-in-files, replace-in-files, regex/case/whole-word (`/case/whole-word`) toggles, include/exclude scope, persistent result trees, and replace preview/confirmation; File Manager search stays local type-ahead; LSP search owns semantic symbols/refs; Chat-domain search owns `/history/message` retrieval. These are all shell-wide discoverable surfaces, but they are not one vague search box.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md

### 4.3 Breadcrumb

At the top of the primary content area, a breadcrumb strip (20px) shows `Group > Page` (e.g., `Data > Ledger`). Breadcrumb items are clickable for quick navigation within the group.

### 4.4 Keyboard Shortcuts

Search, File Manager, Source Control, Chat, Artifacts, and runtime-surface shortcuts MUST be registered in the shortcut registry and appear in Settings > Shortcuts. Activity-bar icon clicks remain primary; shortcuts are additive and must stay consistent with `cmd.search.*`, `cmd.file.*`, `cmd.chat.*`, `cmd.source_control.*`, and shell layout rules.

Orchestrator shortcut candidates include focus global Orchestrator search, next `/previous` tab, open `/close` right-side inspector, jump between current attention items, fit graph, focus selected node, and toggle generation overlay; each maps through command-catalog bindings before it becomes a default shortcut.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md

**Tier 1 -- Essential (learn day one):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+L` | Focus chat input |
| `Ctrl+N` | New chat thread |
| `Ctrl+Shift+E` | Toggle File Manager |
| `Ctrl+Shift+F` | Show Search with query focus |
| `Escape` | Close palette / panel / stop agent |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

**Tier 2 -- Productive (learn in first week):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` through `Ctrl+8` | Jump to activity-bar item 1-8 in current order |
| `Ctrl+Enter` | Send message (in chat) |
| `Tab` | Queue message (in chat, steer mode) |
| `Ctrl+Shift+,` | Open settings |
| `Ctrl+\` | Toggle current side-panel occupant |
| `Ctrl+Shift+H` | Show Search with replace focus |
| `Ctrl+Shift+\`` | Toggle bottom runtime panel |
| `Ctrl+W` | Close current tab/panel |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

**Tier 3 -- Power user (discoverable via palette):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle Dashboard |
| `Ctrl+Shift+\` | Detach/re-dock active detachable side-panel or terminal section |
| `Alt+Up/Down` | Cycle through chat threads |
| `Ctrl+Shift+C` | Compact current session |
| `Ctrl+Shift+P` | Open project switcher |
| `F5` | Start/Continue debug |
| `F10` | Step Over (debug) |
| `F11` | Step Into (debug) |
| `Shift+F11` | Step Out (debug) |
| `Shift+F5` | Stop debug |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

Shortcut registry rule: A Rust-side registry maps (modifiers + key) to commands or route/open actions. Platform-specific modifier normalization (Cmd on macOS, Ctrl on Windows/Linux) remains mandatory, and the Keyboard Shortcuts help view is auto-generated from the registry.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

## 5. Panel System

### 5.1 Detachable Panels
The shell supports detachable panels, but detachment never changes canonical surface identity.

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Required detachable surfaces:
- Search panel
- Chat panel
- File Manager panel
- bottom terminal workspace
- editor-embedded terminal panels when they are promoted out of the editor stack

Rules:
- re-docking restores the same logical surface identity rather than minting a new panel type.
- the bottom terminal workspace remains the canonical host for runtime terminals.
- editor-embedded terminal panels are secondary presentations of terminal leaf panes, not separate PTY sessions.
- normal browsing and preview/browser sessions remain governed by the browser/session model, not by terminal detachment rules.
- desktop-first terminal `/presentation` is the MVP SSOT: browser or `/remoted` terminal access is a sibling transport/presentation layer over the same terminal tabs, panes, command metadata, and PTY model, not a provider-style or shell-like second ownership model.
- Terminal integration APIs may expose structured `/query`, `/focus/send-input/interrupt/resize/state` capture, `/create-terminal`, and `/input/session` controls for PM-owned `/workflows` and `/preview/summarization`, but arbitrary third-party plugins or open-ended extension hooks cannot mutate core rendering, input, or session semantics.
- Default terminal tab and `/pane` labels prefer stable `/project-folder-derived` or `/context-derived` names over command-derived titles; `/container/shell/profile` context appears as badges, sublabels, or `/details` unless a user-defined opt-in `/role` is `/active`.
- Generated `/derived` labels freeze after user rename, resume auto-derived behavior only on explicit reset-to-auto, and `/splitting` creates a split-created label suggestion instead of silently copying a misleading source-pane label.
- Terminal reduced-motion handling remains active for terminal enter animations; split `/grid` containers avoid `/fade` or `/motion` enter effects during drag `/reorder` so drag targets stay clear.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md
### Terminal section presentation rules


The bottom runtime zone uses a workgroup-first terminal information architecture.

#### Bottom runtime information architecture


The canonical structure is:
- workgroups as the primary horizontal strip
- subtabs for each leaf terminal pane inside the active workgroup
- an optional split-pane tree inside each workgroup

The bottom strip is laid out as left / center / right regions.
- center hosts the workgroup cluster plus the active subtab row
- right hosts split, add, collapse, and related terminal actions
- the separate command-log strip is retired from the canonical layout

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md

#### Split grid and editor embeddings


Terminal panes may be organized as a row/column split tree.

Rules:
- visible gutters and resizers are part of the canonical layout, not optional decoration.
- workgroups own the accent used by the workgroup pill and the active subtab highlight.
- the terminal grid must not use a split-parent opacity enter animation that dims all children during reorder or drag operations.
- the editor may host a multi-panel terminal stack. Each panel references an existing terminal leaf pane and workgroup rather than creating a second terminal session.
- if a pane is currently editor-only, the bottom runtime zone shows placeholder language explaining that the pane lives in the editor stack and can be restored there or dropped back into the bottom workspace.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

#### Drag-and-drop contract


Terminal DnD accepts pane, subtab, and workgroup payloads.

Required behavior:
- same-group pane reorder swaps leaf panes in the workgroup split tree.
- dropping a workgroup on the editor resolves to the focused leaf pane in that workgroup, falling back to the first leaf when needed.
- DnD cleanup must clear stale hover, opacity, and drag classes after rebuild or dragend so terminal panes do not remain visually dimmed.
- drag handlers for pane drop targets must work when the cursor is over pane-body content, not only over outer chrome.

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

#### Motion and accessibility

Reduced motion applies to terminal enter animations where those animations are still used, but not to removed split-parent fade effects.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md
### 5.2 Panel State Machine

Per panel: **DOCKED** <-> **FLOATING**. Same Slint component is used inline when docked or as the root of a separate Slint `Window` when floating.

```
DOCKED --[undock]--> FLOATING --[snap to edge]--> DOCKED
  |                       |
  +--[drag to edge]-------+
                          +--[close floating window]--> DOCKED (collapsed)
```

**State per panel:**

```rust
enum PanelDock {
    Docked { side: DockSide, width_px: i32 },
    Floating { window_id: WindowId, x: i32, y: i32, width: i32, height: i32 },
}

enum DockSide {
    Right,   // default for Chat and File Manager
    Left,    // alternative
    Bottom,  // for the bottom runtime zone / terminal-section host
}
```

### 5.3 Undock Triggers

- **Double-click** the panel's title bar tab
- **Drag** the panel's title bar tab away from the edge
- **Pop-out button** in panel header (window-with-arrow icon)
- **Right-click** panel tab -> "Pop out to window"
- **Keyboard shortcut** (e.g., `Ctrl+Shift+\`)
- **Command palette:** "pop out chat" or "detach file manager"

### 5.4 Snap Zones

When a floating panel window is dragged near the main window edge:
- Proximity threshold: 25px from the main window edge
- Visual cue: 2px accent strip (`Theme.accent-blue`) on the target edge
- On drop: panel docks to that side; floating window closes
- Snap animation: instant (no easing -- retro hard-edge aesthetic)

### 5.5 Slint Multi-Window Implementation

- Each panel is a reusable Slint component that renders identically whether inline (docked) or in a separate `Window` (floating)
- When docked: component placed inside main window layout hierarchy
- When floating: new Slint `Window` created; panel component placed inside it
- **Shared data:** All panel data (chat messages, file tree) lives in Rust (e.g., `Arc<RwLock<...>>`). Exposed to Slint via properties/Models (e.g., `VecModel`). Both docked and floating instances bind to the same Rust-backed properties via `Rc<VecModel<T>>` and Slint's `ModelNotify` for automatic propagation
- **Scalar properties** (orchestrator status, current phase, theme mode): Sync via `invoke_from_event_loop` from background threads -- NOT via polling timers

### 5.6 Discoverability

Three-signal system for panel detach discovery:
1. **Drag handle + tooltip:** Subtle grip icon (6 dots) in panel header. Hover tooltip: "Drag to detach, or double-click to pop out."
2. **Explicit "Pop Out" button:** Small window-with-arrow icon button in panel header (right side)
3. **First-run hint (one-time):** On first use of Chat or File Manager, inline banner: "This panel can be popped out into its own window. [Try it] [Dismiss]." Dismissed permanently after first interaction.

### 5.7 Panel Persistence


**Layout persistence per project:** Panel dock state (docked side and width, or floating position/size), **activity bar icon order**, and **which panel was last visible** are persisted **per project** in redb (e.g. under keys scoped by `project_id`). Restored on startup and when switching projects. If a floating window was on a monitor no longer connected, fall back to docked state.
### 5.8 Panel Edge Cases and Recovery

**Data sync:** Floating and docked instances share the same `Rc<VecModel<T>>` and scalar properties. When the Rust side replaces an entire model (e.g., project switch), it must update the shared `Rc` in-place rather than reassigning the pointer, so both windows stay synchronized.

**Monitor disconnect:** On startup, validate floating window coordinates against available monitors. If coordinates are off-screen or on a disconnected monitor, fall back to docked state. At runtime, listen for display-change events (platform-specific) and re-dock any orphaned floating windows.

**Snap zone conflicts:** If two floating panels are both within 25px of the same edge, the one closer to the edge wins. If equidistant, the most recently moved panel snaps first.

**Focus management:** When a floating panel window closes (user clicks X or presses Escape), focus returns to the main window. Tab key does NOT cross window boundaries -- each window has its own focus chain.

**Zero-width prevention:** Minimum panel width is 240px. If a resize drag would reduce below this, clamp at 240px. Bottom panel minimum height is 80px (collapse to 24px header via collapse button only, not via resize drag).

---

## 6. Theme System

### 6.1 Three Theme Families (Three User-Facing Choices)


| Theme Family | Variants | Retro Effects | Target Audience |
|-------|--------|--------------|----------------|
| **Retro Dark** | 1 | Full: pixel grid, paper texture, scanlines, hard shadows, sharp corners, Orbitron + Rajdhani | Users who love the current aesthetic |
| **Retro Light** | 1 | Full (reduced opacity): pixel grid, paper texture, hard shadows, sharp corners, Orbitron + Rajdhani | Light-mode users who want the aesthetic |
| **Basic Modern** | 2 internal palette variants | None: flat colors, subtle borders, rounded corners, system fonts | Accessibility, readability, reduced visual noise |

User-facing selector contract:
- The GUI MUST expose exactly three built-in theme choices: `Retro Dark`, `Retro Light`, and `Basic`.
- `Basic` may internally resolve to light or dark palette tokens based on explicit sub-setting or system scheme, but that internal palette choice does not create a fourth user-facing built-in theme promise.

### 6.2 Theme Token Table

| Token | Retro Dark | Retro Light | Basic Light | Basic Dark |
|-------|-----------|-------------|-------------|------------|
| **background** | #0a0a1a | #FAF6F1 | #FAFAFA | #121212 |
| **surface** | #1a1a2e | #f0ece5 | #FFFFFF | #1E1E1E |
| **surface-elevated** | #252540 | #e8e4dc | #FFFFFF | #2D2D2D |
| **text-primary** | #e8e0d0 | #1A1A1A | #1A1A1A | #E8E8E8 |
| **text-secondary** | #a0a0a0 | #666666 | #616161 | #A0A0A0 |
| **text-muted** | #666666 | #999999 | #9CA3AF | #6B7280 |
| **border** | #e8e0d0 (low opacity) | #1A1A1A | #E0E0E0 | #424242 |
| **border-light** | #333333 | #E5E7EB | #F0F0F0 | #333333 |
| **accent-blue** | #00d4ff | #0047AB | #1565C0 | #64B5F6 |
| **accent-magenta** | #ff2d9b | #FF1493 | #C41170 | #FF69B4 |
| **accent-lime** | #b4ff39 | #00FF41 | #0D7A3C | #3DD68C |
| **accent-orange** | #ff8c00 | #FF7F27 | #C45D00 | #FFA347 |
| **shadow-type** | Hard offset (2,2) | Hard offset (2,2) | None | None |
| **border-width** | 2px | 2px | 1px | 1px |
| **border-radius** | 0px | 0px | 4px | 4px |
| **display-font** | Orbitron Bold | Orbitron Bold | Inter / system-ui | Inter / system-ui |
| **body-font** | Rajdhani | Rajdhani | Inter / system-ui | Inter / system-ui |
| **mono-font** | System monospace | System monospace | System monospace | System monospace |
| **base-font-size** | 14px | 14px | 15px | 15px |
| **line-height** | 1.4 | 1.4 | 1.6 | 1.6 |
| **letter-spacing** | default | default | 0.02em | 0.02em |
| **pixel-grid-enabled** | true | true | false | false |
| **pixel-grid-opacity** | 0.09 | 0.045 | 0.0 | 0.0 |
| **paper-texture-enabled** | true | true | false | false |
| **scanline-enabled** | true | optional | false | false |
| **scanline-opacity** | 0.06 | 0.03 | 0.0 | 0.0 |
| **padding-scale** | 1.0 | 1.0 | 1.25 | 1.25 |
| **scrollbar-width** | 12px (styled) | 12px (styled) | 8px (system-like) | 8px (system-like) |

### 6.3 Retro Effects Implementation

**Pixel grid and paper texture:** Generated as tiled images from Rust at startup using `SharedPixelBuffer`. Applied via `Image` elements with appropriate tiling. Do NOT use `RenderingNotifier` -- use `SharedPixelBuffer` as it is backend-agnostic and simpler.

**Important:** `ImageFit.repeat` may not exist in Slint 1.15.1. If unavailable, tile the image manually using a `GridLayout` or `Flickable` with repeated `Image` elements, or generate a single large tile that covers the viewport.

**Conditional overlays:** Paper texture and pixel grid are optional overlay components at the root, bound to `Theme.retro-effects-enabled`. Implementations must not branch component logic on theme; only the presence/absence of these overlay nodes changes.

```slint
if Theme.retro-effects-enabled: PixelGridOverlay {
    opacity: Theme.pixel-grid-opacity;
}
if Theme.retro-effects-enabled && Theme.paper-texture-enabled: PaperTextureOverlay { }
```

### 6.4 Theme Switching

- **Live switch** for colors, spacing, borders, overlays: Slint's reactive property system propagates changes instantly
- **Restart required** for font family change: Switching between Retro (Orbitron/Rajdhani) and Basic (system fonts) requires app restart because Slint loads fonts at initialization
- **Within same family is live:** Switching between Retro Dark and Retro Light is instant (same fonts)
- **Basic palette note:** Switching Basic between its internal light/dark palette variants MAY be live when fonts do not change, but it remains one built-in theme family in the UI model.

### 6.5 Slint Implementation

```slint
export enum ThemeMode { retro-dark, retro-light, basic-light, basic-dark }

export global Theme {
    in property <ThemeMode> mode: retro-dark;
    in property <color> background: #0a0a1a;
    in property <color> surface: #1a1a2e;
    in property <color> surface-elevated: #252540;
    in property <color> text-primary: #e8e0d0;
    in property <color> text-secondary: #a0a0a0;
    in property <color> text-muted: #666666;
    in property <color> border: #e8e0d050;
    in property <color> border-light: #333333;
    in property <color> accent-blue: #00d4ff;
    in property <color> accent-magenta: #ff2d9b;
    in property <color> accent-lime: #b4ff39;
    in property <color> accent-orange: #ff8c00;
    in property <bool> retro-effects-enabled: true;
    in property <float> pixel-grid-opacity: 0.09;
    in property <float> scanline-opacity: 0.06;
    in property <bool> paper-texture-enabled: true;
    in property <length> border-width: 2px;
    in property <length> border-radius: 0px;
    in property <float> padding-scale: 1.0;
    in property <length> scrollbar-width: 12px;
    in property <float> line-height-scale: 1.4;
    in property <length> base-font-size: 14px;
}
```

A Rust-side `ThemeVariant` enum applies all tokens to the global at runtime:

```rust
pub enum ThemeVariant { RetroDark, RetroLight, BasicLight, BasicDark }

impl ThemeVariant {
    pub fn apply_to(&self, ui: &AppWindow) {
        match self {
            ThemeVariant::RetroDark => { /* set all dark retro tokens */ }
            ThemeVariant::RetroLight => { /* set all light retro tokens */ }
            ThemeVariant::BasicLight => { /* set all basic light tokens, disable effects */ }
            ThemeVariant::BasicDark => { /* set all basic dark tokens, disable effects */ }
        }
    }
}
```

### 6.6 Theme Extensibility Architecture (MVP)

The architecture supports unlimited user-created themes beyond the four built-in variants.

**Built-in themes (ship with app):**
- Retro Dark, Retro Light, Basic Light, Basic Dark (the four variants in §6.1-6.2)

**Custom theme file format:** Custom themes are defined as TOML files in `~/.puppet-master/themes/<name>.toml`. Each file specifies token overrides; any token not specified inherits from the base theme (Basic Dark or Basic Light, chosen by a `base` field).

```toml
[meta]
name = "Solarized Dark"
author = "User"
base = "basic-dark"          # inherit unset tokens from this variant
version = "1.0"

[colors]
background = "#002b36"
surface = "#073642"
surface-elevated = "#0a4050"
text-primary = "#839496"
text-secondary = "#657b83"
accent-blue = "#268bd2"
accent-magenta = "#d33682"
accent-lime = "#859900"
accent-orange = "#cb4b16"

[effects]
retro-effects-enabled = false
pixel-grid-opacity = 0.0
border-width = 1
border-radius = 4

[fonts]
# omitted = inherit from base


# display-font = "CustomFont"  # requires font file in ~/.puppet-master/fonts/
```

**Theme loading and validation:**
- On startup, scan `~/.puppet-master/themes/` for `.toml` files
- Parse and validate each file against the token schema (§6.2). Invalid files log a warning and are skipped (not loaded); user sees a toast on Settings open: "Theme '{name}' has errors -- see log for details"
- Valid custom themes appear in the theme selector (Settings > General and title bar toggle) alongside built-in themes
- **Hot reload:** Editing a theme TOML file while the app is running triggers a re-scan (via file watcher on the themes directory). If the currently active theme is modified, changes apply immediately (same as live theme switch within a family). If font changes are detected, prompt for restart.

**Theme selector UI:**
- Title bar theme toggle becomes a dropdown when >4 themes are available (built-in + custom)
- Each entry shows: theme name, color swatch preview (4 circles: background, surface, accent-blue, accent-lime), author (for custom), "[built-in]" or "[custom]" badge
- "Manage themes" link at bottom opens Settings > General > Themes section
- Settings > General includes: theme dropdown, "Open themes folder" button (opens `~/.puppet-master/themes/` in system file manager), "Create new theme" button (copies a template TOML to the themes folder and opens it in File Editor), "Import theme" button (file picker for .toml), "Export theme" button (saves current token values as .toml)
- Theme selection, including terminal color-scheme selection, must support preview before apply, fast switching, `/search`, explicit readability `/contrast` signals, and instant apply/revert; `/revert` returns to the previously persisted theme or terminal color scheme without waiting for app restart.
- Settings > Terminal owns durable terminal appearance/theme/color, default cwd, font, and default behavior controls; runtime terminal panels consume those preferences but do not mint separate settings owners.
- Terminal theme schema is semantic, not raw ANSI-only: it defines background `/foreground`, ANSI `/basic` and bright palettes, cursor and selection colors, search highlight colors, command-block and sticky-header chrome, and badge/status colors for `/failure/running/context` states.
- Terminal theme catalog includes PM-matched themes, polished general-purpose themes, and `/fun/funky` or `/expressive` presets only when `/contrast` and readability checks pass; previews support `/search/light-dark` pairing, quick `/switching`, instant apply, and easy `/revert`.

**Custom font support:** Custom themes can reference font files placed in `~/.puppet-master/fonts/`. Font files (.ttf, .otf, .woff2) are loaded at startup. A theme TOML referencing a missing font falls back to the base theme's font and shows a warning toast.

**Theme preview:** When hovering over a theme in the selector dropdown, show a live preview of the theme applied to a small widget card (button, text, border sample). On click, apply the theme. This allows users to preview without committing.

### 6.7 WCAG Compliance

- **Retro themes:** Prioritize aesthetic over strict WCAG AA compliance for accent colors (e.g., ACID_LIME on dark backgrounds may not meet 4.5:1)
- **Basic theme:** MUST meet WCAG 2.1 AA for all text and interactive elements (4.5:1 minimum contrast for normal text, 3:1 for large text). Basic accent colors are muted specifically to meet this requirement
ContractRef: ContractName:Plans/FinalGUISpec.md#13, ContractName:Plans/DRY_Rules.md#7

---

## 7. Views Specification


The GUI surface is responsible for displaying concerns, progress, artifacts, and help through carefully scoped views. Canonical concern definitions, approval scope semantics, and route/open ownership are defined in Plans/Contracts_V0.md; this section owns the visible widget and interaction layer.

### 7.1 Orchestrator

The Orchestrator renders five composite projection states: `current`, `refreshing`, `stale`, `degraded`, and `unavailable`. `projection_freshness` owns `current` / `refreshing` / `stale`, `projection_health` owns `degraded` / `unavailable`, and `trust_tier` is reserved for preview/browser semantics only rather than acting as the general projection-state bucket. Sensitive actions require `current` data or direct canonical revalidation; when a surface is `degraded`, the UI falls back to record-backed views and suppresses live mutation affordances.

User-facing projection-freshness copy resolves to `projection_freshness` and `projection_health`; it never borrows Preview `trust_tier` or treats browser trust as runtime projection trust.

Projection-heavy surfaces must disclose degraded or `/stale` state and revalidate against canonical records before emitting strong notification claims. Dashboard-hosted push widgets carry a chrome-level trust indicator plus `/idle/historical` and no-active-run states, so page-level chrome explains whether data is live, historical, absent, stale, or degraded.

Orchestrator stale-data mitigations use the same copy and action rules as other `/degraded` runtime projections: mutation-bearing controls narrow, disable, or require canonical/current revalidation before execution.

Only `Progress` is widget-composed inside Orchestrator; non-Progress tabs use native `view-state` contracts. The `orchestrator:progress` layout persists independently from Dashboard and Usage layout keys. Slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors are mandatory across every dense tab, and scale is treated as a cross-tab contract rather than a graph-tab-only concern.

`Progress` remains live-first but run-focus aware: when a historical run is selected, Progress widgets render coherent historical snapshots instead of implying the current live dashboard.

Orchestrator widgets live inside `Progress`; eligible Progress widgets may also be Dashboard-hostable, but non-Orchestrator widgets are not hostable on the Orchestrator page. Widget resizing and `/customizable` controls stay subordinate to the tab-first Orchestrator structure.

Each non-Progress fixed tab persists its own `view-state`: filters, selection, split positions, inspector state, and the last-focused object are tab-local restoration inputs rather than widget-layout fields.

Legacy widget-composed tab keys `orchestrator:tiers`, `orchestrator:evidence`, `orchestrator:history`, and `orchestrator:ledger` plus generic `/remove/move/resize` behavior are migration aliases; only `orchestrator:progress` persists as the Orchestrator widget layout key.

`Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` carry-through references to `Tab 2: Tiers`, `orchestrator:tiers`, and `FinalGUISpec section 7.7` are legacy aliases only; FinalGUISpec keeps them searchable without restoring a Tiers tab as canonical Orchestrator navigation.

`Source Control` is the execution surface for Git-native mutations, while `Orchestrator` remains the operational surface explaining why those actions matter and how they relate to runs, concerns, and recovery.

Legacy tier-era `Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` signals such as `Progress`, `Tiers`, `Node Graph`, `Evidence`, `History`, `Ledger`, the six-tab shell, `active tier`, `phase/task/subtask`, `TierChanged`, and cross-surface `CTA` labels are compatibility inputs only; native Orchestrator pivots normalize through object-first `route_target` behavior instead of tier-local navigation.

`Orchestrator_Page.md` and `Run_Graph_View.md` user-facing help and `/copy` translate legacy data-model labels, including `Tiers`, `Phase/Task/Subtask`, `/Task/Subtask`, and `Overseer`, into native graph/package/seam/lane terms instead of presenting tier-era wording as current guidance.

Tier/group views, where retained as compatibility projections, carry pointers to canonical execution objects for `/group` display and `/audit` routing; `tier_id` is never the primary mutation or audit key.

`Orchestrator_Page` / `Orchestrator_Page.md` legacy ontology may still be visible in tab structure, widget structure, event sources, filter keys, and worker identity fields, but those are migration signals rather than canonical execution identity.

When `Orchestrator_Page.md` and `Widget_System.md` disagree on Dashboard hostability, FinalGUISpec treats Progress widget Dashboard-hostability as an explicit allowlist rather than a catalog-wide default.

The old `all Orchestrator tabs are widget canvases` model from `Widget_System.md` and `Orchestrator_Page.md` is compatibility-only; Progress stays the sole widget-composed Orchestrator tab, while Seams, Node Graph, Evidence, History, and Ledger remain native views.

`Plans/FinalGUISpec.md` / `/FinalGUISpec.md`, `Widget_System` / `Widget_System.md`, and `Orchestrator_Page` / `Orchestrator_Page.md` migration notes treat `GUI`, `/Tiers/Node`, `/Evidence/History/Ledger`, phase `/task/subtask` progress, `widget.tier_tree`, `widget.progress_bars`, `/widget`, scheduler `/blocked`, and addenda `pile-up` as compatibility inventory; replacements use package `/seam/lane` groupings and native `view-state` contracts.

GUI rewrite-era surfaces replace tier/task/subtask claims with seam/package/node ownership; `/package/node` expansions expose execution detail while legacy `/task/subtask` wording stays compatibility copy only.

`Progress` widgets must not teach active-tier, `phase-task-subtask`, or `tier-targeted` terminal semantics as the primary operational mental model; those spellings remain compatibility labels behind native Progress, package, lane, and runtime-object routing.

`History` is the chronological durable story and `Ledger` is exact record inspection; projection-backed operational views may degrade or fall back to record-backed slices without erasing auditability.

FinalGUISpec-owned Dashboard widgets `widget.orchestrator_status` and `widget.current_task` must route the dashboard -> Orchestrator -> chat `CTA` with overseer/thread identity, lane state, and active object context, so the flow is no longer under-specified or dependent on whichever thread happened to be visible last.

Dashboard CtAs, blocked-node CtAs, thread badges, and live-run cards route through one Dashboard -> Orchestrator -> chat-thread attention contract. The route is `/seam/lane-aware`, exposes `/seams/lanes` rollups and package `/package/node` expansions progressively, and demotes tiers-first widgets or layouts to compatibility-only presentation.

Graph-native execution replaces tiers-first and single-worktree assumptions with package/seam/lane-aware surfaces; the same attention-routing model handles blocked work, optional `HITL`, and side-effect approvals.

Provider `/runtime` architecture from the rewrite-root contract is not sufficient by itself for GUI surfaces; FinalGUISpec also consumes Orchestrator `/routing/projection` decisions before downstream GUI docs expose navigation, widget, or attention behavior.

On `Seams`, top-level seam rows load compact `/seams/lanes` rollups first; package lists and node problem lists expand lazily through package `/package/node` details instead of rendering fully expanded seam/package/node trees by default.

Action surfaces classify every affordance by navigation vs mutation, palette visibility, shortcut eligibility, multi-target safety, and confirmation/reversibility. Bulk affordances default to navigation and triage rather than live execution mutation.

Side inspectors stay summary/action-light; `/action-light` affordances belong there, while `/high-consequence` actions and dense records route to the owning full-record surface before mutation.

#### Cross-surface state presentation and disabled controls

SCM, GitHub Actions, Docker/Kubernetes, Orchestrator, and other /runtime-backed surfaces share one user-facing status vocabulary: `Running`, `Ready`, `Blocked`, `Needs Attention`, `Degraded`, `Stale`, `Detached`, and `Not Configured`. Icon, text, and badge presentation may vary by density, but `/text/badge` meaning must stay consistent and derive from canonical reason codes rather than panel-local copy.

Every disabled mutation affordance uses the shared `disabled-control` explanation model. Disabled controls expose a short inline reason, a hover/focus tooltip with the exact blocking condition, and the primary recovery CTA when one exists. Controls remain keyboard-focusable when that focus is needed for `/accessibility`, explanation, or recovery discovery.

Deep links from `Operation receipts`, Orchestrator blocked views, and owner-route attention items must preserve visible context. A destination surface either applies a visible context filter chip or opens an isolated focus mode; inherited `/search`, filter, or `/focus` state must be clearable in one action.

Shell `/navigation` and `deep-link` handling in `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` must consume the shared route contract before reviving any stale `Tiers` or widgetized Orchestrator surface assumption.

`Explain this state` is a GUI-level affordance on status pills, disabled buttons, blocked banners, and receipt rows across SCM, GitHub Actions, Docker/Kubernetes, and Orchestrator. It can auto-open on the first block when the user enables that behavior, and it offers ELI5 plus expert detail without inventing panel-local explanations. The explanation derives from canonical reason codes, validation fields, `allowed_action_ids[]`, requested/effective state, `/blocked/diverged/degraded` chains, and the `/event/storage` or `/events/storage` receipt projection; if a field is missing, the GUI says what data is unavailable instead of filling the gap with generic copy. `/tradeoffs`: one-click reasoning is valuable only when it stays tied to the same evidence that disables or permits the action.

Destructive, `/targeted`, and remote-mutating surfaces show a compact target/context banner before rendering mutation CTAs. The banner includes the effective target identity, fallback source, and whether the context came from selected worktree, receipt context, workspace branch, Docker context, Kubernetes namespace/environment, or `/runtime/context`. Empty-state taxonomy is canonical: `Not relevant`, `Not configured`, `Unavailable`, `No data yet`, and `No results for current filter` are distinct states, not interchangeable copy. Hide-when-unused surfaces remain rediscoverable through Settings, commands, and receipt or CTA deep links.

Accessibility for dense custom surfaces is non-color dependent. Source Control, GitHub Actions, Docker Manager, Kubernetes, Orchestrator, receipt views, and any `/table` fallback must preserve `/screen-reader` labels, keyboard traversal, non-color state indicators, and text equivalents for graph badges, status badges, blocked reasons, and filter results.

Blocked-state integration uses one shared contract rather than surface-specific recovery wording. Orchestrator remains the hub for blocked episodes, while destination panels render the same reason code, owner route, recovery CTA, and allowed actions in local context. If a destination panel cannot host the requested recovery action, it links back to the owner route with the original receipt/filter context preserved; it must not create a competing remediation path.

Dashboard CtAs, blocked cards, modal `/toast` approvals, graph-local dialogs, and inline chat actions all resolve through the same owner-routed action family; resolution-thread ownership belongs to the canonical attention/blocked route, not the surface that happened to display the prompt.

UI, runtime, and chat-thread resolution share the same blocked/recovery action family, so `/recovery` affordances point to canonical actions instead of surface-specific commands.

Governance and policy outcomes are blocked outcomes, not generic failures. The GUI distinguishes namespace disallowed by product policy, admission or policy denied by OPA, `/Gatekeeper/Kyverno/Pod` Security or `/image` policy, quota or `/limit` policy denial, and `remote_mismatch`, with separate remediation pivots and CTAs. Multi-object Kubernetes apply, `compose-to-cluster`, and multi-step publish chains show partial `/receipts`: accepted resources, the later denied resource, any downstream deployment blocked by that denial, and the exact policy-blocked object and `/stage`. While a run is waiting on approval, `/review/ruleset`, or external governance change, resume revalidates before mutation; receipts retain original and current `/policy` or `/remote` outcomes, including active, deleted, archived, `renamed_redirected`, and transferred targets.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md

#### Progress catalog source and default drills


Orchestrator consumes the named Progress catalog from FinalGUISpec Appendix C. The promoted 13-widget Progress catalog and default drill targets are:
1. `progress.run-overview` → Execution unit tree scoped to `focused_run_id`
2. `progress.current-task` → Node inspector for the active execution unit
3. `progress.lane-health` → Lane row filtered to the selected lane/worktree
4. `progress.node-throughput` → Dense node list filtered to slow or blocked nodes
5. `progress.blocked-concerns` → Concern lane filtered to `blocked` or `attention_required`
6. `progress.approval-queue` → Concern inspector showing pending approvals
7. `progress.recovery-status` → Recovery timeline for the selected concern or blocked episode
8. `progress.artifact-receipts` → Artifact browser filtered to receipt-linked runtime artifacts
9. `progress.worktree-state` → Source Control worktree row with lane/package/run refs
10. `progress.account-pressure` → Historical `account_pressure_episode` list
11. `progress.account-switches` → Historical `account_switch_event` list
12. `progress.escalation-stack` → Project attention view focused on the shared escalation ladder
13. `progress.attention-summary` → `project_attention_item.primary_route_payload` list

#### Progress labels and taxonomy


- State labels: `queued`, `running`, `attention_required`, `blocked`, `recovering`, `degraded`, `complete`
- Action labels: `Inspect`, `Focus run`, `Open evidence`, `Request approval`, `Acknowledge`, `Dismiss`, `Resolve`, `Retry recovery`
- Alert taxonomy: `advisory`, `attention_required`, `blocked`, `escalated`, `degraded_projection`
- Event taxonomy: `run_started`, `node_started`, `node_completed`, `concern_opened`, `approval_requested`, `approval_decided`, `recovery_started`, `recovery_completed`, `artifact_published`, `account_switched`
- Condition-aging policy: advisory warnings may quiet after one stable refresh window; `attention_required` resurfaces on meaningful change or persistence; `blocked` and `escalated` never auto-quiet

### 7.3 Shared route and open behavior

All search results, palette actions, widgets, recovery links, and cross-surface pivots emit one shared route/deep-link payload. `resume_url` is the `/serialization` transport form of that payload, not a hidden canonical route contract or second routing model.

Widget actions route through the same command and `/deep-link` payload model as search, inspectors, and palette actions, not through widget-local action ids.

`Plans/assistant-chat-design.md` / `assistant-chat-design.md` message `jump-to-message`, search, and persistence behavior consume the same object-first route model; chat may store `resume_url` for recovery portability, but it must not fall back to path-first opening.

`cmd.nav` and `cmd.nav.*` wrappers route through the same route payload and `/wiring/gate` stack, so catalog commands cannot bypass owner checks or force every consumer surface to restate route semantics.

UI container state such as `tab_id`, panel focus, and inspector section is view context around the target, while `target_kind` is destination class only and never shell state or object taxonomy.

Usage pivots route `usage_event` and runtime-object detail through object-first `/object` and `/search/jump` primitives; legacy `tier_id` may remain filter context but cannot replace node, `/attempt/block`, and `/correlation` lineage.

`switch-aware` usage/history views prefer `usage_event_ref` plus `attempt_id` as pivots; switch state may annotate a view, but it cannot restore `tier_id` as the cross-surface runtime identity.

Graph and evidence schemas add work-package `/seam/promotion/account/lane` identity and align `/coverage/evidence` linkage so `/evidence` and exact-record views can route by normalized record shape.

Route payload passthroughs include `correlation_id` as a matrix-verifiable field when owner contracts require it, rather than relying on prose-only correlation.

Route destination classes include `bottom_panel` for terminal, problems, output, ports, browser, and debug; `embedded_surface` covers embedded sub-surfaces such as `document_pane` and `agent_activity` without turning those panes into route-object taxonomy.

Usage-event identity stays primary for Usage `/Ledger` navigation, while node `/attempt` identity stays primary for runtime and graph inspectors.

`human-in-the-loop` / `human-in-the-loop.md` carries direct canon-supersession for HITL behavior; FinalGUISpec consumes that owner state rather than treating it as additive refinement.

The Evidence pane owns verdicts `/receipts/findings/reports`; the Artifacts pane owns screenshots `/recordings/diffs/reports/generated` docs `/etc`, and evidence/artifacts remain bidirectionally linked with usage-linked receipts where relevant.

Canonical-record cleanup treats `tier_runtime_record`, tier-keyed `usage_record`, tier-adjacent `evidence_record`, `thread_blocked_notice`, and `wizard_runtime_state` `resume_url` fields as compatibility records; they cannot reassert tier identity over object routes.

`Crosswalk.md` must expose route-target / identity-native open behavior as a primitive alongside command and document-pane primitives; FinalGUISpec consumes that primitive through `route_target`, `OpenSubject`, and `OpenFile` rather than creating a parallel navigation vocabulary.

Route envelopes, not ad hoc UI glue, hold the minimum openable routing fields for cross-surface pivots before the destination opens file, subject, inspector, or runtime views.

`FileManager` keeps `OpenFile { path... }` for workspace-file opens, while runtime-identity opens use `OpenSubject` or `route_target` over canonical object identity before landing in file, subject, or inspector views.

`tab_id` is allowed for top-level tab restoration and `/focus` refinement only; it does not replace destination class, subject identity, or object identity.

`subject_id` is for openable `/renderable` content subjects only; it must not become a second generic object taxonomy beside `object_kind` / `object_id`.

Interview and other `/document-production` runs may carry runtime identity plus blocked `/remediation` state, but they are not Orchestrator package `/node` execution records and must not collapse into the package/node object model.


All search results, palette actions, widgets, recovery links, and cross-surface pivots emit one shared route/deep-link payload. `resume_url` is the serialized transport form of that payload, not a second routing model.

- Concern search results route as object-first results with focused-run and target-tab context by using `object_kind: concern`, `object_id: concern_id`, `focused_run_id`, and `target_tab`.
- Concern drill-down preserves the selected `concern_id` plus related object context when pivoting into inspectors, recovery links, or historical views.
- `route_target` stays small: it is either `subject_id`-based identity or `object_kind` / `object_id` identity.
- `subject_id` families are limited to `doc:` and `artifact:`.
- `inspector_target` is secondary metadata, not primary identity.
- Destination/context overrides are allowed only when needed to restore the target surface.

### 7.4 Settings and inspectors

#### 7.4.2 Indexing settings subsection

The Indexing settings subsection exposes the project search index as an admin surface: enable/disable index, large file threshold, generated-file and custom exclusion patterns, follow-symlinks toggle default OFF, shallow/partial (`/partial`) remote cache toggles, local and remote disk usage, manual cache eviction with confirmation, and `Rebuild Index`. Local projects hide remote-only cache controls while keeping toggle, threshold, exclusion, symlink, disk-usage, and rebuild controls visible.

#### 7.4.4 Settings (Unified) panel specification

Settings provider and web rows must preserve row-level health/error disclosure, last-failure messaging, availability plus support-tier visibility in Settings, and availability plus support-tier visibility in /web help/autocomplete. The row contract includes provider identity, support tier, readiness state, last failure, and contextual help without moving provider routing ownership out of `Plans/Tools.md`.

Settings Tab Registry:

The unified Settings surface exposes a stable tab registry so run-touched settings content has a visible landing zone without copying detailed owner-doc behavior into this GUI file. The registry is a placement and owner-routing contract: hidden or unsupported tabs remain searchable and command-addressable, but they show unavailable or unsupported state instead of disappearing silently.

| Tab | Final GUI responsibility | Owner detail |
|---|---|---|
| General | App-wide theme, appearance, onboarding, and ordinary preference rows | FinalGUISpec plus storage settings keys |
| Models / Providers | Model, provider, account, runtime, and Default Crew entrypoints | Models_System, Multi-Account, Agent Config |
| Tiers (retired alias) | Compatibility/search alias only; visible execution navigation uses Nodes, Packages, Lanes, Seams, or Branching surfaces | Orchestrator, Run Graph, Worktree, and node/package/lane owner docs |
| Branching | Git/worktree policy, branch defaults, merge/push posture, and recovery entrypoints | WorktreeGitImprovement and GitHub integration docs |
| Verification | Validation pass settings, report visibility, and gate/run quality preferences | chain-wizard, Project Output Artifacts, and Progression Gates docs |
| Memory | Assistant memory, retrieval, context, and rehydration preferences | assistant-memory, Prompt Pipeline, and assistant-chat docs |
| Budgets | Token, spend, quota, pressure, and execution-budget controls | usage, Models, Run Modes, and Contracts docs |
| Advanced | Rare or hazardous controls, debug/instrumentation toggles, and platform diagnostics | FileSafe, Tools, Runtime Artifacts, and Doctor/Health owners |
| Permissions | Permission rules, approval scopes, presets, and web-operation keys | Permissions_System |
| LSP | Language-server enablement, host/root attachment, diagnostics, and restart controls | LSPSupport plus FileManager consumers |
| Interview | Interview, builder, and requirements workflow preferences | interview, chain-wizard, and Project Output Artifacts docs |
| Media | Media-generation provider and capability settings | Media_Generation_and_Capabilities |
| Auth | Provider, server, GitHub, and account authentication entrypoints | Multi-Account and provider/auth owner docs |
| Health | Doctor checks, readiness, stale/degraded states, and remediation links | owner docs for the failing subsystem plus Runtime Artifacts |
| Rules | Instruction, rule, and policy-pack visibility without replacing owner storage | agent rules, Prompt Pipeline, Skills, and Plugins docs |
| Shortcuts | Keyboard shortcut discovery, remapping, conflicts, and command bindings | UI_Command_Catalog |
| Skills | Skill registry visibility, readiness, source, and persona references | Skills_System and Agent Config |
| Plugins | Plugin registry visibility, readiness, source, and capability disclosure | Plugins_System and MCP/Tools owners |

Settings is the tooltip-heavy `/help` surface for explaining what a setting does and what wins when multiple settings apply; it links to owner docs rather than duplicating runtime policy.

Settings scopes are not limited to global and `/project` toggles; policy-bearing controls may be package, `/seam/lane/run/account-aware`, or account/actor scoped when the owner contract exposes that scope, and the UI must show the effective scope before applying or inheriting a setting.

Settings rows that still arrive from older run artifacts under `Tiers`, `tiers.slint`, or `TierTree` migrate to this registry as aliases only; new UI copy uses node/package/lane/seam or Branching terminology. Detailed behavior remains in the owner docs named above, while FinalGUISpec owns discoverability, grouping, disabled-state copy, and cross-surface routing.

`Plans/storage-plan.md` / `/storage-plan.md` and `Plans/usage-feature.md` / `/usage-feature.md` remain the consumer docs for storage and usage record truth; FinalGUISpec only exposes `/detail/history/ledger/runtime` inspector entrypoints and must route them to those owner contracts.

Usage, `/history/ledger`, and run-snapshot views attribute cost and consumption to `effective_account_id` while preserving requested-side fields as queryable and `/auditable` context wherever the run snapshot is shown.

`storage-plan` / `storage-plan.md` supports disposable projections, slice fetches, redb-backed projection pages, and seglog-derived views; FinalGUISpec consumes those storage-plan capabilities instead of restating projection storage.

`storage-plan` / `storage-plan.md` owns key registration, projector `/rebuild` semantics, and current vs historical projection rules.

`storage-plan` / `storage-plan.md` owns receipt row shape and the minimum cross-surface receipt contract; FinalGUISpec may expose receipt summaries only by routing to that storage-plan owner truth.

`Plans/usage-feature.md` / `/usage-feature.md` may surface usage-local and tier-local legacy identity only as migration vocabulary; GUI routes normalize usage pivots through the shared route/object model before exposing history, ledger, or runtime inspectors.

Settings show origin badges and precedence disclosure for resolver inputs, while runtime/history surfaces display requested/effective deltas and `support-state` only when those fields affect interpretation or recovery.

Runtime-related Settings, inspectors, and history surfaces share one override-display grammar: show the source snapshot, requested value, effective value, switch or clamp reason, and recovery path in the same order before applying surface-specific labels.

Operational-identity payloads use the bounded `operational-identity` shape `{ kind, requested_ref?, effective_ref?, selection_reason?, partial_capability? }`; provider-, registry-, Kubernetes-, and future surface-specific identities may extend the `kind` vocabulary without adding hidden credential ownership.

#### 7.4.7 Agent-Config panel specification

Agent Config owns the visible provider/model/account/instruction management surface and mirrors Skills owner vocabulary for Skills, Personas, bundled, protected_core, catalog_installed, manual_import, project_local, global_local, pm_enhanced, disabled, and ready_with_warnings rows. Agent Config rows expose source/readiness and recovery context, while Settings remains the durable preference surface.

The Agent Config Personas tab has three visible content categories: persona library and editing (create, edit, delete, disable, restore default, reorder where ordering is meaningful), runtime preferences (per-persona response style, verbosity, default model, tool posture, and output format defaults applied automatically while that persona is active), and skill refs (skills associated with or activated for the persona). Persona rows show scope, chat-selectable eligibility, child/subagent eligibility, protected/core or bundled-specialty status, prompt preview, requested/effective runtime summary, and provider compatibility disclosure. Protected core built-ins are read-only and not deletable, disableable, or shadowable; bundled specialty Personas are editable, disableable, and restorable to default. Persona rows cross-link to provider settings and to the Skills tab for the referenced skill registry entries.

Agent Config `/data` records include a durable `provider_entry` row with `provider_entry_id`, `runtime_platform_id`, `model_provider_id`, provider family, account/profile identity, and `auth_surface` auth-state metadata. Richer provider fields extend the visible `/provider` row without renaming the existing `auth_surface` or account/provider auth-state terms.

Provider/profile diagnostics expose local setup state without making Settings the owner: Linux per-provider storage resolves under `$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/` or `~/.local/share/puppet-master/providers/<provider_entry_id>/`, bootstrap checks can name `gemini-credentials.json` and `google_accounts.json`, and Cursor trust/cache rows can name `~/.cache/cursor-compile-cache` as profile `/account-local` evidence. Account-local and provider-profile-local rows may drift independently from shared workspace targets, so the GUI shows independent drift state rather than duplicating shared targets per account.

Agent-Config setup copy separates setup success from operational evidence. Cursor/headless `/workspace` trust rows may expose `--trust` and `/bootstrap` prompt state, and any material trust change sends the account/profile back through `Validating...` or a visible `Revalidate` action before it returns to `Ready`. `provider-home` paths, scheduler mechanics, and overlay configuration internals stay hidden unless a concrete `/debug` or audit use case requires persisted evidence. `provider-specific` remains or `/quota` probes belong in Usage and expanded account/runtime inspectors, not in setup success copy.

Selection and failover explanations use a stable reason-code family: `manual_pin`, `provider_default`, `preferred_account_retained`, `highest_priority_eligible`, `lowest_pressure_eligible`, `auth_surface_match`, and `server_profile_default`.

Requested/effective persona and `/model/variant/runtime` controls show project-owned multi-account policy, effective account selection, and provider-gap disclosure together: provider capability rows distinguish `honored`, `skipped`, and `clamped` states while preserving the `/effective` runtime value.

Default Crew default-config is an Agent-Config feature-surface. The panel exposes enable/disable, ordered crew members, per-member default-model and provider/runtime (`/provider`) selectors, and the first-run crew confirmation UX. Before launch, that confirmation resolves each member's model -> provider/runtime mapping and reconfirms it whenever mappings or `/defaults/restrictions` materially change; if Copilot is selected for any member, the visible confirmation normalizes the whole crew to Copilot and explains the crew-level provider constraint.

#### 7.4.8A Docker Manager Panel Spec

Docker Manager is the `docker_manager` side-panel surface for containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes. FinalGUISpec owns only shell placement, surface label, disabled-state copy, deep-subview discoverability, Settings entrypoints, and cross-surface routing for this panel; `Plans/Containers_Registry_and_Unraid.md` owns Docker runtime, auth, registry, publish, Unraid, Podman, Kubernetes, receipt, and detection behavior.

`Plans/Containers_Registry_and_Unraid.md` / `/Containers_Registry_and_Unraid.md` disagreement between `needs_review` and `/failure` payload semantics must be shown as an automation-first operator-flow mismatch until the container owner resolves it; FinalGUISpec mirrors only disabled-state and routing copy.

Legacy `DOCKER MANAGE`, `Docker Manage`, `docker_manage_surface_state`, and separate Unraid panel references are migration aliases. They open Docker Manager, optionally focused to `Publish / Unraid`, and must not create a second activity-bar slot or remain embedded under Persona Editor.


The settings model separates `requested_account_id` from `requested_account_policy`. It adds `requested_account_binding` with `none`, `preferred`, and `required` semantics, and every inspector renders the same identity grammar: Requested account / Requested binding / Effective account / Switch reason.

Shared runtime identity carries `execution_role` together with requested and effective operational identity. That packet propagates into effective-resolution records, attempt records, usage surfaces, and inspector payloads so the operator can compare requested vs effective runtime identity without reconstructing it from logs.

The settings resolver uses three axes:
- `source`: app defaults, project policy, worker policy, and recovery-policy inputs
- `request`: requested account, requested binding, requested account policy, requested execution role, and requested operational identity
- `execution`: effective account, effective binding outcome, effective operational identity, `execution_role`, and `switch_reason`

Resolver display grammar is deterministic: show worker-policy display first, then source snapshot, then request snapshot, then execution outcome. Resolver inputs are the three axes above plus current projection trust. The deterministic resolver matrix is: `required` must bind or block; `preferred` binds when available and otherwise falls back with an explicit `switch_reason`; `none` keeps the request visible but lets policy choose execution. The emit shape is `settings_resolution { source_snapshot, request_snapshot, execution_snapshot, switch_reason, resolution_status }`.

Panel-specific persistence and visibility controls live in Settings only when they are durable app or project preferences. Settings groups them by owning surface rather than by implementation store: Source Control / Branching, GitHub Actions, Docker Manager / Kubernetes, Terminal, File Manager, Models / Providers, plus General, Shortcuts, Advanced, and Health for cross-cutting controls. Active runtime object selection, live run actions, and transient inspector focus remain in the owning panel.

Agent-Config is the visible provider/model/account/instruction management surface for the now-locked `/provider` model. Settings and `/inspector` language must name Agent-Config, persistent Effective Runtime inspectors, provider entries, account/profile rows, instruction projections, and skill/MCP status rather than generic provider settings.

### 7.4 Terminal Settings Ownership

Settings > Terminal is the in-product cheat sheet and durable `/preferences` owner for terminal defaults. It groups high-frequency controls for preview and change ahead of dangerous `/rare` controls and daily-use settings, and it keeps `/shortcut` mappings plus conflict `/explanations` visible in-product rather than hiding discoverability in a secondary utility.

Terminal durable preferences include `/theme/font/rendering`, `/selection/copy/paste`, `/profile/cwd`, `/transcript` retention and `/performance`, diagnostics `/logging`, shell-integration `/capability` visibility, and renderer/session diagnostics when exposed. Scope labels distinguish per-project or workspace-local `/workspace` defaults from tab-scoped `/tab` overrides; live-session and pane/session-local actions stay in Terminal runtime UI rather than Settings.

Settings > Terminal is also the terminal-specific `/coverage` and `/reconciliation` landing zone for durable GUI preferences that are not owned by Tools or storage: `/theming`, `/remote/session` disclosure, and any future browser or remote terminal transport controls must reference the terminal SSOT rather than creating a new settings owner.

Settings > Terminal groups Appearance, `/layout` & Workspaces, Shell & Startup, Interaction, and Diagnostics. Interaction covers `/copy/paste`, copy-on-select, `/kill/quit` prompts, sticky-header command-block visibility, `/explanations`, performance-safe search, `/readability` signals, and `/tunable` `/quadrant` layout behavior.

Shortcut discovery is in-product and `/remappable`: it prioritizes true terminal operations over layout-management and other app-level actions, distinguishes terminal-owned shortcuts from `/TUI-owned` keys, and keeps search, next/previous match, scrollback paging, top/bottom jump, command-block navigation, font zoom, clear/reset, `/shortcuts/behaviors`, and copy/paste visible.

### 7.4A Agent Config Skills tab

Agent Config surfaces a Skills tab that mirrors the Skills owner contract. Skill rows show source/readiness and contextual badges, including `referenced_by_persona`, `auto_invokable`, `requires_missing_capability`, and `catalog_update_available`, without turning Settings into the skill-management owner.

### 7.5 Project and attention surfaces

`project_summary` is the reusable summary object for Orchestrator-facing project surfaces. It contains `activity_state`, `attention_state`, `health_state`, `owner`, and projection-trust disclosure so the operator can see whether a summary is record-backed, current, or degraded. Canonical blocked episodes take precedence over weaker derived warnings when summary rollups disagree.

`projects:v1` list metadata such as path, detected languages, last-opened timestamp, health status, and overrides is not enough for the Orchestrator `/concern/projection-trust` model; project summaries add explicit activity, attention, health, owner, and trust rollups.

Dashboard remains the `/urgency/entry` surface, Orchestrator owns operational depth, and Projects is the multi-project `/management` surface; project cards stay summary-first while exposing compact orchestrator `/attention/usage` pressure and one primary blocked owner `/reason`.

`project_attention_item` is the reusable attention-row object. Each row carries a primary route payload, projection-trust disclosure, blocked-owner kind, escalation level, and summary text. The same row contract is consumable in Orchestrator, Dashboard, and notification surfaces without re-minting attention identities.

Project-summary cards derived from stale or `/degraded` projections downgrade confidence without manufacturing a blocked state, and historical-only projects still keep a current `project_summary` row with neutral `historical_only` or `idle` activity rather than a warning color/state.

`project_summary` rows carry `project_id`, `activity_state` (`idle | active | background_active | historical_only`), `attention_state` (`none | advisory | attention_required | blocked`), `health_state` (`healthy | degraded | blocked`), optional `primary_owner_kind`, optional `primary_reason_code`, optional `primary_object_ref`, `active_run_count`, `blocked_run_count`, `attention_object_count`, `projection_trust_state`, `last_activity_at_utc`, and `historical_run_count`.

Project cards, `/title-bar` badges, and `/attention` surfaces share one status vocabulary with explicit precedence and rollup rules so background activity, blocked items, and unsaved shell state do not compete as unrelated badges.

Project status appears through the same precedence rules on title-bar badges, project cards, command-palette summaries, and attention-center rows.

Project surfaces preserve the distinction between registry identity, shell restore state, operational summary, and actionable attention objects.

`project_attention_item` rows carry `attention_item_id`, `project_id`, `severity` (`advisory | attention_required | blocked`), `owner_kind`, `reason_code`, `source_kind`, `source_object_ref`, `primary_route_payload`, optional `secondary_route_payload`, `projection_trust_state`, `created_at_utc`, `updated_at_utc`, `dismissibility_kind` (`none | quiet_only | dismissible`), and `active`; `quiet_only` never hides a canonical blocked condition.

GUI-facing redb projections use the `project_summary` and `project_attention_item` record families as the key pattern for per-project operational summary and per-project active attention items; `attention-item` archival/resolution behavior changes `active`, `dismissibility_kind`, and `/resolution` metadata instead of becoming ad hoc card state.

Project-attention routing is shared by attention-center rows, project cards, command palette actions, and search results, and every entry restores precise scope and target instead of inventing a surface-local "open the right place" rule.

Projects `/attention-center` docs and command `/deep-link` docs consume `project_attention_item.primary_route_payload` and keep future surface-specific copy subordinate to the shared project-attention routing contract.

Projection-derived attention items that are not canonical-runtime-backed show reduced trust explicitly and avoid overconfident imperative copy until the row revalidates against canonical runtime records.

Reusable summary cards split by density: `Run Summary`, `Seam Summary`, `Concern Summary`, `Account / Usage Pressure`, and `Recent Major Events` can appear across Orchestrator, Dashboard, and Projects, while operational `/dense` summaries stay primarily Orchestrator-facing.

### Concern, escalation, notification, and help surfaces

Concern and trust-state escalation share one conversational `/tooling` surface contract so chat, inspectors, and commands present the same status, route, and escalation semantics.

Cross-surface escalation uses one cadence model for banners, `/cards/toasts/badges`, and notification copy so severity, quieting, recurrence, and owner-route timing do not diverge by surface.


Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request. The visible concern contract carries `concern_id`, `project_id`, run refs, scope refs, evidence refs, source refs, lineage refs, severity, category, status, and governance metadata.

Concern actions carry actor authority, confirmation requirements, rationale requirements, reversibility, and audit fields. `acknowledged`, `dismissed`, `resolved`, and structural lineage edits remain distinct actions rather than aliases of a single close operation.

These surfaces share one escalation ladder across Orchestrator, Dashboard, thread badges, and notifications. `attention_required` remains distinct from `blocked`, and persistent blockers resurface on meaningful change or persistence even when advisory warnings are quieted.

`degraded-trust` is a projection-trust condition, not a separate local warning family. It routes through the shared concern and escalation ladder so provider/runtime/UI surfaces show the same trust degradation, concern escalation, blocked owner, and recovery route instead of inventing per-panel aliases.

This section consumes Glossary coverage for rewrite-critical objects, states, and trust terms, including Concern, blocked episode, focused run, projection trust, escalation ladder, blocked owner, and `resolution_kind`. Help is layered as inline help, context help, and canonical help-entry pages while keeping canonical term names stable.

Notifications route by severity, execution impact, blocked owner, persistence, and projection trust. Quiet windows are allowed for advisory warnings only; canonical blocked episodes are never suppressed by quiet windows.

Dedicated help entries use a stable template: canonical term, trigger conditions, operator meaning, related concepts, primary routes, and recovery guidance. Related-concept links always point to canonical term names rather than local aliases.

Project-facing help and notifications use project `activity_state`, project `attention_state`, the blocked-owner taxonomy, the shared escalation ladder, and resurfacing/aging rules. Dismissal requires dismissal rationale, resolution requires resolution rationale, and `accepted_risk` is treated as a resolution path rather than a dismissal.

The blocked-owner taxonomy is explicitly eight kinds: `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`. The five-level escalation ladder is `info`, `watch`, `attention_required`, `blocked`, and `escalated`, with mapping across Orchestrator banners, Dashboard summaries, thread badges, and notifications.

### Recommended minimum concern record shape

Compatibility labels such as system-notification, project-card, primary-reason, pressure-summary, and help-system normalize to this concern/escalation/help surface model: project cards expose blocked-owner and primary reason detail, pressure summaries use the account/usage pressure card vocabulary, system notifications are narrowed by the shared escalation ladder, and help-system entries stay anchored to canonical term pages.

- `concern_id`, `project_id`, `run_ref`, `scope_ref`, `source_event_ref`
- `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`
- `severity`, `category`, `status`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`
- `owner_kind`, `owner_ref`, `created_by_kind`, `created_by_ref`, `resolver_ref?`
- `governance`: authority policy, confirmation policy, rationale policy, audit refs

`blocking_effect` stays explicitly separate from `severity`; it explains operational stop/go impact rather than concern seriousness.

### Alert and Attention Lifecycle Contracts

If the only evidence is a plan-state or `/exceeded` signal, the GUI emits a soft warning and waits for a canonical exhausted or blocked state before presenting a hard block.

Command-originated and runtime-originated notifications use incident bundling when one failure creates a cascade. A cascade uses a `parent-incident` model: one primary alert owns the root cause, child issues attach as related consequences, and CTAs prioritize fixing the root cause before derivative failures. Child consequence CTAs may appear only after the root-cause CTA.

Historical alert timelines retain enough state to answer what alerted, where the user acted, and whether it cleared. The minimum timeline fields are `raised_at`, `source_surface`, `severity`, `root_cause_key`, `owning_surface`, `acknowledged/snoozed state`, `resolved_at`, and linked receipt/run/worktree/workflow/container/workload IDs. The same record preserves the compact route key `/run/worktree/workflow/container/workload` and keeps `/snoozed` as historical state rather than deleting it when the active notification leaves the surface.

Runtime/Kubernetes attention items are owned by Docker Manager first, with Dashboard and Orchestrator acting as mirrors or consumers. This includes unhealthy containers, restart loops, failed readiness, failed rollouts, and related Kubernetes failures even when no active Orchestrator run is open.

Runtime alert lifecycle defines `/auto-resolution`: an alert may auto-resolve on healthy refresh, downgrade to historical `/seen` after acknowledgment, and clear badges consistently across mirrored surfaces. Persistent non-blocking issues support `per-alert` `acknowledge`, `snooze`, and `/snooze/mute`; `mute by root_cause_key` is allowed only where safe. A mute or snooze must not suppress blocking confirmations or `security-sensitive` failures, and muted issues remain visible in owning surfaces while stopping repeated interruptions.

Condition-aging policy keeps unresolved conditions on operational surfaces, moves resolved conditions back to History, lets recently resolved major items linger in summaries, and uses policy-level defaults (normal resolved operational items about 15 minutes; major resolved items until dismissed or up to 24 hours) instead of per-alert micro-configuration.

Active attention rows render from `attention_key` plus `root_cause_key`: `attention_key` controls the visible thread/route, and `root_cause_key` controls `/coalescing`. Repeated sightings with the same root cause update the existing attention thread, while interruptive notification surfaces fire again only when severity or state changes.

Primary owner routing is fixed for common issue classes. Run-blocking issues open Orchestrator and its CTA stack; branch and workflow issues open GitHub Actions; runtime, `/container/rollout`, and Kubernetes issues open Docker Manager; global degraded infrastructure opens the status bar detail and Dashboard. Mirror surfaces show the same attention item as a deep link to the owner rather than offering a competing remediation flow.

Non-active project issues surface as compact global attention items with a project label. Selecting one switches or focuses the target project and owning surface via `/focus`, with active-project and background-project items visually distinct.

When mirrored surfaces disagree, each issue class declares freshness/authority order (`/authority`). Secondary surfaces with older data say `updating` or `state may be outdated` instead of presenting conflicting definitive copy.

Bulk action families include stage/unstage/discard (`/unstage/discard`), rerun/cancel, cleanup/prune (`/prune`), apply/delete, and pin/unpin. Before execution, every bulk action shows target preview plus scope summary/count (`/count`). Completion state represents result state, `partial-success`, and a `per-target` failure list; when possible, the action exposes rollback/undo expectations, and when rollback is unavailable the UI says so before execution. Bulk action history and `/exported` views preserve the same per-target result state and spawned attempt/remediation refs used by receipt/evidence records.

### 7.16 Chat Panel

The Chat Panel is the canonical threaded assistant workspace for Ask, Agent, Debug, Plan, and Deep Plan modes.

Layout:
- vertical split with **message stream** in the top 70% and **composer** in the bottom 30%
- optional collapsible **Plan panel** appears as a side panel within the chat surface when the thread is in Plan or Deep Plan mode
- header remains sticky while the message stream scrolls independently

#### 7.16.1 Thread header and message stream

Chat context and message detail requirements:
- The chat-header context indicator is the GUI entrypoint for thread context state. Hover opens the lightweight usage/status module, `More Details` focuses or opens the thread-scoped context-detail editor tab, and click may reveal `Compact Now` without dispatching compaction until the user chooses that action.
- The context-detail tab is keyed by thread and live-updates as thread data changes. Its top-level header summary is followed by a top-level view toggle with `Curated` and `Raw`; `Curated` contains Overview, Breakdown, and Messages, while Raw exposes serialized payloads and provider/runtime debugging data through the shared Contracts and Usage rules.
- Message rows expose an under-message icon row for copy, message actions, and message-level info-popover access. The info-popover consumes the closed field and label rules from Assistant Chat and Contracts, including runtime identity fields for provider, model, persona, account, requested/effective state, and `/model/persona/account` inspector disclosure where material.


#### 7.16.1A Thread header and message stream live contract

Thread header content:
- editable thread title
- mode badge
- persona indicator
- model indicator
- token-count summary
- quick actions for thread search, rename, duplicate, archive, and thread settings

Message stream requirements:
- scrollable virtualized list of user, assistant, system, tool, approval, and activity message blocks aligned with the taxonomy in `Plans/assistant-chat-design.md`
- stable message identity so streaming updates mutate existing rows rather than replacing the full list
- inline `activity-card` rendering for tool calls, file operations, subagent activity, approvals, run-state transitions, and linked artifacts; compact activity cards show 5 lines, expanded cards show 15 lines, and expanded log/detail views cap at 50 lines before routing to the owning surface
- sticky unread marker, `New messages below`, and a `jump-to-latest` badge when the user is scrolled away from the bottom; `/auto-follow` state controls whether streaming output follows the latest row

#### 7.16.2 Composer, commands, and plan mode affordances

Composer requirements:
- multiline text input
- mode selector exposing at minimum `Steer` and `Queue`
- attachment button
- send / stop button
- visible disabled-state explanation when sending is unavailable

Plan-mode affordances:
- collapsible Plan panel showing the current plan, live TODO tracker, plan steps, status, and linked artifacts
- plan panel supports focusing the active step and jumping to linked documents or evidence
- when not in a planning mode, the plan panel stays hidden rather than showing an empty placeholder
- provider settings layout stays OUT of this GUI widget contract while provider-runtime docs remain provisional; this document owns UI widget contracts and must not encode provider routing or configuration internals

Composer queue rules:
- queued messages are FIFO with max 2 entries, transient, and not restart-persisted
- queue item states are `pending | in_progress | completed | blocked | skipped`; `superseded` is plan-level only and not a queue item state

Commands and approvals:
- slash commands, mode switches, and tool approvals remain routed through the canonical chat/runtime command catalog
- the visible slash palette mirrors the final reserved slash set, including bare `/web` help/autocomplete, `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, `/web map`, `/skill`, and the deprecated `/cancel` alias
- tool approval dialogs launched from Chat must preserve thread context and return focus to the composer after completion
- chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console; they link to those shell surfaces instead

### 7.17 File Manager Panel

The File Manager Panel is the persistent project-tree side panel and defers detailed tree, drag-and-drop, and open-file behavior to `Plans/FileManager.md`.

Required behavior summary:
- project tree with local filter, expand/collapse persistence, and current-file reveal
- click-to-open and context-menu actions route through canonical open-file and file-tree action contracts
- external drag-and-drop, ignored-file visibility rules, and detached-panel behavior remain aligned with `Plans/FileManager.md`
- File Manager owns tree navigation and file discovery, but not semantic search, diff-local search, or runtime artifact browsing
- The panel header carries the active repo/worktree chip plus a local tree-search field. If the current file is hidden by `/hidden` or `/ignored` filters, the GUI must disclose that state instead of silently failing reveal; Git status badges in rows stay read-only, while stronger repo/worktree state remains in the compact strip or Source Control. This row-level behavior is cross-checkable with `Plans/FileManager.md`, `Plans/GitHub_Integration.md`, and this GUI owner.
- Tree-level actions include `New file`, `New folder`, `Rename`, `Delete`, Copy full path, Copy relative path, Add to Assistant Chat, Open With, Download / Save Local Copy, and `/Cut/Paste` for workspace nodes. `cmd.file` / `cmd.file.*` is the command-family for workspace-node actions, and missing actions must not remain anonymous context-menu-only behavior; terminal reveal actions stay in the terminal family, with `Open in Terminal` using `cmd.terminal.open` and `Show Terminal` using `cmd.terminal.show`.
- Workspace-node clipboard is a dedicated file-operation model: paste and `/drop` reuse one path-validation plus conflict-resolution engine, cut-pending state remains visibly armed until paste or clear, and successful paste uses the same progress and toast feedback as drag/drop instead of a second feedback path.
- File-manager operational GUI coverage remains MVP and implementation-ready for `/file-manager/remote/review/runtime` seams: `/delete/duplicate/bulk`, `/refresh/conflicts`, generated-vs-workspace-file identity, `/open/save/export`, `/hiding`, `/test/share`, `/ignored-file` behavior, `/browser/terminal/artifacts` reveal/reuse rules, chat-thread diff exposure, multi-surface routing, exact-session terminal reveal, and project-driven orchestration-native feature-fleshing. These are PM-native obligations, not competitor-derived features to add blindly.
- Known GUI ownership references are explicit: `§7.16` Chat, `§7.18` File Editor, `§7.20` Bottom Panel / Browser / Problems / Debug / Ports, `§7.4.2` Settings > LSP, `§7.4.5` Settings > SSH, and `§7.4.6` Settings > Debug. Remote-LSP GUI projections consume host-aware owner contracts such as `(server_id, root)` only as display context until the LSP owner provides the stronger root identity.

### 7.18 File Editor

The File Editor is the canonical in-app code and document editing surface.

Required behavior summary:
- tabbed editor groups with shared buffers, diff view, preview modes, and detach / re-dock support
- LSP-backed diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, and go-to-definition
- SSH remote editing, stale-write disclosure, and recoverable unsaved local buffer persistence
- embedded rendering for markdown, mermaid, HTML, SVG, and image documents through the shared preview pipeline
- Preview/browser/file-type GUI seams include Mermaid, Markdown, HTML, SVG, image, and media preview; source-canonical preview/edit bridge; linked-asset reload; multi-preview ownership; trust tiers; sandboxing; `runtime_unavailable`; capture/mutation boundaries; and generated-vs-workspace-file open, `/save/export`, and promotion paths. Browser hosting is editor-tab-first, while File Manager search remains a `/file-manager` filtering/location surface and symbol search exposes LSP-backed versus text `/index-backed` behavior plus visible `/indexing-state`, `/offline/stale-state`, `/framework/build/preset`, and project-driven capability state.
- Embedded editor surfaces are leaf editing/rendering surfaces, not owners of workspace truth. DOM/browser-coupled, browser-specific, browser-runner, service-worker, query-string, localStorage, `/browser-coupled`, `/shared-doc`, `/render-root`, `/selection/IME/paste/shadow-root/Firefox`, `/auth/input`, `/version`, IDs, edge-case, collaboration-oriented, generated-vs-workspace, and `/reveal` assumptions must not shape the canonical Slint/Rust architecture even when they enable demos elsewhere.
- local-operational and `/native-style` references are implementation inputs for explicit PM workbench seams, not authorities that replace PM-owned workspace identity, file-manager operations, diff/review, preview/browser lifecycle, remote/SSH, or terminal/runtime ownership across the shell.
- Implementation-reference learning preserves breadth without inheriting shortcuts: `bench-05` informs breadth-of-file-operations, CRUD, `/archive/upload/preview/edit/search`, and security-hardening; `bench-28` informs control-plane, reverse-proxy, SSH bootstrap, URI/workspace binding, launch-time environment setup, and delegated IDE backend seams. PM remains a native `/workbench` with explicit service boundaries for `/file-tree/diff/LSP/terminal`, not a server-heavy/server-rooted file app or a thin control plane over another IDE.
- External workspace/editor product lessons are constraints, not feature cargo cult. AI-native `/workspace-agent` UIs validate visible plans, task state, artifacts, provider/model transparency, multi-surface orchestration across editor, terminal, browser, docs, and review, and persistent `/rules/skills`; PM must still guard against opaque agents, fragile diff/review apply flows, session-loss or compaction surprises, autonomy defaults users cannot inspect, and `/auth/reconnect` brittleness. Full IDE and `/workbench` references validate modular workspace models, cached file-type/framework detection, `/tab/window` persistence, reusable diff/viewer pipelines instead of one-off UIs, and explicit degraded/indexing states; collaborative `/online` editors are references only, not authorities for PM state or durability.
- The same external lessons remain negative constraints: no hanging agents, no hidden indexing/startup cost, no clutter and split/focus complexity, and no coordination regressions across large service graphs. Thin wrapper or small embeddable editor references may inform host integration, but they are poor direct product models whenever robust diff/merge, accessibility depth, resize/container reliability, large-file behavior, or advanced host/runtime integration matters.
- Shell/editor architecture keeps explicit document/resource identity, `/history/session-state`, event-driven file dialogs and reveal/open adapters, long-lived terminal/runtime sessions, and first-class search persistence. Electron `/extension-host`, extension-compatibility, IPC, CLI-wrapper, collaboration-first, component-level editor libraries, heavy-refresh, external-change, `/search/remote/shell`, remote bootstrap, and OS integration fragility are caution signals, not GUI ownership models.
- Rust + Slint implementation keeps workspace services, buffers, diff, indexing, remote/session state, persistence, AI orchestration, and durable AI task/artifact records in Rust-owned core services; Slint owns pane layout, tree/list/status surfaces, workbench `/pane/review/task` chrome, and cross-platform shell behavior rather than text `/render` logic, and specialized renderers stay bounded to preview surfaces. Cross-platform-safe IDE acceptance covers `/LSP/remote/auth` degradation, `/clipboard/session` behavior, `/rendering/DPI`, IME/input, path/symlink semantics, file watching/refresh, drag/drop, and macOS, Linux, Windows, and WSL portability.
- Browser/session fallback language must stay aligned with `FinalGUISpec.md:1539-1555`, `FileManager.md:391-415`, and `Section15_MVP_Promoted_Features_Spec.md:758`: browser hosting is `/editor-tab-first`, detached-window-capable, and bottom-panel-adjacent only. `runtime_unavailable` and degraded browser capability messaging replace `/screenshot` substitution as a pseudo-browser.
- Workspace-backed preview/browser flows preserve logical subject identity instead of retargeting to an over-cap or `/LRU` slot. `Open` on HTML stays source/editor mode, `Open in Browser` creates or opens `workspace_preview`, `Open in Detached Browser` creates or opens `detached_preview`, and split browser layout is layout state after open. Click-to-context, `/capture`, screenshots, share-with-agent, takeover, promotion, reopen, `/retry/keep-closed`, DevTools-adjacent panes, and source-mutation privilege route through canonical browser/session commands keyed by `browser_session_id`.
- Legacy `preview_mode` and `browser_panel` labels are compatibility aliases only. Command and storage routing use `cmd.browser.*` entries such as `cmd.browser.open_workspace_preview`, `cmd.browser.open_detached_preview`, and `cmd.browser.focus_browser_tab`, with `workspace_preview`, `detached_preview`, `preview_subject_id`, `browser_session_id`, and `normal_browsing` as the canonical session vocabulary; `Bottom Panel Browser`, generic `Browser tab`, bottom-panel-primary, and normal-browsing wording are not canonical owners for built-in browser or click-to-context flows.
- Diff/review GUI feedback remains explicit: files-touched strips, inline operation-card previews, click-to-open, Source Control `/compare`, docked versus detached review surfaces, hunk-action UI, conflict-review UI, scrollbar heat-map/change-marker rendering, dirty/reverted/conflicted/staged feedback, `/revert` history, and chat card mapping into editor or Source Control surfaces are required GUI contracts, not still-missing follow-up notes.
- The editor-engine and early search reference lessons are constrained: `bench-13` supports async project search plus command discoverability, `bench-04` warns against blurred file-tree responsibilities, and embed-first editor-engine `/mini-editors` trade host flexibility for `/caret`, IME, accessibility, diff/merge, and robust runtime integration. Cross-target learning favors PM's rich shared-buffer, multi-surface workbench rather than overfitting to tiny embeddable wrappers.
- The master seam inventory is MVP and implementation-ready, never `/optional/future`: shell-wide routing for editor, browser, terminal, artifacts, side panels, bottom-panel-adjacent surfaces, `OpenFile`, `OpenSubject`, route_target, browser sessions, terminal sessions, artifacts, generated documents, reuse/split/detach behavior, structure-aware editing, IME/input correctness, and cross-surface clipboard/copy-paste must be represented as GUI behavior.

#### 7.18.1 Inline Note Mode

Inline Note Mode enables targeted feedback and annotation inside the editor.

Activation:
- user selects code in the editor
- `Add Note` appears in the context menu for the selection
- source-backed document selections expose the `Annotations` Menu through pointer context-menu and keyboard `Shift+F10`
- read-only `/no-source-map` and `/internal` preview renders may expose `Send selection to chat`, but durable annotation actions stay disabled unless stable semantic anchor IDs are available
- `Send selection to chat` creates a visible `pre-send` removable context chip `/pill` in the owning `chat-input-area`, above the textarea `/composer` shell and below any queued intervention block; the chip shows doc name `/path`, bounded excerpt, `/provenance`, and a removal affordance before send. When a document pane belongs to Interview, Assistant, or `document-viewer` chat, the UI makes the target chat obvious; if ambiguous, the action opens a small target picker instead of silently routing elsewhere, and the default is the page-owned chat panel, opening or pulsing that panel when hidden.

Note creation:
- captures selection range
- captures `selected_text`
- captures note text
- optional category: `bug`, `improvement`, `question`, or `style`

Display and persistence:
- inline annotation markers appear in the editor gutter
- hover reveals note content and status
- notes persist via `note_record.v1:{bundle_id}:{note_id}` and remain linkable from bundle review surfaces
- the annotation drawer/list announces per-annotation status changes through a `/live-region`
- user-facing status labels map to `addressed`, `still_open`, and `cannot_apply` without hiding the underlying annotation id
- v1 plan-graph, generic read-only, and other no-source-map previews are `send-to-chat-only` for selections unless they define stable anchor IDs

Reusable annotation UI components:
- `AnnotationActionMenu` is the shared inline context menu / floating palette for selection-scoped actions; it must preserve existing editor and chat clipboard semantics, expose a keyboard-only path, and follow the custom context menu contract where Slint has `no built-in context menu`.
- `AnnotationDrawer` is the shared right-side `/drawer` or right binder-rail surface for annotation management, status, review summaries, and validation banners; final-review gating copy must say no open annotations, not no open notes.
- `ContextChipStrip` is the shared chip strip for ephemeral `send-to-chat` context in the owned chat panel composer; it must stay separate from durable annotations and avoid unreadable clutter in compact layouts.
- Assistant Deep Plan, Wizard requirements/PRD review, Interview embedded document pane, and document viewer review surfaces should reuse these components and shared inline annotation decorators instead of per-surface bespoke implementations.
- Native document preview/review imports the annotation grammar but not a `browser-gated` review workflow; durable `targeted-revision` notes and separate `send-to-chat` context actions both remain available.

### 7.19 Agent Activity

The Agent Activity surface is the canonical inspection view for delegated work, investigations, bundle review progress, and embedded review documents.

Required behavior summary:
- active and historical child-run / subagent activity list with status, owning thread, target, and outcome
- clear distinction between running, queued, blocked, remediation, and completed activity
- direct links to related chat messages, artifacts, investigation records, and review bundles

### 7.19A Dedicated log and audit inspector

PM ships two complementary audit surfaces: lightweight in-thread transparency and a dedicated searchable log/audit inspector. Summary rows use a 5-item compact format: operation label, short query or `/url/task` preview, success/failure status, fallback note when present, and source/page counts when present. Full payload dereference is on-demand only; the inspector does not eagerly expand large refs or blobs. Supported interactions include `/filter/drill-down`, filter by event family, search by tool or `/operation`, time-range queries, drill-down, and export. `logsearch` and `logread` have explicit GUI surfacing rather than remaining CLI-only affordances.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md


PM ships two complementary audit surfaces: lightweight in-thread transparency and a dedicated searchable log/audit inspector.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Inspector requirements:
- summary rows use a 5-item compact format: operation label, short query/url/task preview, success/failure status, fallback note when present, and source/page counts when present
- full payload dereference is on-demand only; the inspector does not eagerly expand large refs or blobs
- supported interactions include filter by event family, search by tool or operation, time-range queries, drill-down, and export
- `logsearch` and `logread` have explicit GUI surfacing rather than remaining CLI-only affordances

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

#### 7.19.1 Embedded document pane


The embedded document pane is a shared-buffer review/document surface used by Interview, Builder, and bundle-review workflows.

Rules:
- document selection, scroll position, active review stage, and approval state persist through `document_pane_state:v1:{project_id}:{page_context}`
- the pane shares source-of-truth buffers with File Editor rather than maintaining divergent document copies
- findings summaries and approval gates render adjacent to the document, not inside unrelated chat-local controls

#### 7.19.2 Bundle controls and review gate


Bundle Controls govern revision loops and approval readiness for reviewed document/file bundles.

Required behavior:
- `Resubmit` in bundle review sends all unresolved notes as revision context
- final approval is blocked until every note is resolved, responded to, or dismissed
- bundle status progression is `draft -> in_review -> all_notes_resolved -> approved -> merged`
- bundle-level persistence uses `bundle_registry.v1:{project_id}:{bundle_id}` with linked `note_record.v1:*` entries

### 7.20 Bottom runtime zone

The bottom runtime zone is the canonical host for Terminal, Problems, Output, Debug Console, Ports, and linked runtime-adjacent panes.

Required behavior summary:
- tabbed runtime panes with stable identity and restore behavior
- terminal/browser/editor integrations reveal the owning pane rather than minting parallel per-feature consoles
- linked dev-session state, historical/live badges, and recovery outcomes stay visible across pane switches

#### 7.20.1 Terminal and browser tab management

Terminal sections, terminal tabs, browser tabs, and detached previews remain identity-stable across docking, focus changes, and restart recovery.

Rules:
- runtime tabs persist selection, order, labels, and pin state
- browser and preview tabs route through canonical browser-session identities and never silently migrate ownership to chat
- hot reload, output routing, and preview refresh status appear in the owning runtime or preview pane

#### 7.20.2 Debug, Problems, Output, and Ports

The runtime zone must provide:
- **Problems:** aggregated diagnostics, file links, and source ownership disclosure
- **Output:** task/build/dev output streams with source tags and search within stream
- **Debug Console:** adapter and evaluation output for the active debug session
- **Ports:** detected ports, local/remote accessibility, open-in-browser actions, and hot-reload controls

`Run & Debug` side-panel actions reveal and focus these bottom-panel panes rather than creating duplicate runtime records.

## 8. Widget Catalog

Section 8 defines the **atomic** widget catalog used to compose pages and panels. Detailed widget references align with `Plans/WIDGETS_VISUAL_REFERENCE.md` and `Plans/WIDGETS_QUICK_REFERENCE.md`.

### 8.1 SelectableText contract

`SelectableText` is the canonical non-editable text primitive for logs, code snippets, labels with copy support, and read-only structured values.

Rules:
- supports mouse and keyboard text selection
- supports copy without converting the field into an editable input
- participates in the shared context-menu and clipboard contract defined in §10.9
- must preserve stable layout when content updates incrementally

### 8.2 Widget categories

Major widget families:
- **Layout:** SplitPane, TabGroup, Panel
- **Input:** TextInput, Dropdown, Toggle, Slider
- **Display:** Tree, List, Table, Card
- **Feedback:** Toast, Dialog, ProgressBar, Badge
- **Navigation:** Breadcrumb, SideNav, CommandPalette

Catalog rules:
- atomic widgets define behavior, focus, and theme-token usage once and are reused across all surfaces
- page widgets in `Plans/Widget_System.md` are composed from this catalog and are not a substitute for the atomic widget list here
- widgets must expose accessible labels, stable identity, and deterministic fallback states

## 9. State Management

State management follows a reactive state tree with observable projections consumed by Slint models and shell surfaces.

### 9.1 State architecture

- canonical runtime and durable state live in Rust-owned records/projections
- Slint surfaces subscribe to observable projections rather than polling
- UI models update through batched `invoke_from_event_loop` mutations

### 9.2 State categories

- **UI state:** ephemeral, not persisted; hover, local selection, transient panel expansion
- **Session state:** persisted per session/thread/workspace tab
- **Project state:** persisted per project and shared across reopened sessions for that project
- **Global state:** user preferences and cross-project durable defaults

### 9.3 State flow

Canonical flow:
`User action -> Command -> State mutation -> UI update`

Rules:
- commands are the mutation boundary
- mutations write to canonical projections first
- UI updates render from the new projection state rather than optimistic ad hoc local rewrites unless explicitly marked pending

### 9.4 Conflict resolution

- last-write-wins for UI state
- merge strategy for project state when multiple durable sources contribute
- requested vs effective runtime values must remain separately inspectable

### 9.5 Persistence boundaries

- ephemeral state may be discarded on restart unless explicitly promoted
- persisted state must have stable keys and versioned migrations
- migration reads from deprecated keys are allowed only during forward migration and must rewrite to the canonical family
- Shell persistence keeps `/floating`, `/document`, `/chat/editor`, workspace-tab identity, per-project `project_state`, per-surface `source_control.project_state.{project_id}`, and `/file-tree/chat` restore state in narrow project shell records, not in canonical blocked or `/attention` truth.
- `FinalGUISpec.md` treats `widget_layout:v1:orchestrator:progress` as a `Progress` layout key layered from `app-global` defaults plus `project-scoped` overrides under `project_state:v1:{project_id}`; it is not a page-global record and `widget_layout` entries must name `project_id` when they depend on project state.
- Per-surface state may persist `line`, `range`, `active_subview`, compare target, panel layout, browser tab state, and widget layout only as view state; it must not replace canonical route identity.
- FileManager restore and handoff state preserves `repo_id`, `worktree_id`, identity-backed `/history/checkpoint` references, and backend-driven restore pipelines rather than treating path opens as the only canonical document identity.

### 9.6 Context management

Context management combines thread context, Investigation Context, editor/file references, and review/document references without hiding provenance.

Rules:
- each context block has stable identity and owner surface
- context usage counters and token summaries derive from canonical usage/state projections
- pruning, compaction, and restoration rules must disclose what was removed, summarized, or rehydrated

### 9.7 Agent-Config instruction projections

The Agent-Config surface must show a canonical instruction editor for PM-owned instruction source plus a per-target rendered preview for each provider-native projection target.

The now-locked Agent-Config `/provider` model is the visible provider/model/account/instruction management surface. Settings and `/inspector` language must name Agent-Config, persistent Effective Runtime inspectors, provider entries, account/profile rows, instruction projections, and skill/MCP status rather than generic provider settings.

Per-target control state is closed to:
- `controlled`
- `manual_override`
- `projection_failed`

Rules:
- `controlled` means PM owns semantic sync for that target and regenerates provider-native projection text from the canonical instruction editor.
- `manual_override` means the target has been detached by the user; the GUI must show that semantic sync is broken for that target only.
- `projection_failed` means PM could not generate or write the target projection and must expose repair/retry actions without pretending the target is current.

The visible label for `manual_override` is Manual Override. Direct edits to a PM-controlled provider-native projection target require switching only that target to Manual Override first; otherwise the GUI treats the edit as a canonical-source change and regenerates provider projections.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Skills_System.md

## 10. UX Patterns

Section 10 defines reusable interaction patterns across pages, panels, dialogs, and editor/runtime surfaces.

### 10.1 Confirmation dialogs

Destructive or irreversible actions require confirmation with explicit consequence copy, especially for delete, reset, merge, publish, repository creation, and credential removal flows.

Every action surface classifies confirmation level as `none`, `light`, `strong`, or `hard_gate` and separately records reversibility, so navigation-only affordances, low-risk state changes, destructive mutations, and runtime-blocked recovery gates do not share one generic confirmation dialog.

The `light` confirmation level covers `moderate-impact` actions where accidental activation is plausible and a short confirm or inline affordance is enough.

Concern actions map acknowledgement and `/dismiss` to `light` or `strong` confirmation according to severity and `/blocking` effect, while merge and `/split` always use `strong` because they alter structural lineage.

Scoped-identity runtime families remain object-first and resolver-backed: GUI routes carry the owning object plus scope, while `Contracts_V0.md` owns the scoped-identity resolver rules and prevents family-specific top-level route fields.

### 10.2 Undo

Support `Ctrl+Z` / `Cmd+Z` where the owning surface allows reversible edits, including file operations that can be safely reverted, text editing, and message editing. Git-native history actions and external side effects are not mislabeled as editor undo.

Git/source-control discard/compare/stage actions are not editor undo. Restore points, rollback, and revert-last-agent-edit stay explicit restore-history commands, and the GUI must not bury them behind git-panel affordances. The File Editor must expose diff heat-map/change-marker and scrollbar change-marker state as compare/review feedback while keeping the revert operation routed to the owning Source Control or FileSafe command.

### 10.3 Loading states

- skeleton screens for panel/page loads
- inline spinners or progress indicators for discrete actions
- keep prior validated content visible with stale/degraded labels when a refresh is in progress

### 10.4 Error display

- inline errors for field validation
- toast notifications for transient non-blocking failures
- blocking dialogs for failures that prevent forward progress or risk destructive ambiguity

### 10.5 Empty states

Empty panels must show helpful onboarding content, clear next actions, and contextual shortcuts instead of blank chrome.

### 10.6 Blocked and recovery surfaces

Blocked state, retry, remediation, and recovery affordances must use the canonical blocked/recovery contract and stay visually distinct from ordinary paused or idle states.

### 10.7 Event-driven refresh rule

Event-driven updates are canonical. UI state refresh happens on relevant runtime, filesystem, or provider events rather than generic timers.

Exception:
- polling is acceptable for external systems that do not provide push updates, such as GitHub Actions status checks; those intervals are freshness aids only and must not become the correctness model for the rest of the shell

### 10.8 Human-in-the-loop approvals

Sensitive operations requiring approval must present:
- explicit action summary
- affected resources
- approval / deny actions
- audit trail link back to the originating thread, run, or bundle

Approval surfaces must preserve context and never auto-approve hidden follow-up side effects.

### 10.9 Context menus and clipboard

Context menus are the canonical discoverability surface for copy, paste, Add Note, file actions, and selection-scoped operations.

Copy, paste, share, and export actions must keep their payload families separate even when the user-visible labels look similar. Text clipboard, file-operation clipboard, chat context insertion, OS export, `/download`, remote-host transfer, and `/paste/share` flows carry different permissions, undo models, remote availability, and confirmation copy.

#### 10.9.1 Copy path and copy value


Non-text path/value copy actions must copy the exact underlying value via the shared clipboard helper and must not depend on text rendering quirks.

#### 10.9.2 Text selection and read-only copy

Read-only text, code blocks, logs, and labels must remain selectable and copyable without entering edit mode.

#### 10.9.3 Clipboard safety and feedback

Clipboard actions should provide lightweight success feedback for non-obvious values and must never copy redacted or hidden-secret placeholders as though they were the real value.

### 10.10 LSP-informed affordances

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope; `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` requires `path` + `position` + `newName` with approval gating.
- LSP GUI consumers preserve the nine `read-op` set by long-name and short-name aliases only as display/compatibility labels; canonical operations remain owner names, `diagnostics` is context/panel data, and `rename` is approval-gated.

Fields:
- operation
- query
- path
- position
- newName
- status

Labels and values:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- rename

Rules:
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
### 10.11 Loading-to-live transitions


When moving from placeholder to real data, preserve layout footprint and focus so the interface does not jump unexpectedly.

### 10.12 Detached-surface continuity

Detached panels and windows must preserve identity, selection, and keyboard focus expectations when re-docked.

### 10.13 Sound effects

Optional sound effects may reinforce key workflow events such as approvals required, run completion, or error escalation, but they must remain user-controllable, accessible, and never the sole carrier of important information.

## 11. Anti-Flickering and Scroll Preservation

### 11.1 Core Principle

The GUI must never visually "jump" or "flicker" when background data updates arrive. Users must not lose their scroll position or see layout shifts during normal operation.

### 11.2 Strategies

**Scroll position preservation:**
- When new items are added to a `VecModel` (e.g., chat messages, log lists, evidence lists, or bounded terminal transcript projections), preserve the current scroll position unless the user is scrolled to the bottom
- If scrolled to bottom: auto-scroll to show new content
- If scrolled up (reviewing history): hold position; show a "New messages below" indicator
- Implementation: Track `viewport-y` property on `ListView`; only update if at bottom threshold

**Batch UI updates:**
- When multiple properties change simultaneously (e.g., orchestrator status + progress + transcript projection updates), batch them into a single `invoke_from_event_loop` call to prevent partial renders
- Example: Do NOT call `invoke_from_event_loop` three times for three properties; collect changes, then apply all in one call

**Stable list keys:**
- Each item in a `VecModel` has a stable ID (not just an index) so that Slint can reconcile updates without destroying and recreating all items
- When updating a list item, modify the existing model entry rather than clearing and rebuilding the entire model

**Avoid full-model replacement:**
- Never call `VecModel::clear()` + re-add all items when only one item changed
- Use `VecModel::set_row_data()` for individual item updates
- Use `VecModel::push()` / `VecModel::remove()` for additions/removals

**Layout stability:**
- Fixed-size containers for status badges, progress bars, and other indicators so they do not cause layout shifts when values change
- Reserve space for optional elements (error messages, loading indicators) even when not visible, or use animation to smoothly reveal them

**Debounce layout persistence:**
- When the user resizes panels or rearranges cards, debounce the redb write (300-500ms) to avoid disk thrashing and potential UI stutter

### 11.3 Terminal-Specific Anti-Flickering

- Live terminal rendering follows the Section 15 terminal-core architecture: terminal output is a high-frequency mutable grid, DOM/React/webview-style document-UI terminal cores are non-ship, and the core centers native screen/buffer state, diff-based painting, and off-UI-thread PTY/buffer ingestion and processing.
- Bounded terminal transcript or plain-log projections may expose a visible row window in `VecModel`/`ListView`, but those projections are derived views rather than the live terminal core.
- When output arrives rapidly, throttle GUI projection updates to max 30fps and batch rows arriving within 33ms; PTY/buffer ingestion and diff computation remain off the UI thread.
- Ring buffers stay in Rust; the GUI holds only the visible transcript or plain-log projection window.
- high-volume terminal output uses ring-buffer backed `/virtualized` projections so 4-split terminal panes keep layout ratios stable while the live core remains off the UI thread.

---

## 12. Responsive Design

### 12.1 Breakpoints

| Window Width | Layout Adaptation |
|-------------|-------------------|
| >= 1360px | **Full layout:** All panels visible at comfortable widths |
| 1080-1359px | **Compact:** Side panel at minimum (240px); bottom panel compact |
| 720-1079px | **Collapsed:** Side panel auto-collapses to 48px icon tab; bottom panel collapses to header row (24px) |
| < 720px | **Single-column:** Activity bar only; panels accessible as overlays/drawers from activity bar icons |

At narrow widths where panels become `/overlays` or drawers, `AnnotationDrawer`, `AnnotationActionMenu`, and `ContextChipStrip` collapse into overlay/drawer patterns without hiding keyboard access or breaking `keyboard-shortcut` expectations.

### 12.2 Side Panel Responsive Widths


| Panel Width | Adaptation |
|------------|------------|
| 480px+ | Full layout with all controls |
| 360-479px | Mode tabs use abbreviated text; footer collapses platform/model to icons |
| 280-359px | Mode tabs show icons only (tooltip on hover); footer shows only context % |
| 240px (minimum) | Mode icons, messages, input only; all extras behind overflow menu |

### 12.3 Dashboard Grid Responsive

| Window Width | Grid Columns |
|-------------|-------------|
| < 1200px | 2 columns |
| 1200-1600px | 3 columns |
| > 1600px | 4 columns |

### 12.4 Activity Bar Responsive

Activity bar remains at 48px at all breakpoints. At < 720px, it becomes the primary navigation mechanism, with panels opening as overlay drawers.

The shared `/binder` and document-review surfaces use the same responsive rule: left binder rail owns document switching/status, right binder rail or drawer owns annotation management, selection actions stay in the inline `AnnotationActionMenu`, ephemeral send-to-chat state stays in `ContextChipStrip`, and chat itself remains a separate panel rather than embedded inside the binder review surface.

The concept lineage from `Concepts/PuppetMasterDashComp.html` (`/PuppetMasterDashComp.html`) narrows the binder placement without making the concept file a live owner. Wizard review uses a binder-style layout: the left document list `/sidebar` contains `wizard-doc-pill`, the central document content area is `wizard-binder-view`, and the top binder toolbar is `wizard-binder-toolbar`. Annotation UI belongs in a right-side drawer, `/rail`, or overlay inside binder content, not in the left document rail and not in a browser-style `annotation-review` modal. Chat remains the separate `#chatPanel` / `chatPanel` side panel with its own thread list, composer, `queued-intervention` strip, footer, and context-usage display; `send-to-chat` chips live in that chat composer through `ContextChipStrip`.

---

## 13. Accessibility

### 13.1 Basic Theme as Accessibility Option

The Basic theme is the primary accessibility-friendly option:
- No decorative effects (pixel grid, paper texture, scanlines)
- WCAG AA compliant color palette (4.5:1 minimum contrast for all text)
- System fonts designed for screen readability
- Minimum 14px body text, 1.6 line height, 0.02em letter spacing
- 4px border radius (less visually harsh)
- No hard shadows
- Respects `prefers-reduced-motion` (no animations or transitions)

### 13.2 Focus Indicators


All themes must show visible focus indicators:
- **Retro Dark/Light:** ACID_LIME 2px border on focus
- **Basic:** High-contrast 2px ring with 2px offset in accent-blue

### 13.3 Keyboard Navigation

- All interactive elements reachable via Tab navigation
- Focus order follows visual layout: Activity bar -> primary content -> side panel -> bottom panel -> status bar
- Every list, table, and tree supports: Up/Down arrow navigation, Enter to select/activate, Escape to deselect/go back, Home/End to jump to first/last item
- Type-ahead filtering where appropriate (thread list, project list, file tree)

### 13.4 Screen Reader Support

Slint's screen reader support is limited. Mitigations:
- Set `accessible-role` and `accessible-label` properties on all interactive components where available in Slint 1.15.1
- Panel state (docked/floating) announced via accessible labels
- Theme name available to assistive technology
- Keyboard shortcuts prominently documented and discoverable via command palette

### 13.5 Minimum Touch/Click Targets

All clickable/draggable controls must be at least 24px in height/width for reliable interaction.

---

## 14. Slint File Organization

### 14.1 Directory Structure

```
puppet-master-rs/
+-- build.rs                          # slint_build::compile("ui/app.slint")
+-- ui/                               # All .slint files
|   +-- app.slint                     # Root component, imports all views
|   +-- theme.slint                   # Theme global + token definitions
|   +-- widgets/                      # Reusable .slint widgets
|   |   +-- panel_card.slint
|   |   +-- status_badge.slint
|   |   +-- styled_button.slint
|   |   +-- styled_input.slint
|   |   +-- combo_box.slint
|   |   +-- progress_bar.slint
|   |   +-- terminal_output.slint
|   |   +-- toast.slint
|   |   +-- modal.slint
|   |   +-- pixel_grid_overlay.slint
|   |   +-- paper_texture.slint
|   |   +-- context_menu.slint
|   |   +-- selectable_text.slint
|   |   +-- activity_bar.slint
|   |   +-- status_bar.slint
|   |   +-- breadcrumb.slint
|   |   +-- command_palette.slint
|   |   +-- budget_donut.slint
|   |   +-- usage_chart.slint
|   |   +-- step_circle.slint
|   |   +-- icon.slint
|   |   +-- help_tooltip.slint
|   |   +-- interview_panel.slint
|   +-- views/                        # Page-level views
|   |   +-- dashboard.slint
|   |   +-- settings.slint            # Unified (old config + settings + login + doctor)
|   |   +-- wizard.slint
|   |   +-- interview.slint
|   |   +-- nodes.slint
|   |   +-- evidence.slint
|   |   +-- evidence_detail.slint
|   |   +-- metrics.slint
|   |   +-- history.slint
|   |   +-- memory.slint
|   |   +-- ledger.slint
|   |   +-- coverage.slint
|   |   +-- projects.slint
|   |   +-- setup.slint
|   |   +-- usage.slint               # NEW
|   |   +-- file_editor.slint         # NEW
|   |   +-- agent_activity.slint      # NEW
|   |   +-- not_found.slint
|   +-- panels/                       # Detachable panel content and shared runtime/browser hosts
|   |   +-- chat_panel.slint
|   |   +-- file_manager_panel.slint
|   |   +-- bottom_panel.slint          # Terminal/Problems/Output/Ports/Debugger panes plus runtime-adjacent panes
|   |   +-- browser_panel.slint         # NEW - Shared webview host reused by workspace-tab and detached browser surfaces
|   |   +-- debug_panel.slint           # NEW - DAP debug UI (variables, call stack, breakpoints)
|   +-- windows/                      # Secondary windows
|       +-- floating_panel.slint
|       +-- about.slint
+-- src/
    +-- main.rs                       # Entry point, BackendSelector
    +-- app.rs                        # AppState, message routing
    +-- bridge/                       # Slint <-> Rust binding layer
    |   +-- mod.rs
    |   +-- theme_bridge.rs           # ThemeVariant -> Theme global sync
    |   +-- model_bridge.rs           # VecModel setup, model factories
    |   +-- callback_bridge.rs        # Slint callback -> Rust handler wiring
    |   +-- window_bridge.rs          # Multi-window lifecycle
    +-- panels/                       # Detachable panel system
    |   +-- mod.rs
    |   +-- registry.rs               # PanelRegistry, dock/undock logic
    |   +-- layout.rs                 # LayoutConfig, persistence, presets
    |   +-- snap.rs                   # Snap zone detection
    +-- effects/                      # Custom rendering effects
    |   +-- mod.rs
    |   +-- grid_texture.rs           # Pixel grid tile generation (SharedPixelBuffer)
    |   +-- paper_texture.rs          # Paper grain tile generation (SharedPixelBuffer)
    +-- theme/                        # Theme definitions (Rust side)
    |   +-- mod.rs
    |   +-- palette.rs                # Color palettes (ported from current)
    |   +-- tokens.rs                 # Design tokens (spacing, borders, fonts, sizes)
    |   +-- variants.rs               # ThemeVariant enum + apply_to
    |   +-- custom_loader.rs          # NEW - Load custom themes from TOML files
    +-- browser/                      # NEW - Browser tab webview integration
    |   +-- mod.rs
    |   +-- webview.rs                # wry webview lifecycle, URL navigation
    |   +-- bookmarks.rs              # Bookmark persistence
    |   +-- context_capture.rs        # Click-to-context element capture
    +-- debug/                        # NEW - Debug Adapter Protocol integration
    |   +-- mod.rs
    |   +-- dap_client.rs             # DAP protocol client
    |   +-- breakpoints.rs            # Breakpoint management
    |   +-- launch_config.rs          # Run/debug configuration parsing
    +-- ssh/                          # NEW - SSH remote editing
    |   +-- mod.rs
    |   +-- connection.rs             # SSH/SFTP connection management
    |   +-- remote_fs.rs              # Remote filesystem abstraction
    |   +-- keychain.rs               # System keychain credential storage
    +-- audio/                        # NEW - Sound effects
    |   +-- mod.rs
    |   +-- player.rs                 # rodio-based audio playback
    |   +-- events.rs                 # Event-to-sound mapping
    +-- catalog/                      # NEW - Community catalog
    |   +-- mod.rs
    |   +-- index.rs                  # Catalog index fetch/cache
    |   +-- installer.rs              # One-click install logic
    +-- sync/                         # NEW - Config sync bundles
    |   +-- mod.rs
    |   +-- exporter.rs               # Bundle export
    |   +-- importer.rs               # Bundle import + conflict resolution
    +-- detect/                       # NEW - Language/framework detection
    |   +-- mod.rs
    |   +-- scanner.rs                # Project root scanning for marker files
    +-- hotreload/                    # NEW - Hot reload file watcher
    |   +-- mod.rs
    |   +-- watcher.rs                # notify-based file watcher
    |   +-- builder.rs                # Build command execution
    +-- ... (remaining app modules unchanged)
```

### 14.2 View Switching in Slint

Use conditional `if` blocks for lazy view rendering:

```slint
if root.current-page == 0 : DashboardView { /* ... */ }
if root.current-page == 1 : ProjectsView { /* ... */ }
if root.current-page == 2 : SettingsView { /* ... */ }
// ... etc
```

Hidden views have zero runtime cost. Widget trees are destroyed when the condition becomes false and recreated when true.

### 14.3 Virtualized Lists


Chat messages, file trees, log outputs, evidence lists, and other long lists use Slint's `ListView` with `VecModel`. For extremely large datasets (100k+ log lines), implement a custom `Model` trait backed by a ring buffer to keep memory bounded. Live terminal rendering is excluded from this normal-list rule and follows the Section 15 screen/buffer, diff-based painting, and off-UI-thread PTY/buffer architecture; only bounded terminal transcript or plain-log projections use `VecModel`/`ListView`.

---

## 15. Persistence

### 15.1 redb Schema

**Shell, layout, and editor state**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `layout:v1` | Panel/editor layout geometry only: panel dock state per panel (docked side + width, or floating position/size), center splits, bottom runtime-panel height, detached-window geometry, and split ratios for terminal sections. It is not terminal topology or terminal session identity. Single JSON blob for atomic read/write. | On change (debounced 300ms) |
| `widget_layout:v1:dashboard` | Canonical dashboard widget grid layout, positions, sizes, and widget IDs | On change (debounced 300ms) |
| `activity_bar_order:v1` | Ordered list of activity bar item IDs + separator position | On change (debounced 300ms) |
| `theme:v1` | Current ThemeVariant enum value | On change |
| `editor_state:v1:{project_id}` | Open tabs, active tab, scroll/cursor position per project | On change (debounced 500ms) |
| `filetree_state:v1:{project_id}` | Expanded folder set, local filter text, and tree scroll position | On change (debounced 300ms) |
| `search_panel_state.v1:{project_id}` | Search side-panel UI state: last query, replacement text, toggles, include/exclude globs, expanded groups, selected result ref, and active query session ref | On change (debounced 250ms) |
| `project_state:v1:{project_id}` | Lightweight shell/UX projection cache, not a canonical state store: editor tabs, file-tree expansion, chat thread selection, last active side-panel occupant, active view, language badges, requested/effective LSP selection summary, last-focused Search/Source Control refs, and remote-context summary | On change (debounced 300ms) |
| `gha_panel_state.v1:{project_id}` | GitHub Actions panel UI state: account-sensitive pins, filters, auto-refresh preference, collapsed groups, and last viewed run partitioned by effective account or invalidated on account switch | On change (debounced 250ms) |
| `artifact_panel_state.v1:{project_id}` | Artifacts panel UI state: expanded groups, selected artifact, compare target, and preview mode | On change (debounced 250ms) |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

**Chat, settings, and review state**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `settings:v1` | Durable app settings and preferences | On save |
| `config:v1` | Full app config struct subordinate to `settings:v1`, not a competing global config key (all Settings values including permissions, shortcuts, LSP registry settings, Search defaults, and file-manager behavior) | On change (debounced 200ms) |
| `chat_state:v1` | Unsent input text and active thread selection | On change (debounced 200ms) |
| `wizard_state:v1:{project_id}` | Current wizard step and form data | On change (debounced 300ms) |
| `document_pane_state:v1:{project_id}:{page_context}` | Embedded document-pane state: selected document, selected view, scroll/cursor state, history selection, and approval stage | On change (debounced 200ms) |
| `document_checkpoints:v1:{project_id}` | Checkpoint metadata for restorable document states | On checkpoint create/restore |
| `review_findings_summary:v1:{project_id}:{run_id}` | Findings summary payload for requirements/interview review runs | On review completion/update |
| `review_approval_gate:v1:{project_id}:{run_id}` | Final approval decision state and precondition flags | On approval state change |
| `debug_investigation_record.v1:{project_id}:{investigation_id}` | Debug investigation record: target summary, phase/state, evidence refs, instrumentation refs, verification state, and cleanup status | On lifecycle change |
| `bundle_registry.v1:{project_id}:{bundle_id}` | Bundle review registry: files, review gate state, notes summary, and bundle status progression | On change |
| `note_record.v1:{bundle_id}:{note_id}` | Inline/bundle review note content, range, author, category, resolution, and timestamps | On change |
| `slash_commands:v1` | Custom slash commands (application-wide) | On save |
| `slash_commands:v1:{project_id}` | Custom slash commands (project-wide) | On save |
| `projects:v1` | Project registry: known projects with paths, detected languages, last-opened timestamps, health status, and per-project overrides | On change |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md

**Preview, browser, recovery, LSP, and remote keys**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `preview_state.v1:{project_id}:{preview_subject_id}` | Preview UI state keyed by document/artifact subject: mode, attached surface, export prefs, scroll sync, and last error | On change (debounced 300ms) |
| `preview_source_artifact.v1:{project_id}:{artifact_id}` | Artifact-backed preview metadata and source linkage | On change |
| `browser_session_state.v1:{project_id}:{browser_session_id}` | Browser session state: session class, workspace tab, preview subject, requested/effective runtime and capabilities, blocked actions, profile scope, restore policy, and last error | On change (debounced 300ms) |
| `browser_profile_state.v1:{project_id}:{profile_scope}` | Browser history/bookmarks and project-scoped profile state, including persistent profiles requested as `profile: { name: string, saveChanges: boolean }`, `saveChanges` writeback state, and cookies/localStorage scope | On change (debounced 500ms) |
| `editor_unsaved_buffer.v1:{project_id}:{document_id}` | Recoverable local unsaved buffer snapshot, capture metadata, host/path identity, and write-availability state at capture time | On change (debounced 500ms) |
| `search_query_state.v1:{project_id}:{query_session_id}` | Query-session snapshot: query, replacement, scope, result snapshot ref, freshness, health, and last error | On query update/complete |
| `lsp_session_state.v1:{project_id}:{host_id}:{server_id}:{root_identity}` | Host-aware LSP session projection: state, freshness, health, restart metadata, capability summary, and last error | On lifecycle change |
| `lsp_diagnostics_snapshot.v1:{project_id}:{host_id}:{server_id}:{root_identity}` | Diagnostics snapshot ref(s), counts, capture time, freshness, and health for the owning host-aware LSP session | On diagnostics update |
| `provider_account_record.v1:{provider_id}:{account_id}` | Provider account identity, entitlement metadata, validation state, and account-level configuration | On account change |
| `server_profile_record.v1:{provider_id}:{connection_profile_id}` | Provider/server profile connection defaults, capability summary, and health metadata | On change |
| `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}` | Rate-limit / pressure episode metadata and recovery history for account selection surfaces | On lifecycle change |
| `account_switch_event.v1:{provider_id}:{event_id}` | Durable record of account switch reason, source, and effective billing/entity context | On switch |
| `mcp_server_record.v1:{mcp_server_id}` | MCP server configuration and readiness metadata | On save/change |
| `skill_record.v1:{skill_id}` | Skill registry entry, enablement, source, and settings summary | On save/change |
| `web_operation_payload` | Stored child-run metadata for web search, fetch/read, extract, research, crawl, and map summaries referenced by GUI projections; `read` is the semantic `web_operation` for the `webfetch` tool. | On completion/update |
| `terminal_layout.v1:{project_id}` | Canonical terminal layout persistence family for terminal sections, pane arrangement, and focused runtime chrome | On change (debounced 300ms) |
| `terminal_session.v1:{terminal_session_id}` | PTY session continuity record for terminal restore and historical/live verification | On lifecycle change |
| `ssh_remotes/{id}` | Saved SSH remote record: nickname, host, port, user, auth method, remote folder, jump host, and last test metadata. No secrets. | On save |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Normative mapping notes:
- `ssh_remotes/{id}` replaces the stale flat `ssh_connections:v1` concept in GUI-facing persistence summaries.
- `preview_state.v1:*`, `preview_source_artifact.v1:*`, `browser_session_state.v1:*`, and `browser_profile_state.v1:*` replace stale single-blob `browser_state.v1` and `browser_state:v1` models.
- Search and LSP rows in this section are GUI-facing projections and MUST resolve back to owner-doc contracts in `Plans/storage-plan.md`, `Plans/FileManager.md`, and `Plans/LSPSupport.md`.
- `editor_unsaved_buffer.v1:*` stores local unsaved buffer state only and MUST NOT imply that a remote write succeeded.
- `dashboard_layout:v1` is a deprecated migration-read alias only; `widget_layout:v1:dashboard` is the canonical dashboard key after migration.
- §15.1 lists the keys required for GUI state persistence. For the complete key catalog including non-GUI keys, see `Plans/storage-plan.md` §2.3.
- Viewer-mode and MCP readiness copy must mirror owner-doc precision. When the active durable store is locked by another writer or the selected `pm.lock` cannot be acquired, the GUI enters `/viewer-mode` and labels the state as read-only/viewer rather than implying ordinary edit capability. MCP readiness rows consume `mcp_server_record` and `mcp_runtime_availability` from the MCP owner docs; cost-display and `/account/readiness` copy must route to the canonical Usage/cost and account/readiness owner pipelines instead of creating local MCP, account, or cost buckets.
- Terminal GUI persistence imports the full storage-owned terminal key catalog instead of forking a local subset: `terminal_workspace_state.v1:{project_id}:{workspace_tab_id}`, `terminal_section_record.v1:{project_id}:{terminal_section_id}`, `terminal_tab_record.v1:{project_id}:{terminal_tab_id}`, `terminal_pane_record.v1:{project_id}:{terminal_pane_id}`, `terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}`, `terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}`, `editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}`, `terminal_session_record.v1:{project_id}:{terminal_session_id}`, and `terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}`. Wildcard audit shorthands such as `terminal_workspace_state.v1:*` and `terminal_command_block.v1:*` resolve to these concrete key families. The GUI-facing `terminal_layout.v1` / `terminal_session.v1` rows above are projection and compatibility summaries only; restore and open/focus flows resolve through the storage key catalog before claiming liveness.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

### 15.2 seglog Projections (for Usage)

- Usage events (tokens, cost, platform, provider/pricing tier, session, thread_id) appended to seglog; this `tier` is entitlement or pricing metadata and is not decomposition-tier identity
- Analytics scan jobs produce rollups in redb (5h/7d counters, tool latency, error rates)
- Usage view and dashboard read from redb rollups, not raw seglog
- Per-thread usage derived from seglog events filtered by thread_id

### 15.3 Tantivy Indices

- Chat history search (human and agent messages) queryable from Chat panel search
- Evidence search
- Ledger search

### 15.4 Startup Restore
On startup:
1. Read `layout:v1` from redb and restore panel positions, sizes, dock states, and detached-terminal geometry.
2. Read `theme:v1` from redb and apply theme.
3. Read `widget_layout:v1:dashboard` and restore dashboard widget layout. On first launch after migration, read from deprecated `dashboard_layout:v1` only when the canonical key is absent, then write back to `widget_layout:v1:dashboard`.
4. Read `activity_bar_order:v1` and restore icon order.
5. Read `editor_state:v1:{project}` and restore open tabs.
6. Read `project_state:v1:{project_id}` and restore the active project-facing shell state.
7. Read `terminal_layout.v1:{project_id}` plus linked `terminal_session.v1:{terminal_session_id}` / canonical terminal record families and restore terminal section layout, tabs, pane tree, labels, and selected focus targets. On first launch after migration, a compatibility reader MAY ingest deprecated `terminal_state:v1` payloads and rewrite them into the canonical terminal key family.
8. Read `hotreload_state:v1:{project_id}` and rehydrate dev-session UI state as historical or verified-live state.
9. Read `onboarding:v1` and determine whether tour or first-run hints should show.
10. If a floating or detached window was on a disconnected monitor, fall back to docked presentation or to a safe detached coordinate.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Restore rules:
- terminal restore MUST preserve section, tab, and pane identity before attempting any session liveness verification
- restored historical sessions may appear immediately, but live-state badges wait for verification
- startup restore MUST prefer revealing prior selected terminal containers over creating new empty terminals automatically
- project `/reopen` restores saved sections, tabs, panes, layout style, labels, dock/detach state, and session cwd/profile metadata before liveness checks; it must not fall back to a default single-pane layout when durable terminal layout exists
- `/restored`, `/exited`, and `/disconnected` UI copy must keep structural restore separate from live PTY proof; replace with new terminal or `/restart` attaches a fresh runtime to the same slot, while close removes the workspace container
- Session restore is project-scoped and `/session-aware`: thread-specific restoration prompts before rebinding thread, chat, terminal, or editor focus, and the saved `/layout` projection may restore only after that scope is confirmed.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md
### 15.5 Session Recovery
On crash or unexpected shutdown, restore as much state as possible without inventing continuity that PM cannot prove.

Recoverable state:
- **Chat state:** unsent input text and active thread selection may restore from `chat_state:v1`; queue state is transient and is not restored across reload or restart
- **Wizard state:** current wizard step and form data resume from `wizard_state:v1:{project_id}`
- **Document pane state:** embedded document-pane selection and view (`document` or `plan_graph`) restore from `document_pane_state:v1:{project_id}:{page_context}`
- **Document checkpoints:** checkpoint list and selected checkpoint context restore so the user can continue restore or approval workflows
- **Review findings and approval state:** findings summary and approval state restore so interrupted review runs return to the correct approval surface
- **Active project:** the last active project is restored automatically

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md

Terminal and dev-session recovery rules:
- terminal sections, tabs, panes, labels, pin state, and selected focus restore from durable terminal workspace state
- terminal sessions restore only as verified-live or historical records; Puppet Master MUST NOT fake live PTY continuity after restart
- canonical recovery outcomes are `restored_live`, `restored_exited`, `restored_disconnected`, and `restored_without_history`
- dev sessions restore as workflow records tied to their last-known output, problems, ports, and linked terminal refs
- restored historical terminals show explicit banners and recovery controls such as restart, replace, or close historical tab
- Restart recovery treats privileged interactive sessions as crash-interrupted unless liveness is revalidated. `docker exec/attach`, `kubectl exec`, and `kubectl port-forward` sessions never `auto-resume` a live attachment after crash or restart. They restore as `interrupted_session` records with target identity, last-known timestamps, the source-specific blind-spot window, and a `Reconnect / Start new session` CTA; prior buffers remain historical evidence, not proof of a live attachment.
- A restored `log_stream_session` stores source identity plus resume cursor or `/bookmark` semantics. Source-specific resume requires the exact cursor when the backend has one, best-effort tail timestamp when it does not, or a metadata-only reopen state when no cursor model exists. GitHub Actions restart recovery distinguishes `remote run still executing`, `remote run completed while app was down`, and `local observation interrupted`: the GUI restores selection context, shows a gap marker if logs advanced while the app was down, and does not claim uninterrupted local stream continuity.
- Receipt finalization for crash-interrupted operation observers uses explicit lifecycle states `started`, `observation_interrupted`, `reconciled_completed`, `reconciled_failed`, and `abandoned_unknown` for exec and `/attach`, port-forward, log streams, `workflow-run` observation, and publish `/deploy` follow chains. Orchestrator `/restart` reconciliation uses `external-continuity` classifications `resumable_local`, `externally_continued`, `externally_completed`, `stale_historical`, and `unknown_after_crash` when hosted runs, containers, or Kubernetes rollouts continued while the UI observer was down.
- Historical inspection restore persists selected `run_id`, selected tab, selected node `/attempt`, history filters, graph `/detail` focus, and selected receipt `/detail` drawer. If the selected historical target no longer resolves, the GUI restores a labeled degraded `historical_view` or `paused_snapshot` rather than switching to the current active run; restored `follow` intent still requires source revalidation before a live stream is claimed.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

Composer and queue rules after restore:
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- Edit restores content into composer and discards all later history/work
- Resend retries the most recent message and discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- Stop becomes disabled when a run completes and no next message is queued
- queue state is transient and is not restored across reload or restart
- always-visible copy affordance on fenced code blocks remains available after restore

Browser and runtime recovery rules remain aligned:
- browser sessions preserve their own restore policy and never silently become terminal-owned shells
- attention surfaces, command cards, and linked runtime panes must pivot back to the restored canonical identity rather than inventing replacement containers

`Project_Output_Artifacts` / `Project_Output_Artifacts.md` and adjacent artifact `/event` owners carry `/thread/run/attempt/account` lineage, pass-report `/fields`, and wizard `/interview` producer alignment before the GUI treats an artifact pass report as canonical.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

Rules:
- restore does not invent queue continuity
- Keep this recovery section consuming Plans/assistant-chat-design.md#4. Message submission (Steer vs Queue), queued editing, interrupt, and stop
## 16. Migration Mapping


### 16.1 Iced View to Slint Location

Agent ecosystem seams remain explicit migration references: `Plans/Skills_System.md` (`/Skills_System.md`), `Plans/MCP_Integration.md` (`/MCP_Integration.md`), and `Plans/orchestrator-subagent-integration.md` (`/orchestrator-subagent-integration.md`).

| Current Iced View | New Slint Location | Notes |
|-------------------|-------------------|-------|
| `dashboard.rs` | `views/dashboard.slint` (Home group) | Add rearrangeable card grid, 4-split terminal |
| `projects.rs` | `views/projects.slint` (Home group) | Minimal changes |
| `wizard.rs` | `views/wizard.slint` (Run group) | Add agent activity pane, intent selection |
| `interview.rs` | `views/interview.slint` (Run group) | Also available as Chat mode |
| `tiers.rs` | `views/nodes.slint` (Run group) | Renamed to match the node/package/lane/seam model; otherwise minimal changes |
| `config.rs` | **Merged into** `views/settings.slint` (Settings group) | Tabs: Nodes, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML |
| `settings.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: General |
| `login.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Authentication |
| `doctor.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Health |
| `setup.rs` | `views/setup.slint` (Run group) | Minimal changes |
| `metrics.rs` | `views/metrics.slint` (Data group) | Minimal changes |
| `evidence.rs` | `views/evidence.slint` (Data group) | Minimal changes |
| `evidence_detail.rs` | `views/evidence_detail.slint` (Data group) | Minimal changes |
| `history.rs` | `views/history.slint` (Data group) | Minimal changes |
| `ledger.rs` | `views/ledger.slint` (Data group) | Minimal changes |
| `memory.rs` | `views/memory.slint` (Data group) | Minimal changes |
| `coverage.rs` | `views/coverage.slint` (Data group) | Minimal changes |
| `not_found.rs` | `views/not_found.slint` | Minimal changes |
| (new) | `views/usage.slint` (Data group) | New page |
| (new) | `views/file_editor.slint` (Primary content) | New page |
| (new) | `views/agent_activity.slint` (Embedded) | New component |
| (new) | `panels/chat_panel.slint` (Side panel) | New panel |
| (new) | `panels/file_manager_panel.slint` (Side panel) | New panel |

### 16.2 Widget Migration

All 25 current Iced widgets map to Slint equivalents. Key differences:
- **Canvas-based widgets** (pixel_grid, paper_texture, step_circle, budget_donut, usage_chart): Use `SharedPixelBuffer` + `Image` instead of Iced's `canvas::Program`
- **text_editor::Content** (for non-terminal logs or degraded/plain historical terminal transcript projections): Use Slint's `TextEdit` (read-only mode) or custom `ListView` with styled text lines; live terminal rendering follows the Section 15 terminal-core architecture and is not a normal text-editor/list widget.
- **Subscriptions** (50ms polling): Replace with event-driven `invoke_from_event_loop`
- **Context menu:** Custom implementation (Slint has no built-in)
- **Animations** (page transitions, pulsing status dots): Use Slint's property transitions and `animate` keyword
- **Dynamic scaling** (UI scale 0.75-1.5): Use Slint's native global/window scale factor as the only scaling path; do not port Iced token-multiplication layers into Slint view code

ContractRef: ContractName:Plans/Contracts_V0.md#8, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

### 16.3 Data Type Preservation

All current data types (AppTheme, Page, CurrentItem, ProgressState, OutputLine, BudgetDisplayInfo, DoctorCheckResult, etc.) remain in Rust. Only their Slint representations (via properties and models) change. The backend event system, orchestrator state, and persistence remain unchanged.

<a id="16.4"></a>
### 16.4 Clipboard Migration Gate

Clipboard migration gate status is **PASS** only when all required criteria below are true.

**Pass/Fail criteria (all REQUIRED):**
- [ ] Native Copy/Paste/Select All behavior works in File Editor input, chat composer input, and terminal command input (if editable).
- [ ] Read-only terminal/log output supports selection/copy and does not accept editable paste behavior.
- [ ] No custom text-widget clipboard handler remains in the migration target.
- [ ] Non-text copy exceptions remain explicitly scoped to `ClipboardHelper` path/value contexts only.
- [ ] Rebuild branch passes type/build verification.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, SchemaID:Spec_Lock.json#locked_decisions.ui

**Verification command (build):**
```bash
cd puppet-master-rs
cargo check
```

**Scenario checklist (manual or automated GUI harness):**

| Scenario | Expected result |
|----------|-----------------|
| Editor clipboard shortcuts + context menu | Ctrl/Cmd+A/C/X/V and context Copy/Paste/Select All behave natively |
| Chat composer clipboard shortcuts + context menu | Same behavior and parity as editor |
| Terminal command input clipboard actions | Native clipboard behavior on editable command input |
| Terminal/log read-only output copy/paste behavior | Selection/copy works; paste is not treated as editable insertion |
| Non-text Copy Path/Copy Value | Clipboard receives exact path/value via `ClipboardHelper` only |

---

## 17. Risks and Mitigations


| Risk | Severity | Mitigation |
|------|----------|------------|
| **`ImageFit.repeat` may not exist in Slint 1.15.1** | Medium | Use `SharedPixelBuffer` to generate tiles at the viewport size; or manually tile via `GridLayout` with repeated `Image` elements. Test at build time; if unavailable, use fallback approach. |
| **Multi-window lifecycle edge cases** | High | State machine in Rust manages window create/destroy. On floating window close -> dock or collapse; update layout state. Test: focus management between main and floating windows; data sync when floating window is open; re-dock after window was on disconnected monitor. |
| **Limited screen reader support** | Medium | Keyboard navigation is comprehensive (§13.3). Set `accessible-role` and `accessible-label` where Slint supports them. Document limitations. Basic theme provides maximum readability. |
| **No built-in context menu** | Low | Custom `ContextMenu` widget using `TouchArea` pointer events. Positioned at mouse coordinates. Styled per theme. Clipboard operations (Copy/Paste/Select All) delegate to Slint's native `TextInput.copy()` / `.paste()` / `.select-all()` — no custom clipboard state management needed. |
| **No built-in docking framework** | High | Custom `PanelRegistry` in Rust handles dock/undock state machine, snap detection, window lifecycle. This is the most complex custom component and should be implemented early. |
| **Font family change requires restart** | Low | Detect font family change in settings. Show restart prompt. Pre-load fonts for all themes on startup so within-family switches (Dark <-> Light) are instant. |
| **4-split terminal performance** | Medium | Live terminal panes use native screen/buffer state, diff-based painting, and off-UI-thread PTY/buffer ingestion and processing per Section 15. Keep bounded ring buffers per pane (max 10k retained rows) and one PTY per pane. `VecModel`/`ListView` holds only bounded transcript/plain-log projection windows (~500 visible rows plus small overscan), not the terminal core. Batch/throttle projection updates (max 30fps). |
| **Platform-specific window manager issues** | Medium | Test: macOS window snapping with floating panels, Linux compositing with overlay effects, Windows DPI scaling. Handle gracefully with fallback behaviors. |
| **Large Settings page complexity** | Medium | 24 tabs across 5 groups. Two-level sidebar navigation (left sidebar for groups, right area for selected tab) is mandatory. Group labels act as collapsible headers. Settings search bar at the top of the sidebar. Test with real data. |
| **Migration scope** | High | 18 existing views + 5 new = 23 total. Prioritize: (1) Theme system + shell layout, (2) Dashboard + Settings, (3) Chat + File Manager, (4) remaining views. Each view can be migrated independently. |
| **invoke_from_event_loop saturation** | High | High-frequency terminal output (1000+ lines/sec) can saturate the event loop if treated as line-widget churn. Mitigation: keep PTY/buffer ingestion and diff computation off the UI thread; push bounded paint/projection deltas to the GUI with a 33ms (30fps) throttle timer. Do not model the live terminal core as raw lines pushed into `VecModel` per frame. |
| **Chat message memory bounds** | Medium | No cap on messages per thread could cause memory issues with very long sessions. Mitigation: Implement a soft cap (e.g., 5000 messages per thread); on exceeding, archive oldest messages to disk and show "Load earlier messages" button. |
| **Theme global property update batching** | Low | Switching 20+ theme properties could cause intermediate re-renders. Mitigation: Slint batches property changes within a single `invoke_from_event_loop` call; always set all theme properties in one callback. |
| **Dashboard card drag-and-drop** | Medium | Drag-reorder logic for dashboard cards is custom and complex. Mitigation: Use a simple ordered-list model with drag-handle + click-to-swap as MVP; full drag-and-drop is enhancement. Test with varying card counts (2-12). |
| **Floating window data sync race conditions** | High | Multiple windows reading/writing the same VecModel can race. Mitigation: All model mutations go through `invoke_from_event_loop` on the main event loop (single writer). Floating windows receive updates via the same shared `Rc<VecModel>`. Never clone+replace the model; always mutate in-place. |
| **LSP server lifecycle management** | Medium | Multiple LSP servers may exist across local and remote hosts. Mitigation: Key server supervision by `(host_id, server_id, root_identity)`, launch lazily on file open, restart boundedly on crashes, and expose stale/degraded/unavailable state instead of silently mirroring remote projects locally. |
| **External drag-and-drop platform APIs** | Medium | Requires platform-specific integration (Windows IDropTarget, macOS NSDraggingDestination, Linux Xdnd/Wayland). Mitigation: Abstract behind a trait; implement per-platform. If Slint exposes native drop events, use those instead. Test on all three platforms. |
| **HTML preview webview** | Medium | Embedding a `/webview` for HTML hot-reload preview may conflict with the Skia renderer pipeline. Mitigation: Use `wry` or similar embeddable webview; ensure it sits in a separate native child window within the editor area. If runtime support is unavailable, surface `runtime_unavailable` plus remediation and degraded browser capability messaging instead of substituting static HTML snapshots or screenshots as pseudo-browser behavior. |
| **Steer submission mid-stream injection** | Medium | Injecting a new user message while the assistant is actively generating requires careful stream handling. Mitigation: Buffer the steer message; on next token boundary, prepend the steer to the ongoing context. Test that partial generation + steer produces coherent output. |
| **Webview embedding (`wry`) conflicts** | High | Browser and HTML preview surfaces embed webviews that may conflict with the Skia renderer pipeline. Mitigation: Use native child windows positioned within Slint layout areas, keep browser ownership editor/workspace-tab-first, and ensure bottom-panel browser-adjacent panes never become the canonical browser host. |
| **DAP debugger reliability** | Medium | Debug adapter communication is asynchronous and adapters may crash, hang, or produce unexpected output. Mitigation: Implement timeouts per DAP request (default 10s for evaluate, 30s for launch). Auto-restart crashed adapters once. Show clear error state in the Debugger surface when adapter is unresponsive. Cap concurrent debug sessions to 1 per project. |
| **SSH connection stability** | Medium | SSH connections may drop unexpectedly (network change, host reboot, timeout). Mitigation: Keep-alive packets every 30s. On disconnect, retain local buffer contents and stale snapshot state, auto-retry once in a bounded way, then show an explicit `Reconnect` action. Never silently fall back to local execution for remote-mode projects. |
| **Catalog service availability** | Low | Catalog index may be unavailable (network down, server offline). Mitigation: Bundle a fallback index with the app binary. Cache last-fetched index locally. Show "Catalog may be outdated" banner when using cached data. All catalog operations work offline with cached index. |
| **Sound effects cross-platform audio** | Low | `rodio` audio playback may fail on some Linux configurations (missing PulseAudio/ALSA). Mitigation: Detect audio device availability at startup. If unavailable, disable sound effects silently and hide the toggle in Settings (or show "(audio unavailable)" label). No error toasts for missing audio. |
| **Custom theme validation** | Low | User-created theme TOML files may have invalid colors, missing tokens, or malformed syntax. Mitigation: Validate all custom themes on load. Skip invalid themes with a warning toast on Settings open. Never crash on invalid theme files. Use base theme values for any missing or invalid tokens. |
| **Settings page tab count (24 tabs)** | Medium | 24 tabs across 5 groups requires careful navigation. Mitigation: Two-level sidebar navigation is mandatory (not optional). Group headers are collapsible. Search/filter across all settings via a search bar at the top of the Settings sidebar. Deep-link support: command palette "Open setting: {name}" jumps directly to the relevant tab and scrolls to the field. |
| **Project switch state reload performance** | Medium | Switching projects triggers full state reload (editor tabs, file tree, chat threads, config, LSP servers). Mitigation: Load in priority order: (1) config (instant, from redb), (2) file tree (async scan, show skeleton), (3) editor tabs (lazy, only load active tab content), (4) LSP/Search/Source Control projections (background refresh), (5) chat threads (lazy load). Show skeleton placeholders during reload. Target: <500ms to interactive. |
| **File watcher resource consumption** | Low | Hot reload and preview watchers monitor project directories for changes. Large projects (>10k files) may consume significant inotify/FSEvents handles. Mitigation: Use `notify` crate with debounced mode. Watch only relevant source directories. Cap watchers and disclose fallback when root-only watching is required. |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md

## 18. Promoted Features (Formerly Future Considerations)

Ledger directionality is closed for items `#18`, `#19`, `#28`, `#29`, `#31`, `#36`, `#50`, `#52`, and `#56`: these items are locked requirements, not directional ideas. Only sections explicitly labeled `FUTURE FEATURE` or `OPEN QUESTION` remain open by intent.


All items previously listed as future considerations are MVP scope and are fully specified in their owner docs:

| Feature | MVP Location |
|---------|-------------|
| Built-in browser / click-to-context | Rendering Surface Addendum + `Plans/FileManager.md` §8 and §14 |
| Search / find in files / replace in files | Activity Bar + Command Palette boundary + Search owner contract in this doc; `Plans/UI_Command_Catalog.md` `cmd.search.*` |
| Instant project switch | Workspace-tab project switch model (§3.4) |
| Sound effects | UX Patterns §10.13 + Settings > General |
| Hot reload controls | Runtime/dev surfaces in `Plans/assistant-chat-design.md` §22 and `Plans/FileManager.md` §14.6 |
| In-app instructions editor | File Editor instructions mode in `Plans/FileManager.md` |
| Additional themes / custom themes | Theme extensibility (§6.6) |
| Language/framework auto-detection and LSP-aware navigation | Project state + `Plans/LSPSupport.md` + `Plans/FileManager.md` §10 |
| Catalog / one-click install | Settings > Catalog tab |
| Sync bundle manager | Settings > Sync tab |
| SSH remote editing | `Plans/GitHub_Integration.md` §C + `Plans/FileManager.md` remote buffer/search behavior |
| Run/debug configurations | Run & Debug side-panel surface + Settings > Debug |
| Browser/terminal tabs, pinning, and preview modes | `Plans/FileManager.md` §9 and §14 + Rendering Surface Addendum |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md

No features in this specification are deferred.

## Appendix A: Cross-References

Cross-References inventory.

Reference rows must point at live owner documents or live section anchors, not nonexistent section numbers.

LF-007 stale-reference cleanup applies to this appendix and to `Plans/assistant-chat-design.md#20. References`: `Plans/FinalGUISpec.md#Appendix A: Cross-References` must keep references explicit to live owner documents or remove them, and stale-reference repairs must not remain implicit in packet scope.

| Plan Document | Sections Incorporated |
| --- | --- |
| `Plans/assistant-chat-design.md` | Chat panel, modes, threads, steer/queue submission, subagent inline blocks, commands, activity transparency, plan panel, context usage, and HITL-to-chat handoff. |
| `Plans/FileManager.md` | File Manager, File Editor, embedded document pane shared-buffer contract, click-to-open, @ mention, preview, external drag-and-drop, HTML preview/hot reload, click-to-context, open-file contract, shared buffer model, editor diff view, SSH remote editing, run/debug configurations, and terminal/browser tab management. |
| `Plans/usage-feature.md` | Usage page, per-thread usage, ledger, analytics, visibility windows, and alerts. |
| `Plans/human-in-the-loop.md` | HITL settings, approval UI, and dashboard calls to action. |
| `Plans/chain-wizard-flexibility.md` | Wizard redesign, intent selection, intent-specific fields, file upload limits, Builder opener and turn semantics, checklist status UI, findings preview, single final approval gate, tri-location chat pointers, embedded document pane separation, pause/cancel/resume controls, recovery state, and adaptive interview phases. |
| `Plans/storage-plan.md` | Persistence, seglog projections, redb schema, and Tantivy. |
| `Plans/agent-rules-context.md` | Application-level rules, project-level rules, and shared rules-pipeline context for orchestrator, interview, and Assistant. |
| `Plans/Glossary.md` | Product name "Puppet Master" throughout. |
| `Plans/newfeatures.md` | Bottom panel and terminal, thinking display, streaming, keyboard shortcuts, stream event visualization, duration timers, background runs, restore points, config migration dialog, rate-limit banner, version update banner, instant project switch, sound effects, hot reload controls, instructions editor, and language auto-detection. |
| `Plans/interview-subagent-integration.md` | Interview config tab, agent activity, embedded document pane, findings summary preview, single final approval gate, and multi-pass review. |
| `Plans/orchestrator-subagent-integration.md` | Orchestrator, orchestrator controls, and node/package/lane/seam display. |
| `Plans/WorktreeGitImprovement.md` | Branching tab in Settings and worktree recovery in Health. |
| `Plans/FileSafe.md` | Advanced tab in Settings, command blocklist, write scope, and security filter. |
| `Plans/MiscPlan.md` | Health tab clean-workspace button, cleanup config in Advanced, and Shortcuts tab. |
| `Plans/Skills_System.md` | Agent Config panel and slash/runtime boundary at `Plans/Skills_System.md#6.3 Slash and runtime boundary`. |
| `Plans/feature-list.md` | Master feature reference for chat modes, thread management, slash commands, ELI5/YOLO, attachments, Teach, context management, editor detach, storage and cache admin UI, and unified settings/search/import/export. |
| `Plans/newtools.md` | MCP/settings alignment note and non-owning cited-search guidance; live provider, routing, provenance, and billing canon stays in owner docs. |
| `Plans/Commands_System.md` | Reserved built-in slash-command set for chat surfaces; see `Plans/Commands_System.md#7. Reserved built-in slash commands` for `/web` family behavior and deprecated aliases. |
| `Plans/UI_Command_Catalog.md` | Terminal reveal identities and canonical `cmd.chat.web.*` command ids consumed by chat and command surfaces; see `Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)`. |
| `Plans/Permissions_System.md` | Tool permission keys, approval ladder, blocked-recovery defaults, deterministic ask/plan behavior, and web-operation derivation at `Plans/Permissions_System.md#3.4A Web-operation permission-key derivation`. |
| `Plans/MCP_Integration.md` | Requested versus effective MCP availability at `Plans/MCP_Integration.md#2. Requested versus effective availability`; GUI surfacing at `Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing`; plus auth-state and connection-state enums, credential binding, and invalidation vocabulary. |
| `Plans/Tools.md` | Tool permissions in Permissions tab, tool permission keys, presets, central tool registry, canonical approval ladder, web-provider matrix, routing algorithm, Firecrawl integration, batch-operation contracts, tool usage widget on Usage page, and tool approval dialog in Chat. |
| `Plans/Provider_OpenCode.md` / `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` | `Provider_OpenCode` / `Provider_OpenCode.md` and `Provider_Stream_Mapping_External_Reference_A2A` / `Provider_Stream_Mapping_External_Reference_A2A.md` consumers cannot satisfy runtime `/account` disclosure from `/API` mappings alone; GUI details must show the owner runtime receipt, account source, or unavailable-field reason before treating provider events as complete. |
| `Plans/Widget_System.md` / `Plans/storage-plan.md` / `Plans/Runtime_Artifacts_Panel.md` | Widget, storage, and runtime-artifact GUI consumers route through `Plans/Widget_System.md`, `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, `/Widget_System.md`, `/storage-plan.md`, and `/Runtime_Artifacts_Panel.md` owner contracts before treating a widget or artifact view as canonical. |
| `Plans/Widget_System.md` / `Plans/Run_Graph_View.md` | `Plans/Widget_System.md` / `/Widget_System.md` consumes the Progress-only catalog and deterministic `drill-target` mapping, while `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` uses node-aware `/graph` views, treats `by-phase` as legacy grouping, and exposes `/package-group` swimlanes. |
| `Plans/LSPSupport.md` | LSP tab in Settings, editor LSP features, chat-window LSP affordances, Problems tab, and status-bar LSP indicator. |
| `Plans/rewrite-tie-in-memo.md` | Rewrite scope alignment so GUI migration stays tied into the broader rewrite plan. |
| `Plans/FinalGUISpec.md` | Internal clipboard contract, clipboard migration requirements, SelectableText contract, context-menu clipboard contract, and migration gate. |
## Appendix B: Locked Decisions Summary

These decisions are final and must not be revisited during implementation:

1. **Slint 1.15.1** -- no other UI framework
2. **winit + Skia** default, **winit + FemtoVG-wgpu** fallback
3. **No React/JS/TS/HTML/CSS** -- pure Rust + Slint shell
4. **IDE shell layout** -- Activity Bar + Primary Content + Side Panel + Bottom Panel
5. **Three theme families** -- Retro Dark, Retro Light, Basic Modern (built-in variants + custom themes via TOML)
6. **Settings restructure** -- unified page merging old Config + Settings + Login + Doctor
7. **Event-driven updates** via `invoke_from_event_loop`, not polling
8. **redb for layout persistence**, seglog for events, Tantivy for search
9. **Model/platform selection via dropdowns**, not text entry
10. **Product name: `Puppet Master`**
11. **All 12 former future considerations are MVP** -- browser, instant project switch, sound effects, hot reload, instructions editor, custom themes, language detection, catalog, sync, SSH, Debug Mode workflows, and terminal tab management
12. **Bottom runtime zone includes the classical debugger surface** -- Terminal, Problems, Output, Ports, and Debugger / DAP Debugger remain runtime-zone occupants; browser-capable preview/browsing is not a bottom-panel debug substitute
13. **Browser runtime contract is capability-first, not crate-name-first** -- implementation must satisfy the promoted browser/session model rather than hard-locking the spec to stale `wry` wording
14. **Classical debugger uses DAP** -- the integrated debugger surface is DAP-based and distinct from Assistant Debug Mode
15. **SSH uses system keychain / agent flows** -- credentials stay in OS-managed stores, never in config files

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md

## Appendix C: Dashboard Widget Grid and Widget Catalog Integration (Addendum -- 2026-02-23)

This appendix extends the Dashboard (section 7.2) from a rearrangeable card grid to a full widget grid with grid-based resizing, and introduces the add-widget flow for the Dashboard.

### C.1 Dashboard Upgrade: Card Grid to Widget Grid


The Dashboard (section 7.2) is upgraded from a simple rearrangeable card grid (drag-to-swap, fixed card sizes) to a full **widget grid** with grid-based resizing:

**What changes from section 7.2:**
- Cards become **widgets** from the widget catalog (Plans/Widget_System.md section 2). Each widget has configurable `col_span` and `row_span`.
- Drag-to-swap is upgraded to **drag-to-reorder** within the grid. Widgets can also be **resized** by dragging their edges (grid-snapping, per Plans/Widget_System.md section 3).
- Grid system follows Plans/Widget_System.md section 3: responsive column counts (2 at <1200px, 3 at 1200-1600px, 4 at >1600px per section 12.3).
- Widget gutters: 8px (MD spacing token) between widgets.

**What stays the same from section 7.2:**
- All existing Dashboard card types remain as default widgets.
- The card visual style is preserved: paper texture on retro themes, drag handle (4px crosshatch pattern in top-left corner), elevated surface for CtA cards with accent-left-border.
- CtA (Calls to Action) behavior: HITL approval, run interrupted, rate limit, warning, and `wizard_attention_required` cards function identically (see §7.2 for full specs).
- Persistence location changes from `dashboard_layout:v1` to `widget_layout:v1:dashboard` (see section C.5 for migration).

ContractRef: ContractName:Plans/Widget_System.md#3

### C.2 Default Dashboard Widget Layout

The default dashboard layout includes:
- **widget-orchestrator-progress** (ID: `orch-progress-v1`): Shows current run progress, node execution status, and lane state.
- **widget-active-lanes** (ID: `lanes-view-v1`): Lists active lanes and worktree allocation state.
- **widget-recent-results** (ID: `results-v1`): Shows recent execution results and artifact links.

### C.3 Add-Widget Flow on Dashboard

Users add widgets via:
1. Dashboard menu → "Add Widget"
2. Select from named widget catalog (see C.4)
3. Confirm placement and sizing
4. Widget appears on dashboard with default configuration

### C.4 Widget Catalog vs. Core Widget Catalog

The current **named widget catalog** includes:
- `widget-orchestrator-progress`: Orchestrator progress view (Puppet Master native).
- `widget-active-lanes`: Active lane browser (Puppet Master native).
- `widget-recent-results`: Recent result summary (Puppet Master native).
- `widget-custom-metrics`: User-defined metric display (user-generated, optional).

**Core widgets** are Puppet Master-owned and part of the default installation. **Custom widgets** are user-generated and optional.

Widget_System consumes this named catalog directly; it does not invent new widget IDs or synthesize missing entries.
### C.3 Add-Widget Flow on Dashboard

The Dashboard has an explicit **"Add Widget"** control:
- **Location**: floating action button in the bottom-right corner of the Dashboard grid area, or in a Dashboard toolbar.
- **Behavior**: opens the Widget Catalog overlay (Plans/Widget_System.md section 4.2) filtered to Dashboard-compatible widgets.
- **Available widgets**: all widgets from the catalog whose "Hostable Pages" includes "Dashboard" -- this includes Usage widgets (`widget.quota_summary`, `widget.budget_donuts`, `widget.analytics_chart`, `widget.tool_usage`, `widget.multi_account`, etc.), Orchestrator Progress widgets (`widget.orchestrator_status`, `widget.current_task`, `widget.progress_bars`, etc.), and others.
- **On add**: widget placed at next available grid position with its default size. Layout persisted immediately.

This enables users to build a customized Dashboard that includes usage information, orchestrator progress, and other data -- all from a single surface.

ContractRef: ContractName:Plans/Widget_System.md#4

### C.4 Widget Catalog vs. Core Widget Catalog

Two distinct catalogs now exist. To avoid confusion:

- **Section 8 of this document** (FinalGUISpec Widget Catalog) = **atomic UI components**: StyledButton, StyledInput, StyledBadge, TreeView, CodeBlock, and other building-block primitives. These are reusable across all views and are NOT page widgets.
- **Plans/Widget_System.md section 2** = **composed page widgets**: OrchestratorStatus, BudgetDonuts, NodeTree, LedgerTable, and other content panels built FROM atomic components. These are the widgets users can add/remove/move/resize on the Dashboard, Usage page, and Orchestrator tabs.

The relationship: page widgets (Widget_System.md) are composed of atomic components (FinalGUISpec section 8).

### C.5 redb Key Migration


The existing `dashboard_layout:v1` redb key (section 15.1) stores a simple card-order list. The new widget layout system uses a richer schema. Migration strategy:

1. **On first load** after the widget system upgrade:
   - Check if `dashboard_layout:v1` exists and `widget_layout:v1:dashboard` does NOT exist.
   - If so: read the card ID list from `dashboard_layout:v1`, map each card ID to its corresponding Widget Catalog ID (per the table in C.2), assign default grid positions and sizes, and write the result as `widget_layout:v1:dashboard`.
   - Treat `dashboard_layout:v1` as deprecated migration input only; it does not remain canonical after migration completes.
2. **Future reads** use `widget_layout:v1:dashboard` only.
3. If both keys exist, `widget_layout:v1:dashboard` takes precedence.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Widget_System.md#7

### C.6 References (Appendix C)

- Plans/Widget_System.md -- widget catalog, grid system, add-widget flow, layout persistence
- Section 7.2 of this document -- Dashboard (original card grid specification)
- Section 8 of this document -- Core Widget Catalog (atomic UI components)
- Section 12.3 of this document -- Dashboard grid responsive breakpoints
- Section 15.1 of this document -- redb persistence for dashboard layout
- Plans/storage-plan.md -- redb namespaces
## 19. Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls (2026-03-06)


This addendum expands the GUI contract for Persona authoring and runtime visibility.

### 19.1 Persona editor compatibility matrix (required)

The Persona editor MUST show provider support state for Persona controls.

Support states:
- `supported`
- `partially supported`
- `unsupported`

For each control (platform/model/variant/temperature/top_p/reasoning_effort/talkativeness/tool-permission coupling/subagents), the editor must:
- show normal editing when supported,
- show warning styling and explanatory tooltip when partially supported,
- show disabled control plus explanation when unsupported.

`talkativeness` is a Persona instruction-layer control rather than a transport/runtime sampling knob. Its support state follows Persona prompt-body support: if a provider can apply Persona prompt instructions, it can apply `talkativeness`.

Minimum provider rows to display:
- Claude Code
- Cursor CLI
- OpenCode
- Direct/API providers

### 19.2 Persona editor fields (expanded)

In addition to existing Persona fields, the editor must support:
- `default_platform`
- `default_model`
- `default_variant`
- `temperature`
- `top_p`
- `reasoning_effort`
- `talkativeness`
- `preferred_tools`
- `discouraged_tools`
- `tool_usage_guidance`
- `aliases`

`talkativeness` must be rendered as a fixed single-select with these labels and stored enum values:
- `Talk a lot more` -> `talk_a_lot_more`
- `Talk more` -> `talk_more`
- `Talk a little more` -> `talk_a_little_more`
- `Model default` -> `model_default`
- `Talk a little less` -> `talk_a_little_less`
- `Talk less` -> `talk_less`

### 19.3 Compatibility panel copy examples


The editor should be able to communicate states like:
- `Claude Code: supports model preference and effort; temperature/top_p not exposed in official CLI settings.`
- `Cursor CLI: supports prompt/rules steering and some model selection; low-level runtime controls are limited or undocumented.`
- `Direct/API providers: strongest support for exact runtime controls.`

### 19.4 Surface-level Persona controls

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Runtime identity canon must preserve requested and effective naming and the account/provider identity fields, and must retire local _id substitutes.
- Consumer surfaces reference `Plans/Personas.md` and use requested/effective Persona fields without local substitutes; the only field names are `requested_persona` and `effective_persona`.

Rules:
- requested_persona
- effective_persona
- effective_account_label
### 19.5 Runtime display requirements

When a run is active, the UI must display:
- requested Persona when explicitly set,
- effective Persona,
- selection source/reason,
- effective platform,
- effective model,
- effective variant/effort when present,
- skipped Persona controls when applicable.

This display requirement applies to:
- chat status strip or header,
- interview activity card,
- requirements builder progress/status UI,
- orchestrator activity and run inspection surfaces,
- subagent inline blocks,
- multi-pass reviewer status rows.

Debug and run activity surfaces expose an `agent_trace_summary` with `subagent_count`, `tool_span_count`, `failed_attempt_count`, and `artifact_refs[]` so operator-facing cards can summarize agent work without expanding raw traces by default.

### 19.6 Natural-language invocation feedback

If the user summons a Persona via natural language, the UI must reflect it explicitly, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Researcher (User requested, session lock)`

If the override is turn-scoped, the UI should clear back to the previous/auto state on the next eligible turn.

Subagent-only Persona requests such as `Explorer` or `Bash` render as child-run/delegation feedback rather than direct chat Persona locks.

### 19.7 Provider-gap disclosure rule


The GUI must never imply that a provider honored a Persona control when it did not.

If a control is skipped, the UI must disclose it in at least one of:
- inline status text,
- tooltip,
- activity detail popover,
- run detail/history panel.

#### 19.7.1 Disclosure mechanics

- **Honored** = requested control applied as requested. **Skipped** = ignored entirely. **Clamped** = partially honored but changed to a supported value/range.
- Every disclosure must include: control name, requested value, effective value (if any), and human-readable reason.
- When a limitation is known before execution, render the control disabled or warning-badged in place; do not let the user believe it is actionable.
- When a limitation is only discovered at runtime, surface the disclosure inline on the active surface **and** persist the same information in run detail/history so it is auditable later.
- Disclosures must name the provider explicitly (for example: `Claude Code ignored reasoning_effort=high; provider does not support that control on this model`).

### 19.8 Interview/Builder/Orchestrator mapping editors

Settings or surface-specific configuration must support mapping Persona defaults to:
- Interview stages/phases,
- Requirements Builder steps/passes,
- Orchestrator node/package/lane/seam mappings,
- Multi-Pass review passes.

These editors should also allow platform/model selection per mapping and show compatibility warnings.

### 19.9 Acceptance criteria addendum

- Persona editor must disclose unsupported and partially supported controls per provider.
- All interactive run surfaces must show effective Persona/model/platform and selection reason.
- Natural-language Persona requests must be visibly reflected in the UI when active.
- Provider-gap disclosure must be explicit; no silent implied support.

> Moved to §7.4.8A — Docker Manager Panel Spec

## Rendering Surface Addendum (2026-03-07)

This addendum locks how Markdown, Mermaid, HTML, SVG, and image rendering appear in the Slint GUI.

### Surface inventory impact


The rewrite must treat browser-capable rendering as a shared capability across these surfaces:

- **Chat Panel**: rendered Markdown text, Mermaid cards, source toggle/open actions, and explicit browser-derived capture chips routed into chat
- **File Editor**: source mode, split preview mode, detached preview mode, and browser mode for HTML/workspace browsing
- **Embedded Document Pane**: preview-capable document review surface using the same rendering and preview identity contract
- **Editor-tab Browser surface**: the canonical in-shell host for `workspace_preview`
- **Detached preview/browser windows**: first-class `detached_preview` surfaces linked to the originating browser subject
- **Automation/Auth browser windows**: visible `automation_session` and `auth_session` surfaces that are not counted as normal in-shell browser tabs
- **Bottom-panel browser-adjacent surfaces**: optional logs, evidence, downloads, console/network summaries, or DevTools-adjacent panes that do not own the canonical browsing session

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Browser-derived capture chips in the Chat Panel appear in the composer chip strip with a bounded preview, page/source label, capture kind, remove/revoke affordance, and blocked/expired state when applicable. They serialize only when the user sends the message and only through the corresponding structured attachment path.

### GUI behavior rules

- Browser and agent-debugging UX follows the Section15 built-in browser contract rather than `web_search`, `web_fetch`, Site Reader, or raw CDP. The GUI presents the PM-managed CEF runtime, DevTools, visible `automation_session` / `auth_session` surfaces, `/video` evidence, `browser_selection_context`, and `browser_element_context`; capture chips must not auto-send, advanced storage or `/cookie` changes require explicit confirmation, and takeover controls expose pause, `/continue/stop`, and resume as named actions.
- Debug browser-automation defaults favor redacted summary packs, bounded evidence windows, isolated session handoff, `/audit` trails, and least-privilege browser takeover. They do not present broad shared-session control as the default user-facing model.
- Debug attention banners display `attention_required_reason_code` values such as `auth_handoff_required`, `manual_repro_required`, `manual_verification_required`, and `target_selection_required`. Debugger attach loss or manual debugger steering that PM does not own in MVP degrades to `attention_required`.
- An arbitrary URL remains a diagnose/verify-only browser investigation until PM binds it to a workspace-backed target; only then may the GUI offer durable-fix actions.
- detached preview/browser windows are part of the intended UX and are not described as degraded workarounds
- the editor/workspace tab surface is the canonical in-shell host for normal browsing and HTML preview
- the bottom panel must not be described as the primary browser host
- HTML/browser mode must visually read as a real browser-capable surface rather than as a static Markdown preview
- users must be able to watch agent-driven browser/testing sessions live when automation is running visibly
- docked DevTools is the default and lives inside the currently focused browser session surface; detached DevTools is an alternate layout
- Browser/rendered mode carries the required/desired browser capability set: it must open browser-handled content, support highlight/select browser content and screenshot capture into chat through visible chips, allow agent control to fully navigate/use user-locked web-app and website flows through named actions, preserve web-app compatibility including DevTools plus screenshot / console / network inspection, and expose DevTools on Linux, macOS, and Windows.
- Session-class UX distinguishes the same visible browser session the user watches, a separate visible automation window/tab, and hidden/ephemeral automation sessions; hidden/ephemeral sessions are allowed only as separate `automation_session` surfaces with an open/watch affordance, user-facing browser tabs remain the default visible host, and `Open in Detached Browser` is the explicit command when a separate window is needed.
- image viewing remains native and must not inherit unnecessary browser chrome

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Chat panel behavior

Chat messages that contain renderable Markdown/Mermaid content must support:

- readable Markdown formatting
- native Mermaid diagram cards where Mermaid syntax is detected
- actions for copy source, open in editor, open detached preview, and export diagram where relevant
- visible error states for malformed Mermaid instead of silent raw-block disappearance

Chat must not execute arbitrary HTML from message content.

Context Lens placement is fixed in the Chat panel: the control lives in the top-right of the chat window immediately to the right of the search bar, renders as an icon plus dropdown arrow, supports multi-select in all modes, and exposes `Mute`, `Focus`, `Subcompact`, and `Turn Off`.

### File editor behavior

The File Editor view must expose clear mode controls for render-capable files:

- Source
- Preview
- Split
- Detached preview
- Browser/rendered mode for HTML

The mode switch must not change the canonical buffer model. Split mode should preserve shared-buffer editing semantics with the existing document/editor contract.

Preview, browser, and other `/rendered` experiences are derivative of source and `/buffer` state. They may cache view mode, scroll, or export preferences, but they do not become peers with separate canonical content authority.

For local HTML, default `Open` = source editor; explicit `Open in Browser` opens the editor/workspace tabs browser surface, `Open in Detached Browser` opens a secondary detached browser window, and the editor toolbar/action plus agent file-target flow invoke the same canonical open command.

### Embedded document pane behavior

The Embedded Document Pane must reuse the same rendering pipeline and PreviewSession abstraction as the file editor and chat. It is a review/inspection surface, not a separate rendering system.

Required actions:

- open source
- open detached preview
- request re-render/reload
- perform allowed structured edits when the underlying document kind supports them

### Bottom panel browser behavior

The bottom panel is not the canonical host for normal browsing, HTML preview, or click-to-context workflows.

Allowed bottom-panel browser-adjacent roles are:
- console/network summaries for the focused browser session
- downloads, trace/video progress, and evidence activity tied to the focused browser session
- automation activity, step status, or capture status linked to a visible browser session
- DevTools-adjacent panes that complement the focused browser session without becoming a separate browser host

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

Rules:
- actions surfaced from the bottom panel must focus or act on the owning browser session rather than invent a separate browser identity
- browser open, detached-open, takeover, promotion, and recovery actions always target the canonical browser session model
- PM browser chrome and any bottom-panel browser-adjacent actions may expose DevTools entry/bridge actions (`Open DevTools`, `Toggle DevTools Dock`, `Focus Browser`) or evidence actions; deeper inspection tools live inside the DevTools UI itself, and these actions must act on the owning `browser_session_id` without making the bottom panel the primary browsing session.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

### Windowing and platform behavior

- the browser runtime expectation is a PM-managed pinned bundled CEF-class Chromium runtime on Windows, macOS, and Linux
- native child-window embedding is the baseline host strategy; offscreen rendering is secondary
- if the implementation uses a CEF wrapper such as `wef`, user-visible chrome must still present the feature as PM-managed browser capability rather than wrapper branding
- setup, Doctor, update, and installer surfaces must disclose a selected CEF path's roughly ~1 GB app-size impact and provide remediation when runtime install/update verification fails
- offscreen rendering may support capture, evidence, and degraded rendering workflows, but it must not replace the native child-window baseline for the canonical visible browser host
- detached browser and detached DevTools windows are first-class surfaces linked to the owning browser session
- GUI copy must not imply that the browser is only available through detached fallback windows or platform-specific system-webview assumptions
- when the bundled browser runtime is damaged or unavailable, the UI must surface `runtime_unavailable` with remediation and keep source/native surfaces usable
- the UI must not rely on hidden pre-created browser panes to feel responsive on platforms where hidden-window behavior is constrained

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md

### Performance and accessibility

- Use lazy rendering and virtualization for long message streams and large documents.
- Preserve scroll positions where feasible when re-rendering preview content.
- Preview controls must be keyboard reachable.
- Diagram export/open/source actions must have explicit labels and accessible tooltips/text.

### Acceptance criteria addendum

- the same logical subject can move between chat card, editor preview, embedded doc pane, editor-tab browser, detached preview, and detached browser without inventing separate rendering contracts
- Mermaid diagrams render consistently across chat, editor, and planning/doc surfaces
- HTML rendered mode behaves like a real browser/workspace preview, not a static screenshot
- the bottom panel is not required as the primary browser host for the feature to work
- platform limitations may change embedding details, but they must not remove the feature or hide requested/effective browser capability differences
- users can watch a live `automation_session`, safely take over, and promote it to normal browsing without losing the visible browser

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

## Assistant Planning UX Addendum (2026-03-08)

### 1. Assistant Chat planning controls

Assistant Chat planning controls must expose both **Plan** and **Deep Plan** as chat workflow choices.

Required controls:
- planning-mode selector entry for `Plan`
- planning-mode selector entry for `Deep Plan`
- `Plan Thoroughness (PT)` control visible when either planning overlay is active

PT control contract:
- control type: segmented control, dropdown, or equivalent compact selector
- canonical labels: `Light`, `Balanced`, `Comprehensive`
- default selection: `Balanced`
- Deep Plan and Plan share the same PT labels
- tooltip/help copy must explain that Deep Plan is more intensive than Plan at the same PT

### 2. Plan vs Deep Plan visible behavior

**Plan** UI expectations:
- lightweight plan artifact in thread
- sticky plan panel remains visible in chat
- normalized TODO list is visible before approval
- users may revise TODO structure before approval
- execution begins only after explicit approval

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Deep Plan** UI expectations:
- richer planning artifact opens in a preview-capable document/editor surface
- the same normalized TODO contract remains visible in the thread plan panel
- document review, annotations, and targeted revision remain available
- Deep Plan remains more intensive than Plan at the same PT

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Crosswalk.md

**Shared TODO tracker rules:**
- the sticky plan panel is the authoritative TODO tracker
- inline chat updates are milestone-style, not a competing tracker
- TODO statuses support at least `pending`, `in_progress`, `completed`, `blocked`, and `skipped`
- the same TODO identity must survive single-agent, subagent, and crew execution
- plan state transitions (`draft`, `approved`, `executing`, `completed`, `blocked`, `superseded`) must remain visible and restorable

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### 3. Deep Plan review in editor / Embedded Document Pane

Deep Plan documents reuse the Embedded Document Pane annotation/revision contract.

Required behavior:
- highlight text -> annotation action palette
- annotation markers in margin + annotation list/drawer
- `Resubmit with Annotations` launches targeted revision for the plan document
- deterministic annotation re-anchoring after edits
- no silent annotation loss
- no automatic Multi-Pass Review requirement before plan approval/execution

The plan document may contain:
- headings
- lists / tables
- fenced code blocks
- Mermaid diagrams
- file paths / references
- validation and rollout notes

### 4. Assistant recommendation card for Chain Wizard

When Assistant Chat or Deep Plan recommends the Chain Wizard, show a visible recommendation card rather than silently switching surfaces.

Required card content:
- reason summary (for example: `This looks like a substantial feature/enhancement that would benefit from the interview + orchestrator flow.`)
- primary CTA: `Add a new Feature or Enhancement`
- secondary action: `Stay in Chat` / `Not now`

Optional supporting copy may mention:
- that the interview can prune irrelevant phases automatically
- that imported plan/chat context will be carried into the wizard

### 5. Post-acceptance wizard handoff surface

If the user accepts the recommendation:
- switch to the Chain Wizard / Interview flow
- show a visible imported-context banner (`Imported from Assistant Chat` or `Imported from Deep Plan`)
- show whether a plan artifact was included
- show the imported goal/scope summary

Recommended imported-context panel contents:
- user goal
- scope summary
- included plan yes/no
- open questions count
- `has_gui` hint when known

If a project is already active, the wizard should open on the preloaded feature/enhancement path rather than on a blank intent picker.

### 6. Non-goals

- Do not copy external GUI layout from OpenCode, Cursor, VSCode, or other tools.
- Do not auto-create repo files for planning artifacts without explicit user action.
- Do not silently redirect the user from chat into the wizard.

### 7. Acceptance criteria

- Assistant Chat visibly exposes both Plan and Deep Plan.
- PT is shown for both planning overlays using the canonical labels `Light`, `Balanced`, and `Comprehensive`.
- Deep Plan documents open in a preview-capable editor/document surface and support durable annotations plus targeted revision.
- When the wizard is recommended, the user sees an explicit CTA and can decline without leaving chat.
- Accepting the CTA opens the Chain Wizard / Interview flow with visible imported context.
- Planning documents continue to use the shared markdown/mermaid rendering and source-canonical rules already defined elsewhere in the spec.

## Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)


> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### 1. Dashboard cards


The Dashboard must distinguish:
- `wizard_attention_required`
- `wizard_blocked`
- HITL blocked actions
- remote-side-effect blocked actions

`wizard_blocked` card requirements:
- more severe copy than `wizard_attention_required`
- primary CTA: `Resume Wizard`
- secondary CTA: `View report`
- auto-dismiss only when the wizard leaves `blocked`

### 2. Assistant thread selector / badges

#### 2.1 Worktree icon in thread selector

Each thread row in the thread selector displays a worktree icon when the thread has an active worktree binding.

- **Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention)
- **Icon:** Theme-consistent branch/tree glyph from icon set
- **Size:** Same size as status badge icons so visual weight stays consistent.
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip content:** Line 1 is the branch name, e.g. `assistant/fix-auth-bug`; line 2 is status pill text such as `clean`, `dirty`, or `conflict`; line 3 is the worktree path, e.g. `.puppet-master/worktrees/wt-abc123`.
- **Icon color:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`. Colors resolve through theme tokens across all three built-in themes.
- **Stale projection:** Icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)"
- **Accessible label:** Thread selector worktree icon uses `aria-label="Has worktree: {branch_name}, {status}"`.
- **Announcements:** Worktree state changes are announced through an `aria-live="polite"` region for create, unbind, remove, dirty status, conflict status, and creation-failed transitions.
- **Completed/failed dirty worktrees:** If a completed or failed thread still has a dirty bound worktree, the selector may show status pill text such as `dirty · completed` or `dirty · failed`, and the completion toast suggests merge/cleanup; there is no auto-cleanup.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Thread and session navigation uses persistent shell surfaces.

Rules:
- the active thread list is visible in a persistent sidebar or equivalent persistent region, not only in a floating overlay
- the selector must expose running, queued, blocked, and attention-required badges per thread
- branch lineage is visible in the selector/history model using stable branch labels and source-origin metadata
- badge aggregation must preserve highest-severity state while still showing blocked counts when present
- the project/session browser may complement thread navigation but does not replace the active-thread list inside chat

The floating thread-list overlay pattern is not canonical after this section.
### 3. Run Graph and Orchestrator views

Required visible scheduler/remediation data:
- wake reason
- ready/blocked/backoff/remediation counts
- selected-node score breakdown
- ready-but-unselected reasons
- safe-point ID
- remediation lineage identifiers

### 4. blocked outcome copy

When a remote side effect or guard prevents execution, the GUI MUST present the outcome as `blocked`, not `failed`, and must preserve any completed local work.

### 5. Event-driven correctness

All scheduler/remediation/blocked UI updates must follow the existing `invoke_from_event_loop` event-driven rule. No timer polling for correctness.

### 6. Acceptance criteria

- Dashboard has a first-class `wizard_blocked` card.
- Thread badges distinguish `blocked` from `attention_required`.
- Scheduler/remediation state is inspectable in run surfaces.
- blocked outcomes are not mislabeled as failures.
- new runtime widgets obey the event-driven rewrite rule.
## Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

The GUI must expose the packet's runtime state without relying on hidden behavior.

### Required visible elements
- queue-analysis summary with last wake reason
- blocked-state badges and grouped blocked lists
- safe-point state and restore status where applicable
- remediation lineage navigation
- disabled-action explanations tied to canonical reason codes
- clear distinction between `attention_required`, `blocked`, `retrying`, and terminal failure

### Event-driven update rule


All scheduler, blocked, and remediation widgets MUST update from runtime events/projections rather than periodic timers.

### UX safety rule
If the GUI cannot perform a required action in the current mode, it must state why and point to the canonical recovery path. The GUI must not present controls that imply hidden fallback, hidden retry, or hidden re-auth behavior.
## Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### `wizard_blocked` CtA card
Add a first-class `wizard_blocked` card alongside `wizard_attention_required`.

Required fields:
- `card_type = wizard_blocked`
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `report_ref`
- `resume_url`
- `thread_id?`

Required UI behavior:
- more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`
### Thread/status surfaces
Thread and run status surfaces MUST include distinct presentations for:
- `attention_required`
- `blocked`
- `retrying/backoff`
- `remediation`
## Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

This addendum retains GUI-specific recovery rules that supplement the canonical blocked/recovery section below.

### FileSafe rendering
A FileSafe block is a persistent blocked episode until the underlying runtime block resolves. It MUST NOT auto-dismiss while still active.

### Degraded draft warning


Decomposition degradation is a pre-lock planning state only. GUI copy MUST NOT imply silent degraded canonical execution after graph lock.

### All-nodes-blocked gating


Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical.
## Canonical Blocked/Recovery Behavior
This section is the canonical GUI summary for blocked and recovery surfaces.

### Dashboard Action Required
Blocked and recovery UI binds to canonical blocked projections and HITL records.
- `wizard_blocked` is a first-class card alongside `wizard_attention_required`
- blocked cards use the fields `card_type`, `wizard_id`, `wizard_step`, `blocked_reason_code`, `report_ref`, `resume_url`, and optional `thread_id`
- `wizard_blocked` uses more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`
- blocked payloads use ordered `allowed_action_ids[]`
- blocked episodes remain distinct when more than one is active
- GUI labels may vary by surface, but command binding always resolves through the shared runtime command catalog
- Blocked and attention-required remain distinct; `wizard-blocked` cards outrank `wizard-attention-required`, thread badges preserve highest severity and blocked counts, usage warnings preserve thresholds, quiet periods, and clear actions, and all-nodes-blocked can escalate by elapsed time.

### Thread and run status taxonomy
`waiting_approval` and other blocked reasons are runtime overlays, not replacement run-graph lifecycle states.
- lifecycle remains the graph-progress contract
- blocked, backoff, retry, remediation, and approval-pending are rendered from runtime projections
- requested vs effective persona/platform/model remains visible where runtime substitution occurred

### Scope rule
The GUI does not synthesize alternate blocked schemas, alternate action arrays, or alternate retry classes for specific surfaces.

The shared blocked/remediation taxonomy preserves actor-specific state machines and object identities: assistant, interview/builder, runtime, and Orchestrator actors consume common blocked fields without collapsing their lifecycle models.

### Visual distinction
- blocked episodes are visually distinct from ordinary paused/idle states
- multiple simultaneous blocked episodes show per-episode controls and a count summary where appropriate
- remediation-ceiling-exceeded and validation-blocked use the same blocked-payload contract as other blocked episodes rather than bespoke one-off UI treatment

### Runtime state presentation
Scheduler surfaces MUST visually distinguish:
- blocked waiting for prerequisite or approval
- retrying/backoff
- remediation in progress
- terminal failure

### Recovery UX rules
- safe points are runtime recovery anchors and MUST NOT be presented as user-facing restore points
- retry controls MUST distinguish `Retry from safe point` from `Start fresh attempt`
- if no valid safe point exists, `Retry from safe point` is disabled with an explanation
- Seam review outputs include a review verdict, failure classes with severity, evidence bundle/rationale, remediation-node or graph-patch recommendations, and corroboration requirement/outcome when invoked.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md
## Blocked-State Visual Distinction and Recovery UX Addendum

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### Blocked-state visual distinction

| State | Badge Color | Icon | Label Text | Tooltip |
|-------|-------------|------|------------|---------|
| `attention_required` | Amber | Warning triangle | "Needs input" | "This step needs your input to continue. The system can still make progress on other steps." |
| `blocked` | Red | Stop circle | "Blocked" | "This step is blocked and cannot continue until you take action. All automatic retries are exhausted." |
| `waiting_approval` | Blue | User badge | "Awaiting approval" | "This step is waiting for your approval before proceeding with a sensitive operation." |

- `attention_required` and `blocked` MUST be visually distinct -- they represent different escalation levels.
- `attention_required` allows continued background work; `blocked` does not.
- Dashboard cards, thread badges, and Run Graph View node badges all use this canonical visual mapping.

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Concurrent blocked episodes

When multiple nodes are blocked simultaneously:

1. The dashboard MUST show a count badge (e.g., "3 blocked") on the run card.
2. Clicking the badge opens a filtered list of all currently blocked nodes, sorted by `blocked_sequence` descending (most recently blocked first).
3. Each list item shows: node name, `blocked_reason_code` label, time since blocked, and the primary `allowed_action_ids[]` as action buttons.
4. The user can expand any item to see full blocked detail (explanation, `detail_ref` contents, remediation lineage if applicable).
5. Multiple concurrent blocked episodes MUST NOT be collapsed into a single notification -- each blocked node is a distinct actionable item.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Graph_View.md

### Remediation ceiling exceeded UX

When the remediation generation count reaches the ceiling (default: 3 per Plans/Decision_Policy.md):

1. The node transitions to `blocked` with `blocked_reason_code: remediation_ceiling_exceeded`.
2. The Run Graph View displays a red "Remediation limit reached" banner on the node detail panel.
3. Available actions presented to the user:
   - **Replan** (`cmd.orchestrator.replan_node`): Trigger a graph replan that may restructure the node's dependencies.
   - **Manual fix** (`cmd.orchestrator.open_for_edit`): Open the relevant files for manual editing, then resume.
   - **Abort node** (`cmd.orchestrator.abort_node`): Mark the node as permanently failed and continue the run without it (if the graph allows).
4. The remediation lineage tree remains visible for diagnostic purposes.
5. No automatic retry is permitted after ceiling is reached.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Graph_View.md

### Degradation warning

When draft decomposition degrades from graph to flat sequencing (before canonical graph lock):

1. The UI displays an amber warning banner: "Plan simplified to sequential steps due to structural issues in the decomposition. Performance may be reduced."
2. The banner includes a "View details" link that shows the specific `graph_integrity` issues detected.
3. No user action is required -- the run continues with flat sequencing automatically.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/chain-wizard-flexibility.md

### All-nodes-blocked circuit breaker

If all runnable nodes in a run are simultaneously in blocked state:

> **Superseded** — event-driven blocked-state transitions are canonical. The GUI must react to runtime events and projections, not timer-driven pause or warning thresholds.

Canonical rule:
1. When all runnable nodes are blocked, the runtime emits the relevant blocked/recovery events and the UI shows the corresponding persistent blocked-state banner or card immediately.
2. The user can resume at any time after resolving blocks.
3. Polling intervals are acceptable only for external systems without push delivery (for example GitHub Actions status refresh every 30s) and must be documented as freshness aids rather than canonical correctness logic.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

## 15. Promoted widget catalog (web tools, planning, question, operation cards)

The promoted widget catalog mirrors the shared runtime contracts. Widget entries below replace the older mixed status taxonomy and Mermaid-only collapse.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Traceability carry-through for this widget catalog preserves consumer/owner obligations `obl-008`, `obl-009`, `obl-021`, `obl-029`, `obl-038`, `obl-061`, `obl-062`, `obl-035`, `obl-036`, `obl-037`, `obl-045`, `obl-051`, `obl-053`, `obl-056`, `obl-059`, `obl-060`, and `obl-064`.

Currentness and fidelity carry-through rules:
- The 2026-04-06 packet-alignment register is historical context only. Final GUI packet regeneration follows the narrowed current reset: live widget text consumes repaired owner docs, and any remaining packet-shape defect inside `Plans/Tools.md#10` must not create duplicate or generalized Final GUI canon.
- `FID-013`: Web and diff cards consume `changeTracking` or its explicit retirement from the Tools owner; GUI text must not regress to stale `change_status` / `change_summary` as the visible contract.
- `FID-029`: Web approval summaries preserve session-pattern semantics in permission and approval cards.
- `FID-008`: Site Reader cards require browser-capability disclosure and no-reuse routing identity; provider fetch cannot reuse PM-native `Reading Site`.
- `FID-009`: Search-then-read citation locality is preserved; final citations come from the actual read path.
- `FID-021`: `progress_event` carry-through includes `tool_use_id`, `operation`, `phase`, `detail`, `pages_completed`, `pages_total`, `elapsed_ms`, `estimated_remaining_ms`, and `cancelled: true`.
- `FID-041`: Planning widgets consume `todowrite` statuses/notes and `todoread` active thread/run scope.
- `FID-040`: `chat.plan_todo_updated` remains the owner-contract definition for durable normalized TODO mutation.
- `FID-043` / `FID-043B`: Question cards preserve `response_kind`, `validation_state`, and the compatibility rule that `allow_other is a deprecated alias`; `allow_other` normalizes to `allow_freeform` and must not become a new canonical field.
- `FID-038`: Queue semantics stay transient, and stale `chat_state:v1` restore residue must not rehydrate queued work across reload or restart.
- `FID-061`: Runtime identity carry-through includes `requested_account_binding`, `operational_identity`, `effective_account_label`, `effective_provider_identity`, and `effective_project_id`; it never revives `requested_persona_id` as GUI identity canon.

Chat-panel carry-through into promoted widgets includes `activity-card` rendering, `jump-to-latest` badge behavior that re-enables `/auto-follow` when the user returns to the bottom, `/auto-follow` scroll state, `/search/diff` card anatomy, live TODO tracker ownership, and the provider settings layout constraint: provider routing/configuration internals stay OUT of FinalGUISpec while provider-runtime docs remain provisional.

Final GUI ownership includes chat-visible queue behavior, chat widgets, the sticky plan panel as a live TODO execution tracker, question forms, Agent Config IA, terminal `/open-in-terminal` behavior, and `activity-card` rendering; provider routing/configuration internals stay out of this GUI consumer surface.

### 15.1 Terminal operation card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Operation cards preserve the three-way rendering distinction across terminal, search, and diff/web cards; card-level status badges use the lifecycle `idle→running→success|error|timeout` while owner runtimes keep their richer internal taxonomies.
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy: header, status badge, body, and action row with per-type specialization.
- Terminal promotion and handoff are locked so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal action canon must preserve the distinct terminal actions and give Rerun in Terminal owned command-table treatment rather than collapsing actions into one normalized target.
- Terminal cards default to a collapsed tool line with inline expand for immediate inspection, explicit open/show actions through `Open in Terminal` / `Show Terminal` reveal controls for the canonical terminal session, and an explicit background/continue-in-terminal action for long-running commands.
- Type-specific primary actions stay distinct: terminal cards expose `Open in Terminal` and `/open-in-terminal`; search cards open or `/focus` the results view `/list`; edit `/diff` cards open the file in the editor with the diff visible.
- Rendering identity remains explicit: one-shot `bash` tool invocations and search tools render inline, while shell-owned live terminal/output surfaces own longer sessions and full `/output`; Chat or Bottom panel (`Terminal/Output`) pop-out triggers detach or re-dock the shell panel without changing session identity.
- Terminal-command approval copy may include sandbox/approval/allowlist context when that helps developer-trust-forward user trust, but terminal-first framing applies only where the owning surface is terminal-centric; chat and terminal must not collapse into one undifferentiated transcript.
- The scope boundary is additive-vs-replacement: `/inline` chat cards, `/command-card` previews, mini-terminal previews, and `/Problems/Ports/Browser` `/linkback` affordances add views into the shell-owned terminal/workflow model rather than minting brand-new pseudo-terminals.
- This keeps terminal-adjacent previews in-scope as bounded chat-owned views while the shell-first runtime remains canonical; out-of-scope and non-canonical alternatives include independent mini-terminal products or inline pseudo-terminals with separate runtime ownership.
- Detached or `/popped-out` terminal windows, `/remoted` or browser-adjacent `/presentation` layers, and terminal-adjacent dev-session views are `/reaffirmed` as presentations of canonical terminal sessions, not competing product models.

Fields:
- terminal_session_id
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out

Rules:
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator
- READ-ONLY and non-interactive
- One card per command
- Retries create a new terminal and therefore a new mini terminal card; Rerun in Terminal creates a new card rather than mutating the completed card
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- Every promoted command card binds to stable terminal session identity
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
### 15.2 Search result card widget


This section consumes the linked owner contract and stays aligned with it.

ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Core rules:
- Answer construction must preserve search-then-read behavior, final citations must come from the actual read path rather than raw search snippets alone, and web activity/provenance docs must use the exact storage/contracts/browser ContractRef targets instead of malformed generic anchors.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.

Fields:
- Serper-backed Google-result behavior
- sources
- categories
- optional result scraping behavior in Firecrawl `websearch`

Rules:
- search-then-read behavior
- final citations come from the actual read path
- raw search snippets alone are not enough provenance for the final answer
- chat may shortlist with search but must read chosen pages before citing them as final evidence
### 15.3 Web and diff operation card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The web routing algorithm must include a capability-unavailable terminal branch with clear setup guidance when no provider supports the requested operation.
- Site Reader canon must require real browser interaction, reserve `Reading Site` for the PM-native Site Reader path, and prevent provider-routed fetch from reusing that reserved identity.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract.
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Operation cards are restricted to stateful, time-bounded lifecycle-bearing operations, exclude other widget families, and use a locked card-level state machine reconciled against the 8-state agent/process taxonomy.
- Message controls are locked to most-recent-user scope, queued-message FIFO semantics, explicit rewind/discard behavior, always-visible code-block copy, mandatory subagent disclosure, and transient queue state that is not restored across reload or restart.
- All web tools share a common output field set that includes provider identity, routing reason, timing, cache status, and standard error or warning fields.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.
- Web activity detail payloads display `adapter_id` examples (e.g. `exa`, `firecrawl`, and `pm_native`); `timestamp` is an ISO 8601 string; `execution_path` may be `pm_site_reader`, `provider_firecrawl_scrape`, or another owner-defined route; and non-fatal `warnings` surface with the activity details.
- The display schema treats `tool_use_id`, `adapter_id`, `adapter_selection_reason`, `timestamp`, `error_code`, `error_message`, `provenance_badge`, and `execution_path` as string fields, `duration_ms` as number, `cached` as boolean, and `warnings` as string[].
- Chat message-stream controls expose a `jump-to-latest` / `jump-to-bottom` to-bottom control with an `unseen-count` badge when the user is away from the bottom, and `/auto-follow` resumes only when the user returns to the bottom.
- Web/search/diff cards preserve distinct card anatomy: `Searching Web` is the activity label for web search or research discovery, `Reading Site` is reserved for native Site Reader, and `/diff` cards plus search cards do not inherit code-block copy affordances.
- Web activity card collapsed labels use the concrete operation: `Searching Web: <query>`, `Fetching Site: <url> (via <provider>)`, `Reading Site: <url>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, and `Mapping Site: <url>`; `Reading Site: <url>` is reserved EXCLUSIVELY for the PM-native Site Reader path, while provider-routed or provider-delegated fetch uses `Fetching Site: <url> (via <provider>)`.
- Narrative order is command trigger in assistant narrative, inline operation card (mini terminal/search/diff), then assistant textual summary `/commentary`; cards do not float out of narrative position.
- Web operation cards render completed content only on `/completion`; while running, activity progress text may stream labels such as `Researching Web: <query>` or `Crawling Site: example.com (12/25 pages)` for `/25` page caps, and summary rows use `<operation>: <query/url> — N sources` when a source count is available.
- Web/provider GUI consumers treat `Plans/Tools.md` as the PRIMARY SSOT for `WebAction`, Firecrawl-as-provider routing, `/questionnaire` and TODO carry-through, while FinalGUISpec owns visible card/progress behavior.
- GUI web cards expose structured `web_input` as operation input; TODO projections surfaced with web/activity progress use `pending | in_progress | completed | blocked | skipped`.
- Runtime disclosure fields shown by web cards include `requested_account_binding`, `operational_identity`, `effective_account_label`, `effective_provider_identity`, and `effective_project_id` when present.
- Legacy `/operation-card` references normalize to the operation-card widget family; individual web, terminal, search, and diff card types keep their owner-specific payload contracts.
- Search and diff/web cards do not expose terminal `show terminal` or `detach/pop-out` affordances; only terminal cards expose those actions, while long-running web operations may use `background` state.
- Provider disclosure displays the exact provider class split `account-backed|API-backed|no-key`, surfaces `QuestionItem`-aligned question widgets, and keeps shared widget statuses within `pending|running|completed|failed|cancelled|blocked`.
- Expanded web activity details include operation input, requested/effective runtime delta when relevant, support tier, fallback disclosure when relevant, source count or scope summary, and warning or error text.
- Rate-limit/outage fallback cards show the failed provider and next same-operation provider in the visible activity label; the audit log records the same explanation in `provider_fallback_summary`.

Fields:
- webresearch
- no-URL natural-language research
- navigation/forms/pagination capability
- structured extraction behavior during provider-native research
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- cancelled: true
- status_badge_state
- `tool_use_id`
- `adapter_id`
- `adapter_selection_reason`
- `duration_ms`
- `timestamp`
- `cached`
- `error_code?`
- `error_message?`
- `warnings?`
- `provenance_badge?`
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health

Rules:
- capability-unavailable terminal branch
- clear setup guidance when no provider supports the requested operation
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- Reading Site
- provider-routed fetch must not reuse the reserved native Site Reader identity
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator
- READ-ONLY and non-interactive
- One card per command
- Retries create a new terminal and therefore a new mini terminal card
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out
- pending
- pending | in_progress | completed | blocked | skipped
- running
- completed
- failed
- cancelled
- blocked
- starting
- exited
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- discards all later history/work
- FIFO, max 2 queued messages
- queue is transient and not restart-persisted
- Stop does NOT clear the queue
- always-visible copy affordance on fenced code blocks
- queue state is transient and is not restored across reload or restart
- blocked_reason_code
- allowed_action_ids[]
- denial_reason_code
- denial_source
- suggested_recovery_action
- adapter_id
- adapter_unavailable
- badge is always visible
- running output may promote out of inline comfort based on heuristic thresholds
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- Terminal and inline operation-card badge consumers align with `assistant-chat-design.md §13` for command-card states: `starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, and `attention_required`. Generic workflow states such as `completed`, `cancelled`, or `blocked` may appear on other shared widgets, but terminal command cards must map completion to `exited`, cancellation to `terminated`, and recovery/action-needed cases to `attention_required` or blocked-with-reason as specified by the owning chat contract.
- When the user backgrounds a long-running operation card, the card-state enters `background` state and shows a `backgrounded` badge; completion updates the badge to `completed` or `failed` and notifies the user.
- Card anatomy is per-card-type: compact previews use 5 lines, expanded detail uses a `/15-line` cap, complete-result cards persist after completion, background cards retain `background` state, FIFO message queues remain separate from operation-card state, and terminal retries expose `Rerun in Terminal` as a new card.
- Terminal operation actions preserve `Open in Terminal|Show Terminal|Rerun in Terminal|Detach/Pop-Out` as distinct UI actions over the owning terminal session.
- simple read/grep/glob results remain inline text, not cards
- Stop becomes disabled when a run completes and no next message is queued
- Edit restores content into composer and discards later history/work
- Resend retries the most recent message and discards later history/work
- blocked responses must be machine-actionable through `allowed_action_ids[]`
- error naming aligns to `adapter_unavailable`
- Blocked or unavailable web/provider cards may display exact surfaced reason labels such as `permission_denied`, `network_error`, `provider_unavailable`, `headless_unavailable`, and `timeout`; contract payloads still normalize provider failures through owner-owned error codes, and the card carries `status: "unavailable"`, `blocked_reason_code`, `allowed_action_ids[]`, and audit routing fields for recovery.
### 15.4 Planning panel widget (sticky sidebar)

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/assistant-chat-design.md#8.1 Canonical planning model

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- The sticky Plan panel is per thread and is the authoritative TODO tracker. It shows plan title/summary, TODOs in canonical order, status badge per TODO, dependency hints, owner or delegated-executor badge when relevant, and verification hint.
- Legacy optional spellings `notes?` and `order_index?` normalize to canonical `notes` and `order_index`; this intentionally retires the source `?` suffix rather than dropping notes or ordering.
- The sticky Plan panel is a live execution tracker, not a checkbox-only list; inline question forms align to the shared `questionnaire` contract before execution advances.
- Before approval, the Plan panel exposes structural editing controls for TODO items. After approval, the approved/executing plan becomes an execution-tracker view with read-mostly structure while still showing live status changes.
- Inline chat progress is limited to compact milestones such as `Started TODO 2/5: add parser tests`, `Completed TODO 2/5`, and `Blocked TODO 3/5: waiting on permission`; clicking a milestone focuses or opens the sticky Plan panel at that item when possible.
- Completed or blocked plan execution leaves the final TODO states visible in thread and panel history, and returning to Ask mode must not erase the plan/TODO state for that thread.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- order_index
- owner_hint
- verification_hint
- notes
- pending | in_progress | completed | blocked | skipped
- superseded
- `superseded` is plan-level only and is not a queue item state
- UI copy must not say `superseded by newer run` unless explicit run-relationship metadata proves derivation, continuation, replacement, or validity lineage; otherwise run history remains chronological-first and the label stays unavailable.

Labels and values:
- Plan
- Deep Plan
- chat.plan_todo_updated
### 15.5 Question card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question flows are locked to PM-managed draft state, required visible options plus a freeform path, resumable multi-question drafts, and explicit dismissed or paused behavior instead of fabricated answers.
- Question cards are a reusable Assistant/Interviewer/requirements-builder component family rather than Interview-only wording. They support `single_question` and multi-question `questionnaire` flows, draft navigation, out-of-order completion, final submit, and continuous draft persistence.
- The `question-card` family uses a `question-flow` form for multi-question sets: navigable `/flow` or `/list`, out-of-order answering, edits before final submission, draft state that auto-saves, final submit only when required answers are complete, and exiting or dismissing never auto-submits or performs `auto-submitting` fallback.
- Question cards may include visuals when `/helpful`; visuals may write to question-flow draft state, but inline visuals are not `question-only` and may also serve user-requested interactive artifacts.
- Headless or `HITL`-unavailable paths return `status = "unavailable"` rather than fabricated answers, and subagent `/brainstorming` must consolidate through the top-level question flow instead of spawning independent user prompts.
- Task/subagent/question escalation is consumed from `Plans/orchestrator-subagent-integration.md` (`/orchestrator-subagent-integration.md`); Final GUI question cards align shared question/runtime display without redefining child-run ownership.
- Single-choice + Other is represented by `single_question` plus `allow_freeform`; richer preference collection uses the shared multi-select questionnaire contract when the schema sets `multi_select`.
- Question-card draft persistence is thread-scoped and `/structured`: per-question `draft_value` and partial answers auto-save continuously, restore on `/navigation-return` or `/close`, and expose no manual save control.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- NOT via `sendPrompt`
- question visuals write to PM draft state, not `sendPrompt`
- Something else
- Always-visible options
- Drafts auto-save until submit
- Exiting/dismissing does NOT auto-submit
- Thread-scoped draft state
- status: 'dismissed'
- draft
- drafts auto-save continuously
- required questions block final submit
- question cards may include a visual
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
- `draft → incomplete` = user begins answering any question
- `incomplete → ready_to_submit` = all `required` questions answered
- `ready_to_submit → submitted` = user confirms submit
- `submitted → [terminal]` = no further transitions
### 15.6 Mermaid and inline visualizer widgets


### 15.6A Visualizer runtime contract

This section defines the canonical contract for this surface.

ContractRef: Plans/assistant-chat-design.md#28.2 Inline visualizer bridge

Core rules:
- Mermaid and inline visualizer behavior is locked to native card rendering, explicit error and fallback disclosure, sandboxing without arbitrary HTML execution, bounded persistence, injected theme tokens, and the exact inline visualizer bridge cross-reference target.
- Native Mermaid remains source-text-first, while richer `HTML/JS` or `/JS` visuals render as sandboxed `visual-module` cards with `/design` tokens, sizing `/auto-height`, an `open-link` bridge, and local `in-module` state only.
- Inline visualizer iframe embeds MUST set `sandbox="allow-scripts"`; the exact minimum attribute is `sandbox='allow-scripts'`. They MUST NOT include `allow-same-origin`, `allow-forms`, `allow-popups`, or `allow-top-navigation`; those tokens are explicitly DENIED, and the widget communicates with PM only through the `postMessage` bridge for all cross-boundary communication.
- Non-iframe Markdown, Mermaid, HTML, and SVG rendering follows the sanitizer baseline in `Plans/assistant-chat-design.md`: standard HTML5 safe subset per DOMPurify `DEFAULT_ALLOWED_TAGS`, approved URL-bearing attributes only, and no raw `<script>`, `<iframe>`, `<object>`, `<embed>`, or `<style>` with external URL references.
- The visualizer host bridge is limited to async-safe `sendPrompt(text: string): void`, `openLink(url: string, target?: "_blank" | "_self"): void`, `copyToClipboard(text: string): Promise<boolean>`, and `requestResize(width?: number, height?: number): void`. `_blank` opens a new tab, `_self` navigation is blocked in sandboxed cards, and resize requests remain host-constrained. For question-flow embedded visual modules, the host omits `sendPrompt` from the bridge and exposes only the narrowed PM-managed question-draft bridge, so visuals cannot bypass PM draft state by queueing chat messages.
- Decision #10 is resolved for the Final GUI consumer: visualizer theme-token injection is locked for MVP as CSS custom properties on the inline `style` attribute of the visualizer container. MVP tokens are `--pm-viz-bg`, `--pm-viz-fg`, `--pm-viz-accent`, `--pm-viz-border`, `--pm-viz-font-family`, and `--pm-viz-font-size`; visualizer fragments MUST use those tokens and hardcoded replacement colors are prohibited.
- Bridge calls preserve exact GUI host semantics: `sendPrompt(text)` queues into the active thread composer outside question-flow contexts; question-flow embedded visuals do not receive `sendPrompt` and write draft answers only through the narrowed question bridge; `openLink(url)` routes through `cmd.browser.open_detached_preview` or the system browser when external; theme injection pushes the CSS custom property bundle on mount and theme change; resize reporting sends `{ height: px }` to the host, which adjusts the visual card height within host constraints.
- PM visual-runtime script loading is closed by default: a `/third-party-library` may execute inside the inline `visual-runtime` only when it is bundled, version-pinned, integrity-recorded, declared in the artifact metadata, and loaded inside the existing sandboxed runtime. Remote CDN scripts, dynamic network import, same-origin escalation, popup/form/top-navigation permissions, and undeclared runtime script injection are not valid MVP paths.
- Generated visual modules render as PM visual cards and follow the stricter MVP allowlist stance: allowed libraries must be BUNDLED in the source fragment, no CDN fetches at runtime, and no unvetted network requests from within the visual module. Exact allowlist TBD remains an open design item; the recommended MVP behavior is no external libraries, so the agent must inline all code. Post-MVP, a curated allowlist of bundled libraries may include examples such as D3, Chart.js, and Three.js.
- Inline visualizer logging is audit-oriented and bounded: PM records render errors, sandbox violations, bridge messages, export actions, and detached-preview opens as structured activity metadata or refs. These persistence/logging/export expectations must not log arbitrary DOM contents, user secrets, or full visual payloads unless the selected export/evidence profile explicitly permits them.
- Visualizer persistence keeps rendered output references, source data, and metadata; it must not persist transient rendering state, animation positions, scroll offsets, or ephemeral JS variables.
- Visualizer and provider-disclosure consumer controls carry `status: "unavailable"`, `proxy_mode`, `basic`, `enhanced`, `auto`, Fire Engine limitation copy, `Copy source`, `Open in editor`, `Open detached preview`, and `Export diagram` as display fields, with audit-field logging refs rather than local owner state.
- The Final GUI remains a live consumer for blocked-state, visualizer, provider, question, planning, and audit-field canon; stale widget wording retires in place rather than downgrading unresolved owner propagation to verify-only guidance.

Rules:
- Copy source
- Open in editor
- Open detached preview
- Export diagram
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- sendPrompt(text)
- openLink(url)
- copyToClipboard(text)
- requestResize(width?, height?)
### 15.7 Permission approval card widget

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget

Core rules:
- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools independently visible and ask-gated in plan presets, allow strict read_only/no-network presets to deny them, and carry the blocked/unavailable payload fields through to permission-card consumers.
- Permission defaults consume allow/deny/ask from Permissions_System; web tools remain ask-gated unless preset policy resolves otherwise.
- In-chat approval cards MUST NOT mutate Persona profiles; approval outcomes write only to the session approval cache or canonical permissions project/global rule storage, and Persona profile edits remain owned by the Personas management surface.
- A `todowrite` auto-use approval prompt in ask-mode lists the proposed TODO items before creation; auto-approved `todowrite` creates items silently and surfaces the resulting plan-panel update.

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- `Once` approves only this invocation.
- `For Session` for search/research approves the current web tool for the current session with suggested pattern `*`.
- `For Session` for fetch/extract/crawl/map approves the host/site for the current session with suggested pattern `https://host.example/*`.
- `Deny` rejects this invocation and other pending asks in the same session that share the same approval ask.
- Session approval scope is host-scoped for fetch/extract/crawl/map; example URL pattern `https://docs.example.com/*` normalizes to host `//docs.example.com/` for display, and approving crawl may share the same host-scoped pattern across `/crawl/map/fetch` without becoming tool-wide.
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern and same tool-key semantics
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- Search/research session approval remains tool-wide only for the current web tool/session.
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/FinalGUISpec.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### F3-001 - Puppet Master GUI Specification -- Slint Rewrite Source-Preserving PlanUnit

```yaml
plan_unit_id: F3-001
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Plans/FinalGUISpec.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0154
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0155
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0156
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0157
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0158
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0159
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0160
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0161
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0162
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0163
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0164
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0165
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0166
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0167
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0168
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0169
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0170
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0171
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0172
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0173
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0174
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0175
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0176
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0177
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0178
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0179
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0180
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0181
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0182
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0183
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0184
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0185
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0186
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0187
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0188
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0189
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0190
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0191
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0192
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0193
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0194
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0195
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0196
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0197
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0198
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0199
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0200
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0201
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0202
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0203
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0204
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0205
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0206
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0207
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0208
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0209
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0210
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0211
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0212
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0213
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0214
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0215
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0216
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0217
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0218
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0219
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0220
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0221
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0222
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0223
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0224
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0225
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0226
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0227
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0228
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0229
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0230
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0231
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0232
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0233
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0234
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0235
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0236
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0237
preserved_exact_tokens:
- Puppet Master GUI Specification -- Slint Rewrite
- Canonical owner-section requirements
- Concern record family definition
- Concern routing and object-first search behavior
- Concern action policy and authority model
- Projection trust and action gating
- Progress-only widget hostability
- Shared escalation ladder
- Action-surface policy
- Glossary and help governance
- Notification routing policy
- Canonical route payload
- Project summary projection
- Project attention projection
- Requested concrete-account fields
- Execution role and operational identity
- Projection freshness vs projection health
- Dismissed vs resolved rationale enforcement
- Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Recommended minimum concern record shape
- Table of Contents
- 1. Executive Summary
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
- 2. Tech Stack and Renderer
negative_constraints:
- '- FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling.'
- Operational identities may display provider/account identity and `/account` source metadata, but the GUI must not imply shared token ownership across accounts, providers, or execution roles.
- '- If a stale-but-valid snapshot is still serving grep or Search, the indicator may show refresh progress, but the UI must not imply that Search is fully unindexed.'
- Remote search freshness copy cross-references `Plans/GitHub_Integration.md` (`/GitHub_Integration.md`) for the SSH file-watcher channel; the regex-index dirty layer and Tantivy code index subscribe to the same notification channel, so the GUI must not imply duplicate watcher setup.
- 'Panel-ownership is resolved before any plan-doc rewrite, shortcut map, or command-palette migration changes shell navigation. The activity bar MUST NOT expose a `Git` icon that opens `GITHUB ACTIONS`: `GITHUB ACTIONS` belongs to panel ID `github_actions`, and `SOURCE CONTROL` / `CONTROL` belongs to '
- Panel-specific UX state must not be `co-mingled` with global policy settings. Settings > Branching / Health owns global Git/worktree policy, recovery, and correctness controls; Settings > Advanced owns GitHub Actions generation/template controls and Docker/registry defaults. Per-panel expansion, fil
- '- Auto-retrieval (Tantivy search, `@file` resolution) remains project-scoped, not worktree-scoped; GUI search surfaces may expose the results, but they must not imply that the retrieval corpus was narrowed to only the active worktree.'
- '- the terminal grid must not use a split-parent opacity enter animation that dims all children during reorder or drag operations.'
- '**Conditional overlays:** Paper texture and pixel grid are optional overlay components at the root, bound to `Theme.retro-effects-enabled`. Implementations must not branch component logic on theme; only the presence/absence of these overlay nodes changes.'
- '`Progress` widgets must not teach active-tier, `phase-task-subtask`, or `tier-targeted` terminal semantics as the primary operational mental model; those spellings remain compatibility labels behind native Progress, package, lane, and runtime-object routing.'
- Blocked-state integration uses one shared contract rather than surface-specific recovery wording. Orchestrator remains the hub for blocked episodes, while destination panels render the same reason code, owner route, recovery CTA, and allowed actions in local context. If a destination panel cannot ho
- '`Plans/assistant-chat-design.md` / `assistant-chat-design.md` message `jump-to-message`, search, and persistence behavior consume the same object-first route model; chat may store `resume_url` for recovery portability, but it must not fall back to path-first opening.'
- '`subject_id` is for openable `/renderable` content subjects only; it must not become a second generic object taxonomy beside `object_kind` / `object_id`.'
- Interview and other `/document-production` runs may carry runtime identity plus blocked `/remediation` state, but they are not Orchestrator package `/node` execution records and must not collapse into the package/node object model.
- Legacy `DOCKER MANAGE`, `Docker Manage`, `docker_manage_surface_state`, and separate Unraid panel references are migration aliases. They open Docker Manager, optionally focused to `Publish / Unraid`, and must not create a second activity-bar slot or remain embedded under Persona Editor.
- 'Runtime alert lifecycle defines `/auto-resolution`: an alert may auto-resolve on healthy refresh, downgrade to historical `/seen` after acknowledgment, and clear badges consistently across mirrored surfaces. Persistent non-blocking issues support `per-alert` `acknowledge`, `snooze`, and `/snooze/mut'
- '- provider settings layout stays OUT of this GUI widget contract while provider-runtime docs remain provisional; this document owns UI widget contracts and must not encode provider routing or configuration internals'
- '- chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console; they link to those shell surfaces instead'
- '- Tree-level actions include `New file`, `New folder`, `Rename`, `Delete`, Copy full path, Copy relative path, Add to Assistant Chat, Open With, Download / Save Local Copy, and `/Cut/Paste` for workspace nodes. `cmd.file` / `cmd.file.*` is the command-family for workspace-node actions, and missing a'
- '- Embedded editor surfaces are leaf editing/rendering surfaces, not owners of workspace truth. DOM/browser-coupled, browser-specific, browser-runner, service-worker, query-string, localStorage, `/browser-coupled`, `/shared-doc`, `/render-root`, `/selection/IME/paste/shadow-root/Firefox`, `/auth/inpu'
- '- Per-surface state may persist `line`, `range`, `active_subview`, compare target, panel layout, browser tab state, and widget layout only as view state; it must not replace canonical route identity.'
- Git/source-control discard/compare/stage actions are not editor undo. Restore points, rollback, and revert-last-agent-edit stay explicit restore-history commands, and the GUI must not bury them behind git-panel affordances. The File Editor must expose diff heat-map/change-marker and scrollbar change
- '- polling is acceptable for external systems that do not provide push updates, such as GitHub Actions status checks; those intervals are freshness aids only and must not become the correctness model for the rest of the shell'
- Non-text path/value copy actions must copy the exact underlying value via the shared clipboard helper and must not depend on text rendering quirks.
compatibility_only_notes:
- '- `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) six-tab `Tiers` carry-through is stale: widget-based tabs `1, 2, 4, 5, 6`, `widget.tier_tree`, `widget.current_task`, `widget.progress_bars`, `tier_id`, `request_id`, `requested_persona_id`, `effective_persona_id`, `provider`, `model`, and `Pu'
- '- `Plans/Widget_System.md` (`/Widget_System.md`) tier-centric `Orch/Tiers` and `/Tiers` entries, `widget.agent_terminal`, `widget.completed_prose`, `widget.tier_tree`, older `TierChanged` / `IterationStart` pushes, and `/task/subtask`-oriented `widget.current_task` remain compatibility vocabulary; o'
- '- Legacy `GUI` inventory entries such as `/current-task`, `7.7 Tiers`, tier-oriented Settings, `Orchestrator tabs`, `wizard_attention_required`, `resume_url`, and phase-task-subtask progress bars stay searchable compatibility copy, but primary navigation moves to native graph/package/lane/seam surfa'
- '- Legacy Progress widget catalog fields such as `widget.current_task`, `widget.progress_bars`, `widget.cta_stack`, `widget.agent_terminal`, and `widget.completed_prose` plus `PuppetMasterEvent`, `PuppetMasterEvent::UserInteractionRequired`, `UserInteractionRequired`, `tier_id`, `/tasks`, `/task/subt'
- '- `Widget_System` / `Widget_System.md` keeps `/Tiers`, `Orch/Tiers`, `Orch/Evidence`, `Orch/History`, `Orch/Ledger`, `/Evidence`, `/History`, and `/Ledger` as legacy widget-composed catalog aliases only; only `Progress` remains widget-composed in native Orchestrator.'
- '- `Orchestrator_Page` / `Orchestrator_Page.md` Progress widgets that still center active-tier or tier-targeted terminal semantics are legacy inputs; `widget.agent_terminal`, `widget.completed_prose`, `widget.current_task`, `widget.progress_bars`, `/task/subtask`, and `/objective/platform/model` reso'
- '`Plans/Run_Graph_View.md` (`/Run_Graph_View.md`) `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` actions use `blocked_sequence` and ordered `allowed_action_ids[]`; legacy `hitl_request_id` is compatibility display metadata, not a second `HITL` approval identity.'
- '`Plans/Prompt_Pipeline.md` / `/Prompt_Pipeline.md` locks requested `/effective` identity semantics, including concrete-account intent, while tier-era override ownership is compatibility vocabulary only.'
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- 19. [Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls](#19-persona-editor-compatibility-disclosure-and-surface-level-persona-controls-2026-03-06)
- 'Provider CLI backend eligibility is separate from Slint renderer selection: Cursor CLI must be re-evaluated as an ACP-capable first-class CLI backend, not only a stream-json bridge, before GUI diagnostics classify it as a legacy stream transport.'
- '`FinalGUISpec.md §3.1` is the shell confirmation for right-hand side-panel occupants: the side panel is the Activity Bar surface slot with a 240-480px width budget. Legacy labels such as `/File`, `/Source`, `/GitHub`, and `/etc` are migration labels for occupants or groups, not separate page surface'
- 'Panel-ownership is resolved before any plan-doc rewrite, shortcut map, or command-palette migration changes shell navigation. The activity bar MUST NOT expose a `Git` icon that opens `GITHUB ACTIONS`: `GITHUB ACTIONS` belongs to panel ID `github_actions`, and `SOURCE CONTROL` / `CONTROL` belongs to '
- Legacy widget-composed tab keys `orchestrator:tiers`, `orchestrator:evidence`, `orchestrator:history`, and `orchestrator:ledger` plus generic `/remove/move/resize` behavior are migration aliases; only `orchestrator:progress` persists as the Orchestrator widget layout key.
- '`Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` carry-through references to `Tab 2: Tiers`, `orchestrator:tiers`, and `FinalGUISpec section 7.7` are legacy aliases only; FinalGUISpec keeps them searchable without restoring a Tiers tab as canonical Orchestrator navigation.'
- Legacy tier-era `Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` signals such as `Progress`, `Tiers`, `Node Graph`, `Evidence`, `History`, `Ledger`, the six-tab shell, `active tier`, `phase/task/subtask`, `TierChanged`, and cross-surface `CTA` labels are compatibility inputs only; native Orche
- '`Orchestrator_Page.md` and `Run_Graph_View.md` user-facing help and `/copy` translate legacy data-model labels, including `Tiers`, `Phase/Task/Subtask`, `/Task/Subtask`, and `Overseer`, into native graph/package/seam/lane terms instead of presenting tier-era wording as current guidance.'
- Tier/group views, where retained as compatibility projections, carry pointers to canonical execution objects for `/group` display and `/audit` routing; `tier_id` is never the primary mutation or audit key.
- '`Orchestrator_Page` / `Orchestrator_Page.md` legacy ontology may still be visible in tab structure, widget structure, event sources, filter keys, and worker identity fields, but those are migration signals rather than canonical execution identity.'
- The old `all Orchestrator tabs are widget canvases` model from `Widget_System.md` and `Orchestrator_Page.md` is compatibility-only; Progress stays the sole widget-composed Orchestrator tab, while Seams, Node Graph, Evidence, History, and Ledger remain native views.
- '`Plans/FinalGUISpec.md` / `/FinalGUISpec.md`, `Widget_System` / `Widget_System.md`, and `Orchestrator_Page` / `Orchestrator_Page.md` migration notes treat `GUI`, `/Tiers/Node`, `/Evidence/History/Ledger`, phase `/task/subtask` progress, `widget.tier_tree`, `widget.progress_bars`, `/widget`, schedule'
- GUI rewrite-era surfaces replace tier/task/subtask claims with seam/package/node ownership; `/package/node` expansions expose execution detail while legacy `/task/subtask` wording stays compatibility copy only.
- '`Progress` widgets must not teach active-tier, `phase-task-subtask`, or `tier-targeted` terminal semantics as the primary operational mental model; those spellings remain compatibility labels behind native Progress, package, lane, and runtime-object routing.'
- Dashboard CtAs, blocked-node CtAs, thread badges, and live-run cards route through one Dashboard -> Orchestrator -> chat-thread attention contract. The route is `/seam/lane-aware`, exposes `/seams/lanes` rollups and package `/package/node` expansions progressively, and demotes tiers-first widgets or
stale_retired_dispositions:
- Projection-backed surfaces use `freshness_state` values `current`, `refreshing`, `stale`, `degraded`, and `unavailable`; `/current` projections may allow normal read/write interaction, while `stale` or `/degraded` surfaces narrow mutation-bearing actions, disable them, or require direct canonical/cu
- '- `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) six-tab `Tiers` carry-through is stale: widget-based tabs `1, 2, 4, 5, 6`, `widget.tier_tree`, `widget.current_task`, `widget.progress_bars`, `tier_id`, `request_id`, `requested_persona_id`, `effective_persona_id`, `provider`, `model`, and `Pu'
- '- The widget layout migration has one explicit persistence-rule: active layout state writes through `widget_layout`, while retired layout keys are read-only migration backups.'
- '- FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling.'
- Blocked-notice consumers keep `## Unified Thread Blocked-State Lifecycle`, `### Multi-episode display`, and `### 7.3 Shared route and open behavior` as owner-anchor / owner-heading carry-through, but `gap-002`, `exact_items`, `stale-survivor`, and `GUI` cleanup must expose `blocked_sequence`, `appro
- '- Stale visibility is not action authority: when projection trust drops, `/recovery` controls and `allowed_action_ids[]` may become invalid, and destructive or topology-changing actions require stronger gating rather than ordinary undo.'
- '- If a stale-but-valid snapshot is still serving grep or Search, the indicator may show refresh progress, but the UI must not imply that Search is fully unindexed.'
- 'Search is also the `search-owner` for the full indexing control surface: enable/disable index, rebuild/re-anchor, large-file threshold default 10 MB, generated-file index-exclusion patterns, follow-symlinks toggle, and visible indexed/stale/unindexed/fallback state. If the user turns OFF indexing wh'
- The GUI concept artifact `Concepts/PuppetMasterDashComp.html` (`/PuppetMasterDashComp.html`) is historical design evidence for the side-panel model, not a live owner path. Its labels `GITHUB ACTIONS`, `DOCKER MANAGE`, and `SOURCE CONTROL` map to the canonical GitHub Actions, Docker Manager, and Sour
- Account-switch propagation is visible at the shell boundary. When the effective account changes, Source Control, GitHub Actions, Docker Manager, Kubernetes, receipts, and blocked-state projections hard-refresh or clear stale selections; Orchestrator CTAs are reclassified against the new requested/ef
- '`Critical workflow pinning / health badges` appears as a GitHub Actions affordance, with dashboard and Orchestrator mirrors only linking back to the owner surface. `GitHub Actions > Workflows` owns pin and unpin, including `cmd.github.actions.pin`, `cmd.github.actions.unpin`, pinned-workflow state, '
- '- the separate command-log strip is retired from the canonical layout'
- '- DnD cleanup must clear stale hover, opacity, and drag classes after rebuild or dragend so terminal panes do not remain visually dimmed.'
- 'The Orchestrator renders five composite projection states: `current`, `refreshing`, `stale`, `degraded`, and `unavailable`. `projection_freshness` owns `current` / `refreshing` / `stale`, `projection_health` owns `degraded` / `unavailable`, and `trust_tier` is reserved for preview/browser semantics '
- Projection-heavy surfaces must disclose degraded or `/stale` state and revalidate against canonical records before emitting strong notification claims. Dashboard-hosted push widgets carry a chrome-level trust indicator plus `/idle/historical` and no-active-run states, so page-level chrome explains w
- 'Orchestrator stale-data mitigations use the same copy and action rules as other `/degraded` runtime projections: mutation-bearing controls narrow, disable, or require canonical/current revalidation before execution.'
- 'SCM, GitHub Actions, Docker/Kubernetes, Orchestrator, and other /runtime-backed surfaces share one user-facing status vocabulary: `Running`, `Ready`, `Blocked`, `Needs Attention`, `Degraded`, `Stale`, `Detached`, and `Not Configured`. Icon, text, and badge presentation may vary by density, but `/tex'
- Shell `/navigation` and `deep-link` handling in `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` must consume the shared route contract before reviving any stale `Tiers` or widgetized Orchestrator surface assumption.
- '| Tiers (retired alias) | Compatibility/search alias only; visible execution navigation uses Nodes, Packages, Lanes, Seams, or Branching surfaces | Orchestrator, Run Graph, Worktree, and node/package/lane owner docs |'
- '| Health | Doctor checks, readiness, stale/degraded states, and remediation links | owner docs for the failing subsystem plus Runtime Artifacts |'
- Project-summary cards derived from stale or `/degraded` projections downgrade confidence without manufacturing a blocked state, and historical-only projects still keep a current `project_summary` row with neutral `historical_only` or `idle` activity rather than a warning color/state.
- '- the visible slash palette mirrors the final reserved slash set, including bare `/web` help/autocomplete, `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, `/web map`, `/skill`, and the deprecated `/cancel` alias'
- '- SSH remote editing, stale-write disclosure, and recoverable unsaved local buffer persistence'
- '- Preview/browser/file-type GUI seams include Mermaid, Markdown, HTML, SVG, image, and media preview; source-canonical preview/edit bridge; linked-asset reload; multi-preview ownership; trust tiers; sandboxing; `runtime_unavailable`; capture/mutation boundaries; and generated-vs-workspace-file open,'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- 'Global search labels distinguish `Search in this tab` from `Search Orchestrator`: the former is local tab filtering, while the latter is object-first, cross-tab, and route-aware so concern, evidence, history, ledger, and graph results land on the canonical object route rather than a page-local text '
- '- Concern record surfaces expose a canonical record schema with `/routing`, `/blocked/remediation`, `/corroboration/graph`, `/recovery`, and relationship links to reviews and graph patches; structural actions use `/split/supersession` instead of local free-text history.'
- '- Object-specific context menus show only operational actions valid for the current object state and use canonical labels from runtime semantics; mutation actions never appear because a generic shell menu has a matching verb.'
- Projection-backed surfaces display `projection_freshness` and `projection_health` as the runtime trust grammar. Preview/browser `/UI` keeps `trust_tier` under `/browser`; runtime `/degraded` copy never reuses `trust_tier` as degraded trust. Artifact provenance `/trust` disclosure derives from persis
- Shared attention labels include `Waiting on user approval`, `Seam integration blocked`, `Graph patch required`, `Recovery in progress`, `Provider/account pressure`, and `Projection trust degraded`; each label carries owner route, projection state, and `/account` or provider context when relevant ins
- Projection-backed surfaces use `freshness_state` values `current`, `refreshing`, `stale`, `degraded`, and `unavailable`; `/current` projections may allow normal read/write interaction, while `stale` or `/degraded` surfaces narrow mutation-bearing actions, disable them, or require direct canonical/cu
- '- Legacy `GUI` inventory entries such as `/current-task`, `7.7 Tiers`, tier-oriented Settings, `Orchestrator tabs`, `wizard_attention_required`, `resume_url`, and phase-task-subtask progress bars stay searchable compatibility copy, but primary navigation moves to native graph/package/lane/seam surfa'
- Blocked-notice consumers keep `## Unified Thread Blocked-State Lifecycle`, `### Multi-episode display`, and `### 7.3 Shared route and open behavior` as owner-anchor / owner-heading carry-through, but `gap-002`, `exact_items`, `stale-survivor`, and `GUI` cleanup must expose `blocked_sequence`, `appro
- '- The canonical term system owns stable object `/state/action` names from docs and `/runtime/contracts`; the help entry system owns explainer pages or `/cards`; the contextual help system owns inline tooltips, badges, hover copy, and small "what is this?" affordances.'
- 'Local attention surfaces normalize through the shared notification model: Dashboard `Action Required`, thread badges, run-graph `/node` badges, warnings `/toasts/banners`, tray `/system` notifications, rate-limit banners, and blocked versus attention-required copy all preserve severity, source, and '
- '### Canonical route payload'
- '`Contracts_V0` / `Contracts_V0.md` owns the canonical route payload and target model, including the `object_kind` enum; `Glossary.md` carries the user-facing `object_kind` vocabulary so help and downstream copy do not drift.'
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Blocked-owner eight-kind taxonomy and escalation ladder surfaces'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '| Persistence (events) | seglog | Canonical event ledger for usage, chat, orchestrator events |'
- 'Canonical shell rule:'
- 'Non-canonical after this section:'
- The activity bar is the canonical entry point for persistent right-hand side-panel operational surfaces.
- '- None of those surfaces are described as canonical primary-content pages unless the statement is explicitly about a routed detail page launched from the surface.'
- 'Canonical side-panel descriptions:'
- '| Panel ID | Canonical label | Purpose |'
owner_hints:
- Plans/FinalGUISpec.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `4cd33d36e80c469ca5cdbfe065a8bf2275a6e0d1331697bac9c658d5c31c7f4a`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `FinalGUISpec-S0001` through `FinalGUISpec-S0237` are preserved in place and mapped in `coverage_map.jsonl` to `F3-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
