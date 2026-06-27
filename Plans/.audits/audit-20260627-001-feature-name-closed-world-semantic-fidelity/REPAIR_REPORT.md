# Repair Report - audit-20260627-001-feature-name-closed-world-semantic-fidelity

Status: repair_validated

- Ledger: `pldg-20260626-001-feature-name`
- Original repair-required findings: 5
- Post-repair repair-required findings: 0
- Original scope coverage: 6176/6176 rows
- Repair impact rows: 5
- Repair closure rows: 5 (`repaired`)

## Repairs

1. Cleared stale sealed-ledger governance projection entries in `state/open_items.json`.
2. Advanced `ledger_registry.json` root freshness.
3. Reoriented dependency metadata for the introduced History, vision_bridge, and Teach cycles; dependency graph returned to the three pre-existing baseline cycles.
4. Removed `OP-026` from `PRDB-010` and `PWIZ-016` `depends_on` while preserving `unblocks: OP-026`.
5. Refreshed closure registry hashes and added five current repair closure rows.

## Validators

All required governance, index, migration, shard, closure, and diff validators pass. No WorkNodes, NodeSeeds, executable queues, implementation files, or legacy Iced app files were created.
