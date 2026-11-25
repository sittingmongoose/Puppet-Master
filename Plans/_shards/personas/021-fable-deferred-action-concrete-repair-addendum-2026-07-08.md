# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Personas.md`

Source lines: L3503-L3513

Source SHA256: `481027fb864e805ec5d21fcd74ee7589315274682fc9d62b17922004c06a1e50`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime persona rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-bb3280798bd1706bc464fd91`: persona GUI command IDs are `cmd.persona.create`, `cmd.persona.edit`, `cmd.persona.disable`, `cmd.persona.restore`, `cmd.persona.delete`, `cmd.persona.save_as_override`, and `cmd.persona.validate_schema`.
  - Corrected 2026-11-24 (Decision_Log DL-2602, C-FIX79): the list above is retired. The persona GUI commands are the catalog's `cmd.persona.create`, `cmd.persona.update`, `cmd.persona.delete` and `cmd.persona.save_as_override` (beside select, duplicate, import and export). Edit is `cmd.persona.update`; disable and restore-to-shipped-default are its `set_enabled` and `restore_shipped_default` operations (§4.1 item 5), emitting `persona.updated`; schema validation runs inside create, update and import and reports `invalid_args`. There are no `cmd.persona.edit`, `cmd.persona.disable`, `cmd.persona.restore` or `cmd.persona.validate_schema` commands.
- Repairs `sfk-5ebb077583e46703c74baa39`: `crew.roles` is a map from `role_id` to `{display_name, description, required_capabilities[], default_persona_id?, allowed_persona_ids[]}`. Role tag values are `planner`, `implementer`, `reviewer`, `tester`, `designer`, `security`, `release`, and `governance`.
  - Confirmed 2026-11-24 (Decision_Log DL-2602, C-FIX79): this role record and its eight tags are canonical; §10's `{ provider, model, persona }` tuple form is retired source lineage (see the §10 rule after the `owner_hint` paragraph).
- Current selection fields remain `requested_persona`, `effective_persona`, `persona_selection_source`, `persona_policy_snapshot_id`, `fallback_reason_code?`, and `created_at_utc`. The scope-aware successor adds `everywhere_default` and `computer_default` beside `user_selected`, `project_default`, `role_default`, `policy_override`, and `fallback`. Historical Project resolution bytes/enums stay readable under their original version; app dispatch requires the successor schema binding from the Personas and Models owners. P-056/P-060 preserve immutable frozen identity.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
