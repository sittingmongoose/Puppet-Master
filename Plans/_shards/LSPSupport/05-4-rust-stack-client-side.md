## 4. Rust Stack (Client Side)

Our rewrite is Rust/Slint (1.15.1). We only need an **LSP client** in the app.

- **Protocol types:** [lsp-types](https://docs.rs/lsp-types/) -- LSP 3.x types (requests, notifications, capabilities, DocumentUri, Range, Diagnostic, etc.). Use for all LSP data structures.
- **Client implementation:** One of:
  - [lsp-client](https://docs.rs/lsp-client/) -- async, uses jsonrpsee + lsp-types.
  - [async_lsp_client](https://docs.rs/async_lsp_client/) -- async, lifecycle (initialize, shutdown, exit), document sync, hover, completion, goto definition.
  - [lsp-client-rs](https://github.com/sudarshan-reddy/lsp-client-rs) -- TCP/Unix socket + async; used with gopls in examples.
- **Server implementation (optional):** If we ever implement our own LSP server (e.g. for a custom language), [tower-lsp](https://docs.rs/tower-lsp/) / [tower-lsp-server](https://lib.rs/crates/tower-lsp-server) (community fork, active).

Recommendation: use **lsp-types** plus one async LSP **client** crate that supports stdio (spawn process, stdin/stdout). Evaluate `lsp-client` and `async_lsp_client` for lifecycle, document sync, and the few methods we need (diagnostics, hover, completion, goto definition).

---

