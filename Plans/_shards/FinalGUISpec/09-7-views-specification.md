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

Settings > Branching tab includes a new subsection `Assistant Worktrees` below existing branching controls. It contains 10 project-level settings organized in three visual sub-groups:

- **Creation:** Auto-create worktree for new threads (bool, default off), Base branch for assistant worktrees (string, inherits from `base_branch`), Creation timeout (integer stepper, 5-300s, default 30s)
- **Merge & Testing:** Run tests before merging (bool, default on), Pre-merge test command (string, empty = auto-detect), Test timeout (integer stepper, 30-1800s, default 300s), What to test (enum: `merged_result | branch_only`, default `merged_result`)
- **Behavior:** Thread delete cleanup (enum: `ask | keep | remove`, default `ask`), File manager follows thread worktree (bool, default on), Worktree count warning threshold (integer stepper, 0-100, default 10, 0 = disabled)

Full setting-key definitions remain canonical in `Plans/assistant-chat-design.md` and are persisted via `Plans/storage-plan.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

#### 7.4.2 Indexing settings subsection

Settings > Project tab includes a dedicated **Indexing** section for sparse-n-gram index controls. This section is separate from search settings and general settings.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

**Local project settings** (always visible):

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Enable regex index | bool toggle | ON | Master toggle. Per-project with a global default. Turning it off cancels any in-progress build and cleans partial generation output |
| Large file threshold | integer stepper | 10 MB | Files above this size are excluded from the index but remain searchable via ripgrep fallback. Range: 1-100 MB |
| Index exclusion patterns | editable list | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.min.js`, `*.min.css`, `*.map`, `*.generated.*`, `*.g.dart`, `*.pb.go` | Files matching these patterns are excluded from the index but remain searchable via ripgrep fallback. Separate from grep ignore rules |
| Follow symlinks | bool toggle | OFF | When ON, index traversal follows symlinks after canonicalization and root validation. When OFF, symlinks are not followed |
| Rebuild Index | button | - | Triggers a full rebuild. Non-destructive because the index is a cache |
| Index disk usage | read-only label | - | Shows the local regex-index footprint |
| Index state | read-only badge | - | Surfaces `building`, `ready`, `refreshing`, `stale`, `disabled`, or `error` for the active project |

**Remote SSH project settings** (shown in addition to local settings; greyed out for local projects):

| Setting | Type | Default | Scope | Description |
|---------|------|---------|-------|-------------|
| Shallow clone | bool toggle | OFF | Global default + per-project override | Uses `--depth=1` for the bare clone. Lower disk footprint, reduced history |
| Partial clone | bool toggle | OFF | Global default + per-project override | Uses `--filter=blob:none`. Smaller initial footprint, slower first full build |
| Remote cache disk usage | read-only label | - | - | Shows `Remote cache: {total} - Index: {index}, Git: {git}` |
| Evict remote cache | button + confirmation | - | - | Deletes the selected project's remote cache. Next open performs clone/build again |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### 7.4.3 Global storage / remote-cache administration subsection

Settings > Storage includes a global **Remote Cache Administration** subsection for cross-project cache policy.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Remote cache retention | integer stepper (days) | 30 | Evict project caches after inactivity exceeds this threshold |
| Remote cache size limit | size field | `min(50 GB, 10% of free disk at first cache creation)` | Global disk-pressure trigger for LRU remote-cache eviction |
| Total remote cache usage | read-only label | - | Shows aggregate disk usage across all remote project caches |
| Clear All Remote Caches | destructive button + confirmation | - | Deletes every `r/{hash8}` remote cache root. Projects rebuild on next open |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

Settings and inspectors separate requested state, effective state, inherited defaults, and repaired or degraded runtime outcomes.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

Required inspector rule:
- compact surfaces may show only material deltas, but the full inspector tier always exposes provider entry, model, auth family, account or server profile, billing/entity context when relevant, and the reason PM selected that runtime.
- historical views use frozen captured state and do not recompute from current settings.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

### Terminal settings ownership

Terminal layout controls belong to the terminal workspace and its inspector, not to ad-hoc chat-only widgets.

Rules:
- workgroups, subtabs, pane trees, and editor panel references persist as terminal workspace state.
- detached terminal windows preserve section identity and reconnect to the same logical workspace records when reattached.
- editor terminal panel controls act on the referenced pane rather than inventing parallel session ownership.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

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

Terminal inspectors must expose:
- active workgroup
- focused leaf pane
- bound terminal session id
- linked dev-session id when present
- editor embedding state
- restore outcome / degraded capability state for historical sessions

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md

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
- File Manager search remains a local tree filter or type-ahead only.
- LSP symbol/reference results may visually resemble Search, but their ownership and fallback rules remain LSP-specific.
- When the regex toggle is ON, Search uses the same sparse n-gram backend as agent `grep`.
- Search inherits the same dirty-layer freshness guarantee as agent `grep`; recently edited files must remain searchable even when the base snapshot is stale.
- A stale-but-valid regex snapshot remains eligible for acceleration while background refresh runs. Show `(unindexed)` only when the query actually fell back to raw ripgrep.
- When the index is unavailable, disabled, corrupted, or skipped for query-specific reasons, Search falls back to raw ripgrep on all files.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Remote and degraded rules:
- Search may keep prior remote results as an explicitly stale snapshot.
- New remote queries or replace operations that need host round-trips must surface `stale`, `degraded`, or `unavailable` state explicitly instead of silently re-running locally.
- Replace-in-files MUST respect remote write availability before presenting a success-shaped UI.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

