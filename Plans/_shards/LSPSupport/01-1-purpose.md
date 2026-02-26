## 1. Purpose

LSP support will provide (all MVP):

- **Diagnostics:** Inline and gutter errors/warnings from language servers (replacing or augmenting the "placeholder for future linter/build errors" in FinalGUISpec).
- **Hover:** Rich hover information (types, docs) in the editor.
- **Autocomplete:** Code completion driven by the language server.
- **Navigation:** Accurate go-to-definition, find references, symbol outline (so breadcrumbs and "go to symbol" can use LSP when available instead of regex/heuristics).
- **Inlay hints:** Parameter names, type hints, etc. (`textDocument/inlayHint`).
- **Semantic highlighting:** `textDocument/semanticTokens` when supported; fall back to syntax-only.
- **Code actions:** Quick fixes, refactors (`textDocument/codeAction`); apply via `workspace/applyEdit` (integrate with FileSafe).
- **Code lens:** Inline actionable links above symbols (`textDocument/codeLens`).
- **Signature help:** Function signature and parameter hint in calls (`textDocument/signatureHelp`).
- **Request timeout and cancellation:** Configurable timeouts; LSP cancellation for in-flight requests when user navigates or edits.
- **LSP status in UI:** Status bar or indicator (e.g. "Rust (rust-analyzer)", "Initializing...", "Ready", "Error: ...").
- **Per-server enable/disable:** User can disable a server globally or per project (OpenCode-style `lsp.<id>.disabled` / `lsp: false`).
- **Fallback when LSP unavailable:** Heuristic symbol search and no diagnostics when no server available; optional one-time or dismissible hint to install the server.
- **Diagnostics for LLM/Assistant (OpenCode-style):** Feed current LSP diagnostics (errors/warnings) into Assistant/Interview context so the agent sees linter/type errors and can suggest fixes.

### 1.1 Feature specification (inputs, outputs, behavior)

For each feature below: **inputs** (what the client sends or user does), **outputs** (what the user sees or context receives), **success/failure behavior**, **config keys** where applicable, **edge cases/failure modes** and required behavior, and **fallback when LSP unavailable**.

| Feature | Inputs | Outputs | Success | Failure / edge cases | Config keys | Fallback when LSP unavailable |
|--------|--------|---------|---------|----------------------|-------------|------------------------------|
| **Diagnostics** | Buffer URI, open/change/close; server sends `publishDiagnostics` | Underlines, gutter markers, Problems panel rows | Errors/warnings shown; click opens file at line | Timeout: show last known or empty; server crash → clear diagnostics, offer "Restart"; no server → no diagnostics | `lsp.<id>.disabled`, `lsp: false` | No diagnostics; optional install hint |
| **Hover** | (URI, position), optional timeout | Tooltip (markdown or plain) | Tooltip at cursor | Timeout → show "Timed out", discard; stale (version changed) → discard; no server → no tooltip | `lsp.hoverTimeoutMs` | No hover; syntax-only if any |
| **Autocomplete** | (URI, position, trigger), optional timeout | Inline completion list | List shows; select applies | Timeout → hide list, discard; stale → discard; no server → no LSP completions | `lsp.completionTimeoutMs` | Heuristic or no completion |
| **Navigation** (go-to-def, outline, breadcrumbs) | (URI, position) or document; server capability | Jump to location or symbol list | Correct location/list | Timeout → show "Timed out", discard; no result → show "No definition"; no server → heuristic/outline | `lsp.workspaceSymbolTimeoutMs` (for workspace/symbol) | Heuristic symbol search, regex outline (§12.1.4) |
| **Inlay hints** | Document sync + visible range (optional) | Inline decorations (no buffer change) | Hints rendered | Timeout → skip or show cached; no server → no inlay hints | -- | No inlay hints |
| **Semantic highlighting** | Document sync; server supports semanticTokens | Token types for coloring | More accurate colors | Not supported → fall back to syntax-only; no server → syntax-only | -- | Syntax-only highlighting |
| **Code actions** | Range + diagnostics; user invokes | Context menu / lightbulb; apply edit | Edit applied via FileSafe | Timeout → hide actions; apply failure → show error, do not change buffer; no server → no code actions | -- | No code actions |
| **Code lens** | Document open/change | Inline links above symbols | Click invokes (e.g. run test) | Timeout → hide lens; no server → no code lens | -- | No code lens |
| **Signature help** | (URI, position) in call | Popup with signature + param highlight | Popup visible | Timeout → hide; stale → discard; no server → no signature help | -- | No signature help |
| **Request timeout/cancellation** | Per-request timeout; cancel on navigate/edit | -- | Stale work abandoned | Timeout → treat as failure for that request (show "Timed out" or discard) | `lsp.*TimeoutMs` (§14.4) | N/A (client-side) |
| **LSP status in UI** | Server state (Initializing/Ready/Error/None) | Status bar text or indicator | e.g. "Rust (rust-analyzer): Ready" | No server: show nothing (omit) | -- | Show nothing (omit) |
| **Per-server enable/disable** | Config: disabled flag | Server not spawned when disabled | LSP off for that server | -- | `lsp.<id>.disabled`, `lsp: false` | Same as "no server" for that language |
| **Diagnostics for LLM/Assistant** | Current diagnostics for relevant files | Text/summary in Assistant/Interview context | Agent sees errors/warnings | No server → omit diagnostics from context | -- | Omit from context; optional hint to install |

ContractRef: ContractName:Plans/LSPSupport.md
- Feature behavior and fallback: Plans/LSPSupport.md §1.1 (this table), §5 (Integration), §8 (mitigations)
- Chat LSP requirements: Plans/LSPSupport.md §5.1
- GUI surface: Plans/FinalGUISpec.md §7.16 (Chat), §7.20 (Problems), §7.4.2 (Settings > LSP), §8.1 (StatusBar)

This plan is the single place for LSP design and implementation notes. **LSP is MVP** -- implement with the desktop editor and Chat Window from the start (FileManager.md, assistant-chat-design.md).

---

