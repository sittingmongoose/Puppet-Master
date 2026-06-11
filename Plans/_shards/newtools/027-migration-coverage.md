# Shard 027: Migration Coverage

Source: `Plans/newtools.md`

Source lines: L1512-L1522

Source SHA256: `6ad7f74869a13a075ad4cd56057aed261f7509b73c671bcf54251e32e787eed9`

---

## Migration Coverage

Original hash: `e71a3c15b076255cc614c4ef56c333212e88f0cb72c6d02b58af24ebe454f904`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `newtools-S0001` through `newtools-S0078` are preserved in place and mapped in `coverage_map.jsonl` to `N2-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
