# Shard 013: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Release_Supply_Chain.md`

Source lines: L798-L807

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime release/supply-chain rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-1c95c03aec7949b6ad8641a7`: project schemas must use JSON Schema Draft 2020-12 unless a migration fixture explicitly records a legacy dialect. `requirements_quality_report.schema.json` now declares Draft 2020-12.
- Repairs `sfk-aebb6fb13c915a60c1a5be40`: `Plans/plan_graph.schema.json` now gives `nodes[].change_budget` the same closed `pm.change_budget.schema.v1` shape used by `Plans/change_budget.schema.json` and `Plans/project_plan_node.schema.json`; live `Plans/plan_graph.json` nodes already carry that schema id and required fields. This is schema/governance repair only and creates no WorkNodes, NodeSeeds, queues, runtime launches, implementation files, production build tasks, or PNC-019 evidence.
- Repairs `sfk-c347a44e26b08efce550bdfd`: non-executable closure evidence required object fields are typed with nested properties in `Plans/.implementation_readiness/non_executable_closure_evidence.schema.json`.
- Repairs `sfk-d62d739e27a728d8ad210435`: future auto-decision rows now have file-wide unique `decision_id` semantics documented in `auto_decisions.schema.json`, `validate-auto-decisions` grandfathering is restricted to exact historical `(decision_id, inputs_hash)` identities, and `scripts/pm-governance-seal.py` refuses ambiguous duplicate-id upserts instead of mutating grandfathered history. This is governance identity repair only and creates no WorkNodes, NodeSeeds, queues, runtime launches, implementation files, production build tasks, or PNC-019 evidence.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
