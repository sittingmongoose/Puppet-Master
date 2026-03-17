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

The canonical `lsp` tool surface extends beyond the minimal MVP trio of definition/hover/references.

Recommended read operations:
- `goToDefinition`
- `findReferences`
- `hover`
- `documentSymbol`
- `workspaceSymbol`
- `goToImplementation`
- `prepareCallHierarchy`
- `incomingCalls`
- `outgoingCalls`

Write-like operation retained for MVP with approval boundary:
- `rename`

Rules:
- read operations remain available when the language server is active and the provider surface can support them
- `rename` remains approval-gated before any apply-edit path mutates workspace files
- Chat, editor, and command surfaces must all refer to the same canonical operation names rather than inventing per-surface aliases

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md

Chat-facing expectations:
- Chat can ask where a symbol is used, what it resolves to, what implements it, or which calls flow into/out of it
- symbol-aware search may route through LSP-backed workspace/document symbol calls when available
- LSP diagnostics and navigation remain shared editor/chat infrastructure rather than separate assistant-only logic

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

