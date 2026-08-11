# Shard 015: Known-37 recovery artifact projection - 2026-07-18

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L422-L426

Source SHA256: `66bf820da0ae10afb746ab56ec9aef68ec4b6ac29197f804a6c6daf14049c3d5`

---

## Known-37 recovery artifact projection - 2026-07-18

The Runtime Artifacts panel exposes, by stable non-secret ref, the `safe_point.recovery_unavailable` event, recovery anchor, snapshot set, reason, preserved-work state, typed command result, verification evidence or confirmation authority, and `recovery_unavailable_resolution_receipt`. It preserves the owner ordering of `allowed_action_ids[]`; it does not derive membership from the presence of artifacts or offer ordinary restore/retry while the anchor remains recovery unavailable.

Locate success shows the verified snapshot refs, lowercase manifest SHA-256, verification evidence ref, exact `resolved` release, and committed receipt identity. Abandonment shows the actor/confirmation ref, exact `abandoned_by_user` release, preserved snapshot/local-work custody, and committed receipt identity. Both show `cleanup_performed = false`. Nonsuccess, receipt `not_committed`, an unresolved ref, or replay uncertainty leaves the anchor visibly `recovery_unavailable` and must not be represented as partial recovery, cleanup, or success. The panel is a read-only receipt/evidence consumer and cannot create an authority ref or release an anchor.
