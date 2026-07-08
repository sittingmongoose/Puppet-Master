# Shard 013: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Formatters_System.md`

Source lines: L1103-L1109

Source SHA256: `395c808e5b926e0362d2a2df2302e40f212e8548ce64793bbb2b0897663afd57`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 364` (repaired; source line 1221; `sfk-52b912e858e3f723a8838777`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L57: "invoked sequentially in registration order" "registration order" itself is never defined (config order? alphabetical? built-in-then-custom?).

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
