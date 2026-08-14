# Shard 007: Known-37 recovery-unavailable GUI projection - 2026-07-18

Source: `Plans/FinalGUISpec.md`

Source lines: L930-L936

Source SHA256: `b4ba9c4395d25651bfdd6e0a0258ad6f4f830247dbe4af008acbde9348d09684`

---

## Known-37 recovery-unavailable GUI projection - 2026-07-18

Every recovery-unavailable surface renders the owner-provided reason (`snapshot_missing`, `snapshot_corrupt`, `snapshot_scope_unsupported`, `snapshot_identity_stale`, or `snapshot_unanchored`), exact preserved-work warning, blocked episode/anchor identity, and the exact ordered `allowed_action_ids[]`. The order is inspect, locate/verify, replan, optional owner-admitted isolated fresh attempt, then explicit abandonment. The GUI does not sort, add, remove, rename, or infer actions; ordinary restore and retry remain disabled in this state.

`locate_and_verify_recovery` collects a non-secret owner custody ref and explains identity/scope/manifest/content verification. `abandon_recovery` requires the exact confirmation `abandon_recovery_and_preserve_local_work`, durable confirmation authority, and preserved-work acknowledgement, and explicitly states that abandonment is not run abort or cleanup. Pre-attempt dispatch omits `attempt_id`; post-attempt dispatch carries the exact current value. Every enabled state is revalidated against current owner membership, identity, reason, snapshot set, permissions, storage, and operation state before dispatch.

The GUI displays success only from the typed domain result plus committed `recovery_unavailable_resolution_receipt`: locate uses `resolved`; abandon uses `abandoned_by_user`; both show `cleanup_performed = false`. A generic UI acknowledgement, accepted dispatch, `not_committed`, stale projection, refusal, recoverable failure, or missing receipt displays no release/recovery/cleanup/retry/success claim and preserves the blocked projection. Replay shows the original result and receipt without implying a second effect.
