## 14. Technical implementation (implementation guide source)

### 14.1 Module and crate layout

- **Decision:** LSP client and server registry live in the **same crate as the editor** (e.g. `puppet-master-rs/src/`) in a dedicated **submodule `src/lsp/`** containing:
  - `client.rs` -- LSP client wrapper (stdio transport, lifecycle, request/response).
  - `registry.rs` -- Server registry (id, extensions, root finder, spawn); reads config.
  - `session.rs` or `server_handle.rs` -- Per-(server_id, root) process handle and state.
  - `document.rs` or `sync.rs` -- Document version tracking and didOpen/didChange/didClose/didSave.
- **Dependencies:** `lsp-types`, chosen LSP client crate (e.g. `lsp-client` or `async_lsp_client`), `tokio` for async. No need for tower-lsp unless implementing a server.

### 14.2 Core data structures (conceptual)

- **LspConfig:** Global and per-server config (disabled, command, extensions, env, initialization). Loaded from app config / redb; project overrides if supported.
- **ServerHandle:** One per (server_id, root). Fields: process handle, optional initialization options, current state (Initializing / Ready / Error), last error message. Map key: `(server_id, root_path)`.
- **DocumentState:** Per open document: URI, version (monotonically increasing on edit), language id, optional server handle reference. Used for sync and stale-response checks.
- **DiagnosticsCache:** Per document or per server: list of `Diagnostic` (uri, range, severity, message, source). Updated on `publishDiagnostics`; cleared when server exits or document closed.

**Error types and handling:**

- **Spawn failure:** Process failed to start (binary not found, permission denied, etc.). **Action:** Log error with server id and root; set ServerHandle state to **Error**; set last error message (e.g. "Failed to start rust-analyzer: command not found"); show user-visible message in status bar (e.g. "LSP Error: rust-analyzer failed to start") and optionally in a toast. Do not retry automatically; user can use "Restart language server" to retry.
- **Init failure:** `initialize` or `initialized` handshake failed (e.g. server returned error or closed). **Action:** Log error; set state to **Error**; set last error message; clear diagnostics for that server's documents; show user-visible message in status bar. Tear down process (send shutdown/exit if possible, then close stdin). Do not retry automatically; user can Restart.
- **Transport error:** Broken pipe, read/write error, or invalid JSON on stdio. **Action:** Log error; set state to **Error**; clear diagnostics for that server; show "LSP Error: connection lost" in status bar; tear down process. Offer "Restart language server" or trigger restart with backoff per policy below.

**Shutdown (order of operations):**

1. Send `shutdown` request to server; wait for `shutdown` response with a **timeout** (e.g. **5 s**). If timeout, log and proceed.
2. Send `exit` notification.
3. Close stdin (and drop write half of transport) so the server can exit.
4. Wait for process exit (with optional short timeout); if it does not exit, kill the process.
5. Remove ServerHandle from registry; clear DiagnosticsCache for that server's documents.

**Restart backoff:**

- **Policy:** Exponential backoff: 1 s → 2 s → 4 s → 8 s → ... up to **max 60 s**. After a successful request (e.g. first successful response after init), reset backoff to 1 s for the next restart. On user-initiated "Restart language server", reset backoff and attempt restart immediately (no delay).
- **Implementation:** Store per (server_id, root): `restart_attempt_count` or `next_retry_delay`; on crash/error, schedule restart after `min(next_retry_delay, 60_000)` ms; on success after init, set `next_retry_delay = 1000`; on explicit Restart, set delay to 0 and restart now.

### 14.3 Message flow

1. **User opens file** → Editor loads buffer → Resolve (path → extension → server id → root) → If server not running for (id, root), spawn process → Initialize handshake → Send `didOpen` with content + version.
2. **User edits** → Buffer content changes → Increment version; **debounce** (e.g. 100 ms) → Send `didChange` (incremental if supported) with version.
3. **Server sends publishDiagnostics** → Client receives → Update DiagnosticsCache for that URI → Notify UI (main thread) → Problems tab and gutter update.
4. **User hovers** → Editor sends (uri, position) → Client sends `textDocument/hover` (with timeout) → On response, check document version; if stale, discard → Show tooltip.
5. **User triggers completion** → Client sends `textDocument/completion` with context → On response, filter/discard if stale → Show list; on select, apply and optionally `completionItem/resolve`.

All LSP I/O on **async task** (tokio); route UI updates to the Slint event loop (e.g. via `slint::invoke_from_event_loop` or `Weak::upgrade_in_event_loop`). Never block UI on LSP.

**Stale response policy:** When a response arrives for a document-scoped request (hover, completion, definition, references, signatureHelp), the client must check whether the document version has changed since the request was sent. Store the document version (from `DocumentState.version` for that URI) at request time; when the response is received, compare to the current `DocumentState.version`. If the current version is **greater** than the version at request time, **discard** the response (do not show tooltip, do not apply completion, do not navigate). Optionally match by request id so only the correct response is discarded. **Do not** automatically re-request; the user can repeat the action (e.g. hover again, trigger completion again) to get a fresh result. For workspace-level requests (e.g. workspace/symbol), version check is per relevant document or omit if no single document applies.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.4 Config schema and storage

- **Keys:** `lsp.enabled` (bool, default true), `lsp.servers.<id>.disabled` (bool), `lsp.servers.<id>.command` (string array), `lsp.servers.<id>.extensions` (string array), `lsp.servers.<id>.env` (object), `lsp.servers.<id>.initialization` (object). **Decision:** Config namespace is `lsp.servers.<id>.*`; support legacy alias `lsp.<id>.disabled` (read/write maps to `lsp.servers.<id>.disabled`). Align with OpenCode schema for compatibility.
- **Storage:** App-level in **redb** (or existing config YAML) under a key like `config.lsp`. Project-level override: optional file in project root (e.g. `.puppet-master/lsp.json`) or key under project id in redb.
- **Debounce / timeouts:** Store in Settings → Editor or Developer: `lsp.didChangeDebounceMs` (default **100**, range 50-500), `lsp.hoverTimeoutMs` (default **5000**), `lsp.completionTimeoutMs` (default **5000**), `lsp.workspaceSymbolTimeoutMs` (default **10000**), `lsp.hoverDelayMs` (default **300**, range 100-1000, delay before sending hover request). All timeouts user-configurable. Document in implementation guide.

### 14.5 Trigger and refresh behavior

- **Completion:** Trigger on typing (all characters) or on explicit shortcut (e.g. Ctrl+Space). Send `CompletionContext` with `triggerKind`: Invoked or TriggerCharacter.
- **Hover:** Trigger on cursor idle; delay **300 ms** (config `lsp.hoverDelayMs`, default 300) before sending hover request to avoid flooding; cancel previous hover request on cursor move.
- **Inlay hints:** Request on document open and on `didChange` (after debounce); optionally on visible range change (scroll). Server may support refresh on demand.
- **Code actions:** Request on context menu open or lightbulb click; pass current range + diagnostics for that range (`CodeActionContext`).
- **Signature help:** Trigger when cursor enters a call (e.g. after `(`); re-request on cursor move within the call.

### 14.6 workspaceFolders policy (decision)

- **Recommendation:** At initialize, send **only roots that have at least one open document**, capped at **10** roots. If user has no open files, send project root if single-root, else empty list. Reduces startup cost and memory; document in implementation guide. Re-initialize not required when opening a file in a new root (server per root handles that).

### 14.7 Virtual documents (Chat code blocks)

Code blocks in Chat messages (§5.1) that are not backed by a project file use **virtual documents** so hover and go-to-definition can still call the LSP.

- **URI scheme:** Use a dedicated scheme so the client and server can distinguish virtual docs from file paths. Example: `puppet-master-virtual://chat/{language_id}/{opaque_id}` where `opaque_id` is a unique id per block (e.g. UUID or message-id + block index). Language id (e.g. `rust`, `typescript`) comes from the block's language tag.
- **Creation:** When the user focuses or hovers over a code block in a Chat message that has a known language id and the project has an LSP server for that language, create a virtual document: assign a URI, set content to the block text, and attach it to the **server for that language and the project root** (same server that would handle a file with that extension). If the block maps to a real project file (e.g. "snippet from src/main.rs"), use the real file URI instead and do not create a virtual doc.
- **Attachment:** Virtual documents are attached to the same (server_id, root) as would be used for a real file of that language in the project. Resolve language id → server id from the registry (e.g. `rust` → rust-analyzer); use project root for that context. Send `textDocument/didOpen` with the virtual URI, language id, and content so the server has the document.
- **Lifecycle:** Send `textDocument/didOpen` when the virtual document is "opened" (e.g. when the user first hovers or requests definition in that block). Send `textDocument/didClose` when the block is no longer needed: when the user scrolls away from that message, when the message is collapsed, or when the Chat view is closed; or after T seconds idle (e.g. 300 s) if implementing eviction by timeout. Optionally retain a bounded set of recently used virtual docs (e.g. last 5) to avoid repeated didOpen/didClose on quick hover. Do not send `didChange` for virtual docs (blocks are immutable); if the user edits the message and the block content changes, treat as a new block (new opaque_id) and close the old virtual doc.
- **Contract for implementer:** (1) Virtual URI never points to disk; (2) one virtual doc per code block instance (same block in UI = same opaque_id); (3) didOpen is sent when the block needs LSP (hover/definition); (4) didClose is sent when the block is evicted or the view is closed; (5) hover/definition requests for that block use the virtual URI and the same (server_id, root) as for that language.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.8 Registry contract (ServerSpec)

The server registry is the single source of truth for which LSP servers exist and how they are started. Each entry is a **server spec** with the following contract (Rust-friendly types below are conceptual; implement using your crate's `PathBuf`, `Result`, and process handle type).

**ServerSpec (conceptual):**

- **id:** `String` -- Unique server identifier (e.g. `"rust"`, `"eslint"`, `"slint-lsp"`). Used in config as `lsp.servers.<id>.*` and as the process key with root.
- **extensions:** `Vec<String>` -- File extensions this server handles (e.g. `[".rs"]`, `[".ts", ".tsx"]`). Used to match an opened file to a server (see §3.6 for primary vs supplementary).
- **root_finder:** `fn(file_path: &Path) -> Option<PathBuf>` -- Given the **currently opened file path** (absolute), returns the project root for this server, or `None` if no root is found (server will not be started for that file). Implementation: take the parent directory of `file_path`, then walk upward until a directory matching the rule for this server id (§3.5) is found; return `Some(dir)` or, when the table specifies "else file's directory", return the file's directory when no marker is found.
- **spawn:** `fn(root: &Path, config: &LspServerConfig) -> Result<ProcessHandle, SpawnError>` -- Starts the LSP server process with **cwd = root** and config overrides (command, env, initialization). Returns a handle to the process (stdio used for JSON-RPC). Called **lazily**: only when the first document open for that **(id, root)** occurs (see below).
- **init_options:** `Option<Value>` -- Optional JSON object sent in the LSP `initialize` request as `initializationOptions`. May be overridden by config `lsp.servers.<id>.initialization`.

**When root_finder is invoked:** On every **document open** (user opens a file in the editor), the client gets the file path, then for each server whose **extensions** match the file's extension, the client calls that server's **root_finder(file_path)**. If it returns `Some(root)`, the client considers that server a candidate for this file (subject to §3.6 primary/supplementary).

**When spawn is called:** **Lazy, per (id, root).** When the client needs an LSP process for a given **(server_id, root)** (e.g. to send `didOpen` for a file that resolved to that root), it looks up whether a process for **(server_id, root)** already exists. If not, it calls **spawn(root, config)** once, stores the resulting `ProcessHandle` keyed by **(server_id, root)**, and uses that process for all documents under that root for that server. If spawn fails, the client does not retry for that (id, root) until the user retries (e.g. "Restart language server") or the config changes.

**Summary for implementer:** (1) Registry is a list of ServerSpec (id, extensions, root_finder, spawn, optional init_options). (2) On file open: path → extensions → for each matching server, root_finder(path) → Option<root>; then apply §3.6 to pick primary and supplementary servers. (3) For each (id, root) that must run: if no process exists, spawn(root, config) and store handle; then send initialize and didOpen. (4) One process per (server_id, root); reuse for all documents under that root for that server.

ContractRef: ContractName:Plans/LSPSupport.md

---

