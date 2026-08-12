# Shard 007: Known-37 recovery-unavailable GUI projection - 2026-07-18

Source: `Plans/FinalGUISpec.md`

Source lines: L655-L661

Source SHA256: `dc51354b20dad6d8cf56051b7dcb649ab91d723ecfcf4a9dbbb2ab8a74341032`

---

## Known-37 recovery-unavailable GUI projection - 2026-07-18

Every recovery-unavailable surface renders the owner-provided reason (`snapshot_missing`, `snapshot_corrupt`, `snapshot_scope_unsupported`, `snapshot_identity_stale`, or `snapshot_unanchored`), exact preserved-work warning, blocked episode/anchor identity, and the exact ordered `allowed_action_ids[]`. The order is inspect, locate/verify, replan, optional owner-admitted isolated fresh attempt, then explicit abandonment. The GUI does not sort, add, remove, rename, or infer actions; ordinary restore and retry remain disabled in this state.

`locate_and_verify_recovery` collects a non-secret owner custody ref and explains identity/scope/manifest/content verification. `abandon_recovery` requires the exact confirmation `abandon_recovery_and_preserve_local_work`, durable confirmation authority, and preserved-work acknowledgement, and explicitly states that abandonment is not run abort or cleanup. Pre-attempt dispatch omits `attempt_id`; post-attempt dispatch carries the exact current value. Every enabled state is revalidated against current owner membership, identity, reason, snapshot set, permissions, storage, and operation state before dispatch.

The GUI displays success only from the typed domain result plus committed `recovery_unavailable_resolution_receipt`: locate uses `resolved`; abandon uses `abandoned_by_user`; both show `cleanup_performed = false`. A generic UI acknowledgement, accepted dispatch, `not_committed`, stale projection, refusal, recoverable failure, or missing receipt displays no release/recovery/cleanup/retry/success claim and preserves the blocked projection. Replay shows the original result and receipt without implying a second effect.
