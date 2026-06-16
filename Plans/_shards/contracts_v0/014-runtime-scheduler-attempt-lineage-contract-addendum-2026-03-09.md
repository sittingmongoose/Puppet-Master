# Shard 014: Runtime Scheduler / Attempt Lineage Contract Addendum (2026-03-09)

Source: `Plans/Contracts_V0.md`

Source lines: L2185-L2279

Source SHA256: `bd800694f4803d027eaf740d5cd2c17305f43c4857ef622bd9738d48a5b4f18e`

---

## Runtime Scheduler / Attempt Lineage Contract Addendum (2026-03-09)


Add the following canonical runtime event families and required fields.

Required fields:
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]` with score breakdown terms
- `selected_nodes[]`
- `non_selected[]` with `non_selected_reason`
- capacity summary

ContractRef: Plans/Executor_Protocol.md#Wake reasons and coalescing

Required fields:
- startup_recovered

Canonical terms and values:
- scheduler.pass
- startup_recovered

Labels:
- scheduler pass

Behavioral rules:
- The first scheduler pass after startup recovery persists `wake_reason = startup_recovered`.
- Blocked and recovery wake ownership is carried by `scheduler.pass` rather than inferred from prompt text.
### `attempt.started`


Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- `scheduler_lane`
- effective requested/effective model snapshot
- effective permission snapshot identifier
- `safe_point_id` when present
- `remediation_root_id` / `remediation_parent_attempt_id` when present
- `replan_generation`

### `attempt.completed`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- terminal state
- `failure_class` or success marker
- retry count and backoff metadata
- verification / reviewer result references when relevant
- resolved lineage identifiers

### `node.blocked`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id` if an attempt existed
- `blocked_reason_code`
- `failure_class` when the blocked state originated from a classified outcome
- `timeout_class` when the blocked state originated from a timeout-class event
- `wait_state_class` when the blocked state represents a known wait
- ordered `allowed_action_ids[]`
- `auth_realm`, `missing_scopes[]`, or side-effect metadata when relevant
- whether local work was preserved

### `safe_point.created` and `safe_point.restored`
Required fields:
- `safe_point_id`
- `run_id`, `node_id`, `attempt_id`
- workspace / worktree reference
- `replan_generation`
- reason for creation or restore
- restore result

For a worktree-bound attempt, `safe_point.created` MUST capture the exact worktree snapshot fields `worktree_id`, `worktree_path`, `branch_name`, and `HEAD_sha`. Restore and retry flows verify the captured worktree context and expected `HEAD_sha` before mutation-capable work continues; if the worktree path, branch name, or HEAD state no longer matches, the recovery flow reports a blocked/stale baseline rather than silently substituting the main project root or a different worktree.

### `remediation.spawned` and `remediation.resolved`
Required fields:
- `remediation_root_id`
- `remediation_parent_attempt_id`
- child `attempt_id`
- finding / issue references
- `remediation_generation`
- resolution enum (`fixed`, `superseded`, `abandoned`, `replan_required`)

### `tool.denied` alignment


`tool.denied` MUST carry canonical runtime mapping fields when the denial affects scheduler state:
ContractRef: EventType:tool.denied, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- `failure_class`
- ordered `allowed_action_ids[]`
- `headless_denied` boolean
- effective permission snapshot identifier

All of the above are canonical contract fields, not UI-only projection conveniences.
