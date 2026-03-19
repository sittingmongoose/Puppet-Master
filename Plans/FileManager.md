# File Manager & IDE-style Editor -- Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary

- 2026-02-25: Added §13 Git Status Integration — repo-aware file tree overlays and Git panel strip; cross-references Plans/GitHub_Integration.md.

**Date:** 2026-02-20  
**Status:** Plan document  
**Cross-references:** Plans/assistant-chat-design.md (§9, §4.1, §13), Plans/Composergui5-concept.html (§5, §8 layout), Plans/feature-list.md, AGENTS.md (DRY Method)
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/Tools.md`, `Plans/LSPSupport.md`.

**ELI5/Expert copy alignment:** Authored tooltip/help/hint copy defined by this plan must provide both Expert and ELI5 variants and follow the single checklist in `Plans/FinalGUISpec.md` §7.4.0. Dynamic external payloads (for example live LSP hover content) are not treated as authored copy variants.

---

## Summary

The app provides a **File Manager** (pop-out side panel), an **in-app IDE-style editor** (File Editor strip), and **@ mention in chat** for file context. File Manager and editor share the same project context; chat integrates via @ mention and **click-to-open** so file paths and code blocks in the thread open in the editor. Full behavior and MVP scope are defined below.

This plan also covers **image viewing** and **HTML-in-browser preview with hot reload**; **split editor panes**; **drag editor out to its own window and back** (detach/snap); **tabs** in the editor and Terminal and **browser tabs plus detached preview windows**; **language/framework presets**; and the editor enhancement set. **LSP (Language Server Protocol) is in scope for MVP**: diagnostics, hover, autocomplete, go-to-definition, and symbol search use language servers when available for the current preset; see **§10.10**. Full LSP integration in the **Chat Window** remains in **Plans/LSPSupport.md §5.1** and **Plans/assistant-chat-design.md §9.1**.

**Scope of this document:** This spec defines File Manager, editor, @ mention, click-to-open, image/HTML preview, tabs, and editor enhancements. It defers chat UX details to `Plans/assistant-chat-design.md`, layout to `Plans/FinalGUISpec.md`, and browser click-to-context / agent-driven browser actions to the promoted browser owner in `Plans/Section15_MVP_Promoted_Features_Spec.md` plus the reconciled browser chat, prompt, permission, and storage docs. Storage terms (`redb`, `seglog`, project storage design) are defined in rewrite-tie-in and storage-plan docs.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### Definitions

- **Buffer:** In-memory representation of a file's content; one per file path. Edits apply to the buffer until Save.
- **Tab:** UI handle for an open buffer; one tab per path per editor group (no duplicate tabs for same path in one group).
- **Editor group:** One pane in a split editor layout; has its own tab list and active tab; shares the global buffer model.
- **Dirty:** Buffer state when in-memory content differs from last-saved content; UI shows unsaved indicator.
- **Preset:** Language/framework configuration (e.g. Rust, Python) that defines run/debug configs and tools (§11).
- **redb:** Durable key-value store for settings, sessions, project state, and editor state (see rewrite-tie-in-memo).
- **seglog:** Canonical append-only event ledger; optional editor lifecycle events for analytics (see project storage design).
- **FileSafe:** Patch/apply/verify pipeline and guards for agent edits; see Plans/FileSafe.md.

---

## Table of Contents

1. [File Manager panel](#1-file-manager-panel)  
    - [1.1 Drag and drop (external ↔ File Manager)](#11-drag-and-drop-external--file-manager)
2. [In-app IDE-style editor (MVP)](#2-in-app-ide-style-editor-mvp)
3. [@ mention in chat](#3-mention-in-chat)
4. [Integration: File Manager, editor, and chat](#4-integration-file-manager-editor-and-chat)  
    - [4.1 Open-file contract](#41-open-file-contract)
5. [Click-to-open from chat](#5-click-to-open-from-chat)
6. [Out of scope](#6-out-of-scope)
7. [Edge cases](#7-edge-cases)
8. [Image viewer and HTML preview](#8-image-viewer-and-html-preview)
9. [Tabs: Editor, Terminal, Browser](#9-tabs-editor-terminal-browser)
10. [Editor enhancements (MVP)](#10-editor-enhancements-mvp)  
    - [10.10 LSP support (MVP)](#1010-lsp-support-mvp)  
    - [10.10.5 LSP features (MVP) -- editing and refactor](#10105-lsp-features-mvp--editing-and-refactor)  
    - [10.10.6 LSP features (MVP) -- navigation and search](#10106-lsp-features-mvp--navigation-and-search)  
    - [10.10.7 LSP features (MVP) -- display and editing UX](#10107-lsp-features-mvp--display-and-editing-ux)  
    - [10.10.8 LSP and chat/agent integration (MVP)](#10108-lsp-and-chatagent-integration-mvp)
11. [Language/framework presets](#11-languageframework-presets)
12. [Gaps, potential problems, and enhancements](#12-gaps-potential-problems-and-enhancements)  
    - [12.4 Suggested additions](#124-suggested-additions-consider-for-file-manager-and-editor)  
    - [12.5 Implementation plan checklist](#125-implementation-plan-checklist)  
    - [12.6 Multi-agent review](#126-multi-agent-review--addressed-in-main-body)

---

## 1. File Manager panel

**Done when:** (1) Tree lists all project files under root; (2) Selecting a file opens it in the editor via §4.1; (3) Virtualized tree handles 10k+ rows without freezing; (4) Expand/collapse state restores per project on reopen. **Error handling:** **Open failed** -- If opening the selected file fails (permission denied, not found, too large), show "Open failed" with brief reason in status or toast; do not leave tree in inconsistent state. **Refresh failure** -- If directory read fails (e.g. permission), show error on that node and optionally "Retry." **Edge cases:** **Empty project** -- Show "No files" or project root only; no crash. **No permission on subfolder** -- Show node but mark or filter; AutoDecision: show node as inaccessible and do not enumerate children. **Expand/collapse persistence:** Redb key e.g. `file_manager/expanded/{project_id}` → list of expanded path prefixes or node ids (§2.9). **Requires** §4.1 open-file contract before "select file opens it"; requires project context (project root). **Settings:** **Hide ignored** (toggle): Settings → File Manager (or header); default off (ignored dimmed); persist in redb. **Row cap per directory:** AutoDecision: default 10_000 entries; configurable; persist in redb key `file_manager/row_cap_per_directory`.

ContractRef: Plans/Decision_Policy.md, Plans/storage-plan.md §2.3, Plans/Tools.md §2.5

- **Placement:** Pop-out side window (like the chat pop-out), default left. Per Composergui5 §5 and feature-list layout: header ("FILES"), refresh, pop-out; search; virtualized file tree; optional Git status strip.
- **Virtualized file tree:** Only visible nodes are rendered; scroll position determines which slice of the tree is shown. Total height uses an estimated row height (AutoDecision: `row_height_px = 24`) so the scrollbar is correct. Supports deep trees; **very large directories** (e.g. node_modules): virtualize by row, apply a row cap per directory (AutoDecision: 10_000 entries; key `file_manager/row_cap_per_directory`) with "Show more" or type-ahead to narrow; AutoDecision: no explicit depth limit (children are loaded lazily on expand).
- **Behavior:** Lists all files in the current project. **Selecting a file opens it in the in-app IDE-style editor** (§2). File Manager and editor share the same project context.
- **.gitignore / exclude:** File tree respects `.gitignore` (and optionally a project exclude list). Ignored files/folders are **dimmed** by default. Optional user setting **"Hide ignored"** hides them entirely (toggle in header or Settings).
- **Context menu:** New file, New folder (in selected directory, with name prompt); Rename; Delete (with confirmation); Copy full path to clipboard. Aligns with selectable labels and context menus (AGENTS.md).
- **Drag and drop (external ↔ File Manager):** User can **drop** files/folders from the desktop (or another app) **onto** a folder or project root in the tree (items are copied into that folder), and **drag** files/folders **out** of the tree onto the desktop or another app (copied to drop target). Copy is default; optional modifier for move. Full specification: **§1.1**.
- **Expand/collapse persistence:** Which folders are expanded is persisted per project (e.g. in redb under project key); restore on reopen.
- **Keyboard:** Arrow keys navigate the tree; Enter opens the selected file (or expands/collapses folders). Type-ahead (or search) narrows to matching nodes. Keyboard-only use must be supported for accessibility.
- **Current file ("you are here"):** When the editor has focus, optionally highlight and scroll the File Manager tree to the current file so the two surfaces stay visually connected.
- **Detach/snap:** Same detach and snap behavior as Chat panel; user can dock left or right. **Discoverability:** Provide a visible affordance (e.g. drag handle or "Pop out" in header) and optional first-time tooltip so users learn that the panel can be detached.

### 1.1 Drag and drop (external ↔ File Manager)

**Done when:** Drop onto folder copies files and tree refreshes; drag out provides URIs; copy/move modifier documented; name conflict dialog or setting works; progress shown for large drops; security checks reject paths outside project.

ContractRef: Plans/Tools.md §2.5, Plans/FileSafe.md

Users can move files between the project and the rest of the system by dragging: **drop onto** the File Manager tree (from desktop or another app) and **drag out of** the tree (to desktop or another app). This section specifies behavior, how we implement it, gaps, potential problems, and enhancements.

#### 1.1.1 Behavior summary

- **Drop onto File Manager:** Drag one or more files or folders from the **desktop**, **file picker**, or **another application** and drop them onto a **folder row** or the **project root** in the File Manager tree. The dropped items are **copied** into that folder (the drop target). The tree refreshes (or invalidates) so the new items appear; if the target folder was collapsed, optionally expand it and scroll to show the new items.
- **Drag out of File Manager:** Drag one or more files or folders from the File Manager tree and drop them onto the **desktop**, a **folder in the OS**, or **another application** (e.g. email client, file picker). The items are **copied** to the drop target. The source files in the project are unchanged unless the user explicitly used a "move" modifier (see below).
- **Copy vs move:** **Default is copy** for both directions (safe, no accidental removal). AutoDecision: **Shift** modifier triggers **move** (copy then delete source on success) for both directions. If move fails after copy (e.g. target OK but source delete failed), leave both in place and show an error; do not leave a half-moved state.
- **Valid drop targets (drop onto tree):** Only **folder** nodes and the **project root** row accept drops. Dropping onto a **file** row does nothing (or is ignored). The drop target is the **folder** that contains the row the user dropped on; if the user drops on the project root row, the target is the project root directory.
- **Multi-selection:** User can drag multiple selected items (if the tree supports multi-select). All selected items are copied/moved to the single drop target. AutoDecision: operation order is lexicographic by normalized source path; name conflicts are handled per item (see below).

#### 1.1.2 How we're going to do it

**Platform drag-and-drop APIs:** Use the host platform's D&D mechanism so the OS handles cross-app drag (e.g. desktop ↔ app).

- **Windows:** Implement `IDropTarget` (or the UI framework's drop target) on the tree control; accept `CF_HDROP` for file drops. For **drag out**, use `DoDragDrop` with `CF_HDROP` and provide the project file paths (or a shell data object with file paths). Slint / winit may expose higher-level APIs; use those if available so we don't hand-roll COM.
- **macOS:** Use `NSView` / `NSDraggingDestination` for drop; `NSDraggingSource` for drag out. Pasteboard type `NSPasteboardTypeFileURL` (or `NSFilenamesPboardType`). Provide file URLs for the project paths when dragging out.
- **Linux:** Use Xdnd (X11) or the Wayland drag-and-drop protocol. Accept `text/uri-list` for incoming drops (decode file:// URIs to paths). For drag out, offer `text/uri-list` with file:// URIs for the selected project paths.

If the UI stack (e.g. Slint) provides a **unified drag-drop API** that abstracts these, use it and document which formats we register (file list / URI list). Fallback: if the framework only supports in-app D&D, we can still implement **drop onto tree** by accepting the platform's file-drop format when the drag originates outside the app; **drag out** may require framework or OS support for exporting file URIs.

**Resolving the drop target:** On drop, we have (a) the **drop location** (e.g. row index or node id under the tree) and (b) the **project root path**. Map the drop location to a **target directory path**: if the row is the project root, target = project root path; if the row is a folder, target = that folder's full path (we must store or compute full path for each tree node). **Normalize** the target path (e.g. canonicalize) and **validate** that it is under the project root (see Security below). If validation fails, reject the drop and show a brief message (e.g. "Invalid drop target").

**Copy implementation:** For **drop onto tree:** For each source path from the OS D&D payload, copy the file or directory (recursively) into the target directory. Single-file drops without conflicts may execute immediately; multi-file and directory drops should run a short preflight first so conflicts and invalid targets are discovered before copying begins. Use a single **copy** operation (e.g. Rust `std::fs` or a crate that preserves permissions/timestamps if required). For **drag out:** The OS or target app performs the copy when it receives the file list/URIs; we only provide the paths. For **move:** After a successful copy, delete the source; if delete fails, report the error and do not remove the source.

**Name conflicts:** When the target directory already contains a file or folder with the same name:

1. **Option A (default):** Show a **dialog** per conflict (or one dialog with a list): "File already exists: {name}. **Overwrite** / **Keep both** (rename to e.g. name (1)) / **Cancel**." If "Keep both," generate a unique name (e.g. append (1), (2) until free). If "Cancel," AutoDecision: abort the whole drop before copying any items (preflight conflicts).
2. **Option B (setting):** Add a **Settings → File Manager** option: "When dropping, if name exists" → **Always ask** | **Always overwrite** | **Always keep both (rename)**. "Always ask" uses the dialog above; the other two avoid the dialog for batch drops.

**Progress and feedback:** For **large** drops (e.g. many files or one large folder), show a **progress indicator** (e.g. "Copying 3 of 50..." or a progress bar) so the UI doesn't appear frozen. Run the copy on a **background task** (e.g. tokio spawn or a thread); do not block the UI thread. On completion: **toast** "Copied N items to {folder}" or "Dropped N items into project." On **error**: toast or dialog with the error (e.g. "Permission denied for ...") and optionally "Retry" / "Skip" for multi-item.

**Visual feedback:** During drag-over-tree: **highlight** the drop target row (e.g. background color or border) so the user knows where the drop will go. Use a **cursor** or **drag image** that indicates copy vs move when the modifier is held (e.g. plus icon for copy, arrow for move) if the platform supports it.

#### 1.1.3 Gaps and how we address them

| Gap | Addressed how |
|-----|----------------|
| **Drop target when tree is scrolled** | The drop target is the **row under the cursor** at drop time, not the "selected" row. Tree must hit-test the cursor to the correct row (folder or root) when the drop occurs. |
| **Symlinks** | When **copying in**, AutoDecision: copy the symlink as a symlink (do not resolve). When **copying out**, the OS typically resolves; we provide the path. When **moving out**, deleting the source removes the symlink, not the target. |
| **Read-only or locked files** | If copy or delete (move) fails because the file is read-only or locked, show the error and do not overwrite. Optionally offer "Try again" or "Skip." |
| **Very long path** | If the resulting path exceeds OS limits (e.g. 260 chars on Windows), fail with a clear message ("Path too long") and suggest moving the project or shortening names. |
| **Drag from within the same project** | Default to **copy within project** so external drag/drop and in-project drag/drop share the same conflict model. Holding **Shift** switches the operation to **move within project** (copy then delete source). Same rules as external drop; no special case unless we add "reorder" semantics later. |
| **Accessibility** | Keyboard alternative: e.g. "Paste from clipboard" (paste files from clipboard into selected folder) and "Copy path to clipboard" (so user can paste elsewhere). Screen reader: announce "Drop target: {folder path}" when hovering over a valid target. |

#### 1.1.4 Potential problems and solutions

| Problem | Solution |
|---------|----------|
| **Security: dropping outside project** | When **dropping onto** the tree, resolve the drop target to an **absolute path** and check that it is **under the project root** (e.g. `target.starts_with(project_root)` with normalized paths). If not (e.g. path traversal), **reject** the drop and do not write anywhere. Never write to paths outside the project for this feature. |
| **Security: drag out exposes sensitive paths** | When **dragging out**, we only expose **paths under the current project**. The user is explicitly moving project files; no other app state (e.g. config, tokens) is included in the D&D payload. |
| **Large drop blocks UI** | Run copy (and optional move) in a **background task**; show progress and allow cancel. Do not block the main thread or the tree UI. |
| **Partial failure (multi-item drop)** | If one of N items fails (e.g. permission denied), **continue** with the rest; at the end show a summary: "Copied N-1 items. Failed: {path} -- {reason}." Optionally "Retry failed" to retry only the failed items. |
| **Tree refresh after drop** | After a successful drop, **refresh** the target folder in the tree (e.g. re-read directory or invalidate cache) so the new items appear. If the tree uses a watcher (§10.7), the watcher may already fire; otherwise trigger an explicit refresh for the target path. |
| **Floating/detached File Manager** | When the File Manager is in a **floating** window, D&D must still work: the floating window receives drag/drop events. Use the same drop-target and copy logic; ensure the window has a window handle that participates in the OS D&D. |
| **Drop onto expanded-but-empty folder** | An empty folder is still a valid drop target; copy creates the first file(s) there. No special case. |

#### 1.1.5 Enhancements

- **Drag to reorder within tree:** Allow dragging a file/folder to a different folder in the **same** tree to move it (reorder). Same security (target must be under project root); implement as move within project. Optional for MVP.
- **"Move" as default on same filesystem:** When source and target are on the same volume, some UIs default to move (faster). We keep **copy** as default for safety; the modifier for move remains optional.
- **Undo:** After a drop (copy or move), optionally offer "Undo" in the toast so the user can revert (e.g. delete the copied files or move back). Requires tracking the last drop operation; optional for MVP.
- **Settings:** Expose "Default action for drop: Copy / Move" and "When name exists: Ask / Overwrite / Keep both (rename)" in Settings → File Manager so power users can avoid dialogs.

---

## 2. In-app IDE-style editor (MVP)

The app includes an **IDE-style editor** so users can open, view, and edit project files without leaving the app. The editor is the **target for all "open file" actions** from the File Manager and from chat (files touched, activity "Read:" / "Edited:", code blocks).

**Done when:** (1) Open file from §4.1 adds/switches tab and optional line/range; (2) Save writes buffer and clears dirty; (3) Dirty + read-only states visible; (4) Large file threshold and hard cap enforced; (5) Transient UI states (Loading, File not found, etc.) shown consistently. **Open failure:** If load fails (permission, not found, decode error), show placeholder/tab with state message and "Retry" or "Close"; do not open empty tab without message. **Edge cases:** **Empty file (0 bytes):** Open as empty buffer; editable; save writes empty file. **Path:** Store path in canonical form so same file never has two buffers. **Requires** §4.1 open-file contract first; §2.4 split groups depend on §2.5 buffer model. **Scroll/cursor value shape:** e.g. `{ line, column, scroll_y }`; document in storage-plan or §2.9. **Settings:** Go to line highlight duration: Settings → Editor; default 5 s; key e.g. `editor/highlight_duration_ms`.

### 2.1 Placement and layout

- **Location:** File Editor strip (center-left between File Manager and Dashboard), per Composergui5 §8 and feature-list layout. When the File Manager or Chat panel is the focus, "open file" actions open or focus the editor and show the file there. The strip is **collapsible** (per feature-list); when collapsed and the user triggers "open file" from chat or File Manager, the editor **focuses and expands** so the file is visible. **Collapsed state** is persisted **per-project** (in redb); restore on reopen and when snapping the editor back.
- **Drag out / drag back:** The user can **drag the editor** (or an editor group) **out** of the main application into **its own window**, and **drag it back in** to re-dock. Same detach/snap pattern as File Manager and Chat: undock by drag or "Pop out" action; floating editor window shows the same tabs and content; snap zones (e.g. near main window edge) with visual cue when dragging back; close floating window to re-dock (collapsed or last dock position). Buffers and tabs stay in sync whether the editor is docked or floating. **Floating editor policy (MVP):** Exactly **one** floating editor window is supported; AutoDecision: when the user drags out again, re-dock the existing floating editor window and float the newly dragged group. **Discoverability:** Provide affordance (e.g. drag handle or "Pop out") and optional first-time tooltip so users learn that the editor can be detached.
- **Tabs:** Multiple open files are shown as **tabs** (or equivalent list). User can switch between open files, close a tab (with unsaved prompt if dirty), and reorder tabs if the design supports it (keyboard-accessible move tab left/right when reorder is supported). Persist open tab list per project so reopening the app restores the same set of open files (§2.9).

### 2.2 Editing and saving

- **Editable content:** Opened files are **editable** (not read-only preview). User can type, delete, and paste. Changes are tracked so the UI can show an unsaved (dirty) state.
- **Save:** **Save** writes the current buffer to the file path (overwrite). Keyboard shortcut (e.g. Ctrl+S). Optional: **Save As** to a new path. **Save success feedback:** On successful save, clear dirty state and show brief feedback (e.g. "Saved" toast or status bar message, or clear unsaved indicator); user must be able to see that save succeeded. **Save failure:** On write failure (disk full, permission denied, path deleted, read-only file), keep the buffer **dirty**, do **not** update "last saved" content, and show an **error message** with **Retry** and optional **Save As**; do not silently fail.
- **Unsaved indicator:** Each tab shows an unsaved indicator (e.g. dot or asterisk) when the buffer has unsaved changes. **Also** show unsaved state in at least one other stable place (e.g. window title or status bar) so it remains visible with many tabs or when the tab strip is scrolled. Closing a tab or switching project with unsaved changes prompts the user (Save / Discard / Cancel).
- **Revert:** Optional **Revert** (reload from disk) and **Revert last agent edit** (from Assistant chat thread; assistant-chat-design §13); can integrate with Git/restore points per newfeatures.md. **Revert last agent edit contract:** Triggered by user action from chat (or editor menu). Backend (FileSafe/chat) performs the revert (e.g. Git restore); then the backend sends a **refresh notification** to the editor for that path (e.g. `BufferReverted(path)` or equivalent). The editor reloads that buffer from disk and updates the view; the editor does not perform the revert itself. See Plans/FileSafe.md.
- **"Restore to…" / History (editor context menu):** The document pane (or editor context menu) offers a **"Restore to…"** or **"History"** action that lists restore points for the current file or session. The list is fetched from the **backend** (redb query — single source of truth; see Plans/newfeatures.md §8 and Plans/storage-plan.md). On user selection and confirm, the app runs the same restore pipeline as "revert last agent edit" / §8 rollback (conflict check, confirmation, file write-back), then sends a `BufferReverted(path)` refresh notification so the editor reloads the affected buffer(s) from disk. The editor does **not** store or create restore points; it only invokes the backend and refreshes. This aligns with Crosswalk §3.11 (`Primitive:DocumentCheckpoint`) and the shared-buffer contract in §2.4.1.

### 2.3 Display and navigation

- **Line numbers:** Show **line numbers** in the gutter (toggle optional). Enables "go to line" and correlation with chat diffs (e.g. "Edited: path (lines 12-45)").
- **Go to line / range:** When opening from chat with **line or range information**, the editor **opens the file and scrolls to that line or range** and **highlights the range** (read-only highlight). **Line/range format:** 1-based, inclusive; e.g. single line `12` or range `12-45`. Chat and editor use the same format (e.g. "lines 12-45" or L12-L45). Highlight stays until the user edits or moves the cursor; **optional fade** after a **configurable delay** (AutoDecision: default 5 s; Settings → Editor). Command or action "Go to line..." (e.g. Ctrl+G) for manual jump. If the requested line is beyond the file length, **clamp to the last line** (and optionally show a brief "Clamped to line N" hint).
- **Syntax highlighting:** **Basic syntax highlighting** by language (inferred from file extension or shebang). Extension → language map for common types (e.g. `.rs`, `.py`, `.md`, `.json`, `.toml`, `.html`, `.css`, `.js`); shebang in first line for scripts. Unknown extension or plain text: no highlighting. Palette respects app theme (Retro Light/Dark, Basic); token→color mapping is app-owned. **When LSP is available** for the file's language (§10.10), **semantic highlighting** from the language server can augment or replace basic highlighting; basic highlighting remains the fallback when LSP is unavailable or for unsupported file types.

### 2.4 Split panes and editor groups

**Split editor panes** are in scope for MVP. The user can split the editor area into **multiple editor groups** (e.g. side-by-side or top/bottom). **Tab bar model (MVP):** Each group has **its own tab list** and active tab; the **buffer model is shared** -- one buffer per file path across all groups. Opening a file from File Manager or chat targets the **active (focused) editor group** by default; optional "Open in" (e.g. right-click) can offer "Open in other group" or "Open in new group." **Single buffer, multiple views:** When the same path is open in more than one editor group, all views show the **same buffer** and **same dirty state**; any edit in one group updates the other views immediately. Cursor/scroll position is per-view; only one "active" tab per group.

### 2.4.1 Embedded document pane shared-buffer contract

- The embedded document pane (wizard/interview) uses the same file buffer and history model as File Editor.
- If File Editor and document pane open the same path at the same time:
  - both views read/write one shared in-memory buffer,
  - one dirty state is authoritative,
  - save in either surface persists the same underlying artifact.
- There is one source of truth for save history and restore points; document pane does not create a separate history branch.
- Restore actions launched from document pane (checkpoint restore or revert-to-checkpoint) must call the same open-file and buffer-refresh pipeline.
- The "Restore to…" / "History" action is available from both the File Editor and the embedded document pane. Both surfaces query the backend store for the restore-point list and invoke the same restore pipeline; neither surface stores or manages restore points independently.

**Write-in-progress lock (required to prevent dueling edits):**
- When a document is in DocumentPane status `writing…` (actively being written by a generation/revision worker), that path is considered **write-locked** for user edits across GUI surfaces:
  - Embedded document pane shows the doc as **read-only** with status `writing…`.
  - File Editor, if the same path is open, must prevent user edits (or immediately revert local edits) and show an inline banner: `Locked: agent is writing this document` (optionally with a pointer to run controls).
- Streaming updates from the agent still apply to the shared buffer so the user can watch content evolve.
- Once the doc leaves `writing…`, the lock is released and both surfaces return to normal edit/save behavior.

**Note:** This lock is an interaction rule only; it does not create a separate buffer or history branch. The shared-buffer invariant remains intact.

### 2.4.1A Embedded document annotations and chat handoff boundary

The Embedded Document Pane shares document identity and buffer state with File Editor, but annotation and chat-handoff state remain adjacent review state rather than extra file buffers.

Rules:
- Durable annotations anchor to canonical source text in the shared buffer, not to rendered DOM state.
- Creating or resolving annotations does not create a second buffer, a second dirty flag, or a separate undo/history branch for the file itself.
- `Send selection to chat` creates thread-scoped composer-prep state and does not mutate the file buffer.
- If a selection was made against stale rendered state, mutating annotation creation must fail explicitly rather than silently rebase to a different span.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### 2.5 Data model and dirty state

- **Buffer model:** One buffer per file path; one tab per path per group (no duplicate tabs for same path in one group). The active tab is the current buffer. See §2.4 for same path in multiple groups. ContractRef: Plans/storage-plan.md §2.3, Plans/FileSafe.md
- **Dirty state:** A buffer is dirty when in-memory content differs from last-saved content (not necessarily on-disk). UI shows unsaved indicator per tab when dirty.
- **Revert (reload from disk):** Revert reloads current buffer from disk. If buffer is dirty, prompt "Discard unsaved changes and reload?" (Discard / Cancel). After reload, dirty state is cleared.
- **Revert last agent edit:** See §2.2 for the contract (backend reverts, sends refresh notification; editor reloads buffer). FileSafe: Plans/FileSafe.md.
- **File changed on disk:** When the file on disk has changed since the buffer was loaded or last saved, the editor prompts the user. **When to check:** On **Save** (before overwriting: prompt Reload / Overwrite / Cancel) and when the **editor pane or the file's tab gains focus** (app-global: when the user focuses any editor window or switches to that tab). Do not check on every keystroke. **Dirty + file changed on disk:** If the buffer is dirty and the file changed on disk, show **one combined prompt** (e.g. "File changed on disk. You have unsaved changes. Reload (discard yours) / Overwrite disk / Cancel") so the user gets a single decision; do not show two separate dialogs in sequence.

### 2.6 Text behavior, encoding, and file types

- **Undo/redo:** Per-buffer undo and redo; no cross-file undo. Standard shortcuts (e.g. Ctrl+Z / Ctrl+Shift+Z or Ctrl+Y).
- **Selection and clipboard:** Copy, Cut, Paste (keyboard and context menu). Paste uses system clipboard. Optionally normalize line endings on paste.
- **Word wrap:** Off by default for code; optional toggle.
- **Font:** Monospace; size and family follow app theme or editor font setting.
- **Encoding:** UTF-8 for editable text. If file cannot be decoded as UTF-8, open read-only with a clear message (e.g. "Cannot decode as UTF-8") and do not allow editing until the file is valid UTF-8 (e.g. user fixes externally and reverts).
- **Line endings:** Preserve on save (keep CRLF/LF/CR).
- **When content is written:** Only on explicit Save; no auto-save in MVP.
- **Binary files:** Read-only with a clear reason: e.g. "Binary file -- cannot edit." Hex view out of scope for MVP.
- **Read-only files:** OS or Git read-only: show read-only indicator and **reason** (e.g. "Read-only on disk"); block Save; Save As allowed. **Read-only reason in UI:** Whenever a file is read-only, the UI must indicate **why**: e.g. "Binary file", "File too large", "Read-only on disk", "Cannot decode as UTF-8" (§2.7), so users are not confused.

### 2.7 Large files

- **Strategy (MVP):** Use **truncated view + "Load full file"** for files above the threshold. Open read-only with a truncated view (e.g. first N lines) and a "Load full file" control; if the user loads full, allow editing subject to the hard cap. Do not implement read-only virtualized editing in MVP unless needed.
- **Default threshold:** **10 000 lines** (primary metric for editor UX). Files above this are not loaded into an editable buffer by default; show truncated read-only view and "Load full file."
- **Hard cap:** Never load more than **5 MB** into a single buffer. Above 5 MB, show "File too large to edit" and offer "View read-only (truncated)" or "Open in system editor." Configurable in Settings → Editor: **Large file threshold (lines)** (e.g. 5k-50k) and **Hard cap (MB)** (e.g. 2-10); persist in redb.

### 2.8 Keyboard shortcuts

- **Editor shortcuts (when focus in editor):** Save (Ctrl+S), Close tab (Ctrl+W, with unsaved prompt), Go to line (Ctrl+G), Next tab (Ctrl+Tab), Previous tab (Ctrl+Shift+Tab). Save As via menu or command palette.
- **Focus rule:** When focus is in the editor (docked or floating), these shortcuts are handled by the editor; when focus is elsewhere, app/chat shortcuts apply. **Floating editor:** Editor shortcuts apply when **any editor window has OS focus** (docked or floating). So Ctrl+S in the floating editor window saves the current buffer. Open-file actions target the editor surface; when the editor is floating, focus the floating window and open the file there (§4, §5).

### 2.9 Persistence (open tabs)

- **Stored per project:** Open tab list (ordered paths), active tab index, and **scroll/cursor position per tab** (default: **persist**). Key: `project_id`. Persisted in **redb** (SSOT: Plans/storage-plan.md §2.3). **Editor state schema (redb):** Store in redb `editor` namespace per SSOT: `tabs.{project_id}` → ordered list of paths; `active_tab.{project_id}` → index; `scroll_cursor.{project_id}.{path_hash}` → optional scroll/cursor; `max_tabs` (app-level); and session-scoped view state under `session.{project_id}.{session_id}` when session-scoped view is used (§10.7). Do not persist full buffer content; recovery/unsaved content is separate (redb or temp).
- **Max tabs (GUI setting):** The app exposes a **Max editor tabs** (or **Max open tabs**) setting in the GUI (e.g. Settings → Editor). This caps how many tabs (buffers) are kept in memory; when exceeded, LRU eviction applies (§10.7). AutoDecision: default 25; user can increase or decrease. Stored with other app settings in redb.
- **Other editor-related state in redb:** Consider storing **editor layout** (split groups, active group, collapse state of File Editor strip) and **recent files** list (for quick open / @ mention) in the same redb schema (settings/sessions) so they persist per project and survive restart.
- **Restore order and lazy load:** On app start (or project open), restore the tab list and active tab index; **load only the active tab's buffer** immediately. Load other tab contents **on first switch** to that tab (lazy load). **Max persisted tab count:** **50**. Config: `editor.max_persisted_tabs`, default `50`, stored in redb. Drop oldest from persisted list if over cap.
- **Dirty buffers on exit:** On quit or project switch with unsaved changes, prompt Save / Discard / Cancel.
- **Recover unsaved (required):** On crash or quit-with-unsaved, offer restore from recovery store (redb or temp per **Plans/storage-plan.md**). Restore UI must be available from both File Editor and embedded document pane.

**Transient UI states:** The editor and File Manager must show clear, consistent states and copy for: **Loading...** (file open in progress); **Decoding...** (when applicable); **Cannot decode as UTF-8** (§2.6); **File not found** / **Deleted** (§7); **Binary file** (§2.6); **File too large** (§2.7); **Indexing...** (when building symbol index); **Open failed** (e.g. permission denied -- with brief reason). Use these in tabs, placeholders, or status so tests and UI stay consistent.

**Accessibility:** Support keyboard-only use for File Manager tree (§1), editor tabs, and dialogs. Provide visible focus indicators, logical focus order, and screen reader-friendly labels/ARIA where the UI stack allows. Respect reduced-motion preferences for animations if applicable. Detailed a11y requirements may live in a dedicated accessibility doc; this plan requires that editor and File Manager are not mouse-only.

---

## 3. @ mention in chat
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md

The `@` mention system is project-scoped and identity-preserving.

Rules:
- invoking `@` opens a picker rooted in the active project context
- sources may include recent files, modified files, folder navigation, and symbol-aware results when LSP data exists
- the inserted mention preserves the canonical file identity/path needed by prompt assembly and click-to-open behavior
- mentions work in Assistant and Interview chat surfaces
- when the referenced file is already open, mention navigation resolves to the existing editor state instead of opening duplicate buffers unnecessarily
## 4. Integration: File Manager, editor, and chat

- File Manager, editor, and chat share the **same project context**.
- @ mention resolution uses the same file list as the File Manager (single source of truth for "project files").
- **Clicking a file path or code block in chat opens the file in the editor**; see §5.

### 4.1 Open-file contract

Source-open behavior uses two canonical contracts.

### OpenFile
`OpenFile` remains the path-based editor open contract.

Required fields are:
- `path`
- `line?`
- `range?`
- `target_group?`

### OpenSubject
`OpenSubject` is the identity-native source-open contract.

Required fields are:
- `subject_id`
- `open_intent`

Rules:
- `subject_id` is closed to `doc:<document_id>` and `artifact:<artifact_id>`
- `OpenSubject` resolves to the best source realization, including `OpenFile` or a transient `generated://<artifact_id>` buffer
- `OpenSubject` is used for artifact-backed and generated subjects that do not have a stable workspace path
- `OpenFile` remains the canonical contract for real workspace documents

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Route/open rules:
- shell navigation uses `route_target`
- source realization uses `OpenSubject` or `OpenFile`
- `resume_url` is serialized transport only and does not replace the canonical route/open split

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

#### Thread context detail documents

The thread-scoped Context Detail Pane may be realized as a generated editor-tab document.

Rules:
- shell destination and focus are owned by `route_target`
- generated document realization for the Context Detail Pane uses the canonical `OpenSubject` path rather than raw-path guessing
- repeated opens for the same thread reuse the existing tab identity instead of opening duplicate tabs
- the implementation may back the tab with a generated document id rather than a workspace file path, but the route/open split remains canonical

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md
## 5. Click-to-open from chat

**Done when:** Click on path or code block in files-touched strip, activity line, or diff header opens file in editor at line/range when available; already-open file focuses existing tab. **Depends on** §4.1 and §2; chat only invokes open-file contract. **If file not found:** Open-file contract returns error; chat or editor shows brief message (e.g. "File not found").

When the user clicks a **file path** or **code block** in the Assistant (or Interview) chat thread, the app **opens that file in the in-app IDE-style editor** via the open-file contract (§4.1). This applies to:

- **Files-touched strip** (chat footer): each path with diff count (e.g. `src/main.rs` (+12 −3)); click opens the file in the editor. When the entry has line/range info, the editor opens at that location (assistant-chat-design §4.1).
- **Activity transparency:** "Read: path" and "Edited: path" (and "Edited: path (lines 12-45)"); click opens the file and, when line/range is known, scrolls to it.
- **Code block / diff header:** The filename (and optional +N −M) at the top of an inline code block or diff in the thread; click opens that file and, when the block has line/range information, scrolls to that line or range.

**Line/range:** Same 1-based inclusive format as §2.3 (e.g. lines 12-45). **Open already-open file:** If the file is already open in a tab (in any group), **focus that tab** (and switch to its group if needed); do not open a second tab for the same path. If line/range is provided, scroll to and highlight it in the existing tab. **Single behavior:** All such clicks open in the same editor; no separate "preview" vs "edit." Chat does not implement its own file viewer; it always targets the editor (this plan §2). **Discoverability:** Provide affordance that paths and code blocks are clickable (e.g. hover underline, cursor change, or first-time tooltip) so users learn the feature.

---

## 6. Out of scope

**MVP** in this plan means the **desktop build scope**: all features listed in §§1-11 are in scope for the initial desktop release unless marked optional. **LSP is in scope for MVP** (§10.10). There are no items explicitly out of scope for the current build beyond what is marked optional in the plan.

### Implementation order (summary)

Implement in roughly this order so that contracts and single sources of truth exist before features that depend on them:

1. **Open-file contract (§4.1)** -- Single request/response shape and one code path. Implement first; all "open file" callers use it.
2. **Editor core (§2)** -- Buffer model, tabs, save/revert, persistence schema (§2.9), transient UI states. Editor is the only target for open-file.
3. **File Manager (§1)** -- Tree, virtualization, expand/collapse; "select file" calls open-file contract. D&D (§1.1) can follow.
4. **Click-to-open (§5)** -- Chat and footer invoke open-file contract; no separate viewer.
5. **@ mention (§3)** -- Same file list as File Manager; UX details in assistant-chat-design.
6. **Presets (§11)** -- Detection and tool download; required for LSP server mapping and run/debug (§10.4).
7. **LSP lifecycle and core (§10.10.2, §10.10.1)** -- Start/stop server, protocol, editor integration; then §10.10.3-10.10.8 features.
8. **Editor enhancements (§10.1-10.9)** -- Search, layout, run/debug, watcher, review, etc.; many depend on §2 and §11; LSP features depend on §10.10.
9. **Image/HTML (§8)** and **Tabs for Terminal/Browser (§9)** -- Can be parallelized with editor work once layout and tab model exist.

**Critical path:** §4.1 → §2 → §1 and §5; then §11 → §10.10 → remaining §10.

---

## 7. Edge cases

- **File deleted on disk:** If the file was deleted externally, show a clear state (e.g. "File not found" or "Deleted") and offer to close the tab or reload from path if it reappears. **Broken/missing files list:** Provide a single place (e.g. list or badge in editor or status bar) that shows tabs with missing/deleted files, with bulk **Close all** or **Reload if present** so the user does not hunt through tabs.
- **File changed on disk:** See §2.5 (when to check, combined prompt with dirty).
- **No project selected:** File Manager and @ disabled; editor may show last project tabs or clear.
- **Project root moved/renamed:** Invalidate list and tabs; show File not found. **Detection:** AutoDecision: detect via failure on next I/O (e.g. read/save); no filesystem watcher in MVP.
- **Symlinks:** AutoDecision: show symlinks as a single node (do not follow during enumeration). Open-file contract validates that the resolved canonical path is still under the project root; otherwise reject open.
- **File replaced by directory (or vice versa) on disk:** If the path now refers to a directory (or was a directory and is now a file), on next open/save or refresh show a clear state (e.g. "Path is no longer a file") and offer to close the tab.
- **Editor floating and main window closed:** AutoDecision: closing the main window does not exit the app if a floating editor window exists; the app exits when the last window closes (or on explicit Quit).
- **Read-only and binary:** See §2.6 (and read-only reason in UI).
- **Large files:** See §2.7 (threshold, hard cap, truncated + "Load full file").
- **LSP and format/rename:** When LSP is in use, server crash or hang is handled per §10.10.4 (fallback, no editor crash). If format-on-save times out, save without formatting. If the file is renamed on disk (by LSP rename or externally), detect and prompt to save to new path or close. Symbol index staleness: see §12.2.7.

---

## 8. Image viewer and HTML preview

**§8.1 Done when:** Image file opens in image tab; zoom/fit work; unsupported format shows message (e.g. "Unsupported image format"). **Load failed / corrupt image:** Show placeholder with message; offer "Open in system viewer" or close tab. **§8.2 Done when:** HTML opens in browser; hot reload refreshes after debounce. **Local server or file URL failure:** If preview cannot load (e.g. CORS, invalid path), show error in browser panel and optional "Retry." **Hot-reload debounce key:** `app.editor.hot_reload_debounce_ms` (redb `settings` namespace; default 400). **Settings:** Dedicated image pane: Settings → Editor; default off (MVP: same tab area).

### 8.1 Image files

- **Opening images:** Selecting an image file in File Manager (or clicking image path in chat) opens it in an image viewer, not the text editor. Formats at minimum: PNG, JPEG, GIF, WebP, SVG (optionally BMP, ICO). Viewer shows image at sensible size (fit to pane or 1:1 with zoom).
- **Placement (MVP):** Image viewer uses the **same tab area as the editor** -- an image opens as a tab that shows the viewer instead of text. Switching tabs or opening a text file works as in §2. Optional setting (e.g. Settings → Editor) for **dedicated image pane** in a later release.
- **Behavior:** View only (no in-app pixel editing). Zoom in/out, fit-to-width/fit-to-pane. Optional: copy image to clipboard, open in system viewer.

### 8.2 HTML in browser and hot reload

### 8.2A Rewrite normalization for HTML/browser preview (2026-03-08)
HTML preview and browser preview use the canonical browser session-class model and the same PM browser runtime as the built-in browser feature.

Rules:
- `Open` keeps the file in source/editor mode
- `Open in Browser` opens the file in a `workspace_preview`
- `Open in Detached Browser` opens the file in a `detached_preview`
- split browser layout is a second-step layout action after opening, not a separate open command
- file-backed HTML preview is editor-tab-first rather than bottom-panel-first
- preview subject identity is not silently retargeted by over-cap behavior
- multiple browser tabs may render distinct preview subjects inside the shell
- preview restore is scoped by project and workspace tab
- auth and automation browser sessions do not become file-manager preview tabs automatically

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
### 8.3 Same browser surface as built-in browser and click-to-context

HTML preview uses the same built-in browser defined by the promoted browser owner spec rather than a separate WebView or a stale `newfeatures.md` authority path.

- local HTML preview, normal browsing, screenshots, console/network inspection, DevTools, and watchable browser testing all use the same PM browser runtime and session-class model
- `workspace_preview` and `detached_preview` cover normal file-backed HTML browsing
- `automation_session` covers watchable agent-driven browser testing and verification with separate ephemeral state by default
- `auth_session` covers PM-owned auth and provider/device flows without silently turning into a normal preview tab

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md

### 8.4 Click-to-context when viewing HTML

Click-to-context in HTML/browser mode is explicit and uses the same browser capture model as the main built-in browser.

- text selection uses `browser_selection_context`
- element pick uses `browser_element_context`
- capture creates removable composer chips and never silently submits a message
- when no writable active thread/composer exists, PM opens a new thread and places the chips there
- the default combined capture is context plus clipped screenshot; full-page combined capture remains explicit

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Boundary rules:
- the HTML/browser path remains separate from native document review selection handoff
- native document surfaces use `document_selection_context` and may support durable annotations only when deterministic source mapping exists
- browser/HTML click-to-context does not imply durable annotations or `Resubmit with Annotations` semantics
- capture privilege and source-mutation privilege remain separate even for workspace-backed HTML preview
- ordinary browsing clicks must not unexpectedly create or send chat context

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md

---

## 9. Tabs: Editor, Terminal, Browser

### 9A. Browser tab and detached preview normalization (2026-03-08)
The canonical browser container model is editor/workspace-tab-first for in-shell browsing.

Rules:
- in-shell normal browsing uses browser tabs in the editor/workspace surface, not a free-floating browser-instance pool
- detached preview/browser windows are first-class and outside the in-shell browser-tab cap
- bottom-panel browser hosting is not canonical behavior
- LRU browser-instance reuse is not canonical behavior
- when the browser cap is reached, the user gets an explicit choice or deterministic command failure; the app must not silently replace the current preview subject
- `automation_session` and `auth_session` are not counted as normal in-shell browser tabs

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
### 10.1 Editor UX (text/code)

- **Minimap:** Small overview of the file in the right gutter for quick scrolling and orientation (e.g. VS Code-style).
- **Breadcrumbs:** Path above or below the editor (e.g. `file > function > block`) for in-file navigation. **When LSP is available**, use **LSP document outline** for accurate breadcrumbs (§10.10); **otherwise** use a simple heuristic (e.g. indent-based regions plus brace matching).
- **Code folding:** Collapse/expand blocks (e.g. by braces or indent level). Configurable fold level and keyboard shortcuts.
- **Multi-cursor:** Multiple carets/selections (e.g. Alt+Click, add next occurrence of word). Parallel edits in one buffer.
- **Find in file / Replace:** In-editor find (and replace) with regex option, match count, next/previous. Optionally "find in all open files."
- **Comment toggle:** Shortcut to toggle line or block comment for the current language (e.g. `//` vs `/* */`).
- **Indent/outdent:** Increase/decrease indent (e.g. Tab / Shift+Tab); optional "indent to line" and language-aware behavior.
- **Duplicate line / Delete line:** Shortcuts to duplicate current line (above/below) or delete line without selecting.
- **Move line up/down:** Move current line (or selection) up or down without copy/paste.
- **Trim trailing whitespace:** Option to trim trailing spaces (and optionally blank lines at end of file) on save or on demand.
- **Render whitespace:** Optional display of spaces/tabs (e.g. dots and arrows) for debugging indentation.
- **Sticky scroll:** Keep current "scope" headers (e.g. function name or block start) visible at top of editor while scrolling.

### 10.2 Navigation and search

- **Powerful search and fuzzy search:** Global **search** that can target: **current (open) file**, **all open files**, **project files** (by path/name/content), and optionally **buffers** or **recent files**. **Default search scope:** Define a default (e.g. current file or project) and show a **visible scope indicator** in the search UI so users know what is being searched. **Fuzzy search** for file open and symbol/symbol-in-workspace (e.g. Ctrl+P for quick open, Ctrl+Shift+O for go to symbol). Search supports plain text and regex; results show line and context; jump to match on select.
- **Go to symbol:** Jump to symbol (function, class, etc.) in **current file** via list or dropdown. **When LSP is available**, use LSP `textDocument/documentSymbol` (§10.10); **otherwise** use regex-based outline (§12.1.4).
- **Go to definition:** **When LSP is available**, use LSP `textDocument/definition`; **otherwise** best-effort via grep or indexed search, open file and scroll to line (§10.10, §12.1.4).
- **Find symbol in workspace:** Search symbols across the project. **When LSP is available**, use LSP workspace symbols; **otherwise** text-based or lightweight index (§12.1.4). Open file and location on select.
- **Recent files:** List of recently opened (or recently edited) files for quick re-open; accessible from quick open or dedicated shortcut.
- **Quick open (Ctrl+P):** Fuzzy open file by path/name; can be unified with command palette (fuzzy commands + files).

### 10.3 Layout and display

- **Split editor:** Covered in §2.4 (multiple editor groups).
- **Zoom in/out:** Editor font zoom (e.g. Ctrl+Plus/Minus) without changing global theme font size.
- **Line wrap:** Toggle on/off (already in §2.6); easily discoverable in view menu or settings.
- **Rulers:** Optional vertical ruler(s) at configurable column(s) (e.g. 80, 120) for line length guidance.

### 10.4 JetBrains-style: run/debug and debugger

- **Run/debug from editor:** "Run" or "Debug" for current file or selected **run configuration** (e.g. `cargo run`, `python main.py`, `npm start`). Run configurations are **preset-driven** (§11) or user-defined; integrate with existing terminal/runner and project context.
- **Integrated debugger:** Breakpoints, step over/into/out, variables view, call stack. MVP supports at least one workflow per preset (e.g. Rust with LLDB, Python with debugpy, Node with inspector). Debugger UI (panes, controls) is in-scope; language-specific adapters may be bundled per preset.

### 10.5 Lapce-inspired: modal editing and remote development

- **Modal (Vim-like) editing:** Optional **modal editing** mode: normal/insert/visual modes and Vim-style keybindings (or configurable). Toggle in settings or command palette; applies to editor only. **Focus trap:** When modal mode is on, provide an explicit "focus next panel" / "focus command palette" shortcut (e.g. Ctrl+Shift+Z) so Tab does not leave the editor without user intent; supports accessibility and keyboard-only flow. See §12.2.4 for conflicts with app shortcuts.
- **Remote development (SSH):** Edit files on a **remote host** over SSH. Project can be **remote path** (e.g. `user@host:/path/to/project`). A small proxy or agent runs on the remote host; app uses same editor and file tree over the connection. If connection is lost, show "Connection lost" and offer **Reconnect** or **Work offline (cached)**; do not corrupt local state. Optional: run/debug and terminal also remote (see §12.2.3).

### 10.6 Cursor/agent-related

- **In-app browser + click-to-context:** Already in §8 and `Plans/Section15_MVP_Promoted_Features_Spec.md` §3.18.
- **Visual design sidebar:** Sidebar for the **HTML/preview** workflow: theme (light/dark), visual controls for CSS (shadow, opacity, borders, colors, dimensions, layout), drag-and-drop element rearrangement, component prop inspection. **One-click apply** changes from sidebar to code (e.g. update HTML/CSS in editor). Complements hot reload (§8.2).
- **Agent-driven browser actions:** The Assistant (or agent) can **drive the built-in browser**: navigate, click, type, scroll, take screenshots, read console/network. Same browser surface as §8; actions gated by tool policy and user permissions (assistant-chat-design). **Browser/Assistant boundary:** The interface (how chat/Assistant sends commands and receives results) and security constraints are defined in `Plans/Section15_MVP_Promoted_Features_Spec.md` §3.18 plus the reconciled chat/prompt/permission/storage browser docs; this plan assumes that boundary is implemented there.

### 10.7 OpenCode-inspired

- **Session-scoped view state:** Per-file view state (scroll, cursor, selected range) can be **session-scoped** as well as per-project. **Session** = chat thread (thread id) when in Assistant/Interview; optionally interview session id. State is keyed by `project_id` + `session_id`. When the user switches threads, **explicitly prompt:** e.g. "Restore N tabs from [thread name]?" with **Yes** / **No** / **Don't ask again** -- do not restore silently without user choice.
- **LRU content cache with eviction:** Limit in-memory open buffers by **size or count** with LRU eviction; the **max tabs** value (§2.9) is the cap. When reopening an evicted file, reload from disk. Prevents unbounded memory use with many open tabs.
- **File tree + watcher invalidation:** File Manager tree **invalidates or refreshes** when files change on disk (e.g. via filesystem watcher). Optional "watch" toggle; refresh on focus or manual refresh remains available.

### 10.8 Graphite-style (review and quality)

- **AI or rule-based code review:** Assistant (or dedicated review mode) can perform **automated code review** on demand or on commit/PR: logic bugs, security, style, documentation, accidental commits. Inline-style comments or a review panel; integrates with chat and file context.
- **Custom review rules:** User- or project-defined **review rules** (e.g. "flag TODOs," "require error handling here," "OWASP checklist"). Enforced during review runs or as optional editor hints (with or without LSP; LSP diagnostics can complement rules). **Canonical project file:** `.puppet-master/review-rules.yaml`. **App-level storage:** redb `review_rules/app`. Load order is app rules first, then project rules override or extend by rule id. Minimum rule fields: `id`, `description`, `severity`, optional `scopes`, and either a human-review prompt fragment or a machine-evaluable matcher. Invalid project YAML must surface a non-blocking warning and fall back to app rules instead of silently disabling review. See §12.1.9.
- **1-click apply suggestion:** In chat or in a review panel: **"Apply this change"** applies a suggested diff (e.g. agent suggestion or review fix) to the file in the editor. Reuses same apply/patch pipeline as agent edits (FileSafe, tool policy). See §12.2.8 for merge/conflict handling.

### 10.9 Additional editor features (MVP)

All of the following are **in scope for MVP**. Evaluate usefulness at implementation; some may be optional or simplified.

- **Recover unsaved buffers:** Required. On crash or quit-with-unsaved, offer to restore unsaved content from recovery store (redb or temp per Plans/storage-plan.md). Align with section 2.9.
- **Editor diff view:** Side-by-side or inline diff of two versions (e.g. buffer vs disk, or two branches); integrate with revert and review.
- **Snippets and templates:** User-defined or preset code snippets; expand on trigger (e.g. prefix or shortcut). MVP contract: support global snippets plus project overrides, TextMate-style placeholders (`${1:name}`, `$0`), autocomplete insertion, and an optional `Tab expands snippet prefix` setting. LSP completions flagged as snippets should reuse the same insertion pipeline.
- **Search in chat / search in messages:** Extend "powerful search" (§10.2) to include chat history and thread messages (content or metadata).
- **Breadcrumbs:** Use LSP document outline when LSP is available (§10.1, §10.10); otherwise use heuristics.
- **Per-preset keybinding schemes:** Optional keybinding profile per preset (e.g. VS Code vs Vim vs JetBrains-style) in addition to modal editing.
- **Editor theming:** User-selectable editor theme (beyond app theme) for syntax colors and editor background.
- **Minimap click-to-scroll:** Click on minimap to jump to that region of the file (common in IDEs).
- **Terminal replay / log:** Persist terminal output per tab for replay or copy after close; optional.

**Storage alignment:** Editor and panel state (open tabs, max tabs setting, layout, view state) are persisted in **redb** (§2.9 schema). Optional: editor **lifecycle events** (e.g. `FileOpened`, `FileClosed`, `TabSwitched`, `BufferSaved`, `BufferReverted`) can be written to **seglog** for analytics; projector pipeline can then index or roll up as needed. A minimal event set supports "revert last agent edit" (refresh after revert), analytics, and future features. **Confirm dialogs:** Standardize all confirmation prompts (Save/Discard/Cancel, Reload/Overwrite/Cancel, Discard unsaved and reload?, etc.) as one pattern: **message + optional "Show diff" + 2-3 buttons**; same UI component and accessibility behavior for all.

### 10.10 LSP support (MVP)
MVP editor LSP behavior follows Plans/LSPSupport.md and must not redefine conflicting defaults here.

Canonical File Manager alignment:
- app-level LSP config lives at `config.lsp`
- project override lives at `.puppet-master/lsp.json`
- merge rule is app config first, project override second; scalar/object keys override, arrays replace, absent keys inherit
- defaults are `didChangeDebounceMs=100`, `hoverTimeoutMs=5000`, `completionTimeoutMs=5000`, `workspaceSymbolTimeoutMs=10000`, `hoverDelayMs=300`, `workspaceFolders` cap = 10 active roots
- completion uses server trigger characters when provided, otherwise normal typing plus manual invocation
- inlay hints refresh on document open and after debounced edits
- rename / code actions / `workspace/applyEdit` use the FileSafe-backed apply-edit path and do not bypass mutation safety rules

This section is intentionally a consumer summary. Policy ownership remains in Plans/LSPSupport.md.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md
### 12.1 Gaps (missing or underspecified)

#### 12.1.1 Click-to-open when editor is floating

**Decision:** When the editor is floating, open-file actions focus the floating editor window and open the file there.

**Solution:** Treat the editor as a single logical surface regardless of dock state. (1) **Open-file action** always targets that surface: if the editor is docked, open in the docked editor; if it's floating, **focus the floating window** and open the file there (add tab or switch to existing tab). (2) App state holds one "editor instance" (tabs, active group, dock state); the UI that renders it (main layout vs floating Window) is a view over the same state. (3) Document in §5 and §2.1: "Open file from chat or File Manager targets the editor surface; when floating, the floating editor window is focused and receives the file."

#### 12.1.2 Which editor group gets the file

**Gap:** With split panes, click-to-open and "open from File Manager" don't specify which editor group receives the new file.

**Solution:** (1) **Default:** Open in the **active (focused) editor group**. Track focus per group; when the user clicks a path in chat or selects a file in File Manager, the file opens in whichever group last had focus. (2) **Optional:** Add an "Open in" control (e.g. right-click file in File Manager or a small dropdown on click-to-open): "Open in current group" | "Open in other group" | "Open in new group." (3) Document in §5 and §2.4 that the default is active group and that optional "Open in" can be added without changing the default.

#### 12.1.3 Large-file threshold value

**Gap:** §2.7 gives examples (> 10 000 lines or > 2 MB) but no final value or hard cap.

**Solution:** (1) **Pick one primary metric:** Either **line count** (e.g. 10 000 lines) or **file size** (e.g. 2 MB). Recommend **line count** for editor UX (virtualized rendering). (2) **Define hard cap:** e.g. never load more than 5 MB into a single buffer regardless of threshold; above that, show "File too large to edit" and offer "View read-only (truncated)" or "Open in system editor." (3) **Settings:** Add **Large file threshold** (lines or MB) and **Hard cap (MB)** in Settings → Editor; persist in redb. (4) Document the chosen default and range (e.g. threshold 5k-50k lines, hard cap 2-10 MB) in §2.7.

#### 12.1.4 Symbol search (LSP when available, fallback without)

**Gap:** Go to symbol and find symbol in workspace need a clear path when LSP is and isn't available.

**Solution:** (1) **When LSP is available** (§10.10), use LSP `textDocument/documentSymbol` for current file and LSP workspace symbol request for find-symbol-in-workspace. **Resolved in §10.10:** LSP behavior for documentSymbol and workspace symbols is specified in §10.10.1 and §10.10.2; implement per §10.10 and §10.2. (2) **Fallback when LSP is unavailable:** **Current file (go to symbol):** Use a **regex-based outline** over the current buffer (language-specific regex sets per preset or extension). Produce `{ name, line, kind }`; user picks from dropdown; editor scrolls to line. **Workspace (find symbol):** Optional **project symbol index** (regex scan, store `{ name, path, line, kind }` in redb or project-local file). Refresh on save, watcher, or manual "Reindex." (3) Document the fallback outline and index schema in §10.2.

#### 12.1.5 Preset detection vs interview

**Gap:** "Detects or asks" for language/framework when a project is added -- detection rules and fallback are not listed.

**Solution:** (1) **Detection order:** (a) **File-based heuristics** at project root: e.g. `Cargo.toml` → Rust, `package.json` + `tsconfig.json` → TypeScript, `pyproject.toml` or `requirements.txt` → Python, `composer.json` → PHP, `go.mod` → Go, `*.sln` / `*.csproj` → C#. (b) If multiple match (monorepo), use **primary** (e.g. first by priority list) or prompt "Select preset." (c) If none match, show **"Select preset"** dialog with the full preset list. (2) **When interview was run:** If the project was created or configured via chain start wizard / interviewer, use the **interview output** (e.g. architecture phase result) to set or suggest the preset; user can override. (3) Document the detection table (file → preset) and the "Select preset" flow in §11 or a short "Preset detection" subsection.

#### 12.1.6 Tool download failure

**Decision:** Preset tool download failure does not block opening the project; show error + Retry + Skip and allow installing later.

**Solution:** (1) **On failure:** Show a **clear error** in the UI (e.g. "Could not install Rust toolchain: [reason]"). Include retry and skip actions. (2) **Retry:** "Retry" re-runs the download/install for that preset. (3) **Skip:** "Use project without full preset" -- project opens with the preset selected but without the optional tools; run/debug may be limited (e.g. "Run" might prompt to install later). Do **not** block opening the project. (4) **Docs:** "Open docs" or "Troubleshoot" link to preset-specific setup or system-requirement docs. (5) Optionally persist "skip this preset's tools" so the user isn't prompted every time; allow "Install preset tools" from Settings or project menu later. Document in §11.

#### 12.1.7 Hot reload debounce

**Decision:** Hot reload debounce is 400 ms per preview instance; linked files are the HTML file plus referenced local resources under the project root.

**Solution:** (1) **Debounce duration:** Use a **per-file** debounce of **300-500 ms** (e.g. 400 ms). On each save of a file that is "watched" for hot reload (the HTML or linked CSS/JS), start or reset a timer; when the timer fires, trigger one refresh of the browser view that shows that file. (2) **Scope:** Per preview instance: each browser instance watching a given HTML file has its own debounce; rapid saves to that file result in one refresh after the last save within the window. (3) **Settings:** Add **Hot reload debounce (ms)** in Settings → Editor or Developer (range e.g. 100-2000 ms); persist in redb. Document default and key in §8.2.

#### 12.1.8 Session-scoped view state scope

**Decision:** Session-scoped view state is keyed by chat thread id (and interview session id when in Interview).

**Solution:** (1) **Define session:** For "session-scoped view state," **session** = **chat thread** (thread id) when the user is in the Assistant/Interview chat. Optionally also key by **interview session id** when in Interview flow. (2) **Keying:** Store view state (open tabs, scroll, cursor, selected range) under a composite key: e.g. `project_id` + `session_id` (thread id or interview session id). When the user switches threads, offer to restore that thread's editor view state if it was previously used. (3) **Fallback:** If no session id (e.g. user never opened chat), use project-only key so behavior matches "per-project" only. Document in §10.7 that session = thread (and optionally interview session) and that state is keyed by project + session.

#### 12.1.9 Review rules storage

**Decision:** Review rules load from `.puppet-master/review-rules.yaml` (project) plus redb `review_rules/app` (app); project rules override/extend by rule id.

**Solution:** (1) **Storage:** Support both **project-level** and **application-level** rules. Project: `.puppet-master/review-rules.yaml` in project root. Application: redb key `review_rules/app` (or equivalent app-data export/import command). Project rules override or extend app rules by `id` when a project is selected. (2) **Format:** YAML for deterministic parsing and diffability. Minimum schema: `id`, `description`, `severity`, optional `scopes`, and one of `match`, `path_glob`, or `prompt_hint` depending on whether the rule is machine-evaluable or prompt-only. (3) **Application:** When running AI/rule-based review (§10.8), the review engine loads app + project rules, records the merged rule set id/count in the review request metadata, and applies them (e.g. inject into Assistant prompt or run a rule evaluator). Invalid YAML surfaces a warning with line/column if available; the engine falls back to the last valid app-level set rather than failing open.

#### 12.1.10 Floating editor + multiple windows

**Gap:** With main window + floating editor + possibly detached Chat/File Manager, window count and focus for shortcuts (e.g. Ctrl+S) need clarity.

**Solution:** (1) **Focus rule:** **Editor shortcuts** (Save, Close tab, Go to line, etc.) apply when **any editor window has focus** (docked or floating). So Ctrl+S in a floating editor window saves the current buffer in that window. App-level shortcuts (e.g. command palette Ctrl+P) apply when the main window or a non-editor panel has focus. (2) **Single floating editor:** AutoDecision: exactly one floating editor window; when the user drags out again, re-dock the existing floating editor window and float the newly dragged group. (3) **Z-order:** OS manages window order; no special z-order requirement beyond "focus follows click." Document focus rule and single-vs-multiple floating policy in §2.1 or §2.4.

### 12.2 Potential problems

#### 12.2.1 Performance with many tabs

**Problem:** Dozens of open files plus LRU eviction can cause thrashing (frequent load/unload) or slow startup if persisted state is large.

**Solution:** (1) **LRU cap:** Enforce the **max editor tabs** setting (§2.9); only that many buffers are kept in memory. When opening a new file would exceed the cap, evict the least-recently-used buffer (clear from memory; keep path in tab list). On tab switch to an evicted file, reload from disk. (2) **Lazy load:** When restoring session, load only the **active tab** content immediately; load other tab contents on first switch to that tab. (3) **Persist minimal state:** Persist only **ordered list of paths**, **active tab index**, and optionally **scroll/cursor per tab**; do not persist full buffer content. Recovery/unsaved buffer content is separate (redb or temp). (4) **Startup:** On app start, restore tab list and active tab; load active buffer; defer loading other buffers until the user switches. Document in §10.7 and §2.9.

#### 12.2.2 Detach/snap and Slint

**Problem:** Plans/FinalGUISpec.md describes detach for Chat and File Manager; the editor has more state (tabs, buffers, multiple groups) and must work when docked or floating.

**Solution:** (1) **Reuse state machine:** Use the same **DOCKED ↔ FLOATING** state machine and **snap zones** (e.g. 25px from main window edge, visual cue on drag) as for Chat/File Manager. One enum per panel type: `PanelDock::Docked { side, width }` | `PanelDock::Floating { window_id, x, y, w, h }`. (2) **Single editor component:** The editor UI component (tabs, groups, content area) is **one component** that can be rendered either **inline in the main layout** (when docked) or **inside its own Slint Window** (when floating). Same component, different parent. (3) **Shared state via app bridge:** All editor state (tabs, buffers, active group, dirty flags) lives in the Rust app; the Slint editor component reads/writes via the backend bridge. So when the user drags the editor out, the floating window shows the same data; no duplication of state. (4) Document in Plans/FinalGUISpec.md or §2.1 that the editor follows the same detach/snap pattern and that editor state is shared, not copied.

#### 12.2.3 Remote SSH + run/debug

**Problem:** Running and debugging on a remote host requires an agent/proxy on the remote machine and port forwarding or a secure channel; complexity and failure modes are high.

**Solution:** (1) **Phase 1 (MVP):** **Remote edit only.** User connects via SSH; file tree and editor read/write files over the connection (e.g. remote proxy or SSHFS-style). Run/debug and terminal **run locally** (or in a local shell that SSHs for commands). Document that "remote run/debug" is out of scope for initial MVP. (2) **Phase 2 (later):** **Remote run/debug** with a documented **remote agent**: e.g. a small binary on the remote that runs commands and streams output; debugger uses port forwarding or the same channel. Document security constraints (no arbitrary code execution beyond project, user consent). (3) **Failure handling:** If SSH drops or proxy fails, show "Connection lost" and offer "Reconnect" or "Work offline (cached files only)." Do not corrupt local state. Document in §10.5.

#### 12.2.4 Modal editing vs shortcuts

**Problem:** Vim-style bindings can conflict with app shortcuts (e.g. Ctrl+S for Save, Ctrl+P for command palette).

**Solution:** (1) **Editor has focus:** When the **editor** has focus and **modal (Vim) mode is on**, the editor **consumes key events first**. So Ctrl+S in insert mode can be "save" (if bound) or pass through to app; in normal mode, 'S' might be "substitute line." Define a **keybinding map** for modal mode that reserves e.g. Ctrl+S for Save and Ctrl+Shift+Z for "open app menu" or "focus main window." (2) **Escape hatch:** Provide a reliable way to **exit modal mode** or **focus out of editor** without mouse: e.g. Ctrl+Shift+Z → "Focus command palette" or "Toggle modal off." (3) **Settings:** Let user choose "Use Vim bindings in editor" and list reserved app shortcuts (Save, command palette, etc.) in Settings → Editor so they are not overridden. Document in §10.5.

#### 12.2.5 Multiple presets in one project

**Problem:** Monorepos (e.g. Rust backend + TypeScript frontend) may need more than one preset; §11 says "single preset per project."

**Solution:** (1) **Primary preset:** Keep **one active preset per project** as the default; it drives run/debug defaults and tool download. (2) **Switchable preset:** Allow the user to **switch** the project's preset (e.g. Settings → Project → Preset: Rust | TypeScript | ...). Use case: "I'm working on the frontend today" → switch to TypeScript. (3) **Combined presets (optional):** Define **combined presets** (e.g. "Rust + Node") that include tools and run configs for both; when selected, both toolchains are available and the user picks run config per launch. (4) **Primary + secondary:** Alternatively, allow **primary** (default run/debug) and **secondary** (additional tools/languages); document in §11. Choose one of combined vs primary+secondary and document.

#### 12.2.6 Browser instances and resources

**Problem:** Browser tabs and detached preview windows use significant memory; too many active browser surfaces can exhaust resources.

**Solution:** (1) **In-shell cap:** Enforce a **max browser tabs** cap for in-shell browser tabs only. Detached preview windows are outside that cap. (2) **Over-cap behavior:** If the user tries to open another in-shell browser tab after the cap is reached, do **not** silently retarget the current preview subject. Instead either prompt the user to close/focus an existing tab or fail the action with a clear message. (3) **Detached windows:** Detached preview windows remain first-class and are managed separately from the in-shell tab cap. (4) **Settings:** Add **Max browser tabs** in Settings → General or Developer (e.g. 2-12); persist in redb. Document in §8 and §9.

#### 12.2.7 Symbol index staleness

**Problem:** The project symbol index (for go-to-symbol / find-symbol in workspace) can be stale after the user or an external process edits files.

**Solution:** Applies to the **non-LSP** symbol index; when LSP is used (§10.10), workspace symbols come from the language server and are up to date on didChange/didSave; invalidation policy here applies to the **fallback index** only. (1) **Invalidation triggers:** Invalidate the index (or the affected file's part of the index) on: **file save** (user saves in editor), **filesystem watcher event** (external change), and **manual "Reindex"** action (e.g. command palette or File Manager context menu). (2) **Refresh policy:** **On save:** update that file's symbols in the index. **On watcher:** same. **Full reindex:** on "Reindex" or when project is opened after a long time (e.g. index older than 24 h). (3) **Stale read:** If index is stale, go-to-symbol may point to an old line; user can re-run "Go to symbol" or "Reindex" to refresh. Document refresh policy in §10.2 and §12.1.4.

#### 12.2.8 1-click apply and merge conflicts

**Problem:** Applying an agent or review suggestion when the file was edited elsewhere (or disk changed) can overwrite user changes or produce confusing results.

**Solution:** (1) **Reuse FileSafe/patch pipeline:** All "apply suggestion" actions go through the same **patch/apply/verify** path as agent edits (FileSafe, tool policy). (2) **Pre-apply check:** Before applying, compare **current buffer** and **current disk file** to the **version the suggestion was based on**. If buffer or disk has changed since then: (a) **Prompt:** "File has changed. Reload and re-apply suggestion, or apply anyway (may overwrite), or cancel." (b) **Show diff:** Optional "Show diff" so the user sees what will change. (3) **Apply anyway:** If user chooses "Apply anyway," apply the suggestion on top of current buffer (or merge if possible); if conflict, show conflict UI or reject. (4) **Reload and re-apply:** Reload file from disk (discard or stash buffer changes per user), then apply the suggestion. Document in §10.8 and FileSafe.

### 12.3 Enhancements (all MVP)

All items previously listed as "future ideas" are **in scope for MVP** and are specified in **§10.9 Additional editor features (MVP)**. Implement as needed; evaluate usefulness for optional items (e.g. terminal replay).

### 12.4 Suggested additions (consider for File Manager and editor)

The following are not yet specified above; consider adding them to §1 or §10 if they fit MVP scope.

**File Manager**

- **.gitignore / exclude patterns:** File tree respects `.gitignore` (and optionally a project exclude list). Ignored files/folders are **dimmed** by default; optional user setting to **hide** ignored items (toggle "Hide ignored").
- **Context menu actions:** New file, New folder (in selected directory, with name prompt); Rename; Delete (with confirmation); Copy full path to clipboard. Aligns with selectable labels and context menus elsewhere (AGENTS.md).
- **Expand/collapse persistence:** Optionally persist which folders are expanded in the tree per project (e.g. in redb under project key).

**Editor**

- **Current line highlight:** Subtle background highlight for the line containing the cursor.
- **Bracket matching:** Highlight the matching bracket/brace when the cursor is adjacent to one; optional brief highlight of the matching range.
- **Indent guides:** Vertical lines at indent levels to show block structure (useful without LSP).
- **Selection occurrence highlight:** When text is selected, highlight other occurrences of that text in the current file (read-only).
- **Pin tab:** Option to pin a tab so it is not evicted by LRU when max tabs is reached; pinned tabs shown with a distinct marker and excluded from "Close others" if desired.
- **Column (block) selection:** Rectangular/column selection (e.g. Alt+drag) for multi-line same-column edits.

### 12.5 Implementation plan checklist

Use this list when deriving an implementation plan; order aligns with §6 Implementation order (summary).

- 1. **File Manager:** Tree (virtualized), project context, select file → open in editor; .gitignore (dimmed/hide); context menu (New file/folder, Rename, Delete, Copy path); expand/collapse persistence.
- 2. **Editor:** Buffer model (one per path), tabs per group, shared buffer across groups; open file from tree shows content; dirty state and unsaved indicator (tab + one other place).
- 3. **Open-file contract:** Single handler for all open-file actions; request shape `OpenFile { path, line?, range?, target_group? }`; response: add/switch tab, scroll/highlight when line/range set; when floating, focus floating window and open there.
- 4. **Save / Revert / file-changed-on-disk:** Save persists to disk and clears dirty; Revert restores last-saved (prompt if dirty); file-changed-on-disk check on Save and on tab focus; combined prompt when dirty + disk changed.
- 5. **Presets:** File-based detection at project open; "Select preset" when none/multiple match; store active preset per project; tool download (non-blocking, Retry/Skip on failure).
- 6. **LSP lifecycle:** Start server when project opens or first file of that language opens; stop on project close or idle timeout; one process per (project, server) or (project, language).
- 7. **LSP document sync:** On buffer open send `didOpen`; on edit send debounced `didChange`; on save send `didSave`; map editor positions to LSP line/column.
- 8. **LSP diagnostics:** Consume `publishDiagnostics`; show squiggles in editor and list in Problems panel.
- 9. **LSP features (core):** Hover, autocomplete, go-to-definition, go-to-symbol (current file), find symbol in workspace; fallbacks when LSP unavailable (regex outline, grep/index) per §12.1.4.
- 10. **LSP features (extended):** Code actions, rename, format on save, inlay hints, signature help, find references, highlight occurrences, go to type/implementation/declaration, semantic folding, expand/shrink selection, document links, color picker, CodeLens, format on type, call hierarchy, semantic tokens; per-feature fallback when server does not support.
- 11. **Click-to-open from chat:** Paths and code blocks in chat open file via open-file contract; line/range scroll/highlight; already-open file → focus existing tab.
- 12. **Drag-and-drop (File Manager):** Drop onto tree (copy into folder); drag out (copy to OS); name conflict handling; progress and error feedback; security (target under project root).
- 13. **Editor enhancements (non-LSP):** Line numbers, go-to-line, syntax highlighting, split panes, persistence (tabs, scroll/cursor, max tabs), large-file threshold and hard cap, transient UI states, accessibility.
- 14. **Image viewer & HTML preview:** Image tab/viewer; HTML open in browser; hot reload with debounce (default 400 ms); click-to-context when viewing HTML (per `Plans/Section15_MVP_Promoted_Features_Spec.md` §3.18).
- 15. **Tabs (Terminal, Browser):** Terminal tabs; browser tab/session cap and explicit over-cap behavior.
- 16. **Optional / later:** Recover unsaved; Save As; Revert last agent edit (contract + refresh notification); "Open in" other/new group; Git status strip; modal editing; remote SSH; review rules storage; combined presets.

### 12.6 Multi-agent review -- addressed in main body

Four reviewer roles (architecture, UX, technical writing, frontend implementation) reviewed this document. **All identified gaps, potential problems, and enhancements have been folded into §§1-11.** Index of where each was addressed:

| Topic | Addressed in |
|-------|----------------|
| Open-file contract | §4.1 (request shape, single code path) |
| Revert last agent edit / FileSafe | §2.2, §2.5 (contract, refresh notification, pointer to FileSafe.md) |
| File changed on disk (when, focus rule, dirty+disk order) | §2.5, §7 |
| Single buffer multiple views | §2.4, §2.5 |
| Editor state in redb (schema) | §2.9 |
| Save failure, save success feedback, unsaved in two places | §2.2 |
| Large-file strategy, threshold, hard cap | §2.7 |
| Collapsed state, floating editor policy (one window) | §2.1 |
| Tab bar model (per-group tab list, shared buffer) | §2.4 |
| Scroll/cursor persistence, restore order, lazy load, max persisted tabs | §2.9 |
| Image viewer placement | §8.1 |
| Hot reload (linked files, debounce default) | §8.2 |
| Line/range format, highlight duration | §2.3, §5 |
| Definitions, scope/ownership, FileSafe pointer | Summary (Definitions), §6 |
| Discoverability (click-to-open, detach) | §1, §2.1, §5 |
| Open already-open file (focus existing tab) | §5 |
| @ vs click-to-open | §3 |
| Accessibility, File Manager tree keyboard | §2 (Transient UI states / Accessibility), §1 |
| Read-only reason in UI | §2.6 |
| Transient UI states (Loading, File not found, etc.) | §2 (after §2.9) |
| Terminal pin, browser instance cap | §9 |
| Project root detection, symlinks, broken-files list, file→dir, editor floating+main closed | §7 |
| Browser/Assistant boundary | §10.6 |
| Preset detection table, tool download order | §11 |
| Session restore explicit prompt | §10.7 |
| Review rules storage | §10.8 |
| Recover unsaved alignment, lifecycle events, confirm dialogs | §2.9, §10.9 |
| Search scope default and indicator, symbol outline/index | §10.2 |
| Modal focus trap, SSH connection lost | §10.5 |
| §12.4 suggested additions | §12.4 (implement as needed); §1 .gitignore and context menu folded into §1 |

**Source key (for reference):** A = architect-reviewer, U = UX-researcher, T = technical-writer, F = frontend-developer.

**Original gaps (historical; addressed in main body)**

- **Open-file contract (§4, §5):** No single request shape (e.g. `path`, `line?`, `range?`, `target_group?`) or code path for chat, File Manager, and quick open. (A, F)
- **Revert last agent edit / FileSafe (§2.5):** Who invokes whom and event/message shape (e.g. `BufferReverted(path)`) not defined; editor "reloads or is notified" is ambiguous. (A, F)
- **File changed on disk (§2.5, §7):** "On next focus" undefined -- per-tab, per-window, or app-global; who performs the check and when. (A, T, F)
- **Single buffer, multiple views (§2.4, §2.5):** When the same path is open in more than one editor group, no explicit rule that all views share one buffer and stay in sync (cursor/scroll ownership, dirty state). (A, F)
- **Editor state in redb (§2.9):** No schema for keys and value shapes (open tabs, active tab, scroll/cursor, max tabs, session-scoped state). (A, T)
- **Save failure (§2.2):** No behavior for write failure (disk full, permission, path deleted): keep buffer dirty, error + retry / "Save As," no "last saved" update. (A, F)
- **Large-file strategy (§2.7):** Both "truncated + Load full" and "read-only virtualized" mentioned; pick one for MVP. Default threshold and hard cap only in §12.1.3 -- state in §2.7. (T, F)
- **Collapsed editor state (§2.1):** Resolved in §2.1: persisted per-project in redb. (F)
- **Tab bar model (§2.4):** "Each group has its own tab list (or shares a common tab bar)" -- choose one for MVP. (F)
- **Scroll/cursor persistence (§2.9):** "Optionally scroll/cursor per tab" -- need a default (yes/no) and storage. (F)
- **Image viewer placement (§8.1):** Resolved in §8.1: same tab area as the editor. (T, F)
- **Hot reload (§8.2):** Which files count as "linked" (same dir, `<link>`/`<script>` refs) and debounce default (e.g. 400 ms) only in §12.1.7 -- add to §8.2. (T, F)
- **Line/range from chat (§2.3, §5):** Resolved in §2.3 and §5: 1-based inclusive; default highlight duration 5 s. (T)
- **Floating editor policy (§2.1, §12.1.10):** Resolved in §2.1 and §12.1.10: exactly one floating editor window (re-dock then float new). (T, F)
- **Definitions:** Terms **buffer**, **tab**, **editor group**, **dirty**, **preset**, and **redb** / **seglog** / **project storage design** / **rewrite-tie-in-memo** (with doc links) not defined here. (T)
- **FileSafe (§2.5):** Referenced but not defined; add pointer (e.g. Plans/FileSafe.md). (T)
- **Discoverability:** How users learn that paths/code blocks in chat are clickable, and that editor/panels can be detached (affordance, hover, tooltip, onboarding). (U)
- **Open already-open file (§2.5, §5):** Resolved in §5: focus existing tab (no duplicates), then apply line/range scroll/highlight when provided. (U)
- **@ vs click-to-open (§3, §5):** Intentional difference (context vs open) not explained in UI. (U)
- **Accessibility:** No mention of screen reader, keyboard-only use (tree, tabs, dialogs), focus order, visible focus, ARIA, reduced motion. (U)
- **File Manager tree keyboard:** Resolved in §1: arrow keys navigate; Enter opens/toggles; type-ahead narrows. (U)
- **Read-only reason (§2.6, §2.7):** UI need not explain why (binary, too large, OS read-only); users can be confused. (U)
- **Save success feedback (§2.2):** No requirement for "Saved" or visible clearing of dirty state. (U)
- **Dirty + Disk Change Prompt Order (Resolved, §7):** When a file has both unsaved editor changes AND has been modified on disk, show a **single combined prompt** (not two sequential prompts): "File [X] has unsaved changes and has been modified on disk." Actions: **[Save yours]** (overwrites disk with editor version), **[Load from disk]** (discards editor changes, loads disk version), **[Show diff]** (opens side-by-side comparison), **[Cancel]** (dismisses prompt, editor retains unsaved changes). The combined prompt prevents the confusing UX of two sequential dialogs about the same file.
- **Transient UI states:** Loading, "Cannot decode as UTF-8", "File not found", "Binary file", "File too large", "Indexing...", open failure -- each needs at least one defined state and copy. (F)
- **Terminal tab "pin" (§9):** Resolved in §9: pinned tabs excluded from Close others and LRU close when cap exists. (F)
- **Project root moved/renamed (§7):** Resolved in §7: detect via next I/O failure only; no watcher in MVP. (A)
- **Symlinks (§7):** Resolved in §7 and §4.1: show symlinks as a single node (no follow); open-file validates canonical path under project root. (T)

**Potential problems**

- **Very large directories (§1, §10.7):** No policy for e.g. node_modules (virtualization depth, row limit, caps). (A)
- **Browser/Assistant boundary (§8, §10.6):** Same browser for preview and agent-driven actions; interface (commands, results) and security not defined. (A)
- **Restore vs lazy load (§2.9, §12.2.1):** §2.9 doesn't state "restore active tab first"; startup could load many buffers before cap. (A)
- **Preset tool download (§11):** Order and UX are defined in §11: non-blocking after project open with progress + Retry/Skip. (A)
- **Summary and §12 (T):** Summary is one long sentence; §12 holds solutions that could live in main body (e.g. §12.1.3 threshold in §2.7); recover unsaved §2.9 vs §10.9 MVP wording inconsistent.
- **Focus when editor floating (§2.8, §12.2.2):** Which window "editor has focus" for shortcuts and open-file target needs an explicit rule. (F)
- **Max persisted tab count (§12.2.1):** Max persisted tab count: **50**. Config: `editor.max_persisted_tabs`, default `50`. Keeps startup and storage bounded. (F)
- **Modal editing (§10.5):** Focus trap when modal on (e.g. Tab shouldn't leave editor without "focus next panel" shortcut). (F)
- **Browser instance cap (§12.2.6):** Define what counts as one instance and whether "Open in browser" reuses or creates new when under cap. (F)
- **Line/range highlight duration (§2.3):** If "fades after short delay," specify duration and configurability. (F)

**Enhancements (consider folding into main spec)**

- **Single open-file contract:** Add subsection under §4 or §5: request shape `path`, `line?`, `range?`, `target_group?`; default active group. (A, F)
- **Editor state schema:** Short "Editor state in redb" note (key names, value types) under §2.9 or §12. (A)
- **Explicit "single buffer, multiple views" rule:** One sentence in §2.4/§2.5: same path in multiple groups ⇒ one buffer, all views in sync. (A)
- **Save failure clause:** In §2.2 or §7: on failure, keep dirty, show error + retry / "Save As," don't update last-saved. (A)
- **Definitions subsection:** After Summary or in §2, define buffer, tab, editor group, dirty, preset; one line each for redb, seglog, doc links. (T)
- **Defaults in body:** Large-file threshold + hard cap in §2.7; hot-reload debounce in §8.2; floating-editor policy (one window) in §2.1. (T, F)
- **Scope/ownership:** 1-2 sentences after Summary: what this spec defines vs defers to assistant-chat-design, newfeatures, etc. (T)
- **MVP definition (§6):** One sentence that "MVP" here means desktop build scope. (T)
- **Onboarding/hints:** Lightweight discovery for click-to-open and detach/snap (e.g. first-time tooltip). (U)
- **Search scope default and indicator (§10.2):** Default scope (current file vs project) and visible scope in search UI. (U)
- **Session restore prompt (§10.7):** Explicit "Restore N tabs from [thread]?" (Yes / No / Don't ask again) instead of "offer to restore." (U)
- **Broken/missing files list (§7):** Single place (list or badge) for tabs with missing/deleted files; bulk Close all / Reload if present. (U)
- **Current file in File Manager (§1):** When editor has focus, highlight or scroll tree to current file ("you are here"). (U)
- **Unsaved in two places (§2.2):** Tab plus one other (e.g. title or status bar) so visible with many tabs. (U)
- **Unified confirm-dialog spec:** Standardize Save/Discard/Cancel, Reload/Overwrite/Cancel, etc. as one pattern (action + optional Show diff + buttons). (F)
- **Editor lifecycle events:** Minimal set (e.g. FileOpened, FileClosed, TabSwitched, BufferSaved, BufferReverted) for bridge and analytics. (F)
- **Symbol outline/index (§12.1.4):** Short note: outline `{ name, line, kind }`; workspace index `{ name, path, line, kind }`; invalidation on save/watcher/Reindex. (F)
- **Preset detection table (§12.1.5):** File → preset table (Cargo.toml → Rust, etc.) and "Select preset" when none/multiple; reference in §11. (F)
- **Adopt §12.4:** Implement suggested File Manager and editor additions (e.g. .gitignore dimmed/hide, context menu, pin tab, bracket matching, etc.). (F)

## Verification (AI-executable)

ContractRef: Plans/Progression_Gates.md, Plans/evidence.schema.json

**Pass criteria:** (1) No unresolved decision markers remain in this plan; (2) Evidence bundle exists and validates against `Plans/evidence.schema.json`.

### Checks (run from repo root)

1. **Wrong directory prefix audit (PASS = no matches):**
   - `rg -n 'P.*lan/' Plans/FileManager.md`

2. **Placeholder audit (PASS = no matches):**
   - `rg -n "\\b(TBD|TODO|FIXME)\\b" Plans/FileManager.md`
   - `rg -n "(decide which|document choice|document implementation choice)" Plans/FileManager.md`

3. **Evidence Bundle Path (Resolved):** Path: `.puppet-master/evidence/{run-id}/bundle.json` where `{run-id}` is the seglog run identifier (e.g., `PM-2026-02-23-14-30-00-001`). Must validate against `Plans/evidence.schema.json` and includes `checks[]` entries for (1) and (2) with result PASS/FAIL and `contract_refs` referencing this section and `Plans/Progression_Gates.md`. Created at run completion (success or failure). Persisted across sessions (not cleaned up automatically). Cross-reference: STATE_FILES.md (add entry for this path).

---

## 13. Git Status Integration

File Manager integrates with Source Control, not with a legacy combined Git panel.

### 13.1 Git status overlay in file tree

The file tree may show Git status badges, but those badges are read-only indicators unless the user opens Source Control or a file diff.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 13.2 Source Control strip

The file-tree header or strip may expose compact repo state, but its primary action targets are:
- `Open in Source Control`
- `Open diff`
- `Open compare`

It must not claim ownership of commit, history, graph, or worktree management.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md

### 13.3 Repo-aware filtering and worktree context

When multiple worktrees or repo roots are relevant:
- the file tree must show which repo/worktree is active
- file-status overlays must resolve against that active repo/worktree
- any handoff to Source Control must preserve `repo_id` and `worktree_id`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Orchestrator_Page.md

## 14. Markdown, Mermaid, HTML, SVG, and Image Rendering (Rewrite Addendum -- 2026-03-07)

This addendum makes the editor/file-surface behavior deterministic for Markdown, Mermaid, HTML, SVG, and image files.

### 14.1 File-type behavior matrix

| File / content kind | Canonical representation | Default open mode | Alternate modes | Native rendering behavior |
|---|---|---|---|---|
| `.md` | Markdown text | Source editor | Split source/preview, preview-only, detached preview | Render Markdown natively via the shared preview runtime |
| fenced ```mermaid``` inside `.md` | Markdown text containing Mermaid source | Source editor with rendered blocks available | Split source/preview, detached diagram preview/editor | Mermaid block renders as native diagram card inside Markdown preview |
| `.mmd` | Mermaid text | Dedicated Mermaid source editor | Detached diagram preview/canvas, split source/diagram | Native Mermaid render, SVG-first export |
| `.html` / `.htm` | HTML source file | Source editor | Full browser-like rendered mode, split source/render, detached browser window | Rendered mode uses browser preview transport with relative assets and scripts |
| `.svg` | SVG file | Native image/vector view | Source editor, detached image view | Prefer native image/vector surface; browser surface is optional, not required |
| raster image (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, etc.) | File bytes | Native image view | Detached image view, open source metadata when relevant | Native Slint image surface |

Rules:

- HTML must support **both source editing and fully rendered browser-like viewing**.
- Markdown and Mermaid remain source-canonical even when rendered inline.
- Images are not forced through the browser preview runtime.

### 14.2 Editor/view modes

Supported modes for render-capable documents:

- **Source**: normal text editor surface.
- **Preview**: rendered-only surface.
- **Split**: source + rendered preview side-by-side or stacked.
- **Detached preview**: separate window using the same PreviewSession.
- **Open in browser panel/window**: for full HTML/browser mode and other cases where a browser-like surface is the correct UX.

Defaults:

- Markdown opens in source mode by default, with preview quickly available.
- Mermaid blocks inside Markdown render in preview mode without changing the canonical source model.
- `.mmd` files open in Mermaid source mode with a diagram preview affordance.
- HTML opens in source mode by default and offers rendered/browser mode as a first-class alternate surface.

### 14.3 Preview state model

The editor/file manager owns document-side state that binds to shared PreviewSession records.

Minimum per-document UI state:

- `document_id`
- `path`
- `content_kind`
- `source_revision`
- `preview_session_id` (if active)
- `preview_mode` (`none`, `inline`, `split`, `detached`, `browser_panel`)
- `trust_tier`
- `can_structured_edit_preview`
- `last_preview_error`
- `export_preferences` (for example, Mermaid export format/theme)
- `scroll_sync_enabled`

### 14.4 Source/preview edit contract

#### 14.4A Shared-buffer preview mutation rules (2026-03-08)

Successful preview edits use the same authoritative document pipeline as normal source editing.

Rules:
- A successful preview action resolves to a bounded text patch against the current source buffer.
- The patch is applied through the shared buffer model used by File Editor and Embedded Document Pane.
- Successful preview edits update dirty state, undo/redo history, and the current `source_revision` before preview re-render.
- Preview actions MUST NOT write directly to disk and MUST NOT bypass the normal save path.
- `ambiguous_mapping`, `unsupported_region`, and `rejected_stale_revision` outcomes MUST remain non-mutating and focus/open source at the mapped region when possible.

Source remains authoritative.

Preview editing rules:

- Preview interactions may only issue **structured actions** against mapped nodes/spans.
- Minimum v1 whitelist:
  - task-checkbox toggle
  - heading text edit
  - list item text edit
  - link/text-format actions where source mapping is deterministic
  - Mermaid block replace/open-source/open-detached actions
- If mapping is ambiguous or stale, the preview must:
  - reject the mutation
  - focus/open source at the mapped block
  - show a deterministic user-facing reason when helpful
- Raw HTML, malformed Markdown, unknown extensions, and opaque fenced blocks remain source-only for editing.

### 14.5 Mermaid authoring and export

### 14.5A Mermaid export artifact contract

All Mermaid export actions use one shared export contract regardless of whether the request originates from chat, file preview, planning preview, or a detached diagram window.

**Destination behavior**
- On first export in a project, the user chooses the destination path explicitly.
- Subsequent exports default to the last-used export directory for that project unless the user overrides it.
- Chat-originated diagrams without a stable source path use `diagram` as the base filename.

**Filename template**
- SVG: `<base_name>.mermaid.<yyyyMMdd-HHmmss>.svg`
- PNG: `<base_name>.mermaid.<yyyyMMdd-HHmmss>.png`

**Overwrite behavior**
- Default behavior is `ask_before_overwrite`.
- Silent overwrite is not allowed as the default.

**Render determinism**
- SVG is the canonical export snapshot.
- PNG is rasterized from that exact SVG snapshot.
- Export metadata MUST record:
  - source path or artifact id
  - source revision
  - diagram node id (when available)
  - export format
  - export theme
  - export background mode

**Theme/background**
- Default export theme is the current app theme.
- The export UI must allow an explicit theme override.
- When a non-default theme is chosen, that choice must be visible in the export metadata and user-facing confirmation.

**Clipboard parity**
- `copy SVG` and `copy image` use the same snapshot contract as file export.
- Clipboard failures must surface a visible error instead of silently degrading.

**Audit**
- Export and copy actions emit the same canonical preview export event family defined in storage-plan.md.

Mermaid behavior in the editor/file manager:

- Canonical Mermaid source lives in `.mmd` or fenced `mermaid` code blocks.
- The assistant may create Mermaid source, but saved artifacts remain text.
- Diagram preview actions should include:
  - open source
  - open detached diagram window
  - export SVG
  - export PNG
  - copy SVG / copy image when platform support is available
- SVG is the canonical export artifact; PNG is derived.
- Diagram preview must be theme-aware while keeping export behavior explicit and deterministic.

### 14.6 HTML preview and hot reload

Full HTML/browser mode must support:
- relative asset resolution
- local script execution appropriate to a workspace preview
- reload and hot reload
- explicit click-to-context and explicit capture-to-chat actions when the browser surface is used in that mode
- screenshots, console/network read, and DevTools access through the canonical browser model
- detached browser open without changing the underlying preview subject identity

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md

Hot reload scope:
- watch the HTML file itself
- watch linked local CSS/JS/image assets under the preview contract
- debounce reloads to avoid thrash (default 400 ms remains acceptable)
- preserve scroll/location when reasonable

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/rewrite-tie-in-memo.md

### 14.7 Error and fallback behavior

Required fallback rules:
- if the PM browser runtime is unavailable or damaged, present explicit `runtime_unavailable` remediation and keep source/native surfaces usable
- if normal embedding is temporarily unavailable, the product may use the detached window path on the same PM browser model rather than silently falling through to an unrelated legacy browser runtime
- if Mermaid parse/render fails, show source plus explicit render error; do not silently drop the diagram
- if Markdown preview generation fails, keep source editor usable and show a visible preview error state
- if a preview edit cannot be reversed into a safe source patch, focus source rather than mutating preview state
- if browser or browser-subprocess crash occurs, preserve recoverable metadata and any completed browser evidence when possible

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 14.8 Non-goals

- no hidden diagram object model
- no promise that every preview surface is embedded in-process in the same way on every platform
- no arbitrary WYSIWYG DOM editing for Markdown/HTML as an MVP requirement
- no bottom-panel-primary browser model
- no silent automatic chat-context injection from browser clicks or selection
- no alternate stale browser authority outside the promoted Section 15 owner and reconciled subsystem docs

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### 14.9 Acceptance criteria

- opening an HTML file supports source editing, `Open in Browser`, `Open in Detached Browser`, and browser split as a second-step layout action without changing canonical source storage
- HTML files support full rendered browser-like viewing with local asset resolution, explicit click-to-context, screenshots, and DevTools access on the canonical PM browser model
- watchable browser automation runs use a visible `automation_session` that the user can safely pause, stop-and-keep, or promote to normal browsing
- browser evidence capture routes screenshots, traces, videos, and recordings into the shared runtime artifact pipeline
- browser recovery uses `Reopen`, `Retry`, and `Keep Closed`, and completed browser evidence survives when possible
- image files still render natively and do not require the browser runtime

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md

## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)
File/artifact browsing must support the new runtime artifacts and reports produced by scheduler/remediation flows while preserving canonical runtime identity.

### Required support
- open scheduler analysis exports/reports when materialized
- open remediation reports/details when materialized
- open degradation reports when materialized
- open generated non-repo drafts without treating them as normal workspace files

### Required navigation targets
- queue-analysis snapshots by `scheduler_pass_id`
- attempt-scoped evidence and reports by stable `attempt_id`
- safe-point manifests / restore logs by `safe_point_id`
- remediation lineage summaries by `remediation_root_id`
- blocked-detail pivots through `detail_ref`

Rules:
- runtime reports opened from Dashboard/Assistant/Orchestrator surfaces must preserve identity and not silently redirect to unrelated files
- UI and file browsing affordances must use stable identities (`attempt_id`, `safe_point_id`, `remediation_root_id`) rather than ambiguous node-only labels
- legacy `analysis_id` may be accepted only as an alias equal to `scheduler_pass_id`

**Runtime Artifacts alignment:** Open by artifact identity and the Artifacts panel MUST align with Plans/Runtime_Artifacts_Panel.md (artifacts_index:v1:{project_id}, 19 artifact types, navigation).
