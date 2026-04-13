## A. Git Panel (IDE Surface)

The legacy heading remains for document continuity, but the canonical user-facing surface defined here is **Source Control**.

Source Control is Git-first and owns:
- working tree changes
- diff and compare workflows
- stage / unstage / discard / commit / amend
- fetch / pull / push / sync
- branch and stash workflows
- history and commit-detail browsing
- commit graph parity
- worktree inventory, lineage, and recovery

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

### A.1 Source Control information architecture

Source Control MUST present these stable subviews as vertically stacked collapsible accordion sections (not horizontal tabs):

**Section order (top to bottom, fixed — not user-reorderable in MVP):**
1. `Changes`
2. `Worktrees`
3. `Branches / Stash`
4. `History`
5. `Graph`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

**Accordion behavior:**
- Section headers always visible, full panel width
- Click header to expand/collapse
- Multiple sections can be open simultaneously
- Header shows section name + item count badge (e.g. "Changes (3)", "Worktrees (2)")
- Expanded section content gets full panel width, scrolls independently within its region
- When total expanded content exceeds panel height, the accordion itself scrolls vertically (section headers stay in scroll flow, not pinned)

**Default open sections on first load:** Changes (expanded), all others collapsed.

**Persistence:** Section open/close state persisted in redb per project: `config:project:{pid}:source_control.accordion_state` — JSON object mapping section names to booleans. Section order is fixed; scroll position within sections is NOT persisted.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

**Minimum width:** Accordion layout must work at the Source Control panel's minimum width of 240px. Section headers truncate with ellipsis at small sizes; item count badges always visible.

**Keyboard navigation:** Tab between section headers. Enter/Space to toggle expand/collapse. Arrow keys move between headers. When expanded, Tab into content; Escape returns to header.

**Accessible labels:** Each section header: `accessible-role: button`, `accessible-label: "{section_name}, {item_count} items, {expanded|collapsed}"`.

**Two-level scroll model:** Each expanded section has a `max-height` constraint (e.g. 50% of panel height) with internal scroll. Outer container scrolls when total exceeds panel height. These are independent scroll regions.

### A.2 Changes

The `Changes` subview is the Source Control owner for day-to-day file mutation review.

It MUST present:
- unstaged files
- staged files
- untracked files
- conflicted files
- file-level diff entrypoints
- hunk-level Git actions
- conflict-review entrypoints

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Default compare targets:

| Origin | Default compare target |
|---|---|
| unstaged file | `index <-> working tree` |
| staged file | `HEAD <-> index` |
| untracked file | `empty <-> working tree` |
| conflicted file | `base`, `ours`, `theirs`, `result` |

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Rules:
- hunk stage/unstage/discard are Git mutations, not editor undo
- diff-local search is owned by the diff/review surface and MUST NOT be routed through project Search
- conflict review uses explicit base/ours/theirs/result context and structured resolution actions
- tree badges and editor markers consume Source Control projections but do not replace Source Control ownership

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md

### A.3 History and Graph

`History` and `Graph` are MVP subviews of Source Control.

`History` owns:
- commit list and filters
- commit detail
- changed-file pivots
- compare sessions seeded from commit, branch, or workflow lineage

`Graph` owns:
- branch ancestry and commit lineage visualization
- worktree/topology overlays on top of branch ancestry
- commit selection handoff into History, review, conflict assistance, or diff/open flows

**Canonical compare identity:** Every pivot from History or Graph freezes the compare session identity `{ repo_id, worktree_id?, base_ref, compare_ref, compare_origin, compare_session_id? }`.

Canonical `compare_origin` values for GitHub-owned pivots include:
- `changes.unstaged`
- `changes.staged`
- `history.commit_parent`
- `conflict.review`
- `worktree.branch_compare`
- `actions.run_commit_range`
- `blocked.dirty_worktree`
- `recovery.safe_point_retry`

Rules:
- history compare defaults use `selected commit <-> first parent`
- opening a file from commit history preserves compare identity and compare origin for downstream review surfaces
- dedicated review mode and guided conflict assistance consume the frozen compare identity rather than recomputing targets from the current branch later
- package/lane/run lineage may appear as metadata, but Git lineage remains the canonical grouping axis for this surface
- if a stored compare target becomes stale or unavailable, the surface shows that stale identity explicitly and offers refresh/recompute instead of silently substituting the current HEAD

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

### A.4 Worktrees

Worktrees are first-class UI objects, not hidden plumbing.

The Worktrees accordion uses narrow-panel rows for direct actions, and Source Control also provides a topology-aware view that overlays worktree state on branch ancestry when the user pivots from Graph/History into worktree reasoning.

**Compact row (default state):**
- Line 1: worktree glyph icon + branch name + expand chevron
- Line 2: status pill + owner label + freshness/health disclosure when degraded
- Owner format: `Thread: <thread_title>` or `Orch: <node_label>` or `Manual`

**Expanded row / topology detail:**
- detail fields: path, base ref, created/age, ahead/behind, dirty/conflict state, linked lane/thread when known
- actions: `Open Files`, `Compare`, `Merge`, `Create PR`, `Remove`, plus `Open Thread` or `Open Lane` when owned
- topology overlays show owner/status directly on branch ancestry so worktrees and graph are not disconnected mental models

**Identity and open rules:**
- open/review/history/actions pivots use canonical worktree-aware identity `{ repo_id, worktree_id, path? }`
- remote-native opens MUST carry `repo_id` / `worktree_id` / `path` explicitly rather than reconstructing state from a local cwd guess
- historical receipts and review sessions remain pinned to the captured worktree identity even after the active selection changes
- worktree actions MUST preserve safe-point and remediation lineage semantics

**Blocked/freshness rules:**
- `dirty_worktree` and `worktree_conflict` are explicit runtime states, not generic errors
- active-run or active-thread ownership must be visible before prune/remove actions
- stale or disconnected worktree projections remain viewable but block mutation until revalidated

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

ContractRef: Plans/storage-plan.md#Required redb keys, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle

Required fields:
- lane_id
- path_ref
- branch_ref
- baseline_ref
- lifecycle_state
- selected_worktree_id

Canonical terms and values:
- lane_id
- archived
- removed
- cleanup_eligible
- selected_worktree_id

Labels:
- archived
- removed

Behavioral rules:
- GitHub surface worktree rows must respect durable worktree/lane identity and historical rendering semantics.
### A.5 Surface boundary rule

Source Control, Orchestrator, and GitHub surfaces keep distinct responsibilities.

Rules:
- Source Control owns Git-native worktree inspection and mutation actions
- Orchestrator owns lane/package/seam operational context, lineage, and governance state
- GitHub surfaces own remote platform state and remote receipt lineage
- cross-surface opens route through canonical route/open contracts rather than feature-local payloads

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Contracts_V0.md

Remote-operation receipts must retain linkage to:
- local runtime identity when applicable
- local worktree/lane identity when applicable
- remote workflow/PR/action identity

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md

ContractRef: Plans/Orchestrator_Page.md#11. Source Control boundary, Plans/FinalGUISpec.md#7.2 Source Control

Required fields:
- initiator_surface
- executor_surface
- worktree_id
- lane_id
- package_id
- run_reference

Behavioral rules:
- Source Control owns Git-native worktree inspection and mutation actions.
- Orchestrator owns lane/package/seam operational context and lineage.
- Remote-operation receipts retain both local runtime identity and remote workflow identity.
