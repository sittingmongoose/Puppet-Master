# Shard 035: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Architecture_Invariants.md`

Source lines: L4439-L4447

Source SHA256: `13ae96c59ca1c16416a77b1d9bac8c759d67536df3d0c4f1e332ad5763e83785`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 265` (repaired; source line 928; `sfk-60e840c059b6db237485d48c`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L29-68: INV-001's rule is preceded by ~40 lines of raw unedited reconciliation fragments inside the canonical rule body extract to changelog or delete.
- `registry_line 266` (repaired; source line 929; `sfk-ddd4dece078c664fd31f6de5`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L44,54,57: invariants describe their OWN unresolved gaps (`correlation_id` lacks trace-through, `usage_event_ref` still special-cased) as if canonical not enforceable as stated.
- `registry_line 267` (repaired; source line 930; `sfk-937c36d705a22bf16645cca2`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L271,275,283 / GATE-003/001/010: cited repeatedly as enforcement authorities with no gate registry/definition doc found anywhere in Plans/*.md via grep.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
