# Shard 027: Migration Coverage

Source: `Plans/MiscPlan.md`

Source lines: L1583-L1593

Source SHA256: `37d2cb724014b4aa42d8ad8efe2c6269e508f7ca0e5fbf45209a1f97fb8373c4`

---

## Migration Coverage

Original hash: `bc01e6f91402242abb8e486a0f70fe8b7c3b3ecc94a1e1a85ebd94ba62eb534d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `MiscPlan-S0001` through `MiscPlan-S0101` are preserved in place and mapped in `coverage_map.jsonl` to `M-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
