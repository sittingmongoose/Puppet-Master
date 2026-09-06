# Shard 018: Migration Coverage

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2344-L2358

Source SHA256: `7b10a22be6347ac99d87c7a8ecb5e0b901523944c34c376b34bb91320deda431`

---

## Migration Coverage

Original hash: `61465efe03b13f2ab959ffcf85b46ea4766377211f1f45ea6e501f6ef3ecaeda`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `assistant-memory-subsystem-S0001` through `assistant-memory-subsystem-S0040` are preserved in place and mapped in `coverage_map.jsonl` to `AMS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

Phase 2B atomization run `pds-20260611-002-atomize-planunits` mapped the first bounded window, `assistant-memory-subsystem-S0001` through `assistant-memory-subsystem-S0029` (source lines 1-396), to fine-grained PlanUnits `AMS-002` through `AMS-024`.

The second bounded window, `assistant-memory-subsystem-S0030` through `assistant-memory-subsystem-S0044` (source lines 397-704), is mapped to fine-grained PlanUnits `AMS-025` through `AMS-041`; `assistant-memory-subsystem-S0044` is a structural Migration Coverage section covered as section-only. `AMS-001` is retired in place as a migration-lineage bridge in Phase 2B batch 012 and no longer counts as source-preserving implementation coverage. Assistant Memory's next safe cursor leaves this document and moves to `BinaryLocator_Spec-S0001` at source line 1.
