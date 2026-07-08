# Shard 009: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/interview-subagent-integration.md`

Source lines: L1056-L1066

Source SHA256: `810009c99c4e18b767e918b5a5b777c1acf28aaeb0253a8a2dd5f85dae707df9`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 149` (explicitly_deferred; source line 622; `sfk-969d105f50df34b7f72f242c`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L5002-5298: `interview.scope_probe.max_questions` config keys referenced but not found in interview-subagent-integration.md via grep; GUI-inventory elicitation algorithm for UI wiring fragments during interview undefined.
- `registry_line 289` (repaired; source line 1004; `sfk-276a3e41fd08d5c4adaff514`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L136-155: claims `Plans/interview-subagent-integration.md` owns `max_subagents_spawn` **confirmed via grep, this string appears NOWHERE in that file** genuinely broken owner pointer, not just unverified (corroborated independently by BUNDLE-9's audit of interview-sub
- `registry_line 367` (explicitly_deferred; source line 1234; `sfk-381230f21baee92304ac31b8`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: every requirement is YAML metadata (owner/tokens/acceptance criteria referencing other units) rather than an implementable spec no request/response payload examples, no error codes, no retry values anywhere.
- `registry_line 368` (repaired; source line 1235; `sfk-973c4b99a2e3f9e5ad705e53`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] confirmed via grep: `max_subagents_spawn` never appears anywhere in this document, corroborating Crosswalk.md's broken-pointer finding independently from the other side.
- `registry_line 369` (explicitly_deferred; source line 1236; `sfk-9d06c1271836fdaa1923df72`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] confirmed via grep: `scope_probe`/`max_questions` also never appear anywhere in this file the interview question-count limit is entirely unresolved here too.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
