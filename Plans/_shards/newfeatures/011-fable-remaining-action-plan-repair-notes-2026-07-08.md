# Shard 011: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/newfeatures.md`

Source lines: L1215-L1222

Source SHA256: `9e3c271c76bc89d6c5cf3abf0fac10931330ba61a42a63c821e966ec649efffa`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 350` (explicitly_deferred; source line 1178; `sfk-a842ba71d3915b955e7ddd63`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: pure PlanUnit YAML with no data models/algorithms/GUI wiring mislabeled "Implementation Plan" in its own H1 despite every unit having `create_worknodes: false`.
- `registry_line 351` (explicitly_deferred; source line 1179; `sfk-382a8aaadd071809899261b5`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] N-006: names required feature families (corroboration/promotion/graph-patch, trust state) with zero schema or state machine.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
