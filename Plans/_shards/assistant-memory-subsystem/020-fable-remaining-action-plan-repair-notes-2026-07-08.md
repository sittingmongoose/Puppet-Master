# Shard 020: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2510-L2517

Source SHA256: `d67792a23f746247d610e52cc1760f8713edeaf6da1c63660930c7cdaac9436d`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 302` (repaired; source line 1039; `sfk-a8729f443cda5680ec95bcb1`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1417-1425/L333-343: activation scoring lists 5 components (pinned boost, recency decay, BM25+ANN blend, etc.) but only 2 numeric constants exist (0.5/0.5 blend, 0.5 Done multiplier) no combining formula across all 5.
- `registry_line 303` (repaired; source line 1040; `sfk-1dcaefad0282b10e9a9bf8fa`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L204-207: `embed_text`/`text_hash` use an unspecified `hash()` function no algorithm named (SHA-256? xxhash?).

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
