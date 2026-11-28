# Shard 030: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/MiscPlan.md`

Source lines: L6489-L6502

Source SHA256: `f8fc84123d35047959a219649c19f926e9f55dd1968eb089bc8e47a63650a67b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime MiscPlan rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d75fd32061dc8e608952bd68`: Skills GUI/backend ownership is `Plans/Skills_System.md` for backend discovery and permission semantics, while this document owns only the visible Skills tab placement summary. Compatibility text that points backend authority back to this file is source-lineage only.
- Repairs `sfk-83bf8b6fcb84de178c4cc3a6`: Skills tab placement is `Settings > Agent Config > Skills` for configuration and `Agents > Skills` for operational status. Skills_System owns backend model; FinalGUISpec owns visible placement.
- Repairs `sfk-805564b3d8497a79fe1a5fd6`: skill permission `ask` flow uses `cmd.skills.permission.request`, result states `approved_once`, `approved_for_session`, `denied`, and `expired`, and visible path `Settings > Agent Config > Skills > Permissions`.
- Repairs `sfk-d83a6f558caf190c0a68b9c6`: shortcut import/export version mismatch handling is `reject_unsupported_version`. Greater major versions, missing version, or incompatible schema versions are rejected with `shortcut_version_unsupported`; equal major/minor with additive optional fields may import after validation.
- Repairs `sfk-cd3164782a4ef1c0059005e0`: debug instrumentation lifecycle fields are `instrumentation_id`, `scope_kind`, `collector_state`, `mutation_policy`, `evidence_sink_ref`, `cleanup_policy`, `cleanup_result`, and `created_at_utc`.
- Repairs `sfk-3a059c95c88e113587672e6b`: duplicate References and Implementation Status sections are source-lineage residues; canonical MiscPlan implementation status is the latest named PlanUnit status plus this addendum. Missing `§9.1.20` is retired and must not be cited as live.
- Repairs `sfk-f2adc94f674eb81b2fc0686f`: `platform_specs` injection is retired compatibility lineage. Active skill listing uses `skill_catalog_entry` fields `skill_id`, `display_name`, `source`, `permission_class`, `enabled`, `owner_doc_ref`, and `schema_version`; `list_skills_for_agent` is a future command alias until `Plans/Skills_System.md` owns its schema.
  Clarified 2026-11-25: "retired" means `platform_specs` is no longer a per-platform data source. M-083's injection contract is the provider-agnostic `SkillRunnerBinding` typed under M-083, whose entries are these `skill_catalog_entry` records, and `list_skills_for_agent` is the typed DRY helper defined there, not a command alias; the "future command alias" wording is retired.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
