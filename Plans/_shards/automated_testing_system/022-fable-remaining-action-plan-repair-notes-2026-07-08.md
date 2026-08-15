# Shard 022: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Automated_Testing_System.md`

Source lines: L2248-L2256

Source SHA256: `975472ff73c949fea277805b1317b1f67f56972bbfe401c73c3f38267edac4b3`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 331` (explicitly_deferred; source line 1126; `sfk-fa0b68afddc10ec875a0b183`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: every ATS PlanUnit is prose pointing at generic validators no concrete IPC schema, adapter interface, or `TestRunReceipt` file format anywhere.
- `registry_line 332` (explicitly_deferred; source line 1127; `sfk-bd4e3c4facbc54e0a68a60c8`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: zero GUI wiring despite steer explicitly asking for GUI result surfacing no command IDs, panel layout, or button states for watching/viewing test results.
- `registry_line 333` (explicitly_deferred; source line 1128; `sfk-a86063e06fec52acf396acb6`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] 6 (L279-281): entire document is gated behind an undefined future "runtime_disabled enabled" event with no trigger criteria.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
