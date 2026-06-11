# Shard 015: Migration Coverage

Source: `Plans/Commands_System.md`

Source lines: L865-L875

Source SHA256: `b5de2955ec7af4adeb576436220d240d13e0d93596dc9236fc6e2d2124d58540`

---

## Migration Coverage

Original hash: `25a6e3b81358a85e8b09ffd86c6d84019ac390ad9efa76b67f48deae697dd1a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Commands_System-S0001` through `Commands_System-S0053` are preserved in place and mapped in `coverage_map.jsonl` to `CS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
