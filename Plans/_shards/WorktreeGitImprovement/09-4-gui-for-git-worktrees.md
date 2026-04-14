## 4. GUI for Git & Worktrees

Source Control and Orchestrator have a deliberate split. Assistant Chat adds a third surface for worktree interaction.

Source Control is:
- compact
- worktree-first
- Git-native
- the unified worktree inventory (all worktrees visible regardless of owner)

Orchestrator is:
- lane/package/seam operational
- history/lineage focused
- concern/recovery/governance aware

Assistant Chat is:
- thread-level worktree binding and lifecycle
- merge-back flow (squash/merge/rebase, PR creation)
- natural language worktree operations

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

Rules:
- Source Control rows are concrete worktrees, branches, and paths
- package, lane, and run context appear as attached metadata in Source Control rather than as the primary grouping axis
- Source Control maintains the unified worktree inventory — orchestrator-owned, assistant-owned, and manual worktrees are all visible in the Worktrees accordion section
- Orchestrator does not duplicate a raw worktree inventory; it shows lane/worktree summary in the Progress tab
- Assistant Chat provides per-thread worktree binding via the chat header worktree button; it does not duplicate Source Control's inventory
- lane identity survives after a live worktree is archived or removed
- cleanup posture belongs to Orchestrator for orch-owned worktrees; assistant-owned worktree cleanup is user-initiated via thread delete or chat dropdown
- the `owner_thread_id` field on `worktree_record.v1` identifies assistant-owned worktrees alongside existing `owner_run_id`/`owner_node_id`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FileManager.md, ContractName:Plans/Crosswalk.md

Assistant worktrees are created via the chat header worktree button or auto-create setting. They follow the same `WorktreeManager` backend as orchestrator worktrees.

**Naming:** Directory `.puppet-master/worktrees/thread-{short_id}` where `short_id` is first 8 chars of `thread_id`. Branch name `assistant/<sanitized_title>` (temp name `assistant/thread-{short_id}` before title generation).

**Persistence:** Assistant worktrees are persistent — they are NOT auto-cleaned by the runner contract or cleanup policy. They remain on disk until the user explicitly removes them (via chat dropdown Remove, thread delete cleanup, or Source Control Remove action).

**Soft limit:** Advisory warning toast at configurable threshold (default 10 worktrees per project). Never blocks creation.

**Doctor check:** WorktreeManager Doctor reports orphaned assistant worktrees (no matching `worktree_binding_reverse` key and no `owner_thread_id`) alongside orphaned orch worktrees. Also reports stale `.git/pm-merge.lock` files and incomplete merge/rebase states (`.git/MERGE_HEAD`, `.git/rebase-merge/`).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/MiscPlan.md

ContractRef: Plans/storage-plan.md#Required redb keys, Plans/GitHub_Integration.md#A.4 Worktrees

Required fields:
- worktree_id
- lane_id
- lifecycle_state
- selected_worktree_id
- dirty_state
- conflict_state
- blocked_reason_code
- projection_freshness
- projection_health

Canonical terms and values:
- baseline
- active
- suspect
- restoring
- retained
- cleanup_eligible
- archived
- removed
- worktree_id
- lane_id
- selected_worktree_id

Labels:
- worktree lifecycle
- cleanup eligible
- archived
- removed

Behavioral rules:
- Cleaning files inside a worktree is not the same thing as removing the worktree.
- `lane_id` remains operational lineage while `worktree_id` remains durable identity.
