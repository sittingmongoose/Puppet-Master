# Shard 023: Migration Coverage

Source: `Plans/usage-feature.md`

Source lines: L1166-L1176

Source SHA256: `85a0a8e8e78485774a55d5d4185f3653412cc4c33707817e77b83171fca838b1`

---

## Migration Coverage

Original hash: `0aa9f55786575dbd9e7fbc5e155e14e603ca5a56959c5fbdae4f8801628b259d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `usage-feature-S0001` through `usage-feature-S0103` are preserved in place and mapped in `coverage_map.jsonl` to `UF-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
