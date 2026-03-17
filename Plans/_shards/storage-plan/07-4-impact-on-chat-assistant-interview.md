## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

### 4.1 Shared runtime identity consumption
Chat/activity/question/todo records may display runtime identity, but the canonical requested/effective snapshot comes from the owner docs.

Rules:
- thread/activity projections consume frozen requested/effective runtime snapshots captured for the execution
- chat must not recompute historical runtime state from current settings
- assistant/chat-local state may reference runtime snapshots, but it must not rename or re-own the shared schema

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

### 4.2 Question and clarification state
Structured question flows may span one or many questions.

Rules:
- `requirements.clarification_requested` and related clarification records retain canonical `question_ids[]`
- thread-scoped questionnaire drafts persist only bounded structured answer data needed to restore the flow
- do not persist arbitrary widget/UI runtime state for question forms
- resolved question flows persist explicit outcome state (`submitted`, `dismissed`, `timed_out`, or equivalent) rather than ambiguous partial state

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md

### 4.3 Plan and TODO state
`chat.plan_todo_updated` is the canonical event family for thread-visible plan and TODO state.

Required payload shape:
- `thread_id`
- `plan_state`
- `plan_revision_id?`
- `todos[]` using the normalized TODO schema
- `updated_by?`
- `source?`

Rules:
- the same TODO identity persists across draft, approval, execution, completion, blocking, and supersession
- structured revision/status history must be sufficient to restore the sticky plan panel honestly after reload/restart
- inline milestone updates in chat are derived from this state; they are not a separate source of truth

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### 4.4 Activity transparency payloads
`tool.invoked` / `tool.denied` payloads may attach bounded feature-specific metadata under `payload.meta`.

Recommended chat-facing additions include:
- web activity meta (`web_operation`, `support_tier`, `execution_path`, `sources_ref`, `provider_fallback_summary`)
- question-flow refs (`question_ids[]`, questionnaire state refs when needed)
- command-card preview refs and session-linkage metadata
- plan/todo tracker refs

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

