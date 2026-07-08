# Shard 012: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L591-L597

Source SHA256: `45f73acb1df7d8221f63292dacc254860ab3ad124f1cc06dcbd0da32492a5aea`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 377` (repaired; source line 1259; `sfk-58d6d13ed1139428d3f6a692`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L534: `handler_location` example cites a Rust module path but no canonical crate root is fixed, and no fallback is defined for the current pre-implementation (no source tree) state.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
