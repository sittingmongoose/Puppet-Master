# Shard 016: Migration Coverage

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L961-L971

Source SHA256: `a34ba16b8d9204278f712a7d59bd7dfc26ec3b7b2f489b3fd2b5ffb53616db21`

---

## Migration Coverage

Original hash: `5bac461d5373c11d1990980310ef3502de74ad5370c8b496d9cf1413a8df6409`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `OpenCode_Deep_Extraction-S0001` through `OpenCode_Deep_Extraction-S0070` are preserved in place and mapped in `coverage_map.jsonl` to `ODE-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
