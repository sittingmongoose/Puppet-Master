## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)

This section defines how rendered Markdown and Mermaid appear in chat, plan-mode outputs, and other assistant-driven document surfaces.

### 28.1 Scope

Applies to:

- normal assistant/user/system chat messages
- assistant-created documents opened from chat
- planning documents opened or generated through chat workflows
- future Deep Plan Mode documents and previews

### 28.2 Canonical model

### 28.2A Chat/planning artifact source model (2026-03-08)

Chat/planning rendering needs one explicit source model for non-file content.

**Artifact classes**
- `chat_message_block` — renderable Markdown/Mermaid originating from a chat message
- `assistant_draft_document` — assistant-created document not yet saved to a workspace path
- `planning_draft` — planning document content created before first persist
- `persisted_planning_document` — planning content with a real workspace file path

**Planning surfaces in scope**
- plan-mode output previews shown in chat/document workflows
- assistant-created documents opened from chat
- planning drafts and persisted planning documents shown in preview-capable document panes
- future Deep Plan Mode previews, when present, following the same canonical-source rules

**Source behavior**
- `persisted_planning_document` opens its real workspace file on `open_source`.
- Non-file artifact classes open a transient `generated://<artifact_id>` source buffer on `open_source`.
- Transient source buffers MUST show provenance (`from chat message`, `from planning draft`, etc.).
- Exporting or opening source from chat/planning content MUST NOT silently create workspace files.
- Explicit user actions such as `Save As` or `Insert into file` create the first workspace-backed document for a non-file artifact.

**Mutation scope**
- Chat/planning render surfaces remain non-destructive until they are wired to the same validated preview-action pipeline used by File Editor and Embedded Document Pane.

- Chat and planning surfaces may render Markdown richly, but canonical saved/editable artifacts remain source text.
- Mermaid remains canonical as fenced `mermaid` code blocks or `.mmd` text.
- The assistant may create Mermaid diagrams, but it creates text artifacts, not hidden binary/graph models.

### 28.3 Mermaid detection and rendering rules

- Detect Mermaid primarily from fenced `mermaid` code blocks and Mermaid documents.
- When detected, render Mermaid natively as a diagram card/surface in chat and planning previews.
- When not detected or when parse fails, show the source block plus a visible render error state rather than silently dropping the content.
- Mermaid preview in chat/planning surfaces uses the restricted generated-preview trust tier.

### 28.4 Allowed user actions on rendered chat/planning content

### 28.4A Element-context attachment contract

Rendered selection capture uses two canonical typed attachments:
- `attachment_type = browser_element_context` for browser / HTML element capture
- `attachment_type = document_selection_context` for native document selections forwarded into chat

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileManager.md, ContractName:Plans/newfeatures.md

`document_selection_context` required fields:
- `attachment_id`
- `schema_version`
- `origin_kind` (`assistant_deep_plan`, `wizard_document_review`, `interview_document_review`, `document_review_surface`, `workspace_preview`)
- `source_surface`
- `bundle_id?`
- `doc_id`
- `doc_path` or equivalent bounded provenance
- `display_name?`
- `captured_at`
- `selected_text` (bounded)
- `anchor` (`text_position?`, `text_quote`, or stable semantic anchor id)
- `requested_target`
- `effective_target?`
- `sensitivity_state`
- `truncation_state`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

Composer behavior:
- capture creates a visible pending composer chip/card immediately visible to the user
- chips are stored in composer-prep state keyed by `thread_id`, never as global chat state
- the chip is attached to the next submitted user message by default and the user may remove it before send
- capturing a selection MUST NOT silently inject a hidden message into the thread
- hidden chat panels do not auto-open by default; the owning chat surface may pulse/badge and show a toast instead
- if the owning thread is terminal or non-writable, create a new thread in the same owning surface and record both `requested_target` and `effective_target`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Prompt assembly:
- both structured attachment types are serialized before the user's freeform message text
- `document_selection_context` serializes bounded provenance, anchor, and excerpt fields first; it MUST NOT inject raw unbounded document bodies
- blocked or expired chips MUST NOT be serialized as successful user attachments

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md

Persistence and audit:
- submitted attachments persist as part of the submitted user message record
- pending composer chips may persist across restart per thread until sent or removed; if they cannot be restored safely they return as blocked/expired, not silently dropped
- search/indexing stores bounded summary fields only; do not index unbounded raw document text
- captures and blocks must be visible in thread history or audit views as user-supplied context, including source provenance and requested/effective target

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Crosswalk.md

### 28.5 Structured editing rules

Chat/planning preview surfaces may support a constrained set of structured interactions, but they are not freeform WYSIWYG editors.

Rules:

- structured edits must target known source spans/nodes
- stale or ambiguous actions must fall back to source focus/open
- raw HTML/unknown syntax regions remain source-only for editing
- preview DOM state must never become the authority

### 28.6 Safety and trust boundaries

- Rendered chat/planning Markdown does not gain arbitrary browser privilege.
- Arbitrary HTML from messages is not executed as a full-trust page.
- Mermaid preview runs with a strict/restricted posture by default.
- Full HTML/browser mode is a separate surface and is not implied by rich chat Markdown rendering.

### 28.7 Planning-document support

Planning documents, including future Deep Plan Mode documents, use the same rendering pipeline and canonical-source rules as normal Markdown files.

Required consequence:

- if a planning doc contains Mermaid, it renders natively
- if the user edits the planning doc, the saved artifact remains Markdown/Mermaid text
- preview/edit behavior follows the same source-preview contract as editor Markdown documents

### 28.8 UX expectations

- Rendered Markdown in chat should feel significantly better than plain monospace message dumps.
- Mermaid cards should feel first-class rather than like pasted screenshots.
- Export/open-source/open-detached actions should be obvious and low-friction.
- Error states should tell the user whether the issue is syntax, runtime, or trust/sanitization related.

### 28.9 Acceptance criteria

- Assistant output containing fenced Mermaid renders as a native diagram card in chat.
- The same Mermaid content can be opened in source form and exported as SVG/PNG.
- Planning documents with Mermaid render using the same rules as normal Markdown docs.
- If inline rendered editing is not safe, the UI moves the user to source rather than corrupting content.

