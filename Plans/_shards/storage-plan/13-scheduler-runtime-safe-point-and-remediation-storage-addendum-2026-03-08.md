## Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)

### 1. New canonical event families

Storage projections must ingest the scheduler, safe-point, remediation, and decomposition-degradation events introduced by this packet.

Required support:
- `run.scheduler_analysis`
- `run.node_ready`
- `run.node_blocked`
- `run.node_unblocked`
- `run.node_backoff_started`
- `run.node_backoff_expired`
- `run.node_retry_scheduled`
- `safe_point.created`
- `safe_point.restored`
- `run.remediation_started`
- `run.remediation_completed`
- `plan.decomposition_degraded`
- `run.graph_integrity_failed`
- `wizard.blocked`
- `wizard.unblocked`

### 2. redb keys / projections

Add or reserve the following projection families:
- `runs -> scheduler_analysis.{run_id}.{analysis_id}`
- `runs -> node_runtime.{run_id}.{node_id}`
- `runs -> safe_point.{run_id}.{safe_point_id}`
- `runs -> remediation.{run_id}.{remediation_root_id}`
- `runs -> backoff.{run_id}.{node_id}`
- `runs -> graph_integrity.{run_id}`
- `runs -> decomposition_degradation.{project_id}`
- `checkpoints -> wizard.{wizard_id}` includes blocked/attention state and latest report refs

Minimum `node_runtime` projection fields:
- `attempt_count`
- `retry_count`
- `failure_class`
- `blocked_reason_code`
- `wake_reason`
- `scheduler_lane`
- `scheduler_score_breakdown`
- `ready_since_utc`
- `selected_at_utc`
- `backoff_until_utc`
- `safe_point_id`
- `remediation_root_id`
- `remediation_parent_attempt_id`
- `replan_generation`

### 3. Safe-point vs restore-point separation

Storage MUST keep the following concepts separate:
- `safe_point.*` = runtime-internal retry/remediation recovery anchor
- `restore_point.*` = user-visible history/rewind anchor
- `rollback.*` = explicit requested/confirmed user or agent rollback flow

Required rule:
- safe points MUST NOT be stored in the `restore_points` namespace
- restore-point history UI MUST NOT silently expose runtime safe points as rewind choices

### 4. Wizard blocked persistence

Wizard checkpoint/state persistence must support both:
- `attention_required`
- `blocked`

Required persisted fields when blocked:
- `wizard_status = blocked`
- `clarification_round_count`
- `latest_quality_report_ref`
- `resume_url`
- `thread_id?`
- `blocked_reason_code`

### 5. Queue-analysis freshness and UI delivery

Queue/scheduler freshness notifications remain projection-driven:
- UI reads committed `scheduler_analysis` / `node_runtime` projections
- ad-hoc polling is not the correctness source
- event-driven delivery remains the preferred UI update mechanism

### 6. Degradation evidence persistence

Pre-canonical draft degradation must persist enough evidence to explain what happened.

Required fields:
- original decomposition shape
- degraded fallback shape
- reason code
- evidence ref / report ref
- whether the degraded draft was later replaced by a valid canonical graph

### 7. Acceptance criteria

- Safe points and restore points are clearly separated in storage.
- Queue-analysis and node-runtime projections expose the scheduler fields needed by UI.
- Wizard blocked state is durable and recoverable.
- Degradation events can be replayed and inspected later.
- New runtime projections derive from committed event/projection state rather than timer-based UI caches.
