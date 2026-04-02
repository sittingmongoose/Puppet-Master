## Part 1A - Markdown, Mermaid, and Unified Rendering Addendum (2026-03-07)
This addendum captures the rewrite's document and preview rendering model: source remains canonical, rendered output is first-class, and richer preview experiences never replace the underlying editable artifact. The same rendering pipeline must support chat, planning docs, editor preview, and future deeper planning surfaces without introducing a hidden document model.

**Key capabilities**

- First-class Markdown rendering in chat, editor preview, document panes, and planning documents.
- Native Mermaid detection/rendering from fenced `mermaid` blocks and `.mmd` files.
- Mermaid export as SVG (canonical) and PNG (derived).
- Full Markdown support centered on source-canonical editing plus rendered preview, not on replacing Markdown with a hidden WYSIWYG model.
- HTML files support both source editing and full rendered browser-like viewing.
- Image files render natively in the Slint app surface.
- Detached preview/browser windows are first-class, cross-platform guaranteed behavior.
- Embedded webviews are optional optimizations, not required product invariants.
- Generated Markdown/Mermaid previews use a restricted trust tier; full HTML/browser mode uses a separate trust tier.
- Preview-mode edits are limited to validated structured commands and otherwise fall back to source editing.
- Planning documents, including future Deep Plan Mode surfaces, use the same Markdown/Mermaid pipeline and canonical-source rules.

**Detailed spec:** `Plans/FinalGUISpec.md`, `Plans/PMConcept.html`, [Crosswalk](#crosswalk-ref)

<a id="feature-sc-gha-docker"></a>
