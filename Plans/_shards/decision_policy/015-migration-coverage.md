# Shard 015: Migration Coverage

Source: `Plans/Decision_Policy.md`

Source lines: L3295-L3305

Source SHA256: `b207b63da950e011e04156e61c1426ee4b7921a8774ab2f7e45766efe6673dd6`

---

## Migration Coverage

Original hash: `34fdf55ca635fc59620b14a92475ca59f3c1e2ccb1ba0af1ce503798b8612230`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Decision_Policy-S0001` through `Decision_Policy-S0036` remain preserved in place. Phase 2B batches 044 through 046 atomized or structurally dispositioned `Decision_Policy-S0001` through `Decision_Policy-S0036` into `DP-002` through `DP-062`, retired `DP-001`, and explicit structural coverage_map dispositions. `DP-001` is retained only as migration-lineage compatibility coverage and must not re-own atomized source coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
