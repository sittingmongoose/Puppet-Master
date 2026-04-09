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

This section defines the canonical contract for this surface.

Core rules:
- Question flows are locked to PM-managed draft state, required visible options plus a freeform path, resumable multi-question drafts, and explicit dismissed or paused behavior instead of fabricated answers.
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.
- The question tool contract is locked to a multi-question envelope, normalized output statuses, object-array options, included answer source, and top-level orchestrator ownership of user questioning.

Fields:
- mode: "single_question" | "questionnaire"
- questions: Array<QuestionItem>
- status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"
- answers: Array<{question_id, values: string[]}>
- answer_text?
- source?: "option" | "other" | "freeform"
- Headless/HITL-unavailable = `status = "unavailable"`
- Subagent question tool access is DENIED by default

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- NOT via `sendPrompt`
- Something else
- Always-visible options
- Drafts auto-save until submit
- Exiting/dismissing does NOT auto-submit
- Thread-scoped draft state
- status: 'dismissed'
- draft
- question_id
- question
- allow_freeform
- multi_select
- default_values?: string[]
- draft_value?: string
- response_kind
- validation_state
- drafts auto-save continuously
- required questions block final submit
- question cards may include a visual
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
