# Shard 013: Migration Coverage

Source: `Plans/Prompt_Pipeline.md`

Source lines: L826-L836

Source SHA256: `ea99ebd724d97ba9cbd4937381ba12c6223b4dd129744b77fcddc053ced876fc`

---

## Migration Coverage

Original hash: `7344aebefa758505ec0fd7b76c5a98b69768cc9253b2e8bd873cd30cdd0e8be7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Prompt_Pipeline-S0001` through `Prompt_Pipeline-S0042` are preserved in place and mapped in `coverage_map.jsonl` to `PP-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
