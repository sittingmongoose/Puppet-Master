# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Personas.md`

Source lines: L3446-L3454

Source SHA256: `be34262ec620936b9b92e011d201c2e09780ddbaeff24ddea1490891b9b97493`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime persona rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-bb3280798bd1706bc464fd91`: persona GUI command IDs are `cmd.persona.create`, `cmd.persona.edit`, `cmd.persona.disable`, `cmd.persona.restore`, `cmd.persona.delete`, `cmd.persona.save_as_override`, and `cmd.persona.validate_schema`.
- Repairs `sfk-5ebb077583e46703c74baa39`: `crew.roles` is a map from `role_id` to `{display_name, description, required_capabilities[], default_persona_id?, allowed_persona_ids[]}`. Role tag values are `planner`, `implementer`, `reviewer`, `tester`, `designer`, `security`, `release`, and `governance`.
- Repairs `sfk-a0b10c29e5616a01ecab3d13`: persona selection fields are `requested_persona`, `effective_persona`, `persona_selection_source`, `persona_policy_snapshot_id`, `fallback_reason_code?`, and `created_at_utc`. `persona_selection_source` values are `user_selected`, `project_default`, `role_default`, `policy_override`, and `fallback`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
