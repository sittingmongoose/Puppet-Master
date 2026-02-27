## 5. Integration with Our Editor (FileManager / Rewrite)

- **Editor:** FileManager plan defines the in-app editor (tabs, buffers, save, syntax highlighting). **LSP is MVP** -- integrate from the start. See also **§5.1 LSP in the Chat Window** for Chat-specific integration.
- **Integration (editor + Chat):**
  - **Document sync:** On open/change/close (and save when configured) of a buffer, send the corresponding LSP notifications. **Decision:** Send `didSave` on buffer save by default; config key `lsp.didSave` (bool, default true). for the document URI. Use the same 1-based line/column and encoding as in FileManager. Prefer **incremental sync** in client capabilities when the server supports it (sends only changed ranges in `didChange`); otherwise full sync. Track document version for each buffer and include it in sync messages.
  - **Diagnostics:** Subscribe to `textDocument/publishDiagnostics`; map `Diagnostic` to editor underlines and gutter markers; optionally a "Problems" panel (as in FinalGUISpec placeholder).
  - **Hover:** On hover at (line, col), call `textDocument/hover` and show the result in a tooltip.
  - **Completion:** On trigger (e.g. character or explicit), call `textDocument/completion` and show an inline completion list.
  - **Breadcrumbs / Go to symbol:** Use LSP `documentSymbol` (or workspace/symbol) for outline and breadcrumbs when available (FileManager §10.1, §10.9).
  - **Go to definition:** Use LSP `textDocument/definition` (and optionally references) instead of grep/index-only.
  - **Inlay hints:** Request `textDocument/inlayHint`; render as inline decorations (no buffer change). Enable when server supports it.
  - **Semantic highlighting:** Request `textDocument/semanticTokens` when supported; use for more accurate token types; fall back to syntax-only.
  - **Code actions:** Request `textDocument/codeAction`; show in context menu or lightbulb; apply via `workspace/applyEdit` (through FileSafe/patch pipeline).
  - **Code lens:** Request `textDocument/codeLens`; render actionable links above symbols; support invoke.
  - **Signature help:** Request `textDocument/signatureHelp` when cursor is in a call; show signature and parameter hint.
  - **Request timeout and cancellation:** Apply configurable timeouts per request type; send LSP cancellation when user navigates or edits to avoid stale results.
  - **LSP status in UI:** Show current server and state (e.g. "Rust (rust-analyzer)", "Initializing...", "Ready", "Error: ...") in status bar or dedicated indicator.
  - **Per-server enable/disable:** Honor config to disable a server globally or per project (`lsp.<id>.disabled`, `lsp: false`).
  - **Fallback when LSP unavailable:** When no server is available for a language, keep heuristic symbol search and no diagnostics. **Install hint:** Dismissible banner once per (project, server_id) per session with message "Install \<server\> for diagnostics" and link to Settings > LSP (FinalGUISpec §7.4.2).
  - **Diagnostics for LLM/Assistant:** Include current LSP diagnostics for relevant files in context fed to Assistant/Interview (assistant-chat-design §9.1 LSP support in Chat (MVP), tool context).

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

**Editor feature behavior (inputs, outputs, edge cases, fallback):**

- **Document sync:** *Inputs:* buffer open/change/close (and optionally save); URI, version, content or contentChanges. *Outputs:* server has up-to-date view. *Success:* server acknowledges; *failure:* server crash → clear diagnostics for that server, offer Restart; transport error → log, mark server Error. *Config:* `lsp.didChangeDebounceMs`. *Fallback when LSP unavailable:* no sync; no diagnostics.
- **Diagnostics:** *Inputs:* subscribe to `publishDiagnostics`. *Outputs:* underlines, gutter markers, Problems panel. *Success:* list shows file, line, message, severity; click opens file. *Edge cases:* timeout → keep last known or empty; server crash → clear diagnostics, offer Restart; empty list → show "No problems" when panel open. *Fallback when LSP unavailable:* no diagnostics; optional install hint.
- **Hover:** *Inputs:* (URI, position). *Outputs:* tooltip. *Success:* show content (markdown/plain). *Failure:* timeout → show "Timed out", discard; document version changed → discard; no server → no tooltip. *Config:* `lsp.hoverTimeoutMs`. *Fallback when LSP unavailable:* no hover.
- **Completion:** *Inputs:* (URI, position, trigger). *Outputs:* inline list; select applies. *Failure:* timeout → hide list; stale → discard. *Config:* `lsp.completionTimeoutMs`. *Fallback when LSP unavailable:* no LSP completions (heuristic if any).
- **Breadcrumbs / Go to symbol:** *Inputs:* documentSymbol or workspace/symbol. *Outputs:* outline, breadcrumbs, symbol list. *Failure:* timeout → show "Timed out" or empty list. *Fallback when LSP unavailable:* heuristic/regex outline (FileManager §10.1, §12.1.4).
- **Go to definition:** *Inputs:* (URI, position). *Outputs:* open file at location. *Failure:* timeout → "Timed out", discard; no result → "No definition"; stale → discard. *Fallback when LSP unavailable:* grep/index-only if available.
- **Inlay hints, semantic highlighting, code actions, code lens, signature help:** *Inputs/outputs* per §1.1. *Failure:* timeout → skip or discard; no server → no feature. *Fallback when LSP unavailable:* no inlay hints; syntax-only highlighting; no code actions/code lens/signature help.
- **Request timeout and cancellation:** On timeout → treat request as failed (show "Timed out" or discard); on navigate/edit → send LSP cancel, discard response when it arrives if version changed. *Fallback when LSP unavailable:* N/A.
- **LSP status in UI:** Show server name + state (Initializing/Ready/Error); when no server, show nothing (omit). *Fallback when LSP unavailable:* show nothing (omit).
- **Per-server enable/disable:** Honor `lsp.<id>.disabled`, `lsp: false`; disabled server not spawned. *Fallback when LSP unavailable:* same as no server for that language.
- **Diagnostics for LLM/Assistant:** Include current diagnostics in context; when no server, omit. *Fallback when LSP unavailable:* omit from context.

### 5.1 LSP in the Chat Window (MVP)

The Chat Window must **fully take advantage of LSP** so the user and the Assistant benefit from language intelligence without leaving the chat. All of the following are **MVP** and must be implemented with LSP support.

| Area | LSP usage | Requirement |
|------|-----------|-------------|
| **Diagnostics in Assistant context** | Feed current LSP diagnostics into the Assistant/Interview prompt | When building the context for the next Assistant turn, **include a summary of current LSP diagnostics** for the project (or for files @'d or recently edited): errors and warnings with file, line, message, severity, and source (e.g. rust-analyzer). The agent can then suggest fixes, explain errors, or prioritize work. Same for Interview when the project has open files or @'d files. **Cap:** Limit to **10 files** and **50 diagnostics total** in context; if more, truncate with "... and N more" in the summary to avoid token overflow. |
| **@ file mention** | LSP-aware @ picker | **@ mention** (Plans/assistant-chat-design.md §9) continues to offer file/folder/symbol search. When LSP is available for the project, **@ symbol** (or "symbols" in the @ menu) uses **LSP workspace/symbol** (and optionally documentSymbol for current file) so the user can add a **symbol** (function, class, etc.) to context by name; results show path, line, kind. File list remains the primary @ result; symbols are an additional category when LSP is active. |
| **Code blocks in messages** | Hover and go-to-definition from chat | **Code blocks** in assistant or user messages (inline or fenced) are **LSP-enabled** when the block has a known language and the project has an LSP server for it: **hover** over a symbol in the block shows LSP hover (type, docs) in a tooltip; **click-to-definition** (e.g. Ctrl+Click or Cmd+Click) on a symbol in a code block calls **textDocument/definition** (using a virtual document or the real file if the block maps to a project file) and opens the definition in the File Editor or scrolls to it. If the block is a snippet from a project file, use that file's URI and position for LSP requests; otherwise create a temporary/virtual document for the block and attach it to the appropriate LSP server for that language so hover/definition still work where possible. |
| **Problems panel from Chat** | One-click to Problems | Chat **footer** strip offers a **link** (label: "N problems" when count > 0, "Problems" when zero), placed **right of context usage** (FinalGUISpec §7.16). Click opens the **Problems** tab (FinalGUISpec §7.20) filtered to the current project (or to files in context). **Filter definition:** Show diagnostics for all open files in the current project; when context has @'d files, optionally restrict to those files plus open. Implementer defines "current project" from app state (e.g. active project root or workspace folder). Empty/error states and accessibility: see FinalGUISpec §7.16. |
| **Inline diagnostics for @'d files** | Optional hint in chat | When the user has **@'d** one or more files, optionally show a **compact hint** (e.g. "2 errors in @'d files") with a click-through to the Problems panel or to the first error location in the editor. **Default: off.** Config key `chat.show_at_diagnostics_hint` (bool, default false). |

**Chat LSP -- inputs, outputs, success/failure, edge cases, fallback:**

- **Diagnostics in Assistant context:** *Inputs:* current LSP diagnostics for project or @'d/recent files. *Outputs:* summary in Assistant/Interview prompt (file, line, message, severity, source). *Success:* agent sees errors/warnings. *Failure:* no server → omit from context; timeout → use last known or omit. *Edge case:* token limit → cap to 10 files, 50 diagnostics (§5.1); truncate with "... and N more". **Fallback when LSP unavailable:** Omit diagnostics from context; optional hint to install server.
- **@ symbol (LSP-aware):** *Inputs:* user query in @ picker; workspace/symbol (and optionally documentSymbol). *Outputs:* symbol list (path, line, kind). *Success:* user can add symbol to context. *Failure:* timeout → show "Timed out" or empty list; no server → use text/index search. **Fallback when LSP unavailable:** Text-based or indexed symbol search (FileManager §12.1.4).
- **Code blocks (hover + go-to-definition):** *Inputs:* code block language, symbol position; virtual or real URI. *Outputs:* tooltip on hover; open definition on click. *Success:* hover shows type/docs; click opens file at definition. *Failure:* timeout → show "Timed out", discard; no server → no hover/definition; virtual doc not supported → no LSP for that block. **Fallback when LSP unavailable:** No hover/definition in code blocks.
- **Problems link from Chat:** *Inputs:* current diagnostics count for project/context. *Outputs:* link/badge "N problems" opening Problems panel. *Success:* panel opens filtered. *Failure:* no server → show "0 problems" or hide badge; server crash → clear count, offer Restart. **Fallback when LSP unavailable:** Hide badge or show "0 problems"; link still opens panel (empty or message "Open a file to see diagnostics.").
- **Inline diagnostics for @'d files (optional):** *Inputs:* @'d file URIs, their diagnostics. *Outputs:* compact hint "K errors in @'d files" with click-through. *Success:* user sees hint and can jump to Problems or first error. *Failure:* no server → do not show hint. **Fallback when LSP unavailable:** Do not show hint.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

**Fallback when LSP unavailable:** When no LSP server is active for the project or language, @ symbol falls back to text-based or indexed symbol search (FileManager §12.1.4); code blocks in chat have no hover/definition; diagnostics in context are omitted. Optional one-time or dismissible hint to enable/install the LSP server.

**Reference:** OpenCode uses LSP diagnostics to inform the LLM (opencode.ai/docs/lsp/); we extend that to Chat with diagnostics in prompt, LSP-aware @ symbol, and code-block hover/definition.

**Server selection:** By file path → language (extension) → which server(s) handle that extension → project root for that file. Then one server process per (server id, root). Same idea as OpenCode's Info + root function. For **multi-root** (e.g. monorepo), consider sending only roots that have open files or a bounded set in `workspaceFolders` at initialize to avoid slow startup (see §7, §8).

**Threading:** LSP is async (I/O). Run the client in an async runtime (e.g. tokio); keep the GUI layer (Slint) responsive by sending results back to the Slint event loop (e.g. via `slint::invoke_from_event_loop` or a model binding update). Avoid blocking the UI thread on LSP requests.

---

