## Runtime Recovery Persistence Consolidation

### Canonical keys
- `scheduler_pass_record`: key = `run_id`, `scheduler_pass_id`
- `blocked_projection`: key = `run_id`, `node_id`, `blocked_sequence`
- `attempt_id?` and `thread_id?` are fields on `blocked_projection`, not primary-key components
- `wizard_runtime_state`: key = `wizard_id`
- `safe_point_restore_record`: key = `safe_point_id`, `restore_sequence`

### Canonical records
1. `attempt_record`
   - key: `run_id`, `node_id`, `attempt_id`
   - fields include `scheduler_pass_id`, requested/effective model snapshot ids, requested/effective permission snapshot ids, `replan_generation`, `mutation_capable`, `safe_point_id?`, `provider_attempt_ref?`, remediation lineage refs, terminal state, and independent counter-family fields
2. `scheduler_pass_record`
   - fields include `wake_reason`, `secondary_wake_reasons[]`, full score breakdowns, `selected_at_utc`, and `newly_ready_nodes[]`
3. `blocked_projection`
   - fields include `blocked_reason_code`, `allowed_action_ids[]`, `preserved_local_work`, `requires_safe_point_restore?`, prerequisite metadata, `failure_class?`, `detail_ref?`, `attempt_id?`, and `thread_id?`
4. `safe_point_record`
   - key: `safe_point_id`
   - safe-point namespace is runtime-internal and distinct from user-facing restore-point storage
5. `safe_point_restore_record`
   - append-only restore history; never last-write-wins
6. `remediation_lineage_record`
   - key: `remediation_root_id`
7. `thread_blocked_notice`
   - key: `thread_id`, `blocked_sequence`
   - fields include `node_id?`, `attempt_id?`, active blocked metadata, `message_id`, and `resume_url?`
8. `wizard_runtime_state`
   - fields include `wizard_status`, `wizard_step`, `blocked_reason_code?`, `clarification_round_count`, `report_ref?`, `resume_url?`, `decomposition_degraded`, `degradation_reason?`, and `replan_generation?`

### Counter rule
- `attempt_count` is total started attempts for the node in the run.
- `automatic_retry_count`, `prerequisite_resume_count`, `manual_resume_count`, and `remediation_retry_count` remain independent stored counters.
- `retry_count` is a derived display value only and MUST NOT drive policy.

### Restart and stale history
Attempts from older `replan_generation` values, or in-flight attempts that cannot resume after restart, transition to `stale_historical` and remain queryable but never resumable.

### Report identity rule
Canonical persisted references use `*_ref` fields. Raw `*_path` wording is compatibility-only.
