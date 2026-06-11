# Shard 043: Migration Coverage

Source: `Plans/assistant-chat-design.md`

Source lines: L3662-L3672

Source SHA256: `70b52937e6d7839db3294be5fa2332888d67afa77c02c4b95be9438582f1b35f`

---

## Migration Coverage

Original hash: `617115e11c2fedeb013bfac6ecdbc1bd8abca75f85d590c67a2930152ff0664e`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `assistant-chat-design-S0001` through `assistant-chat-design-S0180` are preserved in place and mapped in `coverage_map.jsonl` to `ACD-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
