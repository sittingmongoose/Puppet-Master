# Shard 045: Migration Coverage

Source: `Plans/assistant-chat-design.md`

Source lines: L21861-L21891

Source SHA256: `c5f64a9608b35cad74fcbc27576b671f798b00c5e7599115dd6e9f50ead14283`

---

## Migration Coverage

Original hash: `617115e11c2fedeb013bfac6ecdbc1bd8abca75f85d590c67a2930152ff0664e`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `assistant-chat-design-S0001` through `assistant-chat-design-S0180` are preserved in place and mapped in `coverage_map.jsonl` to `ACD-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

Phase 2B atomization run `pds-20260611-002-atomize-planunits` mapped the first bounded window, `assistant-chat-design-S0001` through `assistant-chat-design-S0025` (source lines 1-398), to fine-grained PlanUnits `ACD-002` through `ACD-017`.

The second bounded window, `assistant-chat-design-S0026` through `assistant-chat-design-S0040` (source lines 399-789), is mapped to fine-grained PlanUnits `ACD-018` through `ACD-045`.

The third bounded window, `assistant-chat-design-S0041` through `assistant-chat-design-S0059` (source lines 790-1160), is mapped to fine-grained PlanUnits `ACD-046` through `ACD-090`.

The fourth bounded window, `assistant-chat-design-S0060` through `assistant-chat-design-S0065` (source lines 1161-1545), is mapped to fine-grained PlanUnits `ACD-091` through `ACD-130`.

The fifth bounded window, `assistant-chat-design-S0066` through `assistant-chat-design-S0090` (source lines 1546-1934), is mapped to fine-grained PlanUnits `ACD-131` through `ACD-189`.

The sixth bounded window, `assistant-chat-design-S0091` through `assistant-chat-design-S0121` (source lines 1935-2326), is mapped to fine-grained PlanUnits `ACD-190` through `ACD-263`.

The seventh bounded window, `assistant-chat-design-S0122` through `assistant-chat-design-S0147` (source lines 2327-2678), is mapped to fine-grained PlanUnits `ACD-264` through `ACD-321`.

The eighth bounded window, `assistant-chat-design-S0148` through `assistant-chat-design-S0163` (source lines 2679-3061), is mapped to fine-grained PlanUnits `ACD-322` through `ACD-370`.

The ninth bounded window, `assistant-chat-design-S0164` through `assistant-chat-design-S0182` (source lines 3062-3325), is mapped to fine-grained PlanUnits `ACD-371` through `ACD-412`; `assistant-chat-design-S0182` is a structural PlanUnits heading covered as section-only.

`ACD-001` is retired in place as a migration-lineage bridge in Phase 2B batch 010 and no longer counts as source-preserving implementation coverage. Assistant Chat's next safe cursor leaves this document and moves to `assistant-memory-subsystem-S0001` at source line 1.
