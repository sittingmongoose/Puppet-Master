# Shard 009: Migration Coverage

Source: `Plans/UI_Command_Catalog.md`

Source lines: L1425-L1435

Source SHA256: `ad58b1dca161fb370311eca7ca7375897f23379170f0dfd4884b0dd6dfe9ac0d`

---

## Migration Coverage

Original hash: `de7fa9f47cbbaac910b668db4778c3faea7d2a32334ade64545dec448b22ac79`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `UI_Command_Catalog-S0001` through `UI_Command_Catalog-S0052` are preserved in place and mapped in `coverage_map.jsonl` to `UCC-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
