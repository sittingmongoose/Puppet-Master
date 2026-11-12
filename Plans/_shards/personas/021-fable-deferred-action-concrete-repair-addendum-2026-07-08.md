# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Personas.md`

Source lines: L3498-L3506

Source SHA256: `89f739fc13a4639be43f3ed8569d8e03342b4fd621622614ec8ab2b72e88f1b3`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime persona rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-bb3280798bd1706bc464fd91`: persona GUI command IDs are `cmd.persona.create`, `cmd.persona.edit`, `cmd.persona.disable`, `cmd.persona.restore`, `cmd.persona.delete`, `cmd.persona.save_as_override`, and `cmd.persona.validate_schema`.
- Repairs `sfk-5ebb077583e46703c74baa39`: `crew.roles` is a map from `role_id` to `{display_name, description, required_capabilities[], default_persona_id?, allowed_persona_ids[]}`. Role tag values are `planner`, `implementer`, `reviewer`, `tester`, `designer`, `security`, `release`, and `governance`.
- Current selection fields remain `requested_persona`, `effective_persona`, `persona_selection_source`, `persona_policy_snapshot_id`, `fallback_reason_code?`, and `created_at_utc`. The scope-aware successor adds `everywhere_default` and `computer_default` beside `user_selected`, `project_default`, `role_default`, `policy_override`, and `fallback`. Historical Project resolution bytes/enums stay readable under their original version; app dispatch requires the successor schema binding from the Personas and Models owners. P-056/P-060 preserve immutable frozen identity.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
