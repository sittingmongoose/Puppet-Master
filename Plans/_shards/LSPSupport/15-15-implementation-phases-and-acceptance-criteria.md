## 15. Implementation phases and acceptance criteria

Order for an agent to build a step-by-step implementation guide. Each phase has clear deliverables and acceptance criteria.

| Phase | Deliverables | Acceptance criteria |
|-------|--------------|---------------------|
| **1. Foundation** | LSP client crate integrated; server registry (in-memory); config loading (lsp.* from redb/config). | App starts; config can disable LSP globally; registry returns server id by extension. |
| **2. Spawn and lifecycle** | Spawn server process per (id, root); stdio transport; initialize handshake; shutdown/exit on close. | Opening a `.rs` file (with rust-analyzer in PATH) spawns one process; closing all files in that root shuts down server. |
| **3. Document sync** | didOpen, didChange (debounced), didClose, didSave; version tracking; incremental sync when server supports. | Editing file sends didChange after debounce; version increments; no flood of messages. |
| **4. Diagnostics** | Subscribe to publishDiagnostics; store per URI; expose to UI. | Problems tab shows errors/warnings for open files; gutter shows markers; click opens file at line. |
| **5. Hover and completion** | textDocument/hover and textDocument/completion; timeout and cancel; tooltip and completion list in editor. | Hover shows type/docs; completion list appears on trigger; stale responses discarded. |
| **6. Navigation** | documentSymbol, textDocument/definition (and references); breadcrumbs and go-to-symbol use LSP when available. | Breadcrumbs reflect LSP outline; go to symbol/definition jump to correct location. |
| **7. Inlay hints, semantic tokens, signature help** | inlayHint, semanticTokens, signatureHelp; render in editor. | Inlay hints and signature help visible; semantic highlighting improves colors when supported. |
| **8. Code actions and code lens** | codeAction (context menu/lightbulb), codeLens; apply via workspace/applyEdit through FileSafe. | Quick fixes appear and apply correctly; code lens links invoke. |
| **9. Status and fallback** | LSP status in status bar; per-server enable/disable; fallback to heuristic when no server; optional install hint. | Status bar shows server state; disabling server stops LSP for that language; heuristic outline used when LSP off. |
| **10. LLM diagnostics** | Include current diagnostics in Assistant/Interview context. | Agent receives diagnostic list for relevant files when composing context. |

---

