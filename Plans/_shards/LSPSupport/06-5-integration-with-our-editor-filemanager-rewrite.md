## 5. Integration with Our Editor (FileManager / Rewrite)

The editor integrates with LSP through a shared authoritative document store and a host-aware session supervisor.

Rules:
- the shared document store is the sole authority for open-document text
- LSP document sync, hover, definition, references, completion, signature help, diagnostics, code actions, rename, and format all operate against that authoritative document state
- feature requests are gated behind sync barriers so stale document versions do not leak into the UI
- workspace edits from rename/format/code action flow through the same FileSafe-backed mutation path as other file edits
- LSP never becomes the owner of Search, diff/review, or chat restore semantics

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md

UI integration rules:
- breadcrumbs, outline, go-to-symbol, hover, references, and code actions are editor/LSP-owned affordances
- diagnostics feed editor markers and Problems, but Problems remains the owner of aggregated problem presentation
- when LSP is unavailable, fallback navigation/index behavior is explicit and MUST NOT masquerade as healthy LSP state
- remote-mode files reuse the same architecture with remote host identity; they are not a second LSP subsystem

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

### 5.1 Chat LSP

Chat LSP provides language intelligence features within the chat and assistant context.

Purpose:
- provide language intelligence features within the chat and assistant context
- let the assistant surface code understanding without requiring the user to leave the chat flow

Capabilities:
- code completion suggestions in chat input
- symbol resolution in code blocks
- hover info for code references in messages
- go-to-definition from chat code blocks

Activation:
- Chat LSP activates when a chat thread has an associated project with LSP servers running
- chat messages containing code blocks are analyzed by the appropriate LSP server based on language detection

Limitations:
- Chat LSP provides read-only intelligence only; no refactoring and no code actions are exposed through this surface
- it uses the same LSP server instances as the editor rather than spawning a separate chat-only server pool

Integration:
- code blocks that map to project files use those real file URIs; other code blocks use the virtual-document contract in §14.8
- when the relevant server is unavailable or degraded, chat surfaces must disclose that reduced state explicitly

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

