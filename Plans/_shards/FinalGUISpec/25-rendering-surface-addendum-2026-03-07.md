## Rendering Surface Addendum (2026-03-07)

This addendum locks how Markdown, Mermaid, HTML, SVG, and image rendering appear in the Slint GUI.

### Surface inventory impact

The rewrite must treat rendering as a shared capability across these existing surfaces:

- **Chat Panel**: rendered Markdown text, native Mermaid cards, source toggle/open actions.
- **File Editor**: source mode, split preview mode, detached preview mode, HTML browser mode.
- **Embedded Document Pane**: preview-capable document review surface using the same PreviewSession contract.
- **Bottom Panel Browser tab**: browser-like HTML/workspace preview and click-to-context surface.
- **Detached windows**: first-class preview/browser windows for platforms where embedding is not the correct guarantee.

### GUI behavior rules

- Detached preview/browser windows are part of the intended UX, not a degraded workaround.
- Embedded browser/preview panes may exist where supported, but GUI flows must remain valid when the preview opens in a separate window.
- Markdown and Mermaid previews should visually match app theming while remaining clearly distinct from editable source.
- HTML/browser mode must visually read as a browser-capable surface rather than as a static Markdown preview.
- Image viewing remains native and should not inherit unnecessary browser chrome.

### Chat panel behavior

Chat messages that contain renderable Markdown/Mermaid content must support:

- readable Markdown formatting
- native Mermaid diagram cards where Mermaid syntax is detected
- actions for copy source, open in editor, open detached preview, and export diagram where relevant
- visible error states for malformed Mermaid instead of silent raw-block disappearance

Chat must not execute arbitrary HTML from message content.

### File editor behavior

The File Editor view must expose clear mode controls for render-capable files:

- Source
- Preview
- Split
- Detached preview
- Browser/rendered mode for HTML

The mode switch must not change the canonical buffer model. Split mode should preserve shared-buffer editing semantics with the existing document/editor contract.

### Embedded document pane behavior

The Embedded Document Pane must reuse the same rendering pipeline and PreviewSession abstraction as the file editor and chat. It is a review/inspection surface, not a separate rendering system.

Required actions:

- open source
- open detached preview
- request re-render/reload
- perform allowed structured edits when the underlying document kind supports them

### Bottom panel browser behavior

The Browser tab is the primary in-shell host for full HTML/browser previews and click-to-context workflows.

Required behavior:

- use the browser/runtime transport contract rather than Markdown preview transport
- preserve navigation/reload state within the tab
- support detached-open without changing the underlying PreviewSession identity
- keep trust-tier boundaries distinct from generated Markdown/Mermaid previews

### Windowing and platform behavior

- GUI copy must not imply that every preview is embedded inline on every platform.
- Linux Wayland behavior must remain correct when the product opens a detached preview/browser window rather than embedding.
- The UI must not rely on hidden pre-created browser panes to feel responsive on platforms where hidden-window behavior is constrained.

### Performance and accessibility

- Use lazy rendering and virtualization for long message streams and large documents.
- Preserve scroll positions where feasible when re-rendering preview content.
- Preview controls must be keyboard reachable.
- Diagram export/open/source actions must have explicit labels and accessible tooltips/text.

### Acceptance criteria addendum

- The same document can move between chat card, editor preview, embedded doc pane, bottom browser tab, and detached preview without inventing separate rendering contracts.
- Mermaid diagrams render consistently across chat, editor, and planning/doc surfaces.
- HTML rendered mode behaves like a browser/workspace preview, not a static screenshot.
- Platform limitations may change whether a preview is embedded or detached, but they must not remove the feature.
