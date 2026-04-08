## 14. Technical implementation (implementation guide source)

### 14.1 Worktree root_identity handling

LSP sessions are keyed by `(host_id, server_id, root_identity)`. When a file belongs to a worktree rather than the main project root, the LSP root_identity MUST use the worktree path.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

**Behavior:**
- When a thread with a bound worktree is active and the user opens files from that worktree, LSP sessions use `root_identity = worktree_path`
- If an LSP session for `(host_id, server_id, worktree_path)` does not exist, one is started (warm-start on worktree creation if feasible)
- When the worktree is removed, the associated LSP session is shut down gracefully
- Multiple worktrees may each have their own LSP session for the same server_id (each with a different root_identity)

**Thread switch behavior:**
- Switching threads does NOT kill LSP sessions for the previous thread's worktree — they remain available for background diagnostics and are reused if the user switches back
- LSP session lifecycle is tied to worktree existence, not thread focus

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### 14.1.1 Remote LSP over SSH transport

Remote LSP uses SSH as a stdio tunnel instead of a port-forwarded secondary protocol.

Rules:
- transport is stdio over SSH; the remote LSP server stdin/stdout are tunneled through the SSH connection rather than exposed by port forwarding
- connection lifecycle is: SSH connection established → remote LSP server spawned → stdio streams connected → initialize handshake → ready
- multiple LSP servers may share the same SSH connection via multiplexed channels
- if SSH disconnects, all remote LSP servers on that connection are marked `degraded`, reconnect is attempted, servers are re-initialized, and pending requests are replayed when safe
- remote LSP has higher latency by design; PM applies a timeout multiplier for remote operations (default `3x`)
- remote LSP uses the remote filesystem directly; there is no hidden local sync or mirror for LSP operations

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### 14.2 Module and crate layout

- **Decision:** LSP client and server registry live in the **same crate as the editor** (e.g. `puppet-master-rs/src/`) in a dedicated **submodule `src/lsp/`** containing:
  - `client.rs` -- LSP client wrapper (stdio transport, lifecycle, request/response).
  - `registry.rs` -- Server registry (id, extensions, root finder, spawn); reads config.
  - `session.rs` or `server_handle.rs` -- Per-`(host_id, server_id, root_identity)` process handle and state.
  - `document.rs` or `sync.rs` -- Document version tracking and didOpen/didChange/didClose/didSave.
- **Dependencies:** `lsp-types`, chosen LSP client crate (e.g. `lsp-client` or `async_lsp_client`), `tokio` for async. No need for tower-lsp unless implementing a server.

### 14.3 Core data structures (conceptual)

```text
LspSessionKey {
  project_id
  host_id
  server_id
  root_identity
}

LspSessionProjection {
  key
  lifecycle_state
  freshness
  health
  requested_enabled
  effective_enabled
  capability_summary
  restart_budget
  last_error
}

DocumentBinding {
  document_id
  path
  version
  host_id
  root_identity
  attached_servers[]
}
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

LSP server lifecycle state machine:

States: `stopped → starting → initializing → ready → degraded → stopping → crashed`

| From | To | Trigger | Action |
|---|---|---|---|
| stopped | starting | file opened matching server's language | spawn server process |
| starting | initializing | process started, stdio connected | send `initialize` request |
| initializing | ready | `initialized` notification received | enable capabilities |
| ready | degraded | server error / timeout / partial failure | reduce capabilities, show warning |
| degraded | ready | server recovers / error clears | restore full capabilities |
| ready | stopping | last file of language closed / user request | send `shutdown` + `exit` |
| stopping | stopped | server process exits | cleanup resources |
| any | crashed | server process dies unexpectedly | log error, attempt restart |
| crashed | starting | auto-restart (max 3 attempts, backoff 2s/4s/8s) | respawn |
| crashed | stopped | restart limit exceeded | show error, require manual restart |

Resource limits:
- max memory per server is configurable, default `512MB`
- max CPU time for a single request is `30s`

### 14.4 Message flow

1. **User opens file** → Editor loads buffer → Resolve (path → extension → server id → effective host/root identity) → If server not running for `(host_id, server_id, root_identity)`, spawn process → Initialize handshake → Send `didOpen` with content + version.
2. **User edits** → Buffer content changes → Increment version; **debounce** (e.g. 100 ms) → Send `didChange` (incremental if supported) with version.
3. **Server sends publishDiagnostics** → Client receives → Update DiagnosticsCache for that URI → Notify UI (main thread) → Problems tab and gutter update.
4. **User hovers** → Editor sends (uri, position) → Client sends `textDocument/hover` (with timeout) → On response, check document version; if stale, discard → Show tooltip.
5. **User triggers completion** → Client sends `textDocument/completion` with context → On response, filter/discard if stale → Show list; on select, apply and optionally `completionItem/resolve`.

All LSP I/O on **async task** (tokio); route UI updates to the Slint event loop (e.g. via `slint::invoke_from_event_loop` or `Weak::upgrade_in_event_loop`). Never block UI on LSP.

**Stale response policy:** When a response arrives for a document-scoped request (hover, completion, definition, references, signatureHelp), the client must check whether the document version has changed since the request was sent. Store the document version (from `DocumentState.version` for that URI) at request time; when the response is received, compare to the current `DocumentState.version`. If the current version is **greater** than the version at request time, **discard** the response (do not show tooltip, do not apply completion, do not navigate). Optionally match by request id so only the correct response is discarded. **Do not** automatically re-request; the user can repeat the action (e.g. hover again, trigger completion again) to get a fresh result. For workspace-level requests (e.g. workspace/symbol), version check is per relevant document or omit if no single document applies.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.5 Config schema and storage

- **Keys:** `lsp.enabled` (bool, default true), `lsp.servers.<id>.disabled` (bool), `lsp.servers.<id>.command` (string array), `lsp.servers.<id>.extensions` (string array), `lsp.servers.<id>.env` (object), `lsp.servers.<id>.initialization` (object). **Decision:** Config namespace is `lsp.servers.<id>.*`; support legacy alias `lsp.<id>.disabled` (read/write maps to `lsp.servers.<id>.disabled`). Align with OpenCode schema for compatibility.
- **Storage:** App-level in **redb** (or existing config YAML) under a key like `config.lsp`. Project-level override: optional file in project root (e.g. `.puppet-master/lsp.json`) or key under project id in redb.
- **Debounce / timeouts:** Store in Settings → Editor or Developer: `lsp.didChangeDebounceMs` (default **100**, range 50-500), `lsp.hoverTimeoutMs` (default **5000**), `lsp.completionTimeoutMs` (default **5000**), `lsp.workspaceSymbolTimeoutMs` (default **10000**), `lsp.hoverDelayMs` (default **300**, range 100-1000, delay before sending hover request). All timeouts user-configurable. Document in implementation guide.

### 14.6 Trigger and refresh behavior

- **Completion:** Trigger on typing (all characters) or on explicit shortcut (e.g. Ctrl+Space). Send `CompletionContext` with `triggerKind`: Invoked or TriggerCharacter.
- **Hover:** Trigger on cursor idle; delay **300 ms** (config `lsp.hoverDelayMs`, default 300) before sending hover request to avoid flooding; cancel previous hover request on cursor move.
- **Inlay hints:** Request on document open and on `didChange` (after debounce); optionally on visible range change (scroll). Server may support refresh on demand.
- **Code actions:** Request on context menu open or lightbulb click; pass current range + diagnostics for that range (`CodeActionContext`).
- **Signature help:** Trigger when cursor enters a call (e.g. after `(`); re-request on cursor move within the call.

### 14.7 workspaceFolders policy (decision)

- **Recommendation:** At initialize, send **only roots that have at least one open document**, capped at **10** roots. If user has no open files, send project root if single-root, else empty list. Reduces startup cost and memory; document in implementation guide. Re-initialize not required when opening a file in a new root; the matching host-aware server session handles that.

### 14.8 Virtual documents (Chat code blocks)

Code blocks in Chat messages (§5.1) that are not backed by a project file use **virtual documents** so hover and go-to-definition can still call the LSP.

- **URI scheme:** Use a dedicated scheme so the client and server can distinguish virtual docs from file paths. Example: `puppet-master-virtual://chat/{language_id}/{opaque_id}` where `opaque_id` is a unique id per block (e.g. UUID or message-id + block index). Language id (e.g. `rust`, `typescript`) comes from the block's language tag.
- **Creation:** When the user focuses or hovers over a code block in a Chat message that has a known language id and the project has an LSP server for that language, create a virtual document: assign a URI, set content to the block text, and attach it to the **server for that language and the effective host/root identity for the current project context** (same session that would handle a real file with that extension). If the block maps to a real project file (e.g. "snippet from src/main.rs"), use the real file URI instead and do not create a virtual doc.
- **Attachment:** Virtual documents are attached to the same `(host_id, server_id, root_identity)` as would be used for a real file of that language in the project. Resolve language id → server id from the registry (e.g. `rust` → rust-analyzer); resolve against the effective host context rather than assuming local project root; then send `textDocument/didOpen` with the virtual URI, language id, and content so the server has the document.
- **Lifecycle:** Send `textDocument/didOpen` when the virtual document is "opened" (e.g. when the user first hovers or requests definition in that block). Send `textDocument/didClose` when the block is no longer needed: when the user scrolls away from that message, when the message is collapsed, or when the Chat view is closed; or after T seconds idle (e.g. 300 s) if implementing eviction by timeout. Optionally retain a bounded set of recently used virtual docs (e.g. last 5) to avoid repeated didOpen/didClose on quick hover. Do not send `didChange` for virtual docs (blocks are immutable); if the user edits the message and the block content changes, treat as a new block (new opaque_id) and close the old virtual doc.
- **Contract for implementer:** (1) Virtual URI never points to disk; (2) one virtual doc per code block instance (same block in UI = same opaque_id); (3) didOpen is sent when the block needs LSP (hover/definition); (4) didClose is sent when the block is evicted or the view is closed; (5) hover/definition requests for that block use the virtual URI and the same `(host_id, server_id, root_identity)` as for that language in the current project context.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.9 Registry contract (ServerSpec)

`ServerSpec` is the canonical machine-friendly catalog record for both built-in and custom servers.

Minimum fields:
- `server_id`
- `display_name`
- `source_tags[]`
- `kind` (`managed_builtin`, `managed_catalog`, `custom`)
- `language_tags[]`
- `file_globs[]`
- `selection_mode`
- `selection_family`
- `primary_priority`
- `supplementary_families[]`
- `context_markers[]`
- `capability_profile`
- `root_rules`
- `host_support`
- `degraded_attach_rules`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

Registry rules:
- the effective support catalog is the deduped union of Microsoft implementor data, OpenCode catalog data, and Puppet Master overlay metadata
- user enable/disable and custom-server settings layer on top of the catalog instead of replacing it
- derived prose tables may be generated from this registry, but this structure remains the SSOT

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

