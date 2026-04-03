## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

### 4.1 Shared runtime identity consumption
Chat, activity, question, todo, and thread-context-detail projections may display runtime identity, but the canonical requested/effective snapshot comes from the owner docs.

Rules:
- thread and activity projections consume frozen requested/effective runtime snapshots captured for the execution
- the shared snapshot includes workflow-overlay and runtime-posture fields rather than forcing chat to reconstruct planning identity from local heuristics
- chat and thread-context-detail projections must not recompute historical runtime state from current settings
- assistant/chat-local state may reference runtime snapshots, but it must not rename or re-own the shared schema
- earlier references in this document to a `thread Usage tab` or equivalent per-thread usage tab now refer to the thread-scoped Context Detail Pane/editor-tab surface

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Thread Context Detail Pane projections consume at minimum:
- `chat.message` records and any stored message usage snapshots
- `usage.event` records with `thread_id`
- `run.completed.usage` snapshots when present, using the canonical usage buckets and attribution fields rather than legacy `(tokens_in, tokens_out, cost)` aliases
- persisted tool or activity payloads needed for per-message inspection and raw views

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

Rules:
- compact chat surfaces may derive display labels such as `Ask`, `Agent`, `Plan`, and `Deep Plan`, but only from frozen shared fields
- thread-scoped cost remains an estimated or provider-authoritative value according to the canonical usage pipeline; the detail pane does not invent a second cost model
- hidden/background usage that rolls into a thread total remains inspectable by source class in raw/detail views
- raw per-message views may expose provider/runtime metadata needed for audit and debugging without reclassifying those fields as chat-facing compact copy

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md
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

Activity transparency payloads must support the parent thread child-card UX and crew inspection surfaces.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Required activity projections:
- child started
- child progress / work / thought deltas
- child blocked / awaiting-parent / failed / cancelled
- child completed
- batch rollups and subgroup rollups
- crew-board message summaries when crew mode is active
- context-shrunk / context-rehydrated disclosures when relevant to the child

Expanded child-panel payload minimums:
- status
- work stream
- thought stream
- current state reason when non-happy-path
- result summary when finished
- provider/model/effort metadata for hover or details surfaces

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md
