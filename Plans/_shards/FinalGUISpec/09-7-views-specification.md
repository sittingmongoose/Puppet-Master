## 7. Views Specification

### 7.1 Orchestrator
Orchestrator is the operational surface for rewrite-era execution.

Rules:
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- only `Progress` is widget-composed
- `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Crosswalk.md

### 7.2 Source Control

#### 7.2.1 Accordion layout

Source Control uses a vertically stacked collapsible accordion layout instead of horizontal tabs. Section order: Changes, Worktrees, Branches/Stash, History, Graph. Full specification in `Plans/GitHub_Integration.md` §A.1.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md


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

#### 7.4.1 Assistant Worktrees settings subsection

Settings > Branching tab includes a new subsection "Assistant Worktrees" below existing branching controls. Contains 10 project-level settings organized in 3 visual sub-groups:

- **Creation:** Auto-create worktree for new threads (bool, default off), Base branch for assistant worktrees (string, inherits from base_branch), Creation timeout (integer stepper, 5-300s, default 30s)
- **Merge & Testing:** Run tests before merging (bool, default on), Pre-merge test command (string, empty = auto-detect), Test timeout (integer stepper, 30-1800s, default 300s), What to test (enum: merged_result|branch_only, default merged_result)
- **Behavior:** Thread delete cleanup (enum: ask|keep|remove, default ask), File manager follows thread worktree (bool, default on), Worktree count warning threshold (integer stepper, 0-100, default 10, 0 = disabled)

Full setting key definitions are canonical in `Plans/assistant-chat-design.md` §W.5 and persisted via `Plans/storage-plan.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Settings and inspectors separate requested state, effective state, inherited defaults, and repaired or degraded runtime outcomes.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

Required inspector rule:
- compact surfaces may show only material deltas, but the full inspector tier must always expose provider entry, model, auth family, account or server profile, billing/entity context when relevant, and the reason PM selected that runtime.
- historical views use frozen captured state and do not recompute from current settings.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

#### Assistant chat mode strip and debug investigation surfaces

The primary Assistant mode strip still presents `Ask`, `Agent`, `Debug`, `Plan`, and `Deep Plan`.

Required UI rules:
- `Debug` remains the assistant investigation overlay rather than a synonym for the classical DAP debugger.
- detailed inspectors for debug investigations show requested/effective overlay, canonical runtime mode, `investigation_id`, target kind, and any degraded capability state.
- the classical debugger surfaces continue to use explicit copy such as `Debugger`, `DAP Debugger`, and `Debug Console`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md

#### Agent-Config

Agent-Config is the canonical provider-management surface.

Required section order:
1. `Overview`
2. `Defaults`
3. `Accounts / Profiles`
4. `Models`
5. `Instructions`
6. `Skills`
7. `Advanced Runtime`

The `Effective Runtime` inspector remains persistently visible while the user changes provider defaults, account/profile selections, instruction control, skills, or advanced runtime options.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md

#### Usage and provider state inspectors

Usage and provider inspectors must show:
- current effective account or server profile
- current effective auth mode
- current effective billing/entity context when it explains quota behavior
- pressure/cooldown summary
- source-confidence or stale status when data is inferred or older than the current runtime state
- direct actions such as `Refresh Usage`, `Revalidate`, `Choose Billing Entity`, `Reconnect`, or `Restart Server` when relevant

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/FinalGUISpec.md

### Terminal settings ownership

Terminal layout controls belong to the terminal workspace and its inspector, not to ad-hoc chat-only widgets.

Rules:
- workgroups, subtabs, pane trees, and editor panel references persist as terminal workspace state.
- detached terminal windows preserve section identity and reconnect to the same logical workspace records when reattached.
- editor terminal panel controls act on the referenced pane rather than inventing parallel session ownership.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

### Terminal inspector rules

Terminal inspectors must expose:
- active workgroup
- focused leaf pane
- bound terminal session id
- linked dev-session id when present
- editor embedding state
- restore outcome / degraded capability state for historical sessions

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md
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

