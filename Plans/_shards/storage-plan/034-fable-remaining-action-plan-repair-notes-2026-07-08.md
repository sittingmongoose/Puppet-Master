# Shard 034: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/storage-plan.md`

Source lines: L16592-L16600

Source SHA256: `89caadf9b7ade780790d06048c5ca8e4d86fb6e93b55d865b8a99716e372f5b9`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 75` (repaired; source line 439; `sfk-047b362fce3b487a9bce5d6b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L2340-2341: startup restore reads `hotreload_state:v1:{project_id}` and `onboarding:v1` neither key is defined in 15.1 or storage-plan.md FIX: add both keys to the catalog with schema.
- `registry_line 119` (repaired; source line 550; `sfk-a1de91e6d5aa62a6816874f1`): kv.json/prompt-history.jsonl decision repaired: product path is migration to canonical seglog/redb families; atomic file write/locking is transitional debug/export mirror protection only. Source summary: - [HIGH] L2003: `kv.json`/`prompt-history.jsonl` "must either be migrated or protected by atomic write" unresolved either/or, no target key FIX: pick one path now.
- `registry_line 121` (repaired; source line 552; `sfk-a01710fdfad63d1badf4fbaf`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4183 vs L4656/7539 (SP-032): unversioned key baseline (`run:<run_id>` etc.) contradicts every other family's versioned `{type}.v1:{scope}:{id}` pattern, with no supersession note FIX: mark SP-032 keys retired/alias-only.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
