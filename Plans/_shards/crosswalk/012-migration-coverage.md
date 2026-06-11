# Shard 012: Migration Coverage

Source: `Plans/Crosswalk.md`

Source lines: L656-L666

Source SHA256: `f2f8e870f84d197685516b94bf721a02b4a839ed3d513287213a5168585c0682`

---

## Migration Coverage

Original hash: `b3ab29d3fdfc69b5ac8ad8d1f6c9d2873085fa86f03b37bb459fba8bf6e57564`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Crosswalk-S0001` through `Crosswalk-S0035` are preserved in place and mapped in `coverage_map.jsonl` to `C-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
