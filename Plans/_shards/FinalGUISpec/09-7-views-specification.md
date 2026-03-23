## 7. Views Specification

### 7.1 Orchestrator
Orchestrator is the operational surface for rewrite-era execution.

Rules:
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- only `Progress` is widget-composed
- `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Crosswalk.md

### 7.2 Source Control

Source Control is the side-panel owner for Git-native repository work in the rewrite shell.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

Required subviews:
- `Changes`
- `History`
- `Graph`
- `Worktrees`
- `Branches / Stash`

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

Rules:
- The `Changes` subview owns staged, unstaged, untracked, and conflicted lists, compare-target defaults, per-file diff entrypoints, hunk actions, and conflict review entrypoints.
- The `History` and `Graph` subviews are MVP and own commit browsing, changed-file pivots, commit-detail compare selection, and lineage overlays.
- Diff-local search belongs to the Source Control diff/review surface; it is not routed through the Search side panel.
- Package, lane, run, or remediation lineage appear as metadata where relevant, not as the primary grouping axis.
- Git-native actions remain Source Control owned and MUST NOT be described as editor undo.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

### 7.3 Shared route and open behavior
Views consume the canonical navigation/source-open primitives.

Rules:
- routed opens resolve through `route_target`
- source opens resolve through `OpenSubject` or `OpenFile` as appropriate
- `resume_url` is serialized transport only and must not outgrow the canonical route contract
- shell realization such as docked/floating state, widths, and local panel layout remains shell state rather than route identity

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/Crosswalk.md

#### Thread context detail realization

Thread context details are a reusable editor-tab surface rather than a chat-side-panel usage view.

Rules:
- `More Details` from the chat context hover module opens or focuses a thread-scoped Context Detail Pane in the editor-tab host
- there is one open Context Detail Pane tab per thread; repeated opens focus the existing tab
- route selection reveals the correct shell destination and focus target
- generated-document or subject realization for the tab follows the canonical route/open split rather than a chat-local special case
- the shell must not treat a detached pop-out or side-panel usage panel as the canonical destination for this surface

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md
### 7.4 Settings and inspectors

Settings and inspectors separate:
- inherited / overridden
- requested
- effective
- honored / skipped / clamped

Rules:
- detailed runtime identity inspectors must show provider, model, persona, account, worker-policy, and terminal-runtime requested/effective state where relevant
- compact surfaces may show only material deltas
- historical views use frozen captured state and do not recompute from current settings
- chat-facing compact rows and popovers are compact surfaces, not the full detailed inspector tier

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

#### Assistant chat mode strip and debug investigation surfaces

The primary Assistant mode strip presents `Ask`, `Agent`, `Debug`, `Plan`, and `Deep Plan` as the stable user-facing choices for the chat surface.

Required UI rules:
- selecting `Debug` switches the thread into the Debug overlay rather than opening the classical DAP debugger surface
- the active Debug thread header shows target summary, investigation phase, Debug Automation Profile state, and bundle/export actions
- the bottom runtime zone uses **Debugger** or **DAP Debugger** for the classical DAP surface and **Debug Console** for runtime output; the bare label `Debug` is not sufficient canonical copy for those runtime surfaces
- detailed inspectors must show requested/effective overlay, canonical runtime mode, `investigation_id`, `debug_target_kind`, verification strength, and any degraded capability state when a Debug investigation is active
- blocked or attention-required Debug investigations must surface explicit reason codes and shared allowed-action affordances rather than inventing a debug-only approval lane

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md

### Terminal settings ownership
Settings owns durable terminal preferences and discoverability. Live session controls remain in terminal chrome and are not hidden inside durable settings.

Terminal settings must include:
- appearance and theme preset selection for the terminal surface
- font size, line height, cursor style, cursor blink, and contrast-safe defaults
- renderer preference and disclosure of effective renderer mode when degraded
- default shell profile and default working-directory policy
- transcript retention limits and shell-integration preference disclosure
- copy, paste, selection, and bell behavior
- terminal shortcut reference, shortcut remapping, and a built-in terminal cheat sheet
- defaults for dock position, second-section behavior, and detach behavior

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### Terminal inspector rules
Detailed terminal inspectors and banners must disclose, where relevant:
- `terminal_session_id`
- `dev_session_id?`
- session status and exit or stop reason
- requested and effective renderer mode
- shell-integration tier
- capability degradations
- cwd snapshot and shell profile label
- restore outcome and transcript-retention tier

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

Chat runtime-inspector rules:
- the message-under-row compact summary shows resolved mode label, model, and assistant duration or user timestamp
- the message info popover shows `Mode`, `Provider`, `Model`, `Effort`, `Persona`, `Worker`, `Tokens`, and `Context`
- compact chat-facing surfaces omit version and omit `current` / `frozen` wording
- the fuller requested/effective/runtime disclosure tier lives in the Context Detail Pane and other detailed inspectors

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Context Detail Pane inspector rules:
- default view is curated, with a visible raw toggle
- curated view exposes overview, breakdown, and per-message inspection
- raw view exposes thread-level and message-level serialized payloads suitable for debugging, audits, and provider/runtime inspection
- thread-scoped estimated cost and token/context summaries must stay aligned with the canonical usage pipeline

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
### 7.5 Project and attention surfaces

Project cards and the attention center consume project-summary and project-attention projections.

Rules:
- project cards surface activity, attention, and health separately
- blocked ownership is summarized by the strongest active item when one exists
- attention rows, palette opens, and cross-surface pivots resolve through the same internal route contract

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

#### Search side-panel owner
Search is the persistent project text-search and replace-in-files surface.

Rules:
- Search owns query text, replacement text, include/exclude globs, regex/case/whole-word toggles, result grouping, and replace preview/apply flow.
- `cmd.search.show` is the canonical shortcut and command-palette entrypoint for this surface.
- Search result opens route through the canonical open-file contract rather than through feature-local payloads.
- File Manager search remains a local tree filter/type-ahead only.
- LSP symbol/reference results may visually resemble Search, but their ownership and fallback rules remain LSP-specific.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md

Remote/degraded rules:
- Search may keep prior remote results as an explicitly stale snapshot.
- New remote queries or replace operations that need host round-trips must surface `stale`, `degraded`, or `unavailable` state explicitly instead of silently re-running locally.
- Replace-in-files MUST respect remote write availability before presenting a success-shaped UI.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

