# Shard 011: Migration Coverage

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L570-L591

Source SHA256: `1b85ffc05fc50570536d9c60b4a47e0ba1ec018de6b448c626df22858f70ed27`

---

## Migration Coverage

Original pilot hash: `aae0e662365537fbf58be77eb52a9848401db204e7521288c2e2d75375f268f1`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

| Original spans | Standardized disposition |
| --- | --- |
| `UI_Wiring_Rules-S0001` - `UI_Wiring_Rules-S0002` | Scope and authority preserved; covered by `UIW-001`. |
| `UI_Wiring_Rules-S0003` | GUI concept lineage, route-aware metadata, stale/retired vocabulary, and owner boundaries preserved; covered by `UIW-005`. |
| `UI_Wiring_Rules-S0004` | Rule 1 hard constraints preserved; covered by `UIW-002`. |
| `UI_Wiring_Rules-S0005` | Rule 2 hard constraints preserved; covered by `UIW-003`. |
| `UI_Wiring_Rules-S0006` - `UI_Wiring_Rules-S0009` | Dispatcher boundary, data flow, diagram, and invariants preserved; covered by `UIW-004`. |
| `UI_Wiring_Rules-S0010` - `UI_Wiring_Rules-S0013` | Wiring Matrix concept, row schema, artifacts, and Instant Grep consumer addendum preserved; covered by `UIW-006`. |
| `UI_Wiring_Rules-S0014` - `UI_Wiring_Rules-S0016` | Autonomous verification strategy and execution requirements preserved; covered by `UIW-007`. |
| `UI_Wiring_Rules-S0017` | Reference table preserved; covered by `UIW-008`. |

No WorkNodes, NodeSeeds, executable build tasks, Spec Lock refresh, shard regeneration, evidence refresh, or plan_graph update was performed during this pilot conversion.
