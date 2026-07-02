# Shard 008: Migration Coverage

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L776-L786

Source SHA256: `32b5e5b19be60784a5bf8d23de9b82d5af02249906cd2b65834b12450d631751`

---

## Migration Coverage

Original hash: `ae9a04b542086ed39c8b78e71f708c91a73242ebf4bfe39fd4680336c75f870d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 076 atomized `GitHub_API_Auth_and_Flows-S0001` and `GitHub_API_Auth_and_Flows-S0003` through `GitHub_API_Auth_and_Flows-S0011` into `GAAAF-002` through `GAAAF-012`, with mixed GUI/runtime/identity/recovery spans split where safe. `GitHub_API_Auth_and_Flows-S0002`, `GitHub_API_Auth_and_Flows-S0006`, `GitHub_API_Auth_and_Flows-S0007`, `GitHub_API_Auth_and_Flows-S0012`, `GitHub_API_Auth_and_Flows-S0013`, and `GitHub_API_Auth_and_Flows-S0015` are structural or migration-history dispositions. `GitHub_API_Auth_and_Flows-S0014` maps to retired bridge lineage `GAAAF-001`; `GAAAF-001` no longer uses source-preserving compile mode, and `Plans/GitHub_API_Auth_and_Flows.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
