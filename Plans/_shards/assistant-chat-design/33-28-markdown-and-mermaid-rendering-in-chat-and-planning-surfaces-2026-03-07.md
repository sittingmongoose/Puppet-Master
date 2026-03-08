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

When browser or HTML preview capture sends element context into chat, the thread uses one canonical typed attachment:

- `attachment_type = browser_element_context`

**Required fields**
- `attachment_id`
- `schema_version`
- `origin_kind` (`workspace_preview`, `external_browse`)
- `preview_session_id` (required for workspace preview when available)
- `page_url`
- `page_title` (optional)
- `captured_at`
- `capture_reason` (`user_click`, `user_keyboard`)
- `payload` (the bounded element-context schema from newfeatures.md section 15.18)

**Composer behavior**
- A capture creates a pending composer chip/card immediately visible to the user.
- The chip is attached to the next submitted user message by default.
- The user may remove the chip before send.
- Capturing an element MUST NOT silently inject a hidden message into the thread.

**Prompt assembly**
- `browser_element_context` is serialized as a structured attachment before the user's freeform message text.
- Prompt assembly MUST use bounded fields first (`tagName`, `id`, `className`, `textContent`, `role`, `rect`, `parentPath`) and include truncated optional HTML only when still within budget.
- If truncation occurs, the attachment metadata must include that truncation occurred.

**Persistence and search**
- The attachment persists as part of the submitted user message record.
- Search/indexing should store summary fields only; do not index unbounded raw HTML.
- Secrets scrubbing and storage rules from storage-plan.md still apply before persistence.

**Audit behavior**
- Captures must be visible in thread history as user-supplied context, not hidden system state.
- The thread audit view should show capture source (`workspace_preview` vs `external_browse`) and page URL/title when available.

Required actions when applicable:

- copy source Markdown/Mermaid
- open source in editor
- open rendered preview in detached window
- export Mermaid as SVG
- export Mermaid as PNG
- focus the corresponding source block when a rendered interaction is not safely editable

Nice-to-have but not required for initial packetization:

- copy SVG directly
- copy rendered image
- quick-insert assistant action that proposes a Mermaid block into the active document

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
