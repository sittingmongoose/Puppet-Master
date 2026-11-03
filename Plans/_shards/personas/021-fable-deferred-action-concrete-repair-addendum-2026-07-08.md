# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Personas.md`

Source lines: L3477-L3485

Source SHA256: `70539854a90f660a87becb50e6d5940880345e97cd12c4860fa3388c25e1ad23`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime persona rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-bb3280798bd1706bc464fd91`: persona GUI command IDs are `cmd.persona.create`, `cmd.persona.edit`, `cmd.persona.disable`, `cmd.persona.restore`, `cmd.persona.delete`, `cmd.persona.save_as_override`, and `cmd.persona.validate_schema`.
- Repairs `sfk-5ebb077583e46703c74baa39`: `crew.roles` is a map from `role_id` to `{display_name, description, required_capabilities[], default_persona_id?, allowed_persona_ids[]}`. Role tag values are `planner`, `implementer`, `reviewer`, `tester`, `designer`, `security`, `release`, and `governance`.
- Current selection fields remain `requested_persona`, `effective_persona`, `persona_selection_source`, `persona_policy_snapshot_id`, `fallback_reason_code?`, and `created_at_utc`. The scope-aware successor adds `everywhere_default` and `computer_default` beside `user_selected`, `project_default`, `role_default`, `policy_override`, and `fallback`. Historical Project resolution bytes/enums stay readable under their original version; F binds the successor schema before app dispatch. P-056/P-060 preserve immutable frozen identity.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
