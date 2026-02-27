## Appendix: Implementation plan checklist (single ordered list for implementers)

Use this as the **single, implementation-ready checklist** an agent can follow. Cross-references: §5.1 = LSP in the Chat Window; §9.1 = Additional enhancements (optional/recommended). FinalGUISpec §7.16 = Chat, §7.20 = Bottom Panel (Problems), §7.4.2 = Settings > LSP; FileManager §10.10, §12.1.4.

**Acceptance (done when):** Each Phase 1-4 item is done when: (1) **Prerequisites:** App builds with lsp-types + chosen client crate; config schema and keys exist in storage. (2) **Phase 1:** Opening a file with a matching server spawns the server; diagnostics appear in Problems tab and gutter; hover and completion work with timeout/stale discard; status bar shows server state. (3) **Phase 2:** Go to definition, Find references, Rename, Format work; code actions apply via FileSafe; code lens invokes; Settings > LSP lists all servers and custom entries with validation. (4) **Phase 3:** Assistant/Interview context includes diagnostic summary (capped 10 files, 50 diagnostics); @ symbol includes LSP workspace/symbol; code blocks in Chat support hover and click-to-definition; Problems link in Chat footer opens Problems tab. (5) **Phase 4:** Optional gate, evidence snapshot, subagent bias, and Chat/Interview enhancements implemented per §9.1 or explicitly deferred and documented.

### Prerequisites

- [ ] Choose Rust LSP client crate (lsp-types + stdio-capable client; e.g. lsp-client or async_lsp_client). Add to Cargo.toml.
- [ ] Define LSP config schema (OpenCode-aligned: lsp.enabled, lsp.servers.<id>.disabled, command, extensions, env, initialization). Store in redb; document in §14.4.
- [ ] Add config keys for debounce and timeouts (lsp.didChangeDebounceMs, lsp.hoverTimeoutMs, lsp.completionTimeoutMs, lsp.workspaceSymbolTimeoutMs). See §14.4.

### Phase 1: Core LSP

- [ ] Implement server registry: id, extensions, root finder, spawn; load config (disabled, command, extensions, env, initialization). Include all built-in servers from §3.2 (OpenCode table plus slint-lsp). ESLint §3.3, slint-lsp §3.3.1; root discovery per server.
- [ ] Implement document sync: didOpen, didChange (debounced, default 100 ms), didClose, didSave; track document version per buffer; prefer incremental sync when server supports.
- [ ] Subscribe to textDocument/publishDiagnostics; map to editor underlines and gutter markers; add Problems panel in bottom panel (FinalGUISpec §7.20): table with file, line, message, severity, source; click opens file at line.
- [ ] Implement textDocument/hover; show tooltip at cursor (timeout and cancel on navigate/edit).
- [ ] Implement textDocument/completion on trigger; render inline list; apply on select; optional completionItem/resolve.
- [ ] Show LSP status in status bar (e.g. "rust-analyzer: Ready", "Initializing...", "Error: ..."). FinalGUISpec §8.1 StatusBar.

### Phase 2: Editor (navigation and editing)

- [ ] Implement textDocument/definition (Go to definition); F12 or Ctrl+Click opens definition in File Editor. Fallback: heuristic/index (FileManager §12.1.4).
- [ ] Implement textDocument/codeAction; show context menu or lightbulb; apply via workspace/applyEdit through FileSafe.
- [ ] Implement textDocument/codeLens; render actionable links above symbols; support invoke (e.g. run test).
- [ ] Implement textDocument/signatureHelp when cursor in call; show popup with signature and parameter highlight.
- [ ] Implement textDocument/inlayHint; render as inline decorations (no buffer change).
- [ ] Implement textDocument/semanticTokens when supported; fall back to syntax-only.
- [ ] Implement textDocument/references (Find references); add References panel or inline list in bottom panel; shortcut Shift+F12; click opens file at location.
- [ ] Implement textDocument/rename and textDocument/prepareRename (Rename symbol); F2; show preview; apply via workspace/applyEdit (FileSafe).
- [ ] Implement textDocument/formatting and textDocument/rangeFormatting (Format document / Format selection); shortcut e.g. Shift+Alt+F; apply via workspace/applyEdit.
- [ ] Use documentSymbol (and workspace/symbol) for breadcrumbs and Go to symbol (FileManager §10.1, §10.9). Fallback: regex outline §12.1.4.
- [ ] Request timeout and cancellation; discard or re-request on stale document version. Per-server enable/disable: honor lsp.<id>.disabled and lsp: false. Settings > LSP per FinalGUISpec §7.4.2.
- [ ] Server lifecycle: spawn on first file open for (server, root); restart on crash with backoff. Bridge pattern: custom command can be stdio↔TCP bridge (e.g. Godot); document for users.

### Phase 3: Chat LSP (§5.1)

- [ ] **Diagnostics in Assistant context:** When building context for next Assistant/Interview turn, include summary of current LSP diagnostics (file, line, message, severity, source) for project or @'d/recently edited files.
- [ ] **@ symbol with LSP:** When LSP is available, @ menu includes symbols from LSP workspace/symbol (and optionally documentSymbol); results show path, line, kind.
- [ ] **Code blocks in messages:** Code blocks in assistant/user messages support LSP hover (tooltip) and click-to-definition (e.g. Ctrl+Click); use virtual document or real file URI when block maps to project file; definition opens in File Editor.
- [ ] **Problems link from Chat:** Chat footer or message area offers link or badge (e.g. "N problems") that opens Problems panel (FinalGUISpec §7.20) filtered to project or context.
- [ ] **Optional:** When user has @'d files, show compact hint (e.g. "2 errors in @'d files") with click-through to Problems or first error.
- [ ] Fallback when LSP unavailable: @ symbol uses text-based or indexed symbol search (FileManager §12.1.4); code blocks no hover/definition; omit diagnostics from context.

### Phase 4: Optional (§9.1)

- [ ] **Optional LSP diagnostics gate:** Verification criterion at tier boundaries: "No LSP errors in scope" (or "no errors; warnings allowed"). Configurable per tier (e.g. Verification tab). See feature-list §4 Verification gates.
- [ ] **Optional LSP snapshot in evidence:** When collecting evidence for a run, attach LSP diagnostics snapshot (file, line, severity, message, source) for project or changed files; store under .puppet-master/evidence/.
- [ ] **Optional subagent selection from LSP:** When files in scope have LSP errors for a language, prefer subagent that matches that language (e.g. rust-engineer for Rust errors).
- [ ] **Optional/recommended Chat:** "Fix all" / quick fixes from Chat; "Rename X to Y" from Chat (LSP Rename symbol with confirmation); "Where is this used?" (Find references in Chat or References panel); "Format this file" (LSP Format document); Copy type/signature to Chat from editor hover.
- [ ] **Optional:** Promote lsp tool to MVP (Tools.md): agents can call lsp.references, lsp.definition, lsp.hover; optionally lsp.rename with user approval. Remove or relax OPENCODE_EXPERIMENTAL_LSP_TOOL gate when ready.
- [ ] **Optional:** Interview "Structure of this file" via documentSymbol; diagnostics in interview context (same as Assistant). Other §9.1 editor enhancements (go to type definition, implementation, document links, call hierarchy, folding range, selection range, document highlight) as natural next steps.

---

