# Shard 022: Migration Coverage

Source: `Plans/Run_Modes.md`

Source lines: L1012-L1022

Source SHA256: `a55e0f6be429d71cc0380293d4d2ddfeac8abf084f4f1667346376ce9380f178`

---

## Migration Coverage

Original hash: `a430763e3be8df6d28f0bd8e8563eb2428ce42663485d0412aaacf8a41d3706f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 163 atomized `Run_Modes-S0001` through `Run_Modes-S0029` into fine-grained PlanUnits `RM-002` through `RM-024`. Phase 2B batch 164 atomized `Run_Modes-S0030` through `Run_Modes-S0059` into fine-grained PlanUnits `RM-025` through `RM-047`. Phase 2B batch 165 structurally dispositioned generated tail spans `Run_Modes-S0060`, `Run_Modes-S0061`, and `Run_Modes-S0063`, and retired `Run_Modes-S0062` as the `RM-001` bridge lineage. `RM-001` is migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
