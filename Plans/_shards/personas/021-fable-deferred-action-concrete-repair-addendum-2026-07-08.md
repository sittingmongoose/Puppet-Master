# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Personas.md`

Source lines: L3450-L3458

Source SHA256: `bc6e85b1db32bbc0f521ad44ad09a2264a72be000d1e29aadd18e90f43ed1dd0`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime persona rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-bb3280798bd1706bc464fd91`: persona GUI command IDs are `cmd.persona.create`, `cmd.persona.edit`, `cmd.persona.disable`, `cmd.persona.restore`, `cmd.persona.delete`, `cmd.persona.save_as_override`, and `cmd.persona.validate_schema`.
- Repairs `sfk-5ebb077583e46703c74baa39`: `crew.roles` is a map from `role_id` to `{display_name, description, required_capabilities[], default_persona_id?, allowed_persona_ids[]}`. Role tag values are `planner`, `implementer`, `reviewer`, `tester`, `designer`, `security`, `release`, and `governance`.
- Repairs `sfk-a0b10c29e5616a01ecab3d13`: persona selection fields are `requested_persona`, `effective_persona`, `persona_selection_source`, `persona_policy_snapshot_id`, `fallback_reason_code?`, and `created_at_utc`. `persona_selection_source` values are `user_selected`, `project_default`, `role_default`, `policy_override`, and `fallback`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
