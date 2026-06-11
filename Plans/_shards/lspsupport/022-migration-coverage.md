# Shard 022: Migration Coverage

Source: `Plans/LSPSupport.md`

Source lines: L1305-L1315

Source SHA256: `df1a9dcf0546d489cf8823a1592b6896ca423ee12a1274894bb0bd899a297278`

---

## Migration Coverage

Original hash: `0a28db3773e3e47f3f5c861279553d6e3696de6980ec40acb40a19fe703f3d8d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `LSPSupport-S0001` through `LSPSupport-S0068` are preserved in place and mapped in `coverage_map.jsonl` to `L-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
