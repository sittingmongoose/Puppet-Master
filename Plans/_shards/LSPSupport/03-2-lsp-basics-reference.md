## 2. LSP Basics (Reference)

- **Protocol:** [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) (JSON-RPC 2.0). Current spec: 3.17.
- **Roles:** Our app is the **LSP client**; we talk to existing **language servers** (e.g. rust-analyzer, pyright, gopls) that we spawn or connect to.
- **Transport:** Typically stdio (spawn server process, stdin/stdout = JSON-RPC). Some setups use TCP/sockets.
- **Document sync:** Client sends `textDocument/didOpen`, `textDocument/didChange`, `textDocument/didClose` (and optionally didSave). Server uses this to keep its view of the file in sync.
- **Key features we care about:**
  - **Diagnostics:** Server sends `textDocument/publishDiagnostics` (params: uri, diagnostics[]). Client renders in editor (underlines, gutter, problem list).
  - **Hover:** Client sends `textDocument/hover` (params: textDocument, position). Server returns contents for tooltip.
  - **Completion:** Client sends `textDocument/completion`. Server returns completion list (items, optional resolve).
  - **Go to definition / references / symbol outline:** Corresponding requests; server returns locations or symbol list.

Capabilities are negotiated at **initialize**: client and server declare what they support; we only use features both sides advertise.

---

