# Shard 054: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31570-L31620

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical orchestration spec text for the deferred non-runtime FABLE rows listed below. It does not certify runtime lifecycle behavior, does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, build tasks, final manifests, or PNC-019 receipts, and does not change `buildability_gate_passed`.

### Required-Subagent Criticality And Parallel Failure Policy

Repairs rows `sfk-87505ab95981f07d6604f714` and `sfk-eb80bcd7eb429ea562ef5551`.

- `critical_subagent` is true only when the subagent `agent_id` or `lane_id` appears in the active `required_subagents[]` set for the current tier, phase, or repair lane. Optional review, exploration, and advisory agents are non-critical unless explicitly listed in `required_subagents[]`.
- A critical tier is any tier whose `required_subagents[]` is non-empty and whose required set has not reached a terminal `completed` or approved `skipped` state. Failure of a non-critical subagent records degraded evidence but does not fail the tier by itself.
- For a parallel group, the first critical failure emits `subagent.parallel_group_failed` with fields `group_id`, `failed_agent_id`, `failure_class`, `required_agent_ids[]`, `completed_agent_ids[]`, `cancel_requested_agent_ids[]`, `retained_partial_agent_ids[]`, and `created_at_utc`.
- Cancellable siblings receive `subagent.cancel_requested`; non-cancellable siblings are drained until a terminal receipt or `parallel_group.drain_timeout_ms` expires. Default `parallel_group.drain_timeout_ms` is `30000`.
- Partial results may be retained only with `partial_result_state = retained_after_group_failure`, `source_agent_id`, `redaction_status`, and `usable_for_repair = false` unless a parent writer explicitly accepts the partial evidence.

### Handoff Retry Ceiling

Repairs row `sfk-f0bb4b941956a19bb7f62357`.

- The canonical config key is `subagent.handoff.max_retries`.
- Default `subagent.handoff.max_retries = 1`; the initial handoff attempt is not counted as a retry.
- Effective range is `0..=3`. Values above 3 are invalid in product spec and must be rejected before dispatch.
- On exhaustion, the handoff records `handoff_retry_exhausted` with `attempt_count`, `max_retries`, `last_error_class`, and `next_allowed_actions[] = [retry, skip_with_operator_acceptance, view_raw_output]`.

### Execution-Unit Hook Naming

Repairs row `sfk-1a88c3d82dd8176a236abe6a`.

- Canonical hook names are `BeforeUnit`, `AfterUnit`, `VerifyUnitStart`, and `VerifyUnitEnd`.
- Legacy `BeforeTier`, `AfterTier`, and `verify_tier_start` strings are source-lineage aliases only. They may appear in imported records, but normalized orchestration records must store `hook_name_normalized` using the canonical execution-unit names.
- Import normalization table: `BeforeTier -> BeforeUnit`, `AfterTier -> AfterUnit`, `verify_tier_start -> VerifyUnitStart`, `verify_tier_end -> VerifyUnitEnd`.
- New owner prose and generated receipts must not introduce tier-era hook names as active hook identifiers.

### Cross-Platform Process Existence Check

Repairs row `sfk-79825aa01b5e2048e47435a8`.

- Unix process existence uses `kill(pid, 0)` and distinguishes `exists`, `not_found`, and `permission_denied`.
- Windows process existence uses `OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)`. A valid handle followed by `GetExitCodeProcess == STILL_ACTIVE` returns `exists`; a valid handle with an exited code returns `not_found`; `ERROR_INVALID_PARAMETER` returns `not_found`; `ERROR_ACCESS_DENIED` returns `permission_denied`.
- `permission_denied` is not treated as proof of liveness for scheduling. It must trigger a fresh owner-visible verification step before any state transition that depends on process liveness.
- The placeholder behavior `true // Assume exists for now` is retired source-lineage only.

### Continuity Record Family

Repairs row `sfk-778d356662ba6f5cd8981897`.

- Required continuity event families are `continuity.actor_identified`, `continuity.provenance_recorded`, `continuity.redaction_applied`, and `continuity.replay_checkpointed`.
- The redb projection key is `continuity_record.v1:{project_id}:{continuity_id}`. The replay checkpoint key is `continuity_replay_checkpoint.v1:{project_id}:{stream_id}`.
- `continuity_record` fields are `continuity_id`, `project_id`, `actor_ref`, `actor_kind`, `source_event_id`, `provenance_ref`, `redaction_profile_id`, `redaction_decision`, `replay_checkpoint_ref?`, `created_at_utc`, and `schema_version`.
- These records preserve audit continuity only. They do not certify executable runtime lifecycle behavior and must not be used as PNC-019 evidence.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
