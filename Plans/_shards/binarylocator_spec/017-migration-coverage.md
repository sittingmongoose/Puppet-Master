# Shard 017: Migration Coverage

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L1698-L1713

Source SHA256: `e9456832f2a15e65e0158775c6650904e162afa6161f7b115793467ad3ccb3b7`

---

## Migration Coverage

Original hash: `78de2230f1d912c528c281e40b91f18e08ca975c81f7064e8a9055d13d7e04d7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomization artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl`

Phase 2B batch 013 atomizes `BinaryLocator_Spec-S0001` through `BinaryLocator_Spec-S0039` into `BS-002` through `BS-020`. `BS-001` remains a temporary source-preserving bridge until the remaining BinaryLocator spans are covered and the bridge is retired in a later controlled batch. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
