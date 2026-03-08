## 24. Unified Markdown, Mermaid, HTML, and Image Rendering Architecture (2026-03-07)

This section adapts the built-in browser, click-to-context, and document-preview ideas into one rewrite-ready rendering architecture.

### 24.1 Core framing

The product must not ship four disconnected implementations for:

- Markdown preview
- Mermaid preview/export
- HTML file preview
- browser/click-to-context

Instead, use one rendering family with:

- a native document core
- a shared PreviewSession abstraction
- a browser-like runtime where browser behavior is truly required
- native image handling for image-first artifacts

### 24.2 Relationship to built-in browser and click-to-context

- The browser surface remains real and important.
- Full HTML preview uses the browser-oriented path.
- Generated Markdown/Mermaid preview does **not** require being treated as arbitrary full-trust browser content.
- Click-to-context stays aligned with the browser/HTML surface, not with raw chat Markdown rendering.

### 24.3 Platform and embedding strategy

- Detached preview/browser windows are guaranteed.
- Embedded webviews are optional per-platform optimization.
- Linux Wayland is detached-first or GTK-bridged behind the same abstraction.
- The architecture should not depend on hidden embedded panes being available everywhere.

### 24.4 Transport split

### 24.4A Browser surface modes and HTML preview transport normalization

The product uses two browser-capable modes with different authority.

#### A) `workspace_preview`
This is the canonical mode for file-backed HTML preview and browser-faithful workspace rendering.

Rules:
- Backed by the loopback preview server.
- Rooted to the active project/workspace.
- Relative assets resolve through the preview server, not `file://`.
- Click-to-context is supported here.
- Agent-initiated navigation/reload is allowed only within the active workspace preview origin.
- Source-mutation privileges are still separate from browser rendering privileges.

#### B) `external_browse`
This is an optional user convenience mode for manually opened HTTP/HTTPS pages.

Rules:
- It is not the canonical path for project rendering.
- It does not imply source-edit privileges, preview editing, or workspace mutation.
- If click-to-context is enabled here, it remains user-triggered only.
- Agent automation for external browsing is out of scope unless a separate tool/capability contract is added later.

#### HTML preview server contract
- Canonical transport: `http://127.0.0.1:<port>/preview/<project_id>/<document_id>/...`
- Canonical preview origin is loopback localhost.
- `file://` is not an MVP transport for full HTML preview.
- `WebViewBuilder::with_html` is prohibited as the primary transport for file-backed HTML preview.
- Generated Markdown/Mermaid previews continue to use the internal preview origin/route and must not share the workspace HTML trust tier.

#### Fallback order
1. embedded browser/runtime path when supported
2. detached preview/browser window using the same preview session and origin contract
3. explicit degraded error state

A static screenshot is not an acceptable steady-state replacement for HTML/browser functionality.

#### Normalized defaults
- Canonical hot-reload debounce: `app.preview.hot_reload_debounce_ms = 500`
- Browser tab capacity applies to in-shell browser tabs; detached windows are outside that cap
- Any earlier `browser instances` language should be treated as pre-normalization text and aligned to this section

- Use localhost preview for file-backed HTML/browser mode.
- Use an internal preview origin/route for generated Markdown/Mermaid/read-only previews.
- Do not use `with_html` as the main transport contract.

### 24.5 Editing contract

- Source text remains canonical.
- Preview-mode edits are allowed only as validated structured commands.
- Ambiguous or unsupported edits jump the user to source instead of mutating rendered DOM state.
- Mermaid remains text-canonical even when rendered on a dedicated canvas/window.

### 24.6 Security split

- Generated preview surfaces are sanitized, restricted, and narrowly bridged.
- Full workspace HTML preview is explicitly a different trust tier.
- Full HTML preview must not receive source-mutation powers by default simply because it is rendered in a webview.

### 24.7 Performance expectations

- lazy rendering
- caching of repeated diagrams/previews
- virtualization for large conversations/documents
- hot reload for HTML and linked assets
- stable fallback behavior rather than blank/failed panes

### 24.8 Suggested implementation phasing

1. **Phase 1:** shared PreviewSession, native Markdown/Mermaid rendering pipeline, detached preview/browser windows, native image surface, localhost HTML preview.
2. **Phase 2:** embedded webview support where stable, richer split-pane integration, improved source/preview synchronization.
3. **Phase 3:** expanded structured preview editing beyond the v1 whitelist, if deterministic mapping continues to hold.

### 24.9 Non-goals

- do not require universal embedded-webview parity before shipping the feature set
- do not make arbitrary WYSIWYG editing the definition of “full Markdown support”
- do not allow generated preview trust boundaries to collapse into workspace-browser trust boundaries
