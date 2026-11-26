# Shard 013: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/GitHub_Integration.md`

Source lines: L2075-L2215

Source SHA256: `6b9df4af93605f51a943490830ba1513b619a4f599d676d8e6f02b79a18a704b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical GitHub integration spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Actions Observation Transport

Repairs row `sfk-9e19da53b708f174b92bbe76`.

GitHub Actions readiness uses webhook delivery when configured and polling fallback otherwise. Polling interval defaults to `30000` ms while a run is active and `300000` ms while idle. Staleness state begins after two missed polling intervals or one webhook delivery failure plus one failed poll. Observation records carry `observation_id`, `workflow_run_id`, `transport`, `observed_state`, `observed_at_utc`, and `staleness_reason_code?`.

### Compare, Graph Patch, And Pinned Workflow Schemas

Repairs row `sfk-a27bc5c5401709bfa6f09922`.

Typed field tables (amended 2026-11-25; they replace the untyped field lists first written here on 2026-07-08). Common types: `identity_id` and `timestamp` are the `Plans/source_control_contracts.schema.json` `$defs` of those names; `full_oid` is a full 40- or 64-hex commit object id; `?` marks an optional field, and an optional field is omitted rather than sent as an empty string.

**`compare_origin` record.** `compare_origin` itself stays the closed value set of "Compare/open identity consumption and run-aware compare-origin forwarding" above; this record is the payload that carries it on every GitHub compare/open pivot.

| Field | Type | Rule |
| --- | --- | --- |
| `compare_origin` | enum `changes.unstaged` \| `changes.staged` \| `history.commit_parent` \| `conflict.review` \| `worktree.branch_compare` \| `actions.run_commit_range` \| `blocked.dirty_worktree` \| `recovery.safe_point_retry` | required |
| `project_id`, `repo_id` | `identity_id` | `repo_id` is required; `project_id` is required for Project scope and absent for an admitted application or pre-registration partition. The latter carries its exact scope/target as required by the identity rules above. |
| `worktree_id` | `identity_id` | required for `changes.*`, `conflict.review`, `worktree.branch_compare`, `blocked.dirty_worktree`, `recovery.safe_point_retry` |
| `path` | `repo_relative_path` per the Git adapter schema | required for `changes.*` and `conflict.review`; optional for file-scoped pivots of other origins |
| `operands` | closed tagged union `{kind: "two_way", base: endpoint, head: endpoint}` or `{kind: "three_way", base: endpoint, ours: endpoint, theirs: endpoint, result: endpoint}` | required; the origin determines the shape and endpoint kinds below |
| `merge_base_sha` | `full_oid` | optional; records a resolved merge base for a commit pair |
| `comparison_url` | string, absolute `https://` URL on the bound forge host | optional |
| `owner_run_id`, `owner_node_id`, `owner_attempt_id` | `identity_id` | optional; required for `actions.run_commit_range` (`owner_run_id`) and `recovery.safe_point_retry` (all three) |
| `revalidation_state` | enum `current` \| `degraded_historical` \| `blocked` | required; `current` requires every recorded endpoint and owner join to revalidate; `degraded_historical` opens read-only only when the exact recorded operands remain reviewable from immutable commits or verified snapshots; `blocked` refuses the pivot when those operands cannot be recovered. Mutation is refused in either non-current state. |

Each `endpoint` is a closed tagged object with the required fields listed below. IDs and refs resolve through Source Control in the record's exact repository and, for local operands, worktree. All snapshot references are `non_secret_ref` from the Source Control schema. `generation` is an integer ≥ 0. Capturing a pivot records the owner snapshot before opening the view.

| `kind` | Other fields and freshness evidence |
| --- | --- |
| `commit` | `sha: full_oid`, `ref?: string`. Resolve the immutable commit in the bound repository. The optional ref records how it was selected, and reopening never substitutes that ref's new tip. A mutation requiring a live ref also checks the ref through its owner. |
| `index` | `status_snapshot_ref`, `generation`, `index_sha256` (lowercase hex SHA-256). Require the same exact worktree, current status generation and index fingerprint. |
| `working_tree` | `status_snapshot_ref`, `generation`, `content_sha256` (lowercase hex SHA-256 of the recorded file or scoped manifest). Require the same exact worktree, current generation and matching captured content, including untracked files. |
| `empty` | No additional fields. In an untracked comparison the matching worktree status snapshot must still identify the named path as untracked. |
| `conflict_stage` | `status_snapshot_ref`, `generation`, `index_sha256`, `stage: 1 \| 2 \| 3`, `blob_oid: string \| null` (full 40- or 64-hex blob OID, or known absent stage). Verify the named path's stage in the same conflict index snapshot and match its OID or known absence. Unreadable stages do not count as absent. |
| `safe_point` | `safe_point_ref: non_secret_ref`, `snapshot_ref: non_secret_ref`. Verify the FileSafe owner's exact safe-point identity, scope and retained snapshot for this recovery pivot. |

| Origin | Required operands |
| --- | --- |
| `changes.unstaged` | Two-way `index` → `working_tree`; for an untracked path use `empty` → `working_tree`. |
| `changes.staged` | Two-way `commit` (recorded HEAD) → `index`. A repository with an unborn HEAD uses `empty` → `index` only when the owner verifies the unborn state. |
| `history.commit_parent` | Two-way recorded first parent → selected commit. If the owner verifies the commit has no parent, the base is `empty`. |
| `conflict.review` | Three-way `conflict_stage` 1 as `base`, 2 as `ours`, 3 as `theirs`, and `working_tree` as `result`. The four operands bind to the same exact worktree, path and status snapshot. |
| `worktree.branch_compare`, `actions.run_commit_range` | Two-way commit pair selected by the worktree owner or recorded run range. |
| `blocked.dirty_worktree` | Two-way baseline of `commit`, `index` or `empty` as recorded by the blocked detail, then `working_tree`. |
| `recovery.safe_point_retry` | Two-way `safe_point` → `working_tree`, both scoped to the recorded recovery operation. |

A local snapshot mismatch, an untracked path becoming tracked, or a conflict stage or result changing makes the recorded pivot non-current. Open the saved comparison only if all recorded operands are still available. A newly selected branch, live worktree or UI focus never replaces an old operand.

**`graph_patch_request` record.** A graph patch changes a run graph generation, so this record binds to the `graph_patch` family of `Plans/Contracts_V0.md` ("Governance Runtime Records And Projection Trust"), which owns `graph_patch_id`, `patch_kind`, its states and transitions. Its fields are the five joins GI-025 requires.

| Field | Type | Rule |
| --- | --- | --- |
| `request_id` | `identity_id` | required; idempotency key |
| `graph_patch_id` | `identity_id` | required; the Contracts_V0 `graph_patch` record this request opens |
| `project_id` | `identity_id` | required |
| `repo_id` | `identity_id` | optional; present when the patched nodes bind to one repo |
| `patch_point` | object `{ graph_generation_id: identity_id, node_ref: string }` | required (GI-025 "patch point") |
| `concern_refs` | array of concern ids (`identity_id`), unique | required, may be empty (GI-025 "triggering /concern refs") |
| `structural_change_summary` | object `{ patch_kind: string` (a Contracts_V0 `graph_patch.patch_kind`), `requested_change_ref: string`, `affected_node_refs: string[]` (at least 1), `summary_text: string` (at most 2000 chars) `}` | required (GI-025 "requested structural change summary") |
| `affected_generation_id` | `identity_id` | required; must equal `patch_point.graph_generation_id` and be the current generation when the request is created (GI-025 "affected generation") |
| `requester_identity` | object `{ actor_kind: "user" \| "agent" \| "system", actor_id: identity_id, run_id?: identity_id }` | required (GI-025 "requester identity") |
| `created_at_utc` | `timestamp` | required |

**`graph_patch_result` record.**

| Field | Type | Rule |
| --- | --- | --- |
| `request_id`, `graph_patch_id` | `identity_id` | required; match the request |
| `state` | enum `validated` \| `applied` \| `rejected` \| `rolled_back` \| `superseded` (the Contracts_V0 `graph_patch` states after `requested`) | required; `rolled_back` and `superseded` are reached only from `applied` |
| `applied` | boolean | required; true only when `state` is `applied` |
| `resulting_generation_id` | `identity_id` | required when `state` is `applied` |
| `decision_ref` | string | required for `applied`, `rejected`, `rolled_back` and `superseded` (Contracts_V0 CV-315: `applied -> rolled_back\|superseded` only with a decision and transition report) |
| `state_transition_report_ref` | string | required for `applied`, `rolled_back` and `superseded` |
| `error_code` | enum `generation_stale` \| `patch_point_not_found` \| `validation_failed` \| `decision_rejected` \| `permission_denied` | required when `state` is `rejected`, absent otherwise |
| `result_ref` | string | optional |
| `created_at_utc` | `timestamp` | required |

GitHub Integration exposes the review action only while a `graph_patch_request` with every required field exists and its patch is `requested` or `validated`, and the apply action only when the result `state` is `validated` and `affected_generation_id` is still current; otherwise apply settles `rejected` with `generation_stale` and no generation changes. No error code is retried automatically; a new request with a new `request_id` against the current generation is the only retry. The 2026-07-08 list's `base_ref`, `patch_ref`, `target_paths[]`, `changed_paths[]` and `conflict_paths[]` are retired because a graph patch does not move a git ref; `requested_by` is now `requester_identity`.

**`pinned_workflow_record`.** Created by `cmd.github.actions.pin`, deleted by `cmd.github.actions.unpin`; historical receipts survive unpin.

| Field | Type | Rule |
| --- | --- | --- |
| `workflow_id` | integer >= 1 (GitHub workflow id) | required |
| `workflow_file_path` | string, repo-relative under `.github/workflows/`, ending `.yml` or `.yaml` | required |
| `workflow_name` | string | required |
| `repo_id` | `identity_id` | required |
| `branch`, `worktree_id` | string, `identity_id` | optional; present when the pin is branch- or worktree-scoped |
| `pinned_ref` | string | required |
| `pinned_sha` | `full_oid` | required; the workflow file's commit when last verified |
| `health_badge_window_runs` | integer 1..100, default 10 | required; how many most recent runs the health badge summarizes |
| `suppress_noisy` | boolean, default false | required |
| `notify_on_failure` | boolean, default false | required |
| `verification_state` | enum `verified` \| `stale` \| `renamed` \| `missing` \| `unverifiable` | required |
| `last_verified_at_utc` | `timestamp` or null | required; null until first verification |
| `reason_code` | a canonical Actions blocked reason (GI-037 enum and the table below) | required when `verification_state` is `unverifiable`, absent otherwise |
| `provenance` | object `{ command_id: "cmd.github.actions.pin", receipt_ref: string, created_at_utc: timestamp }` | required; `receipt_ref` names the no-persist command receipt `cmd.github.actions.pin.dispatch_receipt` (`Plans/Wiring_Matrix.production.json` row `catalog.github_actions_pin`, `expected_event_types: []`). There is no persisted pin event, so the record carries no `event_ref`. |

`verification_state` moves on each Actions observation ("Actions Observation Transport" above): `verified` when `workflow_id` resolves at `workflow_file_path`; `stale` when the staleness rule there fires; `renamed` when `workflow_id` resolves at a different path (the badge shows the rename and `workflow_file_path` updates only after the user confirms); `missing` when `workflow_id` no longer exists; `unverifiable` when an Actions blocked reason prevents the read. Every non-`verified` state shows on the badge and keeps unpin available.

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
| `actions_no_github_remote` | blocked | yes | This repository has no GitHub remote; add one in Source Control. |
| `actions_missing_scope_runtime` | blocked | yes | Reconnect GitHub with the Actions scope needed to run workflows. |
| `actions_missing_scope_admin` | blocked | yes | Reconnect GitHub with the admin scope needed for Actions settings. |
| `actions_workflow_not_dispatchable` | blocked | no | This workflow has no manual (workflow_dispatch) trigger. |
| `actions_missing_secret` | blocked | yes | Add the secret this workflow needs in Actions Settings. |
| `actions_missing_variable` | blocked | yes | Add the variable this workflow needs in Actions Settings. |
| `actions_missing_environment` | blocked | no | The deployment environment this workflow uses does not exist on GitHub. |
| `actions_environment_review_required` | warning | no | Waiting for a required reviewer to approve the environment. |
| `actions_environment_wait_timer` | warning | no | The environment wait timer is running; the job starts when it ends. |
| `actions_dispatch_input_invalid` | blocked | yes | Fix the highlighted workflow inputs and dispatch again. |
| `actions_workflow_file_invalid` | blocked | no | The workflow file has errors; fix it before running. |

Extended 2026-11-25 so the table covers every canonical code of GI-037's union: the seven rows above the extension plus the eleven GI-017 codes GI-037 keeps canonical unchanged. `severity` is `blocked` when the action cannot proceed, or `warning` when it may proceed or is waiting on GitHub. `retryable=yes` means Puppet Master offers Retry of the same action once that row's gate clears: after the named correction or refresh for sign-in, scopes, remote, secrets, variables, inputs or stale observations, and, for `actions_rate_limited` and `actions_runner_unavailable`, after a fresh observation shows that the limit has cleared (GitHub's retry time, when supplied, is the earliest point) or that a runner is available. Until the gate clears, Retry is shown disabled with the reason, and nothing is resubmitted automatically. `retryable=no` means the current result offers no Retry: a change on GitHub or in the workflow file must happen first, or, for `actions_environment_review_required` and `actions_environment_wait_timer`, the queued job proceeds by itself once the approval or timer completes. Availability is then re-evaluated from a fresh observation. The compatibility aliases `actions_auth_required` and `actions_branch_rule_mismatch` take the row of their canonical code (`actions_auth_missing`, `actions_branch_protected`) after normalization. Each row's recovery actions remain the blocked payload's ordered `allowed_action_ids[]`.

### Worktree Topology Commands

Repairs row `sfk-218bd2f9b09b060a43aa18b8`.

Command IDs: `cmd.git.worktree.open_topology`, `cmd.git.worktree.create`, `cmd.git.worktree.remove`, `cmd.git.worktree.prune`, `cmd.git.worktree.switch`, and `cmd.git.worktree.repair`.

Destructive commands require confirmation fields `target_worktree_id`, `expected_path`, `expected_branch`, `confirmation_text`, and `permission_snapshot_id`. Disabled states are `dirty_worktree`, `untracked_files`, `protected_branch`, `missing_remote`, `permission_denied`, and `operation_in_progress`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
