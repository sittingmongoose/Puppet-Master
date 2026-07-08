# Shard 010: Migration Coverage

Source: `Plans/Run_Graph_View.md`

Source lines: L819-L832

Source SHA256: `bba41eafbbded5865b46f24362f9ee697d7f44d60d4073993c9c14ac9862b703`

---

## Migration Coverage

Original hash: `ae46a77348397a81370e97493b38f8997311c540607466ad3571d87c62785bef`.

Run-scoped proof artifacts:
- Phase 1 source-preserving bridge: `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- Phase 1 source-preserving bridge: `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- Phase 1 source-preserving bridge: `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 1 original spans from `Run_Graph_View-S0001` through `Run_Graph_View-S0011` remain preserved by `pds-20260611-001-standardize-plans`. Phase 2A pre-edit spans from `Run_Graph_View-S0001` through `Run_Graph_View-S0015`, including the former coarse source-preserving bridge PlanUnit, are preserved by `pds-20260611-002-atomize-planunits` and mapped in that run's coverage map to fine-grained PlanUnits, preserved source sections, or explicit replacement disposition. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
