# Shard 013: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Release_Supply_Chain.md`

Source lines: L660-L669

Source SHA256: `b59fb5bef77954bcd7b2734a9c28896b992798094dda0218d26bb31559b76216`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 385` (explicitly_deferred; source line 1286; `sfk-1c95c03aec7949b6ad8641a7`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - **[CRITICAL]** `requirements_quality_report.schema.json` declares `$schema: draft-07` while all 43 other schema files declare 2020-12 a one-line fix.
- `registry_line 386` (explicitly_deferred; source line 1287; `sfk-aebb6fb13c915a60c1a5be40`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - **[HIGH]** `plan_graph.schema.json`'s `change_budget` property is a bare unconstrained `{"type":"object"}` even though a fully-typed `change_budget.schema.json` exists standalone AND `project_plan_node.schema.json` (a likely-duplicate schema for the same node concept) correctly
- `registry_line 387` (explicitly_deferred; source line 1288; `sfk-c347a44e26b08efce550bdfd`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - **[HIGH]** `non_executable_closure_evidence.schema.json`: 7 fields are `required` AND bare unconstrained objects with zero documented internal shape (`event_payload_contract_registry`, `gui_wiring_contract`, etc.).
- `registry_line 389` (explicitly_deferred; source line 1295; `sfk-d62d739e27a728d8ad210435`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - **[HIGH]** auto_decisions.jsonl: 19 distinct `decision_id` values are reused across 2-8 lines each (verified mechanically) the natural primary key is not unique, making ID-based lookup ambiguous; schema requires `minLength: 3` but never uniqueness.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
