## 14. Markdown, Mermaid, HTML, SVG, and Image Rendering (Rewrite Addendum -- 2026-03-07)

This addendum makes the editor/file-surface behavior deterministic for Markdown, Mermaid, HTML, SVG, and image files.

### 14.1 File-type behavior matrix

| File / content kind | Canonical representation | Default open mode | Alternate modes | Native rendering behavior |
|---|---|---|---|---|
| `.md` | Markdown text | Source editor | Split source/preview, preview-only, detached preview | Render Markdown natively via the shared preview runtime |
| fenced ```mermaid``` inside `.md` | Markdown text containing Mermaid source | Source editor with rendered blocks available | Split source/preview, detached diagram preview/editor | Mermaid block renders as native diagram card inside Markdown preview |
| `.mmd` | Mermaid text | Dedicated Mermaid source editor | Detached diagram preview/canvas, split source/diagram | Native Mermaid render, SVG-first export |
| `.html` / `.htm` | HTML source file | Source editor | Full browser-like rendered mode, split source/render, detached browser window | Rendered mode uses browser preview transport with relative assets and scripts |
| `.svg` | SVG file | Native image/vector view | Source editor, detached image view | Prefer native image/vector surface; browser surface is optional, not required |
| raster image (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, etc.) | File bytes | Native image view | Detached image view, open source metadata when relevant | Native Slint image surface |

Rules:

- HTML must support **both source editing and fully rendered browser-like viewing**.
- Markdown and Mermaid remain source-canonical even when rendered inline.
- Images are not forced through the browser preview runtime.

### 14.2 Editor/view modes

Supported modes for render-capable documents:

- **Source**: normal text editor surface.
- **Preview**: rendered-only surface.
- **Split**: source + rendered preview side-by-side or stacked.
- **Detached preview**: separate window using the same PreviewSession.
- **Open in browser panel/window**: for full HTML/browser mode and other cases where a browser-like surface is the correct UX.

Defaults:

- Markdown opens in source mode by default, with preview quickly available.
- Mermaid blocks inside Markdown render in preview mode without changing the canonical source model.
- `.mmd` files open in Mermaid source mode with a diagram preview affordance.
- HTML opens in source mode by default and offers rendered/browser mode as a first-class alternate surface.

### 14.3 Preview state model

The editor/file manager owns document-side state that binds to shared PreviewSession records.

Minimum per-document UI state:

- `document_id`
- `path`
- `content_kind`
- `source_revision`
- `preview_session_id` (if active)
- `preview_mode` (`none`, `inline`, `split`, `detached`, `browser_panel`)
- `trust_tier`
- `can_structured_edit_preview`
- `last_preview_error`
- `export_preferences` (for example, Mermaid export format/theme)
- `scroll_sync_enabled`

### 14.4 Source/preview edit contract

Source remains authoritative.

Preview editing rules:

- Preview interactions may only issue **structured actions** against mapped nodes/spans.
- Minimum v1 whitelist:
  - task-checkbox toggle
  - heading text edit
  - list item text edit
  - link/text-format actions where source mapping is deterministic
  - Mermaid block replace/open-source/open-detached actions
- If mapping is ambiguous or stale, the preview must:
  - reject the mutation
  - focus/open source at the mapped block
  - show a deterministic user-facing reason when helpful
- Raw HTML, malformed Markdown, unknown extensions, and opaque fenced blocks remain source-only for editing.

### 14.5 Mermaid authoring and export

Mermaid behavior in the editor/file manager:

- Canonical Mermaid source lives in `.mmd` or fenced `mermaid` code blocks.
- The assistant may create Mermaid source, but saved artifacts remain text.
- Diagram preview actions should include:
  - open source
  - open detached diagram window
  - export SVG
  - export PNG
  - copy SVG / copy image when platform support is available
- SVG is the canonical export artifact; PNG is derived.
- Diagram preview must be theme-aware while keeping export behavior explicit and deterministic.

### 14.6 HTML preview and hot reload

Full HTML/browser mode must support:

- relative asset resolution
- local script execution appropriate to a workspace preview
- reload / hot reload
- click-to-context integration when the browser surface is used in that mode
- detached browser window fallback

Hot reload scope:

- watch the HTML file itself
- watch linked local CSS/JS/image assets under the preview contract
- debounce reloads to avoid thrash
- preserve scroll/location when reasonable

### 14.7 Error and fallback behavior

Required fallback rules:

- If browser embedding is unavailable, open detached preview/browser window instead.
- If Mermaid parse/render fails, show source plus explicit render error; do not silently drop the diagram.
- If Markdown preview generation fails, keep source editor usable and show a visible preview error state.
- If HTML preview runtime requirements are missing on Linux, present a clear missing-runtime state instead of a broken blank pane.
- If a preview edit cannot be reversed into a safe source patch, focus source rather than mutating preview state.

### 14.8 Non-goals

- No hidden diagram object model.
- No promise that all preview surfaces are embedded in-process panes on every platform.
- No arbitrary WYSIWYG DOM editing for Markdown/HTML as an MVP requirement.

### 14.9 Acceptance criteria

- Opening a Markdown file supports source, preview, split, and detached preview without changing canonical source storage.
- Mermaid fenced blocks render natively in Markdown preview and can export SVG/PNG.
- `.mmd` files support source editing plus detached/native preview.
- HTML files support source editing and full rendered browser-like viewing with local asset resolution.
- Image files render natively and can detach/open without going through the browser runtime.
- Preview actions either apply validated text patches or deterministically fall back to source focus.
