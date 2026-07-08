# Shard 010: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/interview-subagent-integration.md`

Source lines: L1064-L1072

Source SHA256: `4710bbe6b870afdf54d816fa9d13f83fe92722e1a2840ea8412de9d44f85966e`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime interview rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-969d105f50df34b7f72f242c` and `sfk-9d06c1271836fdaa1923df72`: canonical config key `interview.scope_probe.max_questions` limits scope-probe clarification questions. Default is `4`, minimum `0`, maximum `8`. GUI-inventory elicitation asks for surface name, owner doc, visible control, command id if known, and missing evidence reason.
- Repairs `sfk-973c4b99a2e3f9e5ad705e53`: canonical config key `interview.max_subagents_spawn` limits interview-time helper agents. Default is `3`, maximum `6`, and value `0` disables subagent spawning for interview probing.
- Repairs `sfk-381230f21baee92304ac31b8`: `InterviewRequest` fields are `request_id`, `topic_id`, `question_text`, `context_refs[]`, `max_questions`, `max_subagents_spawn`, and `created_at_utc`. `InterviewResponse` fields are `response_id`, `request_id`, `answer_text`, `accepted`, `followup_required`, `error_code?`, and `created_at_utc`. Error codes are `out_of_scope`, `needs_user_decision`, `budget_exhausted`, `redacted`, and `unavailable`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
