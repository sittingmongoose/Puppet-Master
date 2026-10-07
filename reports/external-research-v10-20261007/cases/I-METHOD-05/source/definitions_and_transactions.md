### Definitions

- **Buffer:** In-memory representation of a file's content; one per file path. Edits apply to the buffer until Save.
- **Tab:** UI handle for an open buffer; one tab per path per editor group (no duplicate tabs for same path in one group).
- **Editor group:** One pane in a split editor layout; has its own tab list and active tab; shares the global buffer model.
- **Dirty:** Buffer state when in-memory content differs from last-saved content; UI shows unsaved indicator.
- **Preset:** Language/framework configuration (e.g. Rust, Python) that defines run/debug configs and tools (§11).
- **redb:** Durable key-value store for settings, sessions, project state, and editor state (see rewrite-tie-in-memo).
- **seglog:** Canonical append-only event ledger; optional editor lifecycle events for analytics (see project storage design).
- **FileSafe:** Patch/apply/verify pipeline and guards for agent edits; see Plans/FileSafe.md.

### Buffer transaction model

The editor buffer transaction model is explicit: user edits, preview edits, agent writes, FileSafe/LSP edits, restore/revert actions, and recovery replay all enter the shared buffer through typed transaction sources before dirty state, undo grouping, and save authority are updated.

- User edits and preview edits create ordinary buffer-local undo groups and dirty state unless the target is read-only, write-locked, or owned by an active recovery replay.
- Agent writes and FileSafe/LSP edits use FileSafe-backed mutation paths and must record whether they replace, patch, format, rename, or apply a code action. They do not silently merge into the user's current undo group.
- Restore/revert actions and recovery replay are explicit transaction sources with confirmation or recovery context; they may refresh the buffer from durable state, clear or replace dirty state only after the owner confirms the applied version, and must explain what happened to undo history.
- Save authority remains single-owner per file path: one shared buffer, one dirty flag, one last-saved version, and one authoritative save/retry path across split panes, preview surfaces, LSP apply-edit, and agent mutation flows.
- Text mutation sources include user typing and `/paste/delete`, preview-generated bounded source patches, FileSafe/LSP apply-edit paths, backend-owned restore or `/revert/history` refreshes, on-disk-change resolution, and agent write-stream updates for generated files. They all route through the shared buffer authority and may not create independent restore points, alternate dirty branches, bypass save/retry authority, or weaken required recover-unsaved handling on `/quit` and `/later`; legacy `unsaved-content` wording maps to that recovery contract.
- Layered change history is not one generic recovery bucket. Buffer-local history owns ordinary per-buffer `/undo` and `/redo`; user-visible restore history owns `Restore to… / History`, rollback, and `revert-last-agent-edit` through a user-confirmed backend-owned restore flow; git/source-control history owns `/revert/discard/stash`, `/history/graph`, staged, `/unstaged/conflicted`, and worktree compare/revert/discard semantics; runtime safe points remain `/internal` `/blocked` recovery anchors and are not restore points.
- Preview-generated, preview-originated, and preview-applied source patches plus single-file FileSafe/LSP `/apply-edit/conflict` operations may enter buffer-history as one coherent single-buffer undo group only when they mutate the open source-buffer in place. Multi-file apply-edit, rename, hunk-level patch-apply, repo/worktree restore, and conflict-resolution flows route through the broader `/diff`, `/review/FileSafe`, or source-control transaction model and MUST NOT masquerade as ordinary editor undo.
- Single-file assistant mutation batches produce one logical undo group for that file; multi-file assistant mutation batches produce one thread/run receipt and one undo group per affected file buffer while preserving multi-group shared-buffer semantics. Editor Ctrl+Z never becomes cross-file global undo. Hunk-level stage, unstage, discard, and `/stages` changes are git mutations; conflict-resolution buttons such as `accept ours`, `accept theirs`, and `accept both` are structured edits to the result buffer until final resolve/stage, after which the stage is source-control history.
- FileManager treats the editor as a shared-buffer, source-canonical workspace: file tree opens and `/targets` buffers, preview surfaces derive from buffers and return bounded patches, and diff/review surfaces compare or mutate buffers without becoming separate authorities. Remote `/SSH` changes the authority `/source-of-truth` and capability model, not the conceptual buffer contract.
- The editor adapter must treat accessibility, IME, selection, caret, clipboard, cursor drift, paste behavior, `/editor-wrapper` limitations, and input correctness as acceptance-criteria-level behavior. Requested-vs-effective modes include normal editable, truncated read-only with load-full, blocked too-large, binary read-only, decode-failed read-only, disk read-only, and visible `/degraded` reasons.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

---

