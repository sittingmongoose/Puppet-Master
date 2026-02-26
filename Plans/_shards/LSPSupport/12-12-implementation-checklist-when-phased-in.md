## 12. Implementation checklist (when phased in)

### 12.1 Implementation order (phases and dependencies)

Recommended ordering so an implementer can build incrementally with clear dependencies. **Dependencies:** each phase assumes the previous phase is done; within a phase, items are ordered by dependency where applicable.

- **Phase 1 -- Core LSP (must ship first):**
  - **Prerequisites:** Rust LSP client crate (lsp-types + stdio-capable client), config schema (OpenCode-aligned; §14.4).
  - **Client + registry:** Server registry (id, extensions, root finder, spawn); config (disabled, command, env, initialization). Include all built-in servers §3.2 + slint-lsp (§3.3.1); reinforce eslint (§3.3). *Depends on: Prerequisites.*
  - **Document sync:** didOpen / didChange (debounced, incremental when supported) / didClose / didSave; version tracking (§7, §14.2, §14.3). *Depends on: Client + registry.*
  - **Diagnostics:** Subscribe to publishDiagnostics; map to editor underlines + gutter; **Problems panel** (FinalGUISpec §7.20). *Depends on: Document sync.*
  - **Hover:** textDocument/hover at cursor; show tooltip; timeout and stale discard (§1.1, §7). *Depends on: Document sync.*
  - **Completion:** textDocument/completion on trigger; render list and apply on select; timeout and stale discard. *Depends on: Document sync.*
  - **LSP status in UI:** Status bar (server name, Initializing/Ready/Error); §8 crash/restart behavior. *Depends on: Client + registry.*
  - **Fallback when LSP unavailable:** Heuristic symbol search, no diagnostics; optional install hint (FileManager §12.1.4). *Depends on: Editor/FileManager.*
  - **Phase 1 outcome:** User can open files, see diagnostics in editor and Problems panel, get hover and completion; status bar shows LSP state; fallback when no server.

- **Phase 2 -- Editor navigation + Chat LSP:**
  - **Navigation (editor):** documentSymbol (outline, breadcrumbs, Go to symbol), textDocument/definition; then **textDocument/references** (Find references → References panel), **textDocument/rename** (Rename with FileSafe), **textDocument/formatting** (Format document/selection). *Depends on: Phase 1.*
  - **Inlay hints, semantic highlighting, code actions, code lens, signature help** in editor. *Depends on: Phase 1.*
  - **Request timeout and cancellation; per-server enable/disable; Settings > LSP** (§7.4.2); server lifecycle (restart on crash, backoff); bridge pattern. *Depends on: Phase 1.*
  - **Chat LSP (§5.1):** Diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code-block hover and click-to-definition; Problems link from Chat; optional inline diagnostics hint for @'d files. *Depends on: Phase 1 (diagnostics, hover, definition).*
  - **Diagnostics for LLM/Assistant** in context. *Depends on: Phase 1 diagnostics.*
  - **Phase 2 outcome:** Full editor LSP (definition, references, rename, format, code actions, code lens, signature help, inlay hints); Chat has LSP-aware @ symbol, code-block hover/definition, Problems link; Settings > LSP and fallbacks in place.

- **Phase 3 -- Additional enhancements (§9.1):**
  - **Recommended (high value):** Find references, Rename symbol, Format document (if not already in Phase 2); LSP diagnostics verification gate (optional); LSP snapshot in evidence (optional); Chat "Fix all" / "Rename" / "Where is this used?" / "Format file"; promote lsp tool (Tools.md).
  - **Optional (as capacity allows):** Go to type definition, Go to implementation, document links, call hierarchy, folding range, selection range, document highlight; Interview "structure of file" (documentSymbol); subagent selection from LSP; code lens "Run test" / "N references" click → References panel.
  - **Phase 3 outcome:** Optional verification gates, evidence snapshots, and Chat/Interview/agent-facing enhancements implemented per §9.1 acceptance criteria.

**Summary:** Phase 1 = core client, doc sync, diagnostics, hover, completion, Problems panel, status, fallback. Phase 2 = navigation (definition, references, rename, format), inlay/semantic/code actions/code lens/signature help, Chat LSP (§5.1), timeouts, Settings > LSP. Phase 3 = §9.1 optional/recommended items.

**Edge cases and fallback:** For each checklist item below, success/failure behavior, edge cases (timeout, server crash, stale response), and **fallback when LSP unavailable** are defined in §1.1 (Purpose), §5 (Editor), §5.1 (Chat), §8 (mitigations), and §13 (GUI). Config keys: §14.4.

---

- [ ] Choose and integrate Rust LSP client crate (lsp-types + stdio-capable client).
- [ ] Implement server registry: id, extensions, root finder, spawn; config (disabled, command, extensions, env, initialization). **Include all built-in servers** from §3.2 (OpenCode-aligned table **plus slint-lsp** for `.slint`). **Reinforce eslint** for ECMAScript/JavaScript/TypeScript (§3.3); **include slint-lsp** for Slint UI (§3.3.1); root discovery via package.json or eslint.config.* (v10 flat config), and for .slint via file directory or Cargo.toml root.
- [ ] Document sync: didOpen / didChange (debounced, incremental when supported) / didClose / didSave; version tracking.
- [ ] Diagnostics: subscribe to publishDiagnostics; map to editor UI and optional Problems panel.
- [ ] Hover: textDocument/hover on cursor position; show tooltip.
- [ ] Completion: textDocument/completion on trigger; render list and apply on select.
- [ ] Navigation: documentSymbol (outline/breadcrumbs), textDocument/definition, **textDocument/references** (Find references → References panel), **textDocument/rename** (Rename symbol with FileSafe), **textDocument/typeDefinition**, **textDocument/implementation** (when server supports).
- [ ] Inlay hints: textDocument/inlayHint; render as inline decorations.
- [ ] Semantic highlighting: textDocument/semanticTokens when supported; fall back to syntax-only.
- [ ] Code actions: textDocument/codeAction; context menu/lightbulb; apply via workspace/applyEdit (FileSafe).
- [ ] Code lens: textDocument/codeLens; render and invoke actionable links.
- [ ] Signature help: textDocument/signatureHelp when cursor in a call.
- [ ] Request timeout and cancellation; discard or re-request on stale document version.
- [ ] LSP status in UI: status bar or indicator (server name, Initializing/Ready/Error).
- [ ] Per-server enable/disable: honor lsp.<id>.disabled and lsp: false. **GUI:** Settings > LSP: all built-in servers listed with Enable toggle (default on); user can turn any off. Global "Disable automatic LSP server downloads" toggle; per-server env and initialization options; custom LSP servers (add/edit/remove: command, extensions, env, initialization). See FinalGUISpec §7.4.2.
- [ ] Server lifecycle: spawn on first file open for (server, root); restart on crash with backoff.
- [ ] Support bridge pattern: custom command can be a stdio↔TCP bridge (e.g. Godot); document for users.
- [ ] Fallback: when LSP disabled or server missing, keep heuristic symbol search and no diagnostics; optional install hint (FileManager §12.1.4).
- [ ] Diagnostics for LLM/Assistant: include current LSP diagnostics in context fed to Assistant/Interview.
- [ ] **Additional enhancements (§9.1):** textDocument/formatting (format document/selection); textDocument/documentLink (clickable imports); optional: LSP diagnostics verification gate, LSP snapshot in evidence, Chat "Fix all" / "Rename" / "Where is this used?" / "Format file"; promote lsp tool when ready.

---

