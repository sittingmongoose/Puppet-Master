# Shard 020: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/human-in-the-loop.md`

Source lines: L2557-L2593

Source SHA256: `67c98fa13cd8e2aaf485c8441d2da07bfd1349927930ecc7e3675e2a43028237`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical HITL spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### PAUSE.md Gate And Precedence

Repairs row `sfk-52b55259003ddf5c68bd4d44`.

`PAUSE.md` is a project-root operator gate file with frontmatter fields `pause_id`, `scope`, `reason`, `created_by`, `created_at_utc`, `expires_at_utc?`, and `allowed_action_ids[]`. A valid PAUSE gate blocks new mutating execution in scope until removed or expired. HITL approvals cannot override an active PAUSE gate unless `allowed_action_ids[]` includes the exact requested action. If both PAUSE and HITL are active, PAUSE precedence is evaluated first, then HITL approval.

### Canonical HITL Request Contract

Repairs row `sfk-ea3ced32a2d07a9cb2ebcf07`.

`HITLRequest` fields are `hitl_request_id`, `request_kind`, `provider_correlation_id?`, `run_id?`, `attempt_id?`, `target_ref`, `permission_snapshot_id?`, `allowed_action_ids[]`, `default_action_id?`, `expires_at_utc?`, `request_copy_ref`, `created_at_utc`, and `schema_version`.

`request_kind` values are `approval`, `clarification`, `risk_acceptance`, `pause_override`, `credential_required`, and `manual_review`.

Provider-native correlation stores `provider_correlation_id`, `provider_id`, `provider_request_id?`, and `provider_thread_id?` only when supplied by the provider; absence is represented by null fields, not invented local ids.

### Skip And Cancel Commands

Repairs row `sfk-e480989a4656856d249b9ed8`.

- Skip node command: `cmd.runtime.skip_node` with fields `node_id`, `run_id`, `reason_code`, and `operator_note?`.
- Cancel run command: `cmd.runtime.abort_run` with fields `run_id`, `reason_code`, `requested_by`, and `created_at_utc`.
- These commands consume existing skip/abort semantics and must not be renamed to unqualified `skip_node` or `abort_run` in UI command payloads.

### HITL Timeout Defaults

Repairs row `sfk-f32c8b50bd2bc2bc30b350ed`.

- `approval_wait` default timeout is `3600000` ms (1 hour).
- `long_governance_wait` default timeout is `86400000` ms (24 hours).
- Timeout maps to `hitl_request_expired` and allowed actions `view_details`, `retry_request`, and `cancel_or_skip` according to request kind.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
