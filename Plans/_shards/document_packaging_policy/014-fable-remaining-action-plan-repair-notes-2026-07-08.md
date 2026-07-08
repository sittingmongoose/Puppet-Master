# Shard 014: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Document_Packaging_Policy.md`

Source lines: L1746-L1753

Source SHA256: `3c834360059f6f49f22343004eccfccf69dd569792ef84a958cca9bc74013a77`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 334` (repaired; source line 1133; `sfk-803c53af977a001393cd07fc`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L90-114: 2.0a-2.0b documents 5+ unresolved SSOT naming contradictions (`chat.thread.created` vs `chat.thread_created`, etc.) as *permanent policy* rather than pointing to a resolution owner/date an implementer cannot know which shape to emit.
- `registry_line 335` (repaired; source line 1134; `sfk-2ebbc3349354d2a57460398b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L211: "the run MUST fail" has no defined exit code, error format, or partial-write rollback spec.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
