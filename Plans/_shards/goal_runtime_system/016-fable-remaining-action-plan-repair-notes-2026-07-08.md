# Shard 016: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L3117-L3124

Source SHA256: `74994ba0e7026b664524bb346e2a2c97c44ecfc82997d5772492937923c4d71c`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 291` (repaired; source line 1013; `sfk-77c72e6b199c46f5035c68c4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1064-1076 (GRS-015): budget fields (max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents) have no default values or units anywhere.
- `registry_line 292` (repaired; source line 1014; `sfk-d42af8f8290bf76a2b1f438f`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1766 vs L1854 (GRS-026): two non-identical write-authority/write_mode enums for what appears to be the same concept (`direct_write_single_owner` vs `leased_writer` families) reconcile.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
