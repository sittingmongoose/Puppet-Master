# Shard 011: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/newfeatures.md`

Source lines: L1220-L1225

Source SHA256: `09c9b55682dcc0d23f24a3512c14e70168dd50cbcdafcbdfc88e9518d3d2f9c2`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 350` (explicitly_deferred; source line 1178; `sfk-a842ba71d3915b955e7ddd63`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: pure PlanUnit YAML with no data models/algorithms/GUI wiring mislabeled "Implementation Plan" in its own H1 despite every unit having `create_worknodes: false`.
- `registry_line 351` (repaired; source line 1179; `sfk-382a8aaadd071809899261b5`): Repaired: N-006 now links corroboration, promotion, graph-patch, and trust-state summary coverage to the `CV-315` governance runtime record schemas/state machines and `SP-233` storage binding. No buildability or runtime proof is claimed here. Source summary: - [HIGH] N-006: names required feature families (corroboration/promotion/graph-patch, trust state) with zero schema or state machine.
