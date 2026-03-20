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
### 9A. Terminal tabs, panes, and sections
Terminal containers are shell-workspace state, not a loose collection of generic bottom-panel tabs.

Rules:
- Puppet Master supports up to two terminal sections/components
- each terminal section owns an ordered terminal-tab strip
- each terminal tab contains from one to four panes
- pane layout supports row and column splits and rebalances deterministically when a pane closes
- tabs and panes can be reordered without changing the bound runtime identity

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

Terminal naming and focus rules:
- explicit user labels override all automatic naming
- when no explicit label exists, the tab title uses the strongest available session-derived label such as current task or cwd summary
- pin state prevents accidental bulk-close behavior and remains visible in the tab strip
- `Open in Terminal` and `Show Terminal` reveal the existing pane, tab, and section that already own the referenced `terminal_session_id`
- explicit `New Terminal` and explicit split create new runtime identity instead of retargeting an unrelated pane silently

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md

Capacity and close rules:
- MVP does not use silent LRU eviction for terminal tabs
- `Close Others` and similar bulk actions exclude pinned terminal tabs
- closing a pane or tab that still owns a live session requires explicit close-versus-terminate semantics rather than silent process orphaning
- moving a terminal tab between sections changes presentation only and MUST NOT mint a new `terminal_session_id`

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 9B. Browser tab and detached preview normalization (2026-03-08)
The canonical browser container model is editor/workspace-tab-first for in-shell browsing.

Rules:
- in-shell normal browsing uses browser tabs in the editor/workspace surface, not a free-floating browser-instance pool
- detached preview/browser windows are first-class and outside the in-shell browser-tab cap
- bottom-panel browser hosting is not canonical behavior
- LRU browser-instance reuse is not canonical behavior
- when the browser cap is reached, the user gets an explicit choice or deterministic command failure; the app must not silently replace the current preview subject
- `automation_session` and `auth_session` are not counted as normal in-shell browser tabs

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 9C. Terminal and browser anti-collapse rule
Terminal tabs and browser tabs are nearby shell surfaces, but they are not interchangeable containers.

Rules:
- terminal tab semantics MUST NOT be reused as browser-session semantics
- browser-tab caps and terminal-tab behavior are configured and disclosed independently
- route and focus actions preserve the correct object kind (`browser_session`, `terminal_tab`, `terminal_pane`, `terminal_session`, or `dev_session`) instead of flattening them into one generic “tab” concept

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md
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
