# Shard 015: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Skills_System.md`

Source lines: L2578-L2582

Source SHA256: `e9b5a64f585b47d2142222d2e1e031981bc97c2da3629e41f2a36c62bc49d094`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime skills rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d75fd32061dc8e608952bd68` and `sfk-83bf8b6fcb84de178c4cc3a6`: Skills_System owns backend skill discovery, validation, permissions, and catalog status. GUI placement is consumed by FinalGUISpec/MiscPlan. Backend fields are `skill_id`, `source`, `manifest_ref`, `permission_class`, `enabled`, `validation_state`, `blocked_reason_code?`, and `schema_version`.
