# Shard 017: Migration Coverage

Source: `Plans/human-in-the-loop.md`

Source lines: L596-L606

Source SHA256: `844eca99e4c87b9669b375cbe844b13f8bc91141b1ef93860675a6585256c80b`

---

## Migration Coverage

Original hash: `1d422c28121f5136cf861604a3df266fb3bb96deca8fc1dd177205c530863fb9`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `human-in-the-loop-S0001` through `human-in-the-loop-S0044` are preserved in place and mapped in `coverage_map.jsonl` to `HITL-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
