## 8. Potential issues and mitigations

Each mitigation is **actionable**: who does what, and when.

| Issue | Mitigation (who, what, when) |
|-------|------------------------------|
| **Server crash or exit** | **Client (LSP layer):** On process exit or broken pipe (e.g. when writing to stdin fails), (1) mark that server's state as Error, (2) clear all diagnostics for documents owned by that server (DiagnosticsCache), (3) notify UI to refresh Problems panel and gutter. **UI:** Show "Error" in status bar for that server; offer "Restart language server" button (or auto-restart with exponential backoff, e.g. 1s, 2s, 4s, cap 30s). **Logging:** Log exit code and stderr tail for debugging. |
| **Server slow or unresponsive** | **Client:** Apply request timeouts (§14.4); on timeout, discard response and show "Timed out". Send LSP cancel on user navigate/edit. **UI:** While a request is in flight and no response yet, show "Waiting for language server..." in status bar; never block UI thread on LSP. **Optional (client):** After N timeouts for a server in a session, throttle or disable heavy features (e.g. workspace symbol) for that server until next restart. |
| **Many open documents** | **Client:** Limit documents pushed to each server (e.g. only currently open tabs, or N most recent per root). **Editor/FileManager:** When a buffer is evicted (FileManager §12.2.1), **client** sends `didClose` for that URI so the server can free memory. **Config:** Optional cap (e.g. max 50 open docs per server) in Settings. |
| **Large workspace at init** | **Client:** At initialize, send only roots that have at least one open document, capped at 10 (§7, §14.6). **When:** During `initialize` request; do not send thousands of paths. |
| **didChange flood** | **Client:** Debounce `didChange` (default 100 ms after last edit; §7, §14.4). When server supports incremental sync, send only `contentChanges`; otherwise full content. **When:** On every buffer edit, start/reset debounce timer; on timer fire, send one `didChange`. |
| **Symbol index staleness (without LSP)** | **FileManager:** §12.2.7 covers invalidation for heuristic index. **When LSP present:** Diagnostics and symbols come from server. **When LSP disabled or unavailable:** Keep regex/heuristic symbol path (FileManager §12.1.4); optional install hint. **Client:** No action for index; fallback is editor/FileManager responsibility. |
| **TCP-only servers (e.g. Godot)** | **User:** Configures a **command** (e.g. `npx godot-lsp-stdio-bridge`) that speaks stdio to the app and TCP to the real server. **Client:** Spawn that command as the LSP server process; no change to client transport (stdio only). **Docs:** Document bridge pattern in user-facing docs; see §10. |

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

---

