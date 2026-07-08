# Shard 015: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Skills_System.md`

Source lines: L2556-L2560

Source SHA256: `4d1d964cb3d747ad352576c4d1d59b240d230a5c16326a2ec5cdb1b52c5e1b53`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime skills rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d75fd32061dc8e608952bd68` and `sfk-83bf8b6fcb84de178c4cc3a6`: Skills_System owns backend skill discovery, validation, permissions, and catalog status. GUI placement is consumed by FinalGUISpec/MiscPlan. Backend fields are `skill_id`, `source`, `manifest_ref`, `permission_class`, `enabled`, `validation_state`, `blocked_reason_code?`, and `schema_version`.
