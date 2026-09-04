# Shard 015: Migration Coverage

Source: `Plans/Commands_System.md`

Source lines: L3505-L3515

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## Migration Coverage

Original hash: `25a6e3b81358a85e8b09ffd86c6d84019ac390ad9efa76b67f48deae697dd1a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomized `Commands_System-S0001` through `Commands_System-S0053` into fine-grained PlanUnits `CS-002` through `CS-049`. `CS-001` is retained only as a retired migration-lineage bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
