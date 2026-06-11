# Shard 007: Migration Coverage

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L234-L244

Source SHA256: `e14f83cf3e0a04701bacf7c329142f6b7c915c8447274f81e326a5789ca88d36`

---

## Migration Coverage

Original hash: `3b2f3908a287cb355fa85b17c3a6f5d7af31cba872c6756f89f14db4cf1ea9b7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `CLI_Bridged_Providers-S0001` through `CLI_Bridged_Providers-S0010` are preserved in place and mapped in `coverage_map.jsonl` to `CBP-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
