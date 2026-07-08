# Shard 015: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Crosswalk.md`

Source lines: L3268-L3275

Source SHA256: `26055c82552be4d6c4fd366f4149878c7db0c215e6e0ae58abc863e03ce4caeb`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 289` (repaired; source line 1004; `sfk-276a3e41fd08d5c4adaff514`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L136-155: claims `Plans/interview-subagent-integration.md` owns `max_subagents_spawn` **confirmed via grep, this string appears NOWHERE in that file** genuinely broken owner pointer, not just unverified (corroborated independently by BUNDLE-9's audit of interview-sub
- `registry_line 368` (repaired; source line 1235; `sfk-973c4b99a2e3f9e5ad705e53`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] confirmed via grep: `max_subagents_spawn` never appears anywhere in this document, corroborating Crosswalk.md's broken-pointer finding independently from the other side.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
