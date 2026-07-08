# Shard 021: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Personas.md`

Source lines: L3447-L3455

Source SHA256: `72bd84fe015d24252ac5562b46aec46c47ebfd992b77315a67a8e3ccd8363e4c`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 283` (repaired; source line 988; `sfk-bb3280798bd1706bc464fd91`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L221-239: 7 GUI CRUD workflows (create/edit/disable/restore/delete/save-as-override/schema-validation) have zero `cmd.persona.*` IDs anywhere confirmed via grep, none exist in Plans/.
- `registry_line 284` (repaired; source line 989; `sfk-5ebb077583e46703c74baa39`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L2016-2065: `crew.roles` tag-map structure and full tag vocabulary never published as a schema/table.
- `registry_line 285` (explicitly_deferred; source line 990; `sfk-a0b10c29e5616a01ecab3d13`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L1963-2014: `requested_persona`/`effective_persona`/`persona_selection_source` etc. are field names only no types, enums, or persistence schema.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
