# Shard 012: Migration Coverage

Source: `Plans/Formatters_System.md`

Source lines: L1090-L1100

Source SHA256: `1f94b8a1d7a00702bb320c1f2c49f4933b6b5d113354c335476dece8d8fd4aa0`

---

## Migration Coverage

Original hash: `841153deb0b40a91ed918a8627949361b605326365dffbe4a2a5b2eb5e09c592`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 075 atomized `Formatters_System-S0001` through `Formatters_System-S0024` into `FS-002` through `FS-015`, with mixed GUI/runtime spans split where safe. `Formatters_System-S0025`, `Formatters_System-S0026`, and `Formatters_System-S0028` are structural owner-map, PlanUnits-heading, and Migration Coverage dispositions. `Formatters_System-S0027` maps to retired bridge lineage `FS-001`; `FS-001` no longer uses source-preserving compile mode, and `Plans/Formatters_System.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
