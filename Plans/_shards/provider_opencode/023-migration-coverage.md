# Shard 023: Migration Coverage

Source: `Plans/Provider_OpenCode.md`

Source lines: L3417-L3427

Source SHA256: `0d10caa7a05a9bdbf4423fb401b048c27f60f27b803fdc57523d3fc157cdd467`

---

## Migration Coverage

Original hash: `e0d27c1494bf01c5a72ca17abb7f28b8f6a1045f19aa2ef941b87d7c9ab6d2e9`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Original spans from `Provider_OpenCode-S0001` through `Provider_OpenCode-S0054` are preserved in place and atomized into fine-grained PlanUnits `PO-002` through `PO-046` or explicit structural/reference dispositions. Generated tail spans `Provider_OpenCode-S0055` through `Provider_OpenCode-S0058` are structurally dispositioned, and `PO-001` is retired to migration-lineage-only compatibility disposition with `node_compile_hint.mode=retired_source_preserving_bridge`. No residual source-preserving product bridge remains for `Plans/Provider_OpenCode.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
