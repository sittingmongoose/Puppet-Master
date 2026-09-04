# Shard 022: Known-37 recovery-unavailable command registration - 2026-07-18

Source: `Plans/Commands_System.md`

Source lines: L4277-L4292

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## Known-37 recovery-unavailable command registration - 2026-07-18

Commands registers exactly two stable domain commands and no wrappers, aliases, generic repair route, or second handler:

| `allowed_action_id` | Command | Sole handler | Typed request | Typed result | Label |
|---|---|---|---|---|---|
| `locate_and_verify_recovery` | `cmd.runtime.locate_and_verify_recovery` | `handlers::runtime::locate_and_verify_recovery` | `LocateAndVerifyRecoveryRequest` | `LocateAndVerifyRecoveryResult` | Locate and verify recovery |
| `abandon_recovery` | `cmd.runtime.abandon_recovery` | `handlers::runtime::abandon_recovery` | `AbandonRecoveryRequest` | `AbandonRecoveryResult` | Abandon recovery |

Both commands are admitted only from the current ordered `safe_point.recovery_unavailable.allowed_action_ids[]`, exact blocked episode and recovery anchor, exact five-value owner reason, exact non-empty snapshot set, preserved local work, current storage/permission state, operation exclusivity, and a fresh or exactly replayable idempotency key. Pre-attempt dispatch omits `attempt_id`; post-attempt dispatch requires the exact event/anchor/prior-attempt identity. A stale projection, reordered action list, caller-selected branch, raw path, moving ref, inferred reason, or mismatched snapshot set refuses before mutation.

`LocateAndVerifyRecoveryRequest` is closed at `1.0.0` and requires `schema_version`, const command ID, `project_id`, `run_id`, `node_id`, `blocked_sequence`, `safe_point_id`, `anchor_ref`, `expected_snapshot_refs`, `expected_recovery_unavailable_reason_code`, `recovery_source_ref`, `actor_ref`, and `idempotency_key`, plus the conditional attempt field. Optional `expected_manifest_sha256` and `permission_snapshot_id` are evidence only. FileSafe must place the source under owner custody and verify safe-point/run/node/attempt/worktree identity, scope, manifest, and content before Storage commits the result.

`AbandonRecoveryRequest` is closed at `1.0.0` and requires the common exact episode fields plus `actor_ref`, `confirmation = abandon_recovery_and_preserve_local_work`, durable `confirmation_ref`, `preserved_local_work_acknowledged = true`, and `idempotency_key`, plus the conditional attempt field. Run exit, archive, timeout, policy, dialog-local state, or cancellation is not explicit abandonment authority.

Both typed results use `outcome = applied | replayed | refused | failed_recoverable`, `receipt_state = committed | not_committed`, required command/idempotency/episode/anchor identity, conditional attempt identity, and `cleanup_performed = false`. Locate success requires owner verification evidence and releases only as `resolved`; abandonment success releases only as `abandoned_by_user`. A release requires a committed `recovery_unavailable_resolution_receipt`; UI acknowledgement does not suffice. Nonsuccess and receipt failure retain `recovery_unavailable`, every hold/ref and local work. Replay returns the original result/receipt with no second release. Commands emits no new EventRecord family for either action.
