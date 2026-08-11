# Shard 027: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Executor_Protocol.md`

Source lines: L7177-L7214

Source SHA256: `fdc88d1ce136a9594060eca989fd77ade3904c54ce32cd093bb47da87438f162`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical executor protocol spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### execution_unit_context Example And Conditional Requirements

Repairs row `sfk-1e2487142a1e52002f8eb946`.

Example:

```json
{
  "schema_id": "pm.execution_unit_context",
  "schema_version": "1.0.0",
  "execution_unit_type": "plan_unit",
  "project_id": "project-001",
  "run_id": "run-001",
  "unit_id": "PDS-003",
  "attempt_id": "attempt-001",
  "permission_snapshot_id": "perm-001",
  "input_artifact_refs": [],
  "owner_doc_refs": ["Plans/Plan_Document_System.md"]
}
```

Conditional requirements: `plan_unit` requires `unit_id` and `owner_doc_refs[]`; `tool_attempt` requires `tool_call_id`, `permission_snapshot_id`, and `attempt_id`; `verification` requires `validator_id`, `target_ref`, and `evidence_ref`; `repair_slice` requires `audit_id`, `finding_key`, and `owner_doc_refs[]`.

### Attempt Counter Invariant Recovery

Repairs row `sfk-d91a2513114704894b54b826`.

If sub-counters disagree with `attempt_count`, the executor records `attempt_counter_mismatch` with `attempt_id`, `attempt_count`, `subcounter_name`, `subcounter_value`, `expected_value`, and `recovery_action`. `recovery_action` values are `recompute_from_events`, `block_for_manual_repair`, and `ignore_non_authoritative_projection`. Event history is authoritative; projections must be recomputed before any retry/skip/complete transition.

### Event Dedup Key Sequence Fallback

Repairs row `sfk-13a077c1b96ec11515ca81d4`.

Dedup identity is `event_name + node_id + attempt_id + event_sequence`. Timestamp is metadata only. If `event_sequence` is missing in imported source, the migration reader derives `event_sequence` from stable event-stream order and records `dedup_sequence_derived = true`. New executor events must carry monotonic `event_sequence` per attempt.
