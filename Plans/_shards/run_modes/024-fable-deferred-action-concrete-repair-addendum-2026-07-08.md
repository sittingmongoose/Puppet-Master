# Shard 024: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Run_Modes.md`

Source lines: L1642-L1647

Source SHA256: `66aee00d7a0cff60dfe50f13afebd4d88f344f1fa6d0012f790bce1488da636d`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime run-mode rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6bc657026c94cc22b43a8b1`: unresolved P5 run-mode governance recovery requirements are tracked as owner-routed blockers, not live mode behavior. Fields are `blocker_id`, `owner_doc_ref`, `conflict_summary`, `status`, `reopen_condition`, and `created_at_utc`.
- Repairs sfk-bc255c3a3c2b772302812837 under current PS-146/147/148 and RM-053: YOLO skips ordinary asks including publication; exact Y1 and grant-created-resource exceptions apply. FileSafe, permission ceilings, secrets/trust, protected targets, disclosure, capability, currentness and Stop remain. This line no longer imposes a universal human publication approval.
