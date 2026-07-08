# Shard 016: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Planning_Wizard.md`

Source lines: L1533-L1542

Source SHA256: `dfa879c8e0ab5201456393f714ab389cb61e969a03f838340fe99a0be6f5c2fa`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 338` (explicitly_deferred; source line 1145; `sfk-78f02d9a707edd394637f596`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: every PWIZ unit is prose-only YAML no data schema for PlanningRun, topic map, Planning Context Capsule, or ledger record shape anywhere.
- `registry_line 339` (explicitly_deferred; source line 1146; `sfk-9fb886bd6cf16ee54c7e1f0e`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] L1075-1139 (PWIZ-013): topic card states (11 named) have no transition table, trigger events, or command/IPC names.
- `registry_line 340` (repaired; source line 1147; `sfk-4dcdcb5c0b63f442e90451bb`): Owner-doc note repairs duplicate or ambiguous section authority by requiring title/PlanUnit anchors and retiring numeric-only references. Source summary: - [HIGH] L803-869 vs L710-800 (PWIZ-014 vs PWIZ-010): both fully restate the same CAS/idempotency mechanism near-verbatim should cross-reference, not duplicate.
- `registry_line 343` (explicitly_deferred; source line 1158; `sfk-dfcc395f84654bcabdfbe6aa`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] whole doc vs Planning_Wizard.md's later ledger addenda: describes an AGENTS.md/Codex-thread workflow that appears superseded by more detailed, differently-worded later addenda not marked stale/retired.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
