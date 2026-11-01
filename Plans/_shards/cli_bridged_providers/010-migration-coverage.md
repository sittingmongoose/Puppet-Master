# Shard 010: Migration Coverage

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1389-L1399

Source SHA256: `14848fb74a4cec851913f354270a3e30a71dad6dd4ef753ade4e4d4158c3cd78`

---

## Migration Coverage

Original hash: `3b2f3908a287cb355fa85b17c3a6f5d7af31cba872c6756f89f14db4cf1ea9b7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomized `CLI_Bridged_Providers-S0001` through `CLI_Bridged_Providers-S0010` into fine-grained PlanUnits `CBP-002` through `CBP-018`. `CBP-001` is retained only as a retired migration-lineage bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
