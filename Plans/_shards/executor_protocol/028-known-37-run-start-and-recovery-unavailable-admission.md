# Shard 028: Known-37 run-start and recovery-unavailable admission

Source: `Plans/Executor_Protocol.md`

Source lines: L7217-L7225

Source SHA256: `fdc88d1ce136a9594060eca989fd77ade3904c54ce32cd093bb47da87438f162`

---

## Known-37 run-start and recovery-unavailable admission

Status: `STATICALLY_MATERIALIZED`; dispatch/runtime behavior is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.

Before `run.started`, Executor assembles and persists one complete immutable `pm.requested_effective_runtime@1.0.0` record, resolves its exact key/ref/digest and all six owner refs, copies the minimum v2 joins, and requires envelope/payload/snapshot equality. The sequence is `candidate -> admission_validated -> runtime_identity_resolved -> activated -> start_recorded`; the barrier event is durable before provider/tool execution attributable to the run. Same semantic start replays the original; a different digest is an idempotency conflict. Thin, missing, mutable, stale, secret-bearing, or historically unresolvable snapshots fail closed.

For a `recovery_unavailable` episode, Executor revalidates `project_id, run_id, node_id, blocked_sequence, safe_point_id, anchor_ref, snapshot_refs, reason`, current ordered membership, permission/storage access, exclusivity, and pre/post-attempt identity. Pre-attempt event/request/result omits `attempt_id`; its anchor/receipt carries required-present null. Post-attempt surfaces require the exact existing prior attempt ID.

The only new handlers are `handlers::runtime::locate_and_verify_recovery` and `handlers::runtime::abandon_recovery`. Transition order is current admission, command verification/confirmation, durable typed result and `recovery_unavailable_resolution_receipt`, atomic anchor release, then projection refresh/downstream admission. Replan releases only after durable admitted replan; conditional fresh attempt releases only after a distinct successor and baseline receipt, using `superseded_with_verified_successor`. A refused, failed, stale, unavailable, or uncommitted result leaves the anchor `recovery_unavailable`.
