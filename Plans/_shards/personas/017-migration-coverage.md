# Shard 017: Migration Coverage

Source: `Plans/Personas.md`

Source lines: L3223-L3233

Source SHA256: `4c0948c8cbef5ed72b599efd8564e36102fd3c8f0db14c5fce0def6bd777cc71`

---

## Migration Coverage

Original hash: `9dfc2723f4722146795000e263279f793663e43bd65205bfa071930aba45f9a5`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Original spans from `Personas-S0001` through `Personas-S0058` are preserved in place and atomized into fine-grained PlanUnits `P-002` through `P-052`. Generated structural/audit spans `Personas-S0059` through `Personas-S0062` are explicitly dispositioned; `P-001` is retired as bridge lineage and no residual `source_preserving_planunit` product coverage remains for `Plans/Personas.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
