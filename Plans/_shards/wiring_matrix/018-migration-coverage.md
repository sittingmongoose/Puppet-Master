# Shard 018: Migration Coverage

Source: `Plans/Wiring_Matrix.md`

Source lines: L726-L736

Source SHA256: `e1c5df49364c535832aae1f2e12e624e9dfdac1ca7a5118e1845daa4621fc750`

---

## Migration Coverage

Original hash: `b1b5c11a92299e43899c9697d2a6a58b37cdb1b3ba7360c956f7cddfee7cf4b6`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Wiring_Matrix-S0001` through `Wiring_Matrix-S0043` are preserved in place and mapped in `coverage_map.jsonl` to `WM-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
