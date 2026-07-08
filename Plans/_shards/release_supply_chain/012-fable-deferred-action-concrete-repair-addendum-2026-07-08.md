# Shard 012: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Release_Supply_Chain.md`

Source lines: L650-L659

Source SHA256: `2f435c22a3df5b5db45df514a0dfcd9646733e01f7dfc50b12e48fe9b1081def`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime release/supply-chain rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-1c95c03aec7949b6ad8641a7`: project schemas must use JSON Schema Draft 2020-12 unless a migration fixture explicitly records a legacy dialect. `requirements_quality_report.schema.json` now declares Draft 2020-12.
- Keeps `sfk-aebb6fb13c915a60c1a5be40` explicitly deferred: `plan_graph.change_budget`, `change_budget.schema.json`, `project_plan_node.schema.json`, live `plan_graph.json` nodes, and validator checks do not yet share one canonical expanded shape. Closure requires a dedicated schema artifact correction lane that either mirrors the current typed change-budget schema or migrates all graph nodes and validators to the expanded governance-seal shape.
- Repairs `sfk-c347a44e26b08efce550bdfd`: non-executable closure evidence required object fields are typed with nested properties in `Plans/.implementation_readiness/non_executable_closure_evidence.schema.json`.
- Keeps `sfk-d62d739e27a728d8ad210435` explicitly deferred: row-level JSON Schema cannot enforce JSONL-wide uniqueness, and historical duplicate ids remain governed by `validate-auto-decisions` grandfathering. Closure requires the auto-decision generator and validator identity model to converge on future-unique ids or a documented composite-key migration without hand-renumbering generated history.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
