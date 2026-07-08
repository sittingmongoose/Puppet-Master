# Shard 016: Migration Coverage

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L4599-L4609

Source SHA256: `ce5ef845ef33f5e94499a41f3a92007360b822339b65f92544c51a5039e04014`

---

## Migration Coverage

Original hash: `a34ba16b8d9204278f712a7d59bd7dfc26ec3b7b2f489b3fd2b5ffb53616db21`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Original spans `OpenCode_Deep_Extraction-S0001` through `OpenCode_Deep_Extraction-S0070` are atomized or structurally dispositioned in the active coverage map. `ODE-001` is retired to migration-lineage-only compatibility disposition and no longer carries source-preserving product coverage. The Owner / Consumer Map, PlanUnits, and Migration Coverage metadata spans are structurally dispositioned. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
