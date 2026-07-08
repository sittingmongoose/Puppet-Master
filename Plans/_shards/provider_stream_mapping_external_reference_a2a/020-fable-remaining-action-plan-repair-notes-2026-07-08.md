# Shard 020: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L2166-L2174

Source SHA256: `71c0dafe1f3fb92db49dcf2c8a44377b951c755f3988253a8116e9d2dab5086c`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 313` (repaired; source line 1074; `sfk-bbe24dbaee588f11b4a55c4d`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L370: doc explicitly admits none of the reserved diagnostic category schemas expose `attempt_id`, even though its own 2026-03-09 addenda mandate attempt_id continuity a normative MUST NOT with no schema field to enforce against, in the same document.
- `registry_line 314` (repaired; source line 1075; `sfk-e98bc6a59c457b5cf85d8d99`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L362-379: "P5 provider-stream continuity recovery requirements" section reads as raw unintegrated audit prose ("the doc internally contradicts itself") rather than resolved spec.
- `registry_line 315` (repaired; source line 1076; `sfk-f343634c482c449df4c8d04f`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L362: `approval_scope_key` composition algorithm/format never given despite being needed across permissions/HITL/doom-loop caching.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
