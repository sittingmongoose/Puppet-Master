# Shard 016: Canonical Runtime Taxonomy and Event Precedence Canonical Alignment (2026-03-09)

Source: `Plans/Contracts_V0.md`

Source lines: L2412-L2524

Source SHA256: `55997dbf0a33935dbe4027f980a2df17fedaa0eee557cbe8f801c10020d08318`

---

## Canonical Runtime Taxonomy and Event Precedence Canonical Alignment (2026-03-09)


This section is an exact compatibility mirror of the later canonical runtime contract so readers do not stop at stale transitional enum lists.

### Event-name precedence
| Canonical event | Legacy alias | Rule |
|---|---|---|
| `scheduler.pass` | `run.scheduler_analysis` | `scheduler.pass` is canonical. |
| `node.blocked` | `run.node_blocked` | `node.blocked` is canonical. |
| `node.unblocked` | `run.node_unblocked` | `node.unblocked` is canonical. |
| `remediation.spawned` | `run.remediation_started` | `remediation.spawned` is canonical. |
| `remediation.resolved` | `run.remediation_completed` | `remediation.resolved` is canonical. |

### Canonical enum families
`failure_class`:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `auth_expired`
- `storage_io`
- `quota_exceeded`
- `rate_limited`
- `graph_integrity`

`blocked_reason_code`:
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `external_side_effect_blocked`
- `network_blocked_by_policy`
- `host_unreachable`
- `host_untrusted`
- `replan_required`
- `waiting_approval`
- `clarification_blocked`
- `worktree_conflict`
- `dirty_worktree`
- `plugin_hook_blocked`
- `validation_blocked`
- `remediation_ceiling_exceeded`

`offline_cached` is a read-only surface/projection state, not a `blocked_reason_code`. Mutating `/runtime`, `/registry`, Kubernetes, plugin-added, or `/extensibility` actions from `offline_cached` state must still emit a canonical blocked payload when policy or host state prevents execution, using `network_blocked_by_policy`, `host_unreachable`, or `host_untrusted` rather than generic network failure.

These blocked-state primitives are the canonical contract for worktree-heavy Source Control and Orchestrator recovery surfaces; settings and consumer docs may expose them, but they do not re-own blocked-state identity.

Domain blocked-payload details for SCM, GitHub Actions, and Docker/Kubernetes are schema-bearing details on top of the shared blocked-state primitives. SCM payloads for `dirty_worktree` and `worktree_conflict` carry `repo_id`, `worktree_id`, dirty/conflict file refs, affected files summary, safe-point relation, recovery target, and recovery command refs. Mutation-capable SCM attempts also carry branch and head refs so consumers can resolve the attempted action to `repo/worktree/branch/head` without guessing. GitHub Actions payloads carry hosted reason detail for auth expired, `missing scope`, `no GitHub remote`, `rate-limited`, and `environment waiting for review`, plus workflow/job/step refs, code-pivot refs, and readiness refs for secrets/variables/environments. Docker/Kubernetes payloads carry reason detail for `runtime unavailable`, `repo missing`, `Buildx/Bake unavailable`, `compose invalid`, `cluster unreachable`, and `namespace/workload missing`, plus image, compose, context, namespace, workload, and rollout refs.

`allowed_action_id`:
- `approve`
- `decline`
- `retry_now`
- `resume_after_prerequisite`
- `restore_safe_point_then_retry`
- `start_fresh_attempt`
- `replan`
- `skip_node`
- `abort_run`
- `open_details`

Command shorthand `/abort` resolves to `abort_run` or the provider-specific stream cancellation action for an in-progress provider call; persisted approval and blocked-state payloads keep the canonical `allowed_action_id` rather than storing the slash command as a separate action identity.

### Temporal outcome and timeout-class taxonomy

Runtime records that describe elapsed time, observation gaps, or known waits MUST carry `timeout_class?` only when a timeout-class event actually occurred.

Canonical `timeout_class` values are:
- `hard_execution_timeout` (`hard execution timeout`): execution budget expired and the runtime ended, cancelled, or blocked the operation.
- `inactivity_timeout` (`inactivity timeout`): no qualifying activity arrived before an inactivity threshold.
- `polling_timeout` (`polling timeout`): a poll loop or remote status refresh exceeded its observation budget without a terminal remote answer.
- `reconnect_timeout` (`reconnect timeout`): an interrupted stream or `/session` failed to revalidate or reconnect before its reconnect budget expired.
- `user_visible_wait_timer_expiry` (`user-visible wait timer expiry`): a timer shown to the user expired while the workflow was otherwise in a known wait state.

`timeout_class` is distinct from `failure_class` and `blocked_reason_code`; it is a recovery discriminator that `/receipts`, blocked events, blocked projections, and receipt-linked runtime artifacts retain because recovery differs by class. A timeout may later produce `/failed` state only when the owning runtime contract declares that outcome; the timeout class itself is not a generic failure substitute.

Known waits use `wait_state_class?` instead of being collapsed into generic `deadlock/stall` states. Canonical wait classes include:
- `environment_wait_timer`
- `approval_wait`
- `queue_wait`
- `long_governance_wait` (`long-governance-wait`)
- `scheduled_workflow_observation_gap`
- `future_timestamp_wait` (`future-timestamp`)

A scheduled workflow with no fresh observation is not skipped/failed by inference alone. A known future-timestamp wait is not a timeout until its governing timer actually expires, and it MUST NOT produce a `/stall` banner or `auto-pause` behavior reserved for deadlocked work.

Timestamp provenance, time-source, and clock-skew blind-spot rules:
- Temporal records distinguish `source_occurred_at` from the remote, provider, or runtime when available; `observed_at` when Puppet Master received the event; and `recorded_at` when the event was persisted locally.
- Persisted timestamps are UTC ISO-8601 values with `Z`. UI surfaces display local timezone by default and expose absolute UTC in detail or hover.
- Ordering prefers Puppet Master's canonical local sequence/order when remote wall-clock time conflicts with local ordering. Remote `/provider/runtime` wall-clock time remains evidence, not the ordering authority, when clocks disagree.
- Relative labels such as `5m ago` derive from one chosen base timestamp per surface and must not silently mix receive, `/update/log`, and persistence times.
- GitHub Actions, SSH remote git state, Docker runtime, and Kubernetes events may report skewed clocks. When skew is material, the UI warns with `clock_skew_detected` and avoids duration or `/staleness` claims based only on remote timestamps.
- Scheduled-workflow projections declare displayed schedule timezone, next-run computation source, missed-run behavior while the app is closed or offline (`/offline`), and the stale threshold for `next run overdue`. Orchestrator and receipts must not mark a scheduled workflow skipped or `/failed` merely because no fresh observation arrived.

### Blocking payload rule


Every runtime-facing blocked event or projection MUST expose:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- prerequisite metadata needed to bind the recovery command
- `preserved_local_work`
- `requires_safe_point_restore?`
- `failure_class?`
- `timeout_class?`
- `wait_state_class?`
- `detail_ref?`

No section in this file may present an earlier shorter enum set as the canonical value family.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
