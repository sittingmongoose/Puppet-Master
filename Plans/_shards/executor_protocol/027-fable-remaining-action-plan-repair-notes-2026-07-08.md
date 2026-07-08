# Shard 027: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Executor_Protocol.md`

Source lines: L7081-L7089

Source SHA256: `3ec1bdf87e2f0987f906375739d62055c38b721088d672f1d2d6209251ce0036`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 215` (repaired; source line 787; `sfk-1e2487142a1e52002f8eb946`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L146-239: `execution_unit_context` field table is thorough but has no JSON example instance and no conditional-requirement matrix (which optional fields become mandatory per execution_unit_type).
- `registry_line 219` (repaired; source line 791; `sfk-d91a2513114704894b54b826`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4954-5003 (EP-083): attempt-counter invariant formula given, but no spec for what happens if sub-counters disagree with attempt_count at runtime.
- `registry_line 220` (repaired; source line 792; `sfk-13a077c1b96ec11515ca81d4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L5056-5106 (EP-085): event dedup key includes a raw timestamp fragile, since two truly-distinct events could share event_name/node_id/attempt_id/ts at sub-second resolution; no sequence-number fallback given.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
