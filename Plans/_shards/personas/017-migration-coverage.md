# Shard 017: Migration Coverage

Source: `Plans/Personas.md`

Source lines: L3177-L3187

Source SHA256: `aad24d2d1027b60f8a00834429ecfb575a1b1002e3f6e5d269489ce2af2e2abb`

---

## Migration Coverage

Original hash: `9dfc2723f4722146795000e263279f793663e43bd65205bfa071930aba45f9a5`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Original spans from `Personas-S0001` through `Personas-S0058` are preserved in place and atomized into fine-grained PlanUnits `P-002` through `P-052`. Generated structural/audit spans `Personas-S0059` through `Personas-S0062` are explicitly dispositioned; `P-001` is retired as bridge lineage and no residual `source_preserving_planunit` product coverage remains for `Plans/Personas.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
