# Shard 039: Shared Conversational Actor Runtime Identity

Source: `Plans/assistant-chat-design.md`

Source lines: L3286-L3300

Source SHA256: `1ce90168383ca6b17ce94bf183e4b53ac930c59dfc8c4616252156f784b8ae23`

---

## Shared Conversational Actor Runtime Identity

Assistant chat, interview, requirements-doc-builder, and PRD builder share `/account/usage/runtime` identity behavior without becoming orchestration nodes, `/packages/seams`, `Feature Seams`, `Work Packages`, graph `Nodes`, graph-plan actors, lane-pool objects, or package `/seam-governance` objects. They share requested/effective provider/model/persona/account/auth semantics, selection reason, skipped `/honored` disclosure, blocked `/retry/remediation/degradation` taxonomy, shared activity `/event-stream` infrastructure, and requested/effective `/model/effort/persona` display, while remaining conversational actors for `/brainstorming`, decision-forming, document-handling, conversational-to-structured questioning, topic-by-topic closure, and traditional requirements documents `/artifacts` under the relevant `/rules` and `/contract`. The requirements-doc-builder and PRD flows are document-production surfaces, not orchestration-style HITL escalation routes.

Blocked `/HITL/critical` Orchestrator events may open a chat-thread resolution-thread, but that pattern must not be projected back onto ordinary assistant, interview, or `/interviewer/requirements-builder` conversation. Those conversational actors already operate directly in chat and share `/account/usage` runtime behavior without becoming Orchestrator-style resolution objects.

Runtime recovery seams that affect chat must preserve `Architecture_Invariants.md` / `Architecture_Invariants`, `Decision_Log.md` / `Decision_Log`, `MiscPlan.md`, and `FileSafe.md` as adjacent owners for frozen requested/effective execution identity bundles, provider-pool concurrency scope, projection trust versus scheduler authority, safe-point lineage exactness, pre-cleanup ordering, deferred-run resume validity, DAE `/post-scan` blocked phases, orphan cleanup, and `/remediation` ordering. Under-documentation in those adjacent docs must not soften chat's own `/effective` identity and safe-point rules.

The execution-policy `/UI` split is explicit: worker kind and retry-context policy are separate settings, chat is a requested-identity override surface, and requested-vs-effective identity must align across chat actors and orchestration actors. The seam covers agent vs subagent, fresh vs reused retry worker, overseer delegation `/off`, delegated-worker provider/model/effort policy, requested-identity display, execution_role, actor_kind, `/platform/model-level` identity, `/account/switch` identity, and requested/effective `/account` disclosure.

Cross-doc parity references are `Plans/assistant-chat-design.md`, `/assistant-chat-design.md`, `Plans/interview-subagent-integration.md`, and `/interview-subagent-integration.md`; both docs must expose `/account` behavior for conversational actors sharing provider runtime.

`package`, `seam`, `lane`, `promotion`, `review`, and `resolution_thread` are persisted-or-projected schema questions owned by the package `/seam/lane` family, not by the chat thread model. Chat may render a detail-focus route with `inspector_target`, but that enum must stay small and must never become a fallback bag for unresolved route design. Live page/widget attribution that chat consumes is attempt-/lane-/session-aware: it uses `attempt_id`, receipt refs, `scheduler_lane`, `worktree_id`, requested/effective identity, and avoids tier-only routing through `tier_id` or generic `/widget` summaries.

`auto` persona or model selection must never appear as an opaque state with no resolved `/reason`; historical runs preserve the resolved effective persona and reason from the time of execution.
