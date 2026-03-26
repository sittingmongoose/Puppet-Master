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
- commit-to-parent compare defaults

`Graph` owns:
- lineage visualization
- branch ancestry inspection
- commit selection handoff into History or diff/review

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

Rules:
- history compare defaults use `selected commit <-> first parent`
- opening a file from commit history preserves the history compare origin for downstream review surfaces
- package/lane/run lineage may appear as metadata, but Git lineage remains the canonical grouping axis

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### A.4 Worktrees

Worktrees are first-class UI objects, not hidden plumbing.

The Worktrees accordion section uses single-column expandable rows optimized for the narrow Source Control panel.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md

**Compact row (default state):**
- Line 1: worktree glyph icon + branch name (truncated with ellipsis if needed) + expand chevron
- Line 2: status pill + owner label (truncated, tooltip for full)
- Owner format: `Thread: <thread_title>` or `Orch: <tier_label>` or `Manual`
- Full-width click target for expand/collapse

**Expanded row:**
- Detail fields: Path (full, selectable/copyable), Base ref, Created/age
- Action buttons (stacked/wrapped, not crammed):
  - `Open Files` — opens worktree root in file manager
  - `Compare` — opens branch-to-branch diff (worktree HEAD vs base HEAD) via `cmd.git.open_diff`
  - `Merge` — opens merge confirmation dialog; shown for assistant-owned and manual worktrees only (not orch-owned)
  - `Create PR` — opens PR creation panel; shown when project has GitHub remote
  - `Remove` — calls remove_worktree (confirmation if dirty or thread-bound)
  - `Open Thread` — navigates to owning thread in assistant chat (thread-owned only; hidden if thread deleted). Opens Chat panel and scrolls to thread.
  - For orch-owned: `Open Thread` replaced with `Open Lane`

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Wiring_Matrix.md

**Filtering:** Filter bar at top of Worktrees section: segmented control `All | Threads | Orchestrator | Manual`. Default: `All`. Filter state persisted per project: `config:project:{pid}:source_control.worktree_filter`. Filter bar degrades to icon-only below 280px panel width (tooltip on hover).

**Sorting:** By creation time descending (newest first). No user-configurable sort in MVP.

**Owner model:** Each worktree row displays an owner field. Owner is one of:
- `Thread: <thread_title>` — assistant-owned via `owner_thread_id`
- `Orch: <tier_label>` — orchestrator-owned via `owner_run_id`/`owner_tier_id`
- `Manual` — no owner (user-created or orphaned)

Blocked-state rules:
- `dirty_worktree` and `worktree_conflict` are explicit runtime states, not generic errors
- active-run ownership must be visible before prune/remove actions
- worktree actions MUST preserve safe-point and remediation lineage semantics

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

**Minimum width (240px):** Compact rows: branch name truncated; status pill and owner on second line. Expanded rows: fields stack vertically; action buttons wrap.

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
