# Shard 008: Migration Coverage

Source: `Plans/GitHub_Integration.md`

Source lines: L1795-L1805

Source SHA256: `6d474302af57dc236c49448d6ad0984e1bafe03f19c106e56a83c4b4796463ef`

---

## Migration Coverage

Original hash: `3fd236bf9f6ce0c2780dc77e155b225db95206c07d8e83b7baa89d8fc939f8a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 077 atomized `GitHub_Integration-S0002`, `GitHub_Integration-S0004`, `GitHub_Integration-S0006`, and `GitHub_Integration-S0008` through `GitHub_Integration-S0012` into `GI-002` through `GI-030`, repeating dense source lineage where the original source span contains multiple safe atoms. `GitHub_Integration-S0001`, `GitHub_Integration-S0003`, `GitHub_Integration-S0005`, `GitHub_Integration-S0007`, `GitHub_Integration-S0013`, `GitHub_Integration-S0014`, and `GitHub_Integration-S0016` are structural or migration-history dispositions. `GitHub_Integration-S0015` maps to retired bridge lineage `GI-001`; `GI-001` no longer uses source-preserving compile mode, and `Plans/GitHub_Integration.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
