# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Automated_Testing_System.md`

Source lines: L2217-L2245

Source SHA256: `cbf113bc3497116549e38ee16407505136466fca3596837cc3acbcfddb699533`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical automated-testing spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Test Adapter Interface And TestRunReceipt

Repairs row `sfk-fa0b68afddc10ec875a0b183`.

`TestAdapterInvocation` fields are `invocation_id`, `adapter_id`, `test_kind`, `target_ref`, `command_ref?`, `input_artifact_refs[]`, `timeout_ms`, `permission_snapshot_id?`, and `created_at_utc`.

`TestRunReceipt` fields are `test_run_id`, `adapter_id`, `test_kind`, `target_ref`, `started_at_utc`, `ended_at_utc`, `status`, `passed_count`, `failed_count`, `skipped_count`, `error_count`, `log_artifact_refs[]`, `visual_artifact_refs[]`, `coverage_ref?`, `failure_refs[]`, and `schema_version`.

`status` values are `queued`, `running`, `passed`, `failed`, `cancelled`, `blocked`, and `inconclusive`.

### GUI Result Surfacing

Repairs row `sfk-bd4e3c4facbc54e0a68a60c8`.

Testing GUI commands are `cmd.testing.open_panel`, `cmd.testing.watch_run`, `cmd.testing.cancel_run`, `cmd.testing.open_receipt`, `cmd.testing.open_failure`, and `cmd.testing.export_bundle`.

Panel layout contains `run_list`, `active_run_detail`, `failure_list`, `artifact_preview`, and `redaction_notice`. Button states derive from `TestRunReceipt.status`: watch enabled for `queued|running`; cancel enabled for `queued|running`; open receipt enabled for any terminal state; export bundle enabled when `log_artifact_refs[]` or `visual_artifact_refs[]` is non-empty.

### Runtime Disabled To Enabled Trigger

Repairs row `sfk-a86063e06fec52acf396acb6`.

Testing remains runtime-disabled until all of the following are true: a target adapter is configured, the target capability probe returns `available`, permission snapshot is current, required fixtures exist, and the test invocation can produce a `TestRunReceipt` without claiming PNC-019 lifecycle certification. The transition event is `testing.runtime_enabled_for_adapter` with fields `adapter_id`, `project_id`, `capability_probe_ref`, `permission_snapshot_id`, `enabled_at_utc`, and `reason_code`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
