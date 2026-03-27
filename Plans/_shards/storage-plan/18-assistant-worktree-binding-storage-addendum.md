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
- New optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_tier_id?`
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_tier_id`, or neither (manual) is set

### New seglog event types (11 total)

| Event type | Fields | Description |
|------------|--------|-------------|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` | Thread bound to worktree |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` (`user_unbind`\|`user_remove`\|`thread_delete`\|`path_missing`) | Thread unbound |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` | Branch renamed after title gen |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` | Creation failed |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `result_commit_sha` | Merge completed |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` | Merge failed |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` | PR created |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` (`push`\|`api`) | PR failed |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target`, `strategy` | Test started |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | Tests passed |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` | Tests failed |

Naming convention: underscore-separated `chat.thread_worktree_*` matching existing `chat.thread_created` convention.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Wiring_Matrix.md

### New settings keys (10 total)

| Key pattern | Type | Default |
|-------------|------|---------|
| `config:project:{pid}:branching.assistant_auto_worktree` | bool | `false` |
| `config:project:{pid}:branching.assistant_worktree_cleanup_default` | enum | `ask` |
| `config:project:{pid}:branching.assistant_worktree_base_ref` | string | `""` |
| `config:project:{pid}:file_manager.worktree_follow_thread` | bool | `true` |
| `config:project:{pid}:branching.worktree_warning_threshold` | int | `10` |
| `config:project:{pid}:branching.worktree_create_timeout_s` | int | `30` |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test` | bool | `true` |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_cmd` | string | `""` |
| `config:project:{pid}:branching.worktree_pre_merge_test_timeout_s` | int | `300` |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test_target` | enum | `merged_result` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

### Accordion and filter persistence keys

| Key pattern | Type | Default |
|-------------|------|---------|
| `config:project:{pid}:source_control.accordion_state` | JSON object | `{"Changes":true,"Worktrees":false,"Branches/Stash":false,"History":false,"Graph":false}` |
| `config:project:{pid}:source_control.worktree_filter` | string enum | `All` |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md