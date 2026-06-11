# Shard 010: Migration Coverage

Source: `Plans/newfeatures.md`

Source lines: L189-L199

Source SHA256: `a49cd1097dcfc0917124f500b33f95da09edc3804cb0b799c6524f512ac8fe63`

---

## Migration Coverage

Original hash: `360bfc1732e8b68dc5199eac373fe54df23eff7e6f1788d69b5f2ae21426a64c`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `newfeatures-S0001` through `newfeatures-S0014` are preserved in place and mapped in `coverage_map.jsonl` to `N-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
