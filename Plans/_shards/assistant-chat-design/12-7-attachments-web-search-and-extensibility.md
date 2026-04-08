## 7. Attachments, Web Search, and Extensibility

Assistant chat accepts structured inputs beyond plain text and exposes external capability integrations without hiding provenance.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 7.1 Attachment model

Supported attachment families are:
- files
- images
- URLs
- inline code snippets

Attachment rules:
- files may include project files, logs, documents, archives, and generated artifacts addressable through the file-manager/editor contracts
- images render with preview, filename or source label, and size metadata when known
- URLs render as normalized link chips/cards and may later resolve into fetched/extracted web-activity cards
- code snippets pasted into the composer preserve formatting and language hinting when detection is possible
- attachments persist as structured message payloads rather than being flattened into plain text only

Minimum attachment fields:
- `attachment_id`
- `attachment_type`
- `display_name`
- `source_ref`
- `mime_type?`
- `size_bytes?`
- `preview_state`

### 7.2 Web search integration

Web search is a first-class chat capability, not a hidden side channel.

Required rules:
- when the assistant uses web search, the thread shows explicit web activity cards and later source/citation disclosure in the related assistant turn
- web-derived results appear inline in chat as operation cards, source blocks, or citations tied to the turn that used them
- fetched/extracted content preserves provenance so users can distinguish search snippets, extracted page text, and synthesized conclusions
- if the active provider or policy cannot use web search, the assistant discloses that limitation rather than implying that the web was consulted
- user-supplied URLs and assistant-triggered web results share the same attachment/provenance system while preserving distinct origin labels

### 7.3 Extensibility surface

### 7.4 Question card and questionnaire system
Assistant Chat consumes the shared `question` runtime contract rather than defining a chat-local payload shape.

ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### Card structure

The chat surface renders one shared request shape with `mode`, `header`, `prompt`, `questions`, and optional `visual_ref?`. `mode: "single_question" | "questionnaire"` is the canonical mode set.

Each `questions[]` entry uses the canonical `QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values?}` contract. Option rows remain `Array<{id, label, description?}>`.

Question item preservation rules:
- `allow_other is a deprecated alias`; chat normalizes it to `allow_freeform` before persisting drafts or rendering resume state
- `default_values?: string[]` remain caller-supplied initial option ids
- `draft_value?: string` remains PM-managed freeform draft state
- `response_kind?: "selection" | "freeform" | "mixed"` and `validation_state?: "valid" | "invalid" | "pending"` remain optional preserved fields when the request surface uses them

#### Answer and draft behavior

- Always-visible options remain visible while the question is open; the card does not collapse into a freeform-only mode when options exist
- `Something else` is the canonical visible label for the explicit other/freeform affordance when options and freeform coexist
- chat writes all question progress into PM-managed draft state and NOT via `sendPrompt`
- Drafts auto-save until submit
- Thread-scoped draft state is restored on resume by `question_id`
- the optional answer field `source?: "option" | "other" | "freeform"` stays visible to chat and storage consumers
- `response_kind` and `validation_state` stay attached to the normalized question/answer state when the caller preserves them
- question cards may include a visual, but visuals remain PM-managed payloads rather than ad hoc embedded HTML
- users can answer out of order and revise before submit
- required questions gate final submit until locally valid
- Exiting/dismissing does NOT auto-submit
- dismiss returns status: `dismissed` and restores the same outstanding questionnaire on resume
- Headless/HITL-unavailable = `status = "unavailable"`
- Subagent question tool access is DENIED by default

#### Parent-mediated clarification rule

Child agents do not question the user directly. If a delegated flow needs clarification, the parent session surfaces the `question` request, stores the draft state, and resumes the child only after the user responds or dismisses.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/chain-wizard-flexibility.md

Rules:
- status: 'dismissed'
- allow_other?
- answers
- answer_text?
- required questions block final submit
- Headless/HITL-unavailable maps to status unavailable
- Subagent question tool access is denied by default
- Keep this chat surface anchored to Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5B `question` tool runtime contract, and Plans/storage-plan.md#4.2 Question and clarification state
