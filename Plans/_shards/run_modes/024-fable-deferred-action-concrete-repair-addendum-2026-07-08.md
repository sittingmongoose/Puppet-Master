# Shard 024: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Run_Modes.md`

Source lines: L1106-L1111

Source SHA256: `8fbb20f19c293128bb9f79d8e14be0b565e02aeaf0ee804723207fd778e0eb8e`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime run-mode rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6bc657026c94cc22b43a8b1`: unresolved P5 run-mode governance recovery requirements are tracked as owner-routed blockers, not live mode behavior. Fields are `blocker_id`, `owner_doc_ref`, `conflict_summary`, `status`, `reopen_condition`, and `created_at_utc`.
- Repairs `sfk-bc255c3a3c2b772302812837`: YOLO is never approval-free for non-bypassable guards. It skips only optional prompts; FileSafe, permissions, policy, secret, protected-branch, and remote-side-effect guards still block or require approval.
