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

Source Control MUST present these stable subviews:
- `Changes`
- `History`
- `Graph`
- `Worktrees`
- `Branches / Stash`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

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

Each worktree row MUST expose:
- `worktree_id`
- path
- branch
- owner run/tier when present
- dirty / conflict / orphaned / stale status
- compare, open, recover, prune, and lineage actions

Blocked-state rules:
- `dirty_worktree` and `worktree_conflict` are explicit runtime states, not generic errors
- active-run ownership must be visible before prune/remove actions
- worktree actions MUST preserve safe-point and remediation lineage semantics

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md

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
