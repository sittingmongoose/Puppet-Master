# Shard 027: Migration Coverage

Source: `Plans/newtools.md`

Source lines: L8595-L8605

Source SHA256: `240930f0cbe095b99bf4cd899255df3eb3fe605feac9907856de55eb020ffdab`

---

## Migration Coverage

Original hash: `e71a3c15b076255cc614c4ef56c333212e88f0cb72c6d02b58af24ebe454f904`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batches 104 through 107 atomized source spans `newtools-S0002` through `newtools-S0078` into fine-grained PlanUnits `N2-002` through `N2-150`, except for structural, reference-only, and migration-lineage dispositions. `newtools-S0001`, `newtools-S0007`, `newtools-S0013`, `newtools-S0017`, `newtools-S0030`, `newtools-S0035`, `newtools-S0057`, `newtools-S0072`, `newtools-S0073`, and `newtools-S0076` are structurally or reference-only dispositioned; `newtools-S0034` is fully covered by `N2-048` and `N2-049`; `newtools-S0052` is split across `N2-096`, `N2-097`, and `N2-098`. `N2-001` is retired to migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
