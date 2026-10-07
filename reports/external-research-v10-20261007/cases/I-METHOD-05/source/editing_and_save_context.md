### 2.2 Editing and saving

- **Editable content:** Opened files are editable (not read-only preview). User edits update one shared authoritative buffer per file path.
- **Save:** Save writes the current buffer to the file path. On success, dirty state clears and the user sees explicit success feedback. On failure (disk full, permission denied, path deleted, read-only file, disconnected remote destination), the buffer stays dirty, last-saved state does not advance, and the user gets visible recovery actions such as `Retry` and optional `Save As`.
- **Unsaved indicator:** Each tab shows unsaved state, and at least one other stable shell location must also surface that state so it remains visible when the tab strip is crowded.
- Editor tab `/chrome` and secondary state-feedback surfaces show dirty, conflicted, read-only `/degraded`, change-marker, write-lock, stale-disk, changed-on-disk, transient `/save/reload` failure, and recovery attention as orthogonal facts rather than a `/vague` flat status. Save is explicit in MVP, save failure leaves dirty state intact with retry, `save-as`, and reason, and backend-owned `/recovery/history` refreshes buffers through events such as `BufferReverted` / `BufferReverted(path)`. OpenFile callers from `/chat/file-tree/quick-open` converge on the same file-open path, and changed-on-disk prompts include a `Show diff` path.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/FinalGUISpec.md

- **Revert:** `Revert` reloads from disk. `Revert last agent edit` is a chat-owned restore action that routes through `cmd.chat.revert`; the editor never fabricates the revert itself.
- **Revert last agent edit contract:** When `target_message_id` is omitted, the backend resolves it to the latest assistant turn in the active thread that produced persisted file mutations. This is a chat-owned turn-level restore action: if that turn touched multiple files, the revert applies to the whole turn across all affected files, while per-file restore remains in editor/history surfaces. After revert, the backend emits a refresh notification and the editor reloads the affected buffers.
- **Restore to… / History:** The editor and document pane fetch restore points from the backend store and invoke the same restore pipeline; neither surface stores or manufactures restore points independently.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/FileSafe.md

- **Recover unsaved (required MVP):** Unsaved-buffer recovery is required for both local and remote-backed buffers.
- Recovery snapshots represent local unsaved buffer state only; they do not imply that a remote write succeeded.
- For recovered remote-backed buffers, the banner copy is: `Recovered local edits — remote destination not yet synchronized`.
- A recovered remote-backed buffer must reconnect or revalidate the destination before save/flush can claim success.
- Remote editing is MVP scope for FileManager buffers and save/recovery flows. Remote terminal and `/run-debug` execution are deferred or optional runtime-surface capabilities, so FileManager must not promise terminal/run-debug availability merely because a remote-backed file can be edited.
- `recover-unsaved` is required MVP behavior for local and remote-backed buffers. The recovered-remote state represents local unsaved buffer memory only; it never claims that remote save/flush succeeded until reconnect and destination revalidation pass.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 2.2.1 Remote/offline cached-file wording

The File Manager/editor owns the cached-file-only offline editing affordance. The visible action label is `Work offline (cached files only)` whenever the user can open or keep editing only files that already have a validated local cache or snapshot. `Work offline (cached)` is a legacy shorthand that may appear only in migration aliases, telemetry lineage, or compatibility notes; live UI copy must not alternate between the two labels.

If no cached file snapshot exists, disable the offline action or show a no-cached-files state instead of implying a full-project offline mode. When remote connectivity returns, reconnect or revalidate before save/flush claims remote success.

Remote `/offline` and remote-degraded editor-state use explicit user-visible `/states`: host connected, `Remote host reconnecting`, `Remote host unavailable`, `Pending remote write`, and `Remote file is read-only`. While reconnecting, the editor preserves visible context and buffers but blocks operations that require confirmed remote round-trips unless they explicitly queue. When disconnected, remote file listings, `/searches/diffs`, git, shell, LSP, and file writes must show unavailable or pending write state instead of pretending-to-be-live behavior.

