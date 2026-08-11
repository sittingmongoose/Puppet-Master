# Shard 039: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FileSafe.md`

Source lines: L14465-L14471

Source SHA256: `efecff59153c90ec0a8dd33d6982b5ed891688de490ddcebfb45639be8d2e91e`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime FileSafe rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-e8baa3796f5c29cdb66f46eb`: `RedactionSettlement` fields are `settlement_id`, `source_ref`, `redaction_profile_id`, `decision`, `redacted_artifact_ref?`, `blocked_reason_code?`, and `created_at_utc`. `ObservabilityEnvelope` fields are `envelope_id`, `trace_id`, `event_refs[]`, `sampling_policy_id`, `quota_class`, `redaction_settlement_id`, and `created_at_utc`. `TracePersistencePolicy` fields are `policy_id`, `sample_rate`, `max_bytes_per_trace`, `retention_days`, `redaction_required`, and `export_allowed`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
