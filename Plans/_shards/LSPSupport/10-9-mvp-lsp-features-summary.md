## 9. MVP LSP features (summary)

All of the following are **MVP** (in scope when LSP is phased in). They are specified in §1 (Purpose) and §5 (Integration); this section is a short summary.

| Feature | LSP / behavior |
|--------|-----------------|
| Inlay hints | `textDocument/inlayHint` -- parameter names, type hints; render as inline decorations |
| Semantic highlighting | `textDocument/semanticTokens` when supported; fall back to syntax-only |
| Code actions | `textDocument/codeAction`; show in context menu/lightbulb; apply via `workspace/applyEdit` (FileSafe) |
| Code lens | `textDocument/codeLens`; render and invoke actionable links above symbols |
| Signature help | `textDocument/signatureHelp` when cursor in a call |
| Request timeout/cancellation | Configurable timeouts; send LSP cancellation to avoid stale results |
| LSP status in UI | Status bar or indicator (server name, Initializing/Ready/Error) |
| Per-server enable/disable | `lsp.<id>.disabled`, `lsp: false` (OpenCode-style) |
| Fallback when LSP unavailable | Heuristic symbol search, no diagnostics; optional install hint |
| Diagnostics for LLM/Assistant | Feed current diagnostics into Assistant/Interview context (OpenCode-style) |
| **LSP in the Chat Window** | **§5.1:** Diagnostics in Assistant context; @ symbol with LSP workspace/symbol; code blocks in chat with hover and go-to-definition; Problems link from Chat; optional inline diagnostics hint for @'d files |

*(Content fully specified in §1, §5, and §5.1.)*

### 9.1 Additional enhancements enabled by LSP

With LSP as MVP, the following enhancements become possible. Each is marked **Recommended** (implement in Phase 2 or early Phase 3) or **Optional** (as capacity allows). Acceptance criteria are in **§9.1.1** so an implementer knows when each item is done. LSP methods from the [LSP 3.17 specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/).

#### Editor and navigation

| Enhancement | Status | LSP method(s) | Behavior |
|-------------|--------|---------------|----------|
| **Find references** | **Recommended** | `textDocument/references` | Find references command (e.g. Shift+F12): show all usages of the symbol under cursor in a **References** panel or inline list; click to open file at location. Complements Go to definition. |
| **Rename symbol** | **Recommended** | `textDocument/rename`, `textDocument/prepareRename` | Rename symbol (e.g. F2): rename variable/function/type across the workspace. Show preview; apply via `workspace/applyEdit` (through FileSafe). |
| **Format document / selection** | **Recommended** | `textDocument/formatting`, `textDocument/rangeFormatting` | Format document / Format selection (e.g. Shift+Alt+F): one-click format; apply via workspace/applyEdit. |
| **Go to type definition** | Optional | `textDocument/typeDefinition` | For types/interfaces: "Go to type definition" (e.g. Ctrl+K Ctrl+T) opens the type's definition. |
| **Go to implementation(s)** | Optional | `textDocument/implementation` | For interfaces/abstract members: "Go to implementation(s)" shows implementors; open in editor. |
| **Document links** | Optional | `textDocument/documentLink` | Clickable **imports/includes** in the editor (e.g. `use crate::foo` or `import './bar'`); click opens the target file. |
| **Call hierarchy** (LSP 3.17) | Optional | `textDocument/prepareCallHierarchy`, `callHierarchy/incomingCalls`, `callHierarchy/outgoingCalls` | "Call hierarchy" view: incoming and outgoing calls for the symbol under cursor; useful for impact analysis. |
| **Folding ranges** | Optional | `textDocument/foldingRange` | **Semantic folding** (fold by function/block instead of indent/brace only); improves "Fold all" / "Unfold all". |
| **Selection range** | Optional | `textDocument/selectionRange` | **Expand/shrink selection** to semantic unit (e.g. expression → statement → function); improves multi-cursor and refactors. |
| **Document highlight** | Optional | `textDocument/documentHighlight` | **Highlight all references** to the symbol under cursor in the current file (read-only highlight). |

#### Chat and Assistant

| Enhancement | Status | LSP usage | Behavior |
|-------------|--------|-----------|----------|
| **"Fix all" / quick fixes from Chat** | **Recommended** | Diagnostics + `textDocument/codeAction` | Assistant suggests "Apply quick fix" or "Fix all in file" based on LSP diagnostics; user confirms; apply via workspace/applyEdit (FileSafe). Or one-click "Fix" on a diagnostic in the Problems panel. |
| **"Rename X to Y" from Chat** | **Recommended** | `textDocument/rename` | User or Assistant says "Rename `foo` to `bar` in this file/project"; resolve symbol from context or @'d file; invoke LSP rename with confirmation; apply via FileSafe. |
| **"Where is this used?" from Chat** | **Recommended** | `textDocument/references` | User or Assistant asks "Where is `function_name` used?"; invoke LSP references; show results in Chat (compact list) or open **References** panel with full list. |
| **"Format this file" from Chat** | **Recommended** | `textDocument/formatting` | Assistant or user triggers "Format file X"; invoke LSP format; apply via workspace/applyEdit. |
| **Copy type/signature to Chat** | Optional | Hover / `textDocument/hover` | From editor hover (or right-click on symbol): "Copy type to chat" / "Copy signature to chat" copies LSP hover content so user can paste into the next message. |

#### Verification and orchestrator

| Enhancement | Status | Usage | Behavior |
|-------------|--------|--------|----------|
| **LSP diagnostics verification gate** | Optional | `textDocument/publishDiagnostics` (existing) | **Optional** verification criterion at tier boundaries (e.g. end-of-subtask): "No LSP errors in `changed_files` or `open` scope files" (or "No errors; warnings allowed"). Configurable per tier (e.g. Verification tab: "LSP: block on errors"). If the project has LSP errors in scope, gate fails and the orchestrator can retry or escalate. |
| **LSP diagnostics in evidence** | Optional | Snapshot of diagnostics | When collecting evidence for a run, **attach an LSP diagnostics snapshot** (file, line, severity, message, source) for the project or changed files before/after the iteration. Stored with gate reports under `.puppet-master/evidence/` for audit and "what broke" analysis. |
| **Subagent selection from LSP** | Optional | Diagnostics + language | When selecting a subagent for a task, if **files in scope have LSP errors** for a given language (e.g. Rust), **prefer** the subagent that matches that language (e.g. rust-engineer) so the right specialist addresses the errors. |

#### Interview

| Enhancement | Status | LSP usage | Behavior |
|-------------|--------|-----------|----------|
| **"Structure of this file"** | Optional | `textDocument/documentSymbol` | When the Interview (or user) asks "What's the structure of this file?", use LSP `documentSymbol` to return an outline (symbols with name, kind, range) so the agent or user sees functions, classes, modules without parsing manually. |
| **Diagnostics in interview context** | **Recommended** | Same as Assistant | When the interview analyzes a codebase (e.g. Architecture phase), **include a summary of current LSP diagnostics** for opened or @'d files so the interviewer can note existing issues or tech debt. |

#### Agent-facing LSP tool (Tools.md)

| Enhancement | Status | LSP methods | Behavior |
|-------------|--------|-------------|----------|
| **Promote `lsp` tool to MVP** | **Recommended** | `goToDefinition`, `hover`, `references`, optional `rename` | The **lsp** tool (Plans/Tools.md) is currently experimental (gated by `OPENCODE_EXPERIMENTAL_LSP_TOOL`). With LSP MVP, consider **promoting** it so agents can call `lsp.references`, `lsp.definition`, `lsp.hover` (and optionally `lsp.rename` with user approval) to reason about code and suggest refactors. Enables "find all usages," "what type is this," "rename with user confirm." |

#### Code lens (extended use)

| Enhancement | Status | LSP usage | Behavior |
|-------------|--------|-----------|----------|
| **"Run test" / "Debug" above tests** | Optional | `textDocument/codeLens` | Many servers (e.g. rust-analyzer, gopls) provide **code lens** above test functions: "Run test", "Debug test". We already specify code lens; ensure we **invoke** these (run the test command in Terminal or debugger). |
| **"N references" click → References panel** | Optional | `textDocument/codeLens` + `textDocument/references` | When a code lens shows "3 references", **click** opens the References panel (or inline list) with results from `textDocument/references`. |

**Summary:** Implement **Find references**, **Rename symbol**, and **Format document** in the editor and (where applicable) from Chat as high-value next steps. Add **LSP diagnostics gate** and **LSP snapshot in evidence** as **optional** verification enhancements (Plans/feature-list.md §4 Verification gates). Use **documentSymbol** for Interview "structure of file" and **references/rename** for the agent lsp tool when promoted. Other items (type definition, implementation, document links, call hierarchy, folding range, selection range, document highlight) are natural editor UX improvements once the LSP client supports them.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md, ContractName:Plans/Tools.md

---

