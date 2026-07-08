# Shard 020: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L1826-L1834

Source SHA256: `ad4e0b77b672faf847917425be40a12d452f41d9d489bba0879c7e512ac828a5`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 328` (repaired; source line 1119; `sfk-77ed7ed2d7561c5d564f6ff5`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L282-296: cache file format/path/serialization and `workspace_fingerprint` algorithm undefined; unclear which of the locked redb/seglog stack backs it.
- `registry_line 329` (repaired; source line 1120; `sfk-93d0ab9899ac150135e4d0cc`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L247-249: 5s subprocess timeout has no cleanup spec (SIGTERM vs SIGKILL, zombie handling, Windows process-tree kill).
- `registry_line 330` (repaired; source line 1121; `sfk-bf615aff54c4421dbc3e50b1`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L188-198: Cursor versions-dir "lexicographically greatest" selection has no filter/tie-break for non-version junk directories.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
