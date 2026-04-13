## Assistant Worktree Binding Storage Addendum

This addendum defines storage additions for the assistant thread-to-worktree binding feature.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md

### New redb key families

**Thread worktree binding:**
- Key pattern: `thread_state:{thread_id}:worktree_binding`
- Value: JSON `{ "worktree_id", "branch_name", "worktree_path", "bound_at_utc", "binding_origin" ("manual"|"auto_create"), "temp_branch_name" }`
- Projection source: seglog events `chat.thread_worktree_bound` / `chat.thread_worktree_unbound`
- Rebuild: replay bound/unbound events in sequence order; last event per thread_id determines current state

**Reverse lookup (1:1 enforcement):**
- Key pattern: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Projection source: same seglog events
- Purpose: fast check whether a worktree is already bound to another thread

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/DRY_Rules.md

**Worktree record extension:**
- Existing key: `worktree_record.v1:{project_id}:{worktree_id}`
- New optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_node_id?`
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_node_id`, or neither (manual) is set

ContractRef: Plans/WorktreeGitImprovement.md#4. GUI for Git & Worktrees, Plans/Orchestrator_Page.md#11. Source Control boundary

Required fields:
- selected_worktree_id
- lane_id

Canonical terms and values:
- selected_worktree_id

Labels:
- worktree record

Behavioral rules:
- `selected_worktree_id` remains UI state and must not replace durable worktree identity.
- Thread binding keys do not replace lane/worktree lifecycle records or historical lineage.

