## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)

This section defines how rendered Markdown and Mermaid appear in chat, plan-mode outputs, and other assistant-driven document surfaces.

### 28.1 Scope

Applies to:

- normal assistant/user/system chat messages
- assistant-created documents opened from chat
- planning documents opened or generated through chat workflows
- future Deep Plan Mode documents and previews

### 28.2 Canonical model

- Chat and planning surfaces may render Markdown richly, but canonical saved/editable artifacts remain source text.
- Mermaid remains canonical as fenced `mermaid` code blocks or `.mmd` text.
- The assistant may create Mermaid diagrams, but it creates text artifacts, not hidden binary/graph models.

### 28.3 Mermaid detection and rendering rules

- Detect Mermaid primarily from fenced `mermaid` code blocks and Mermaid documents.
- When detected, render Mermaid natively as a diagram card/surface in chat and planning previews.
- When not detected or when parse fails, show the source block plus a visible render error state rather than silently dropping the content.
- Mermaid preview in chat/planning surfaces uses the restricted generated-preview trust tier.

### 28.4 Allowed user actions on rendered chat/planning content

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
