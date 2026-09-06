# Shard 041: Known-37 corruption evidence and recovery-unavailable owner completion

Source: `Plans/FileSafe.md`

Source lines: L14481-L14491

Source SHA256: `e665850106a97f5c95b2bab2e2b2d799d02da3dfc1dcb755a19c30c060789abb`

---

## Known-37 corruption evidence and recovery-unavailable owner completion

Status: `STATICALLY_MATERIALIZED`; filesystem, recovery, and crash behavior is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.

For `restore_point.corrupt`, FileSafe attests immutable, non-secret evidence refs, lowercase SHA-256, referenced-material hashes and lengths, and content-scope results. Referenced material fields are exactly `context_provenance_refs | attachment_refs | citation_refs`. Evidence carries refs/hashes/lengths, never record bodies, snapshot bytes, raw local paths, credentials, or secrets. Missing record/material is not corruption. Indeterminate I/O remains unknown/quarantined.

For `safe_point.recovery_unavailable`, FileSafe owns the five exact reasons `snapshot_missing | snapshot_corrupt | snapshot_scope_unsupported | snapshot_identity_stale | snapshot_unanchored`, proves `preserved_local_work=true`, and preserves the anchor, worktree ownership, refs, fences, and holds until durable release. The event/action order is owner-issued and cannot be reconstructed by a GUI.

`cmd.runtime.locate_and_verify_recovery` accepts only a FileSafe-normalized non-secret `recovery_source_ref`, exact current episode/anchor/snapshot/reason/attempt identity, and current permission/storage access. FileSafe verifies safe-point/run/node/attempt/worktree identity, snapshot scope, manifest/content hashes, and then transfers the material into owner custody. Only a committed `applied|replayed` result with verified refs/hash/evidence and a committed receipt releases as `resolved`.

`cmd.runtime.abandon_recovery` requires durable actor-bound confirmation `abandon_recovery_and_preserve_local_work` and acknowledgement of preserved work. It releases only the recovery anchor as `abandoned_by_user`; `cleanup_performed=false`. It never aliases `abort_run`, deletes snapshots/work, detaches a worktree, or decides GoalRun terminal state. Age, exit, archive, completion, pressure, compaction, or cleanup never releases the anchor.
