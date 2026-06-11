# Shard 022: Migration Coverage

Source: `Plans/Run_Modes.md`

Source lines: L905-L915

Source SHA256: `278c36fc1015a5ee27bf870d55c3f1147530f3880a98ebc4071ecc5e19ef74b0`

---

## Migration Coverage

Original hash: `a430763e3be8df6d28f0bd8e8563eb2428ce42663485d0412aaacf8a41d3706f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Run_Modes-S0001` through `Run_Modes-S0059` are preserved in place and mapped in `coverage_map.jsonl` to `RM-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
