# Shard 010: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/interview-subagent-integration.md`

Source lines: L1065-L1078

Source SHA256: `b20fdd4e4778c38aff651a829d22a06e4324aa2737186327fabbc383e2766c57`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime interview rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-969d105f50df34b7f72f242c` and `sfk-9d06c1271836fdaa1923df72`: canonical config key `interview.scope_probe.max_questions` limits scope-probe clarification questions. Default is `4`, minimum `0`, maximum `8`. GUI-inventory elicitation asks for surface name, owner doc, visible control, command id if known, and missing evidence reason.
- Repairs `sfk-973c4b99a2e3f9e5ad705e53`: canonical config key `interview.max_subagents_spawn` limits interview-time helper agents. Default is `3`, maximum `6`, and value `0` disables subagent spawning for interview probing.
- Repairs `sfk-381230f21baee92304ac31b8`: `InterviewRequest` fields are `request_id`, `topic_id`, `question_text`, `context_refs[]`, `max_questions`, `max_subagents_spawn`, and `created_at_utc`. `InterviewResponse` fields are `response_id`, `request_id`, `answer_text`, `accepted`, `followup_required`, `error_code?`, and `created_at_utc`. Error codes are `out_of_scope`, `needs_user_decision`, `budget_exhausted`, `redacted`, and `unavailable`.
  - Typed contract (2026-11-25). `InterviewRequest`: `request_id` string (UUID, unique per request), `topic_id` string (non-empty), `question_text` string (1 to 4000 characters), `context_refs[]` array of artifact reference strings (0 to 32 entries), `max_questions` integer 0 to 8 (defaults to `interview.scope_probe.max_questions`, 4), `max_subagents_spawn` integer 0 to 6 (defaults to `interview.max_subagents_spawn`, 3), `created_at_utc` string (RFC 3339 UTC). `InterviewResponse`: `response_id` string (UUID), `request_id` string (equals the request's), `answer_text` string (empty when `accepted` is false), `accepted` boolean, `followup_required` boolean, `error_code?` closed enum `out_of_scope | needs_user_decision | budget_exhausted | redacted | unavailable` (present only when `accepted` is false), `created_at_utc` string (RFC 3339 UTC). A request that breaks a type or bound is refused before dispatch and produces no response record.
  - Request example: `{"request_id":"7f0c2a1e-4b6d-4c1a-9e3f-2d5b8a6c1f00","topic_id":"auth-scope","question_text":"Should sign-in support SSO in the first release?","context_refs":["plan_graph/nodes/auth.json"],"max_questions":4,"max_subagents_spawn":3,"created_at_utc":"2026-11-25T02:00:00Z"}`
  - Accepted response example: `{"response_id":"0b9d3e44-1c2f-4a7e-8d61-5f3a2c9e7b10","request_id":"7f0c2a1e-4b6d-4c1a-9e3f-2d5b8a6c1f00","answer_text":"Yes: SAML SSO for workspace admins; personal accounts use email sign-in.","accepted":true,"followup_required":false,"created_at_utc":"2026-11-25T02:00:41Z"}`
  - Refused response example: `{"response_id":"5e2a7c90-3d4b-4f1e-a6c8-9b0d1e2f3a40","request_id":"7f0c2a1e-4b6d-4c1a-9e3f-2d5b8a6c1f00","answer_text":"","accepted":false,"followup_required":true,"error_code":"needs_user_decision","created_at_utc":"2026-11-25T02:00:12Z"}`
  - Retry and settlement per error code. Only `unavailable` retries: it normalizes to `failure_class = provider_transient` and follows the canonical provider_transient row (backoff 1s, 2s, 4s; fail after 3 attempts) in `Plans/orchestrator-subagent-integration.md` §7 Retry/backoff matrix (orchestrator consumer contract); each retry reuses the same `request_id`, so at most one accepted response exists per request. When the attempts are spent, the request settles as `unavailable` and the interview records the topic as unanswered and continues with the next topic; it does not end the interview. `out_of_scope`, `needs_user_decision`, `budget_exhausted` and `redacted` never retry automatically. `needs_user_decision` settles by asking the user through the shared question-card flow (`QuestionItem`), and the user's answer becomes a new request with a new `request_id`. `out_of_scope` settles by dropping the topic from this phase with the reason recorded. `budget_exhausted` (the `max_questions` or `max_subagents_spawn` cap is reached) settles the remaining topics of the phase as unanswered and lets the phase finish. `redacted` settles with no answer text kept; the topic is recorded as answered-with-redaction and is not asked again.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
