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

The `Changes` subview owns staged, unstaged, untracked, and conflicted files, per-file diff pivot, bulk stage/unstage/discard, AI-assisted commit grouping/message help, commit/amend, and upstream sync state.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md

### A.3 History and Graph

The `History` and `Graph` subviews are MVP scope, not later polish.

Required behavior:
- history lists commits for the active repo/worktree/branch
- graph shows branch lineage, ahead/behind/diverged state, and selected-commit detail
- both views can pivot into diff, changed files, compare target selection, and worktree overlays

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

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

GitHub-hosted workflow/admin behavior does not belong to Source Control and MUST route to the GitHub Actions surface.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

