# Shard 013: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/GitHub_Integration.md`

Source lines: L2065-L2109

Source SHA256: `ca98a6f62948a97779ea383dd564964b485e8863072dd42e40730cc7ccccbfa9`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical GitHub integration spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Actions Observation Transport

Repairs row `sfk-9e19da53b708f174b92bbe76`.

GitHub Actions readiness uses webhook delivery when configured and polling fallback otherwise. Polling interval defaults to `30000` ms while a run is active and `300000` ms while idle. Staleness state begins after two missed polling intervals or one webhook delivery failure plus one failed poll. Observation records carry `observation_id`, `workflow_run_id`, `transport`, `observed_state`, `observed_at_utc`, and `staleness_reason_code?`.

### Compare, Graph Patch, And Pinned Workflow Schemas

Repairs row `sfk-a27bc5c5401709bfa6f09922`.

`compare_origin` fields are `repo_id`, `base_ref`, `head_ref`, `base_sha`, `head_sha`, `merge_base_sha?`, and `comparison_url?`.

`graph_patch_request` fields are `request_id`, `repo_id`, `base_ref`, `patch_ref`, `target_paths[]`, `requested_by`, and `created_at_utc`.

`graph_patch_result` fields are `request_id`, `applied`, `changed_paths[]`, `conflict_paths[]`, `error_code?`, `result_ref?`, and `created_at_utc`.

`pinned_workflow_record` fields are `workflow_id`, `workflow_file_path`, `pinned_ref`, `pinned_sha`, `last_verified_at_utc`, `verification_state`, and `reason_code?`.

### Actions Blocked Reason Table

Repairs row `sfk-4ca6da4b81de5f8665c4ae9f`.

| reason_code | severity | retryable | user message |
| --- | --- | --- | --- |
| `actions_auth_missing` | blocked | yes | Connect a GitHub account with Actions access. |
| `actions_auth_expired` | blocked | yes | Refresh GitHub authentication. |
| `actions_workflow_disabled` | blocked | no | Enable the workflow in GitHub before retrying. |
| `actions_branch_protected` | blocked | no | Branch policy blocks this action. |
| `actions_rate_limited` | warning | yes | GitHub rate limit is active; retry later. |
| `actions_runner_unavailable` | warning | yes | No runner is available for this workflow. |
| `actions_observation_stale` | warning | yes | Refresh workflow status before deciding. |

### Worktree Topology Commands

Repairs row `sfk-218bd2f9b09b060a43aa18b8`.

Command IDs: `cmd.git.worktree.open_topology`, `cmd.git.worktree.create`, `cmd.git.worktree.remove`, `cmd.git.worktree.prune`, `cmd.git.worktree.switch`, and `cmd.git.worktree.repair`.

Destructive commands require confirmation fields `target_worktree_id`, `expected_path`, `expected_branch`, `confirmation_text`, and `permission_snapshot_id`. Disabled states are `dirty_worktree`, `untracked_files`, `protected_branch`, `missing_remote`, `permission_denied`, and `operation_in_progress`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
