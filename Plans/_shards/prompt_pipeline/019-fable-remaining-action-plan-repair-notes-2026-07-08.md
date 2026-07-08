# Shard 019: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Prompt_Pipeline.md`

Source lines: L5019-L5027

Source SHA256: `c9e42dad47823889bfcbf99bf1c29c9c42da839afb6f77a0dc8857b9c4ec7d50`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 253` (repaired; source line 901; `sfk-ccad8553537b0e17aeb5671b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L79-96: 9 named pipeline stages have no per-stage algorithm/I-O contract.
- `registry_line 254` (repaired; source line 902; `sfk-b396b1cb5317435b5bf00626`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L242: `max_compaction_immune_pct` default 30% but "effective context window" is never defined (tokens? which model's window for subagents?).
- `registry_line 256` (repaired; source line 904; `sfk-c87a7d3ae3ed9070e1b8ca5a`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4099-4178 (PP-060): HistoryAdmissionGate needs quarantine storage location and validation rule set undefined.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
