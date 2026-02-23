# File Manager & IDE-style Editor -- Plan

**Date:** 2026-02-20  
**Status:** Plan document  
**Cross-references:** Plans/assistant-chat-design.md (§9, §4.1, §13), Plans/Composergui5-concept.html (§5, §8 layout), Plans/feature-list.md, AGENTS.md (DRY Method)

---

## Summary

The app provides a **File Manager** (pop-out side panel), an **in-app IDE-style editor** (File Editor strip), and **@ mention in chat** for file context. File Manager and editor share the same project context; chat integrates via @ mention and **click-to-open** (file paths and code blocks in the thread open in the editor). Full behavior and MVP scope are defined below.

This plan also covers **image viewing** and **HTML-in-browser preview with hot reload**; **split editor panes**; **drag editor out to its own window and back** (detach/snap); **tabs** in the editor and Terminal and **multiple browser instances**; **language/framework presets** (JetBrains-style, with tool download on project add or interview); and a full set of **editor enhancements** (UX, navigation & search, layout, run/debug, modal editing, remote SSH, agent/design sidebar, OpenCode-style cache/watcher, Graphite-style review). **LSP (Language Server Protocol) is in scope for MVP**: diagnostics, hover, autocomplete, go-to-definition, and symbol search use language servers when available for the current preset; see **§10.10**. Full LSP integration in the **Chat Window** (diagnostics in context, @ symbol with LSP, code-block hover/go-to-definition) is in **Plans/LSPSupport.md §5.1** and **Plans/assistant-chat-design.md §9.1**.

**Scope of this document:** This spec defines File Manager, editor, @ mention, click-to-open, image/HTML preview, tabs, and editor enhancements. It defers chat UX details to Plans/assistant-chat-design.md, layout to Plans/feature-list.md (GUI layout) and gui-layout-architecture, and browser click-to-context/agent actions to Plans/newfeatures.md §15.18. Storage terms (**redb**, **seglog**, project storage design) are defined in rewrite-tie-in-memo and project storage design docs.

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

**Done when:** (1) Tree lists all project files under root; (2) Selecting a file opens it in the editor via §4.1; (3) Virtualized tree handles 10k+ rows without freezing; (4) Expand/collapse state restores per project on reopen. **Error handling:** **Open failed** -- If opening the selected file fails (permission denied, not found, too large), show "Open failed" with brief reason in status or toast; do not leave tree in inconsistent state. **Refresh failure** -- If directory read fails (e.g. permission), show error on that node and optionally "Retry." **Edge cases:** **Empty project** -- Show "No files" or project root only; no crash. **No permission on subfolder** -- Show node but mark or filter; document whether children are hidden or shown as inaccessible. **Expand/collapse persistence:** Redb key e.g. `file_manager/expanded/{project_id}` → list of expanded path prefixes or node ids (§2.9). **Requires** §4.1 open-file contract before "select file opens it"; requires project context (project root). **Settings:** **Hide ignored** (toggle): Settings → File Manager (or header); default off (ignored dimmed); persist in redb. **Row cap per directory** (e.g. 10k): document default and whether configurable.

- **Placement:** Pop-out side window (like the chat pop-out), default left. Per Composergui5 §5 and feature-list layout: header ("FILES"), refresh, pop-out; search; virtualized file tree; optional Git status strip.
- **Virtualized file tree:** Only visible nodes are rendered; scroll position determines which slice of the tree is shown. Total height uses placeholder/estimated row height so the scrollbar is correct. Supports deep trees; **very large directories** (e.g. node_modules): virtualize by row, apply a row cap per directory (e.g. 10k entries) with "Show more" or type-ahead to narrow; document depth limit if any.
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

Users can move files between the project and the rest of the system by dragging: **drop onto** the File Manager tree (from desktop or another app) and **drag out of** the tree (to desktop or another app). This section specifies behavior, how we implement it, gaps, potential problems, and enhancements.

#### 1.1.1 Behavior summary

- **Drop onto File Manager:** Drag one or more files or folders from the **desktop**, **file picker**, or **another application** and drop them onto a **folder row** or the **project root** in the File Manager tree. The dropped items are **copied** into that folder (the drop target). The tree refreshes (or invalidates) so the new items appear; if the target folder was collapsed, optionally expand it and scroll to show the new items.
- **Drag out of File Manager:** Drag one or more files or folders from the File Manager tree and drop them onto the **desktop**, a **folder in the OS**, or **another application** (e.g. email client, file picker). The items are **copied** to the drop target. The source files in the project are unchanged unless the user explicitly used a "move" modifier (see below).
- **Copy vs move:** **Default is copy** for both directions (safe, no accidental removal). Optional: **modifier key** (e.g. **Shift** for move when dropping onto tree; **Shift** when dragging out for move) so the source is deleted after a successful copy. Document the chosen modifier in Settings or Help. If move fails after copy (e.g. target OK but source delete failed), leave both in place and show an error; do not leave a half-moved state.
- **Valid drop targets (drop onto tree):** Only **folder** nodes and the **project root** row accept drops. Dropping onto a **file** row does nothing (or is ignored). The drop target is the **folder** that contains the row the user dropped on; if the user drops on the project root row, the target is the project root directory.
- **Multi-selection:** User can drag multiple selected items (if the tree supports multi-select). All selected items are copied/moved to the single drop target. Order is unspecified; name conflicts are handled per item (see below).

#### 1.1.2 How we're going to do it

**Platform drag-and-drop APIs:** Use the host platform's D&D mechanism so the OS handles cross-app drag (e.g. desktop ↔ app).

- **Windows:** Implement `IDropTarget` (or the UI framework's drop target) on the tree control; accept `CF_HDROP` for file drops. For **drag out**, use `DoDragDrop` with `CF_HDROP` and provide the project file paths (or a shell data object with file paths). Slint / winit may expose higher-level APIs; use those if available so we don't hand-roll COM.
- **macOS:** Use `NSView` / `NSDraggingDestination` for drop; `NSDraggingSource` for drag out. Pasteboard type `NSPasteboardTypeFileURL` (or `NSFilenamesPboardType`). Provide file URLs for the project paths when dragging out.
- **Linux:** Use Xdnd (X11) or the Wayland drag-and-drop protocol. Accept `text/uri-list` for incoming drops (decode file:// URIs to paths). For drag out, offer `text/uri-list` with file:// URIs for the selected project paths.

If the UI stack (e.g. Slint) provides a **unified drag-drop API** that abstracts these, use it and document which formats we register (file list / URI list). Fallback: if the framework only supports in-app D&D, we can still implement **drop onto tree** by accepting the platform's file-drop format when the drag originates outside the app; **drag out** may require framework or OS support for exporting file URIs.

**Resolving the drop target:** On drop, we have (a) the **drop location** (e.g. row index or node id under the tree) and (b) the **project root path**. Map the drop location to a **target directory path**: if the row is the project root, target = project root path; if the row is a folder, target = that folder's full path (we must store or compute full path for each tree node). **Normalize** the target path (e.g. canonicalize) and **validate** that it is under the project root (see Security below). If validation fails, reject the drop and show a brief message (e.g. "Invalid drop target").

**Copy implementation:** For **drop onto tree:** For each source path from the OS D&D payload, copy the file or directory (recursively) into the target directory. Use a single **copy** operation (e.g. Rust `std::fs` or a crate that preserves permissions/timestamps if required). For **drag out:** The OS or target app performs the copy when it receives the file list/URIs; we only provide the paths. For **move:** After a successful copy, delete the source; if delete fails, report the error and do not remove the source.

**Name conflicts:** When the target directory already contains a file or folder with the same name:

1. **Option A (default):** Show a **dialog** per conflict (or one dialog with a list): "File already exists: {name}. **Overwrite** / **Keep both** (rename to e.g. name (1)) / **Cancel**." If "Keep both," generate a unique name (e.g. append (1), (2) until free). If "Cancel," abort the whole drop (or skip that item and continue, document choice).
2. **Option B (setting):** Add a **Settings → File Manager** option: "When dropping, if name exists" → **Always ask** | **Always overwrite** | **Always keep both (rename)**. "Always ask" uses the dialog above; the other two avoid the dialog for batch drops.

**Progress and feedback:** For **large** drops (e.g. many files or one large folder), show a **progress indicator** (e.g. "Copying 3 of 50..." or a progress bar) so the UI doesn't appear frozen. Run the copy on a **background task** (e.g. tokio spawn or a thread); do not block the UI thread. On completion: **toast** "Copied N items to {folder}" or "Dropped N items into project." On **error**: toast or dialog with the error (e.g. "Permission denied for ...") and optionally "Retry" / "Skip" for multi-item.

**Visual feedback:** During drag-over-tree: **highlight** the drop target row (e.g. background color or border) so the user knows where the drop will go. Use a **cursor** or **drag image** that indicates copy vs move when the modifier is held (e.g. plus icon for copy, arrow for move) if the platform supports it.

#### 1.1.3 Gaps and how we address them

| Gap | Addressed how |
|-----|----------------|
| **Drop target when tree is scrolled** | The drop target is the **row under the cursor** at drop time, not the "selected" row. Tree must hit-test the cursor to the correct row (folder or root) when the drop occurs. |
| **Symlinks** | When **copying in**, copy the symlink as a symlink (or resolve and copy the target; document choice in Settings). When **copying out**, the OS typically resolves; we provide the path. When **moving out**, deleting the source removes the symlink, not the target. |
| **Read-only or locked files** | If copy or delete (move) fails because the file is read-only or locked, show the error and do not overwrite. Optionally offer "Try again" or "Skip." |
| **Very long path** | If the resulting path exceeds OS limits (e.g. 260 chars on Windows), fail with a clear message ("Path too long") and suggest moving the project or shortening names. |
| **Drag from within the same project** | If the user drags from one folder in the tree and drops on another folder in the same tree, treat as **move within project** (copy then delete source) or **copy within project** (copy only). Same rules as external drop; no special case unless we add "reorder" semantics later. |
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
- **Drag out / drag back:** The user can **drag the editor** (or an editor group) **out** of the main application into **its own window**, and **drag it back in** to re-dock. Same detach/snap pattern as File Manager and Chat: undock by drag or "Pop out" action; floating editor window shows the same tabs and content; snap zones (e.g. near main window edge) with visual cue when dragging back; close floating window to re-dock (collapsed or last dock position). Buffers and tabs stay in sync whether the editor is docked or floating. **Floating editor policy (MVP):** Exactly **one** floating editor window is supported; if the user drags out again, re-dock the existing floating window and float the newly dragged group, or replace the floating window -- document implementation choice. **Discoverability:** Provide affordance (e.g. drag handle or "Pop out") and optional first-time tooltip so users learn that the editor can be detached.
- **Tabs:** Multiple open files are shown as **tabs** (or equivalent list). User can switch between open files, close a tab (with unsaved prompt if dirty), and reorder tabs if the design supports it (keyboard-accessible move tab left/right when reorder is supported). Persist open tab list per project so reopening the app restores the same set of open files (§2.9).

### 2.2 Editing and saving

- **Editable content:** Opened files are **editable** (not read-only preview). User can type, delete, and paste. Changes are tracked so the UI can show an unsaved (dirty) state.
- **Save:** **Save** writes the current buffer to the file path (overwrite). Keyboard shortcut (e.g. Ctrl+S). Optional: **Save As** to a new path. **Save success feedback:** On successful save, clear dirty state and show brief feedback (e.g. "Saved" toast or status bar message, or clear unsaved indicator); user must be able to see that save succeeded. **Save failure:** On write failure (disk full, permission denied, path deleted, read-only file), keep the buffer **dirty**, do **not** update "last saved" content, and show an **error message** with **Retry** and optional **Save As**; do not silently fail.
- **Unsaved indicator:** Each tab shows an unsaved indicator (e.g. dot or asterisk) when the buffer has unsaved changes. **Also** show unsaved state in at least one other stable place (e.g. window title or status bar) so it remains visible with many tabs or when the tab strip is scrolled. Closing a tab or switching project with unsaved changes prompts the user (Save / Discard / Cancel).
- **Revert:** Optional **Revert** (reload from disk) and **Revert last agent edit** (from Assistant chat thread; assistant-chat-design §13); can integrate with Git/restore points per newfeatures.md. **Revert last agent edit contract:** Triggered by user action from chat (or editor menu). Backend (FileSafe/chat) performs the revert (e.g. Git restore); then the backend sends a **refresh notification** to the editor for that path (e.g. `BufferReverted(path)` or equivalent). The editor reloads that buffer from disk and updates the view; the editor does not perform the revert itself. See Plans/FileSafe.md.

### 2.3 Display and navigation

- **Line numbers:** Show **line numbers** in the gutter (toggle optional). Enables "go to line" and correlation with chat diffs (e.g. "Edited: path (lines 12-45)").
- **Go to line / range:** When opening from chat with **line or range information**, the editor **opens the file and scrolls to that line or range** and **highlights the range** (read-only highlight). **Line/range format:** 1-based, inclusive; e.g. single line `12` or range `12-45`. Chat and editor use the same format (e.g. "lines 12-45" or L12-L45). Highlight stays until the user edits or moves the cursor; **optional fade** after a **configurable delay** (default e.g. 5 s; Settings → Editor). Command or action "Go to line..." (e.g. Ctrl+G) for manual jump. If the requested line is beyond the file length, **clamp to the last line** (and optionally show a brief "Clamped to line N" hint).
- **Syntax highlighting:** **Basic syntax highlighting** by language (inferred from file extension or shebang). Extension → language map for common types (e.g. `.rs`, `.py`, `.md`, `.json`, `.toml`, `.html`, `.css`, `.js`); shebang in first line for scripts. Unknown extension or plain text: no highlighting. Palette respects app theme (Retro Light/Dark, Basic); token→color mapping is app-owned. **When LSP is available** for the file's language (§10.10), **semantic highlighting** from the language server can augment or replace basic highlighting; basic highlighting remains the fallback when LSP is unavailable or for unsupported file types.

### 2.4 Split panes and editor groups

**Split editor panes** are in scope for MVP. The user can split the editor area into **multiple editor groups** (e.g. side-by-side or top/bottom). **Tab bar model (MVP):** Each group has **its own tab list** and active tab; the **buffer model is shared** -- one buffer per file path across all groups. Opening a file from File Manager or chat targets the **active (focused) editor group** by default; optional "Open in" (e.g. right-click) can offer "Open in other group" or "Open in new group." **Single buffer, multiple views:** When the same path is open in more than one editor group, all views show the **same buffer** and **same dirty state**; any edit in one group updates the other views immediately. Cursor/scroll position is per-view; only one "active" tab per group.

### 2.5 Data model and dirty state

- **Buffer model:** One buffer per file path; one tab per path per group (no duplicate tabs for same path in one group). The active tab is the current buffer. See §2.4 for same path in multiple groups.
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
- **Max tabs (GUI setting):** The app exposes a **Max editor tabs** (or **Max open tabs**) setting in the GUI (e.g. Settings → Editor). This caps how many tabs (buffers) are kept in memory; when exceeded, LRU eviction applies (§10.7). Default e.g. 20-30; user can increase or decrease. Stored with other app settings in redb.
- **Other editor-related state in redb:** Consider storing **editor layout** (split groups, active group, collapse state of File Editor strip) and **recent files** list (for quick open / @ mention) in the same redb schema (settings/sessions) so they persist per project and survive restart.
- **Restore order and lazy load:** On app start (or project open), restore the tab list and active tab index; **load only the active tab's buffer** immediately. Load other tab contents **on first switch** to that tab (lazy load). **Max persisted tab count:** Cap the restored tab list (e.g. 50) so startup and storage stay bounded even if the user had raised max open tabs; drop oldest from persisted list if over cap.
- **Dirty buffers on exit:** On quit or project switch with unsaved changes, prompt Save / Discard / Cancel. **Recover unsaved:** Optional for MVP (e.g. on crash or quit-with-unsaved, offer to restore from recovery store); if implemented, use redb or temp per **Plans/storage-plan.md**. §10.9 lists it as in-scope; treat as optional for initial release so §2.9 and §10.9 are aligned.

**Transient UI states:** The editor and File Manager must show clear, consistent states and copy for: **Loading...** (file open in progress); **Decoding...** (when applicable); **Cannot decode as UTF-8** (§2.6); **File not found** / **Deleted** (§7); **Binary file** (§2.6); **File too large** (§2.7); **Indexing...** (when building symbol index); **Open failed** (e.g. permission denied -- with brief reason). Use these in tabs, placeholders, or status so tests and UI stay consistent.

**Accessibility:** Support keyboard-only use for File Manager tree (§1), editor tabs, and dialogs. Provide visible focus indicators, logical focus order, and screen reader-friendly labels/ARIA where the UI stack allows. Respect reduced-motion preferences for animations if applicable. Detailed a11y requirements may live in a dedicated accessibility doc; this plan requires that editor and File Manager are not mouse-only.

---

## 3. @ mention in chat

**Done when:** Typing @ opens file list (same as File Manager); selecting a file adds it to message context; UI explains @ = context vs click = open. **Requires** same file list source as File Manager; full UX in assistant-chat-design. **If file list fails:** Show message in @ popup (e.g. "No project" or "Could not load files"); do not send message with invalid ref. **File deleted after @:** At send time, if file is missing, either resolve to last-known content or warn and allow send without attachment.

- **Trigger:** In the chat input, the user types **@** to open a **small search box** over the file list (same file list as File Manager -- single source of truth).
- **Behavior:** User picks a file (search/filter by name or path); the selected file is **added to the agent's context** for that message (e.g. as an attachment or context reference so the agent can read it). This provides explicit file context without leaving the chat. **@ vs click-to-open:** **@** adds the file to the **message context** (agent can read it); **clicking** a path or code block **opens the file in the editor**. They are intentionally different: context vs open. Explain this in the UI (e.g. tooltip or short hint) so users are not confused.
- **Scope:** Chat-specific; full UX for @ mention is in assistant-chat-design.md. This plan states that @ mention resolution uses the same file list as the File Manager.

---

## 4. Integration: File Manager, editor, and chat

- File Manager, editor, and chat share the **same project context**.
- @ mention resolution uses the same file list as the File Manager (single source of truth for "project files").
- **Clicking a file path or code block in chat opens the file in the editor**; see §5.

### 4.1 Open-file contract

**Done when:** All callers (chat, File Manager, Ctrl+P) use one handler; request shape and defaults as specified; response is add/switch tab + optional scroll/highlight; floating editor receives focus and file. **Implement §4.1 before §2 (editor), §1 (File Manager open), §5 (click-to-open).** Editor is the single target; contract is the API. **Response on failure:** If open fails (not found, permission, too large, binary), return or signal error; caller shows message; do not add tab with broken state. **Path outside project:** Reject or constrain to project root; document. **Response shape:** Success: tab added or focused; optional payload for line/range applied. Failure: error code + message (e.g. FileNotFound, PermissionDenied, FileTooLarge).

All "open file" actions (chat click-to-open, File Manager selection, quick open Ctrl+P) use a **single internal contract** and one code path. **Request shape:** `OpenFile { path: PathBuf, line?: number, range?: { start: number, end: number }, target_group?: 'active' | 'other' | 'new' }`. **Defaults:** `line` and `range` are 1-based inclusive; `target_group` defaults to **active** (focused editor group). If the editor is floating, the target is still the single editor surface -- focus the floating window and open the file there. **Response:** Add or switch to the tab for `path` in the target group; if `line` or `range` is set, scroll to and optionally highlight that range (§2.3). Implementors: one function/handler for all callers.

---

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
- **Project root moved/renamed:** Invalidate list and tabs; show File not found. **Detection:** Detect via failure on next I/O (e.g. read/save) or optional watcher on project root; document the chosen approach so behavior is reliable.
- **Symlinks:** Specify in this spec or implementation docs whether symlinks are **followed** (show target contents) or **shown as a single node** (no follow). Document the choice.
- **File replaced by directory (or vice versa) on disk:** If the path now refers to a directory (or was a directory and is now a file), on next open/save or refresh show a clear state (e.g. "Path is no longer a file") and offer to close the tab.
- **Editor floating and main window closed:** If the user closes the main window while the editor is floating, define behavior: e.g. app keeps running until the floating editor window is closed, or app exits -- document the choice in §2.1 or §12.1.10.
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

- **Open HTML in browser:** When user opens an HTML file, app can open it in system or embedded browser (or "Open in browser" / "Preview" action). Use file: URL or local HTTP server so relative paths resolve.
- **Edit + hot reload:** User opens HTML in editor; optionally preview in browser. When user saves the HTML file or any **linked** file, browser view refreshes automatically after a debounce. **Linked files:** Files that trigger refresh are the HTML file itself and any resource referenced by it (e.g. `<link href="...">`, `<script src="...">`) that lie under the project or the same directory; implementation may use a simple same-dir + referenced-path rule. **Debounce:** **400 ms** default (per file, per preview instance); configurable in Settings → Editor or Developer (e.g. 100-2000 ms); persist in redb. Rapid saves result in one refresh after the last save within the window. Tight loop: edit → Save → see result in browser.
- **Scope:** One or more HTML files per project; embedded vs system browser is implementation choice. Local resources only; no remote deployment in MVP.
- **Security:** Preview in sandboxed/local context (file: or localhost). Document any restrictions (e.g. no file:// to paths outside project).

### 8.3 Same browser surface as built-in browser and click-to-context

The HTML preview uses the **same built-in browser** as in **Plans/newfeatures.md §15.18** (Built-in Browser and Click-to-Context). One WebView/browser panel for: (1) Local HTML preview and hot reload (§8.2), (2) **Click-to-context for the Assistant**: user can **click on parts of the page** and **send that element's context to the Assistant chat** (DOM, attributes, rect, etc.) via the same mechanism as §15.18 (modifier key or "Send element to chat" toggle). When viewing your HTML design in this browser, you can click an element and add it as context for the next message. Edit → Save → hot reload → click section → send to Assistant. Element context schema, capture mode, security, and Assistant integration are in newfeatures.md §15.18. **Web app testing:** Same browser surface aligns with web app testing/verification (Playwright, browser verifier, GUI tool catalog per feature-list and newtools.md).

### 8.4 Click-to-context when viewing HTML

When viewing a local HTML file in the built-in browser (with or without hot reload), **clicking an element** (with same modifier or toolbar as newfeatures.md §15.18) **sends that element's context to the Assistant**. The Assistant receives a structured summary (tag, id, class, text, role, rect, parent path, optional HTML snippet) so the user can ask for changes or explanations about that part of the page. Same behavior as "launch webapp and click to send context"; here the "webapp" is the user's local HTML file.

---

## 9. Tabs: Editor, Terminal, Browser

**Done when:** Editor tabs per §2; terminal tabs with pin semantics; browser instances capped and policy (reuse/LRU/prompt) documented. **Max browser instances:** Redb key e.g. `app.editor.max_browser_instances` (redb `settings` namespace; app-level); default 3-5. **Settings:** Max browser previews: Settings → Editor or Developer; range 1-10; persist in redb. Terminal tab limit: document default and key if applicable. **Pin semantics:** Editor pin (see §12.4 Suggested additions -- Pin tab) aligns with or distinguishes from terminal pin; define in §2 or §9 if needed.

- **Editor tabs:** Multiple open files in the editor are shown as **tabs** per editor group (§2.1, §2.4). Reorder, close (with unsaved prompt), persist per project.
- **Terminal tabs:** The **Terminal** (bottom panel per feature-list/gui-layout) supports **tabs**: multiple terminal sessions (e.g. one per shell or task). User can open a new terminal tab, switch between them, close, and optionally name or **pin**. **Pin semantics:** Pinned terminal tabs are excluded from "Close others" (and optionally from LRU-style close when terminal tab limit exists); align with or explicitly distinguish from editor pin (§12.4). Each tab has its own cwd and history; project context applies when a project is selected.
- **Browser:** The app supports **multiple browser instances** (e.g. multiple preview windows or browser panels). **Cap:** Enforce a **max browser instances** (e.g. 3-5; configurable in Settings, persist in redb). **One instance** = one WebView/preview window. When the user tries to open another preview over the cap: reuse an existing instance (switch its URL to the new file), or close least-recently-used and open the new one, or prompt "Max previews reached." Document choice. No requirement for **tabs within** a single browser. Each instance is the same WebView/browser surface (§8, newfeatures.md §15.18) with click-to-context available.

---

## 10. Editor enhancements (MVP)

All of the following are **in scope for MVP**. When **LSP is available** for the current preset (§10.10), diagnostics, hover, autocomplete, go-to-definition, and symbol search use the language server; **fallback** to text-based or indexed search when LSP is unavailable.

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

- **In-app browser + click-to-context:** Already in §8 and newfeatures.md §15.18.
- **Visual design sidebar:** Sidebar for the **HTML/preview** workflow: theme (light/dark), visual controls for CSS (shadow, opacity, borders, colors, dimensions, layout), drag-and-drop element rearrangement, component prop inspection. **One-click apply** changes from sidebar to code (e.g. update HTML/CSS in editor). Complements hot reload (§8.2).
- **Agent-driven browser actions:** The Assistant (or agent) can **drive the built-in browser**: navigate, click, type, scroll, take screenshots, read console/network. Same WebView as §8; actions gated by tool policy and user permissions (assistant-chat-design). **Browser/Assistant boundary:** The interface (how chat/Assistant sends commands and receives results) and security constraints are defined in Plans/newfeatures.md §15.18; this plan assumes that boundary is implemented there.

### 10.7 OpenCode-inspired

- **Session-scoped view state:** Per-file view state (scroll, cursor, selected range) can be **session-scoped** as well as per-project. **Session** = chat thread (thread id) when in Assistant/Interview; optionally interview session id. State is keyed by `project_id` + `session_id`. When the user switches threads, **explicitly prompt:** e.g. "Restore N tabs from [thread name]?" with **Yes** / **No** / **Don't ask again** -- do not restore silently without user choice.
- **LRU content cache with eviction:** Limit in-memory open buffers by **size or count** with LRU eviction; the **max tabs** value (§2.9) is the cap. When reopening an evicted file, reload from disk. Prevents unbounded memory use with many open tabs.
- **File tree + watcher invalidation:** File Manager tree **invalidates or refreshes** when files change on disk (e.g. via filesystem watcher). Optional "watch" toggle; refresh on focus or manual refresh remains available.

### 10.8 Graphite-style (review and quality)

- **AI or rule-based code review:** Assistant (or dedicated review mode) can perform **automated code review** on demand or on commit/PR: logic bugs, security, style, documentation, accidental commits. Inline-style comments or a review panel; integrates with chat and file context.
- **Custom review rules:** User- or project-defined **review rules** (e.g. "flag TODOs," "require error handling here," "OWASP checklist"). Enforced during review runs or as optional editor hints (with or without LSP; LSP diagnostics can complement rules). **Storage:** Project-level (e.g. `.puppet-master/review-rules.md` or `.puppet-master/review-rules.yaml`) and application-level (redb or app config); project rules override or extend app rules. Format: markdown or YAML (list of descriptions or named rules with description and severity). See §12.1.9.
- **1-click apply suggestion:** In chat or in a review panel: **"Apply this change"** applies a suggested diff (e.g. agent suggestion or review fix) to the file in the editor. Reuses same apply/patch pipeline as agent edits (FileSafe, tool policy). See §12.2.8 for merge/conflict handling.

### 10.9 Additional editor features (MVP)

All of the following are **in scope for MVP**. Evaluate usefulness at implementation; some may be optional or simplified.

- **Recover unsaved buffers:** Optional for MVP. On crash or quit-with-unsaved, offer to restore unsaved content from recovery store (redb or temp per Plans/storage-plan.md). Align with §2.9 (optional for initial release).
- **Editor diff view:** Side-by-side or inline diff of two versions (e.g. buffer vs disk, or two branches); integrate with revert and review.
- **Snippets and templates:** User-defined or preset code snippets; expand on trigger (e.g. prefix or shortcut).
- **Search in chat / search in messages:** Extend "powerful search" (§10.2) to include chat history and thread messages (content or metadata).
- **Breadcrumbs:** Use LSP document outline when LSP is available (§10.1, §10.10); otherwise use heuristics.
- **Per-preset keybinding schemes:** Optional keybinding profile per preset (e.g. VS Code vs Vim vs JetBrains-style) in addition to modal editing.
- **Editor theming:** User-selectable editor theme (beyond app theme) for syntax colors and editor background.
- **Minimap click-to-scroll:** Click on minimap to jump to that region of the file (common in IDEs).
- **Terminal replay / log:** Persist terminal output per tab for replay or copy after close; optional.

**Storage alignment:** Editor and panel state (open tabs, max tabs setting, layout, view state) are persisted in **redb** (§2.9 schema). Optional: editor **lifecycle events** (e.g. `FileOpened`, `FileClosed`, `TabSwitched`, `BufferSaved`, `BufferReverted`) can be written to **seglog** for analytics; projector pipeline can then index or roll up as needed. A minimal event set supports "revert last agent edit" (refresh after revert), analytics, and future features. **Confirm dialogs:** Standardize all confirmation prompts (Save/Discard/Cancel, Reload/Overwrite/Cancel, Discard unsaved and reload?, etc.) as one pattern: **message + optional "Show diff" + 2-3 buttons**; same UI component and accessibility behavior for all.

### 10.10 LSP support (MVP)

**Implementation dependencies:** §10.10 LSP requires **§4.1 open-file contract** (to know which file is open and which editor group is active), **§2 buffer model** (to send `didOpen`, `didChange`, `didSave` and to apply edits), and **§11 preset** (to know which LSP server(s) to start and their config). Implement the open-file contract and editor buffer/tabs before LSP document sync; implement preset detection and storage before LSP lifecycle.

**Done when:** For a file whose language has an LSP server configured in the current preset and started successfully: diagnostics appear in the editor and in a Problems panel; hover shows info; autocomplete works on typing or manual trigger; go-to-definition and go-to-symbol (current file and workspace) work. When LSP is unavailable or fails (not configured, failed to start, or crashed), fallback behavior is used (e.g. regex-based outline for go-to-symbol, grep/index for go-to-definition) and no LSP-only UI is shown without a defined fallback or a clear "LSP unavailable" message with Retry/Settings.

LSP (Language Server Protocol) is **in scope for MVP**. When an LSP server is available for the current language or preset, the editor uses it for: **core** (diagnostics, hover, autocomplete, go-to-definition, symbol search, breadcrumbs) and **full feature set** (code actions, rename, format on save, inlay hints, signature help, find references, highlight occurrences, go to type definition/implementation/declaration, semantic folding, expand/shrink selection, document links, color picker, CodeLens, format on type, call hierarchy, semantic tokens, and chat/agent integration) as specified in §§10.10.1-10.10.8. When LSP is unavailable or fails, the app falls back to text-based or indexed behavior as specified in §10.1, §10.2, and §12.1.4.

#### 10.10.1 Behavior

All of the following are **when LSP is available** for the current file's language and preset; fallback behavior is defined in §10.10.3, §10.10.4, and the sections referenced below. When a capability is not supported by the server or LSP is unavailable, the client behaves as specified in the Fallback / Gaps sections; no vague "optional" -- the client always has a defined action.

- **Diagnostics:** Underline/squiggles in the editor for errors and warnings; **Problems** panel lists all diagnostics for the project (or current file). **Source:** LSP notification `textDocument/publishDiagnostics` (server pushes; client does not request). **Trigger:** None (server sends after document sync). **UI:** Inline squiggles by severity (error/warning/info); Problems panel shows file, line, message, source (server id); click opens file at range. **Keybinding:** Open Problems panel (e.g. Ctrl+Shift+M or View → Problems). When **multiple servers** publish diagnostics for the same file, merge by appending; show source label per diagnostic so user can distinguish (e.g. "rust-analyzer", "eslint").
- **Hover:** At cursor, show hover info (type, doc comment, etc.). **Source:** LSP `textDocument/hover` (request). **Trigger:** Cursor idle at a position for **150 ms** (debounce); cancel any in-flight hover when cursor moves or document changes. **UI:** Tooltip (markdown or plain text) at cursor; dismiss on cursor move or Escape. **Keybinding:** Optional "Show hover" (e.g. Ctrl+K Ctrl+I) to force hover at cursor. **When not supported:** No tooltip; no error.
- **Autocomplete:** Inline completion list. **Source:** LSP `textDocument/completion`; for items that need expansion, `completionItem/resolve` before insert. **Trigger:** On typing (debounce **50-100 ms** to avoid flooding) or manual trigger (e.g. Ctrl+Space). **Request:** Send `textDocument/completion` with `position` and optional `context.triggerKind` (Invoked, TriggerCharacter, TriggerForIncompleteCompletions). **UI:** Dropdown at cursor; select with Enter/Tab; dismiss with Escape. **Keybinding:** Ctrl+Space for manual trigger. **When not supported:** No LSP completions; editor may still offer word/snippet completion from buffer.
- **Go to definition:** Jump to definition on action. **Source:** LSP `textDocument/definition`. **Trigger:** User action (e.g. F12 or Cmd+click on symbol). **Request:** Send `textDocument/definition` with current document URI and position. **UI:** Single location → open file (or tab) and go to range; multiple locations → show picker, then open chosen. **Keybinding:** F12 (or Cmd+click). **When not supported or empty:** Fallback: grep/index (§12.1.4); optionally show "No definition found."
- **Go to symbol (current file):** List symbols in current file; jump on select. **Source:** LSP `textDocument/documentSymbol`. **Trigger:** User opens "Go to symbol in file" (e.g. Ctrl+Shift+O). **Request:** Send `textDocument/documentSymbol` for current document. **UI:** List or tree (by kind); select opens and jumps to range. **Keybinding:** Ctrl+Shift+O. **When not supported:** Fallback: regex-based outline (§12.1.4).
- **Find symbol in workspace:** Search symbols across the project. **Source:** LSP `workspace/symbol`. **Trigger:** User invokes "Go to symbol in workspace" (e.g. Ctrl+T); optional query string. **Request:** Send `workspace/symbol` with optional `query`. **UI:** Panel or quick-pick list; select opens file and goes to range. **Keybinding:** Ctrl+T (or equivalent). **When not supported:** Fallback: project index (§12.1.4).
- **Breadcrumbs:** Document outline for breadcrumb path. **Source:** Same as "Go to symbol (current file)" -- `textDocument/documentSymbol`; build hierarchy from returned symbols. **Trigger:** Always (when document has symbols). **UI:** Breadcrumb bar above or below editor showing path to current symbol; click navigates. **When not supported:** Heuristic (indent/brace) per §10.1.

#### 10.10.2 How we're going to do it

- **Per-preset / per-language server mapping:** Each preset (or language) maps to one or more LSP servers. Examples: **Rust** → rust-analyzer; **Python** → pylsp (or pyright); **TypeScript/JavaScript** → typescript-language-server (tsserver) and optionally **ESLint** LSP; **C/C++** → clangd; **Go** → gopls; **C#** → OmniSharp or C# Dev Kit. Mapping is defined in preset config (e.g. in platform_specs or a dedicated LSP config module); **binary path** comes from preset or **PATH** (with optional user override in Settings).
- **Lifecycle:** Start the server when the **project is opened** or when the **first file of that language is opened**; stop when the **project is closed** or after a configurable **idle timeout** (no open files of that language for N minutes). One process per (project, server) or per (project, language) as needed; multiple servers per project (e.g. Rust + ESLint) are supported.
- **Protocol:** Communicate via **stdio** (default) or **TCP** (e.g. for debugging). JSON-RPC 2.0; LSP 3.x. **Request order:** (1) Send `initialize` with client capabilities and root URI; (2) send `initialized`; (3) for each already-open document, send `textDocument/didOpen`. Thereafter: for each open document send `textDocument/didOpen` on buffer open, `textDocument/didChange` on edit (see **Document sync** below), `textDocument/didClose` on buffer close, `textDocument/didSave` on save (if server declares `textDocumentSync.save`). Request `textDocument/hover`, `textDocument/completion`, etc., as needed. Handle `textDocument/publishDiagnostics` notifications.
- **Document sync:** On buffer open: send `didOpen` with `textDocument: { uri, languageId, version, text }`. On edit: **debounce** (e.g. 300 ms); then send `didChange`. Use **incremental sync** when server advertises `textDocumentSync.change === Incremental`: send `contentChanges: [{ range, rangeLength?, text }]` and increment client-held `version` per change. When server does **not** support incremental: send full `text` in `contentChanges: [{ text }]` and bump version. On buffer close: send `didClose`. On save: send `didSave` (with optional `text` if server requested it). **When server does not support a sync kind:** Client still sends the minimum the server accepts (per capability); never assume server has latest content without sending.
- **Request cancellation:** For **idempotent** requests that depend on cursor position or document state (hover, completion, signature help, document highlight, inlay hints, selection range), **cancel the previous request** when a new one is triggered (e.g. cursor moved, key typed). Use LSP cancellation: send `$/cancelRequest` with the previous request id before or when sending the new request; discard the result of the cancelled request and do not update UI with it. **No cancellation** for user-explicit one-shot actions (e.g. go to definition, rename) until the user cancels (Escape) or a timeout applies.
- **Applying WorkspaceEdit:** When the server returns a `WorkspaceEdit` (code action, rename, format, etc.): (1) **Order:** Apply `documentChanges` in the order given if present; otherwise apply `changes` (map of URI → TextEdit[]) in a deterministic order (e.g. sort URIs). (2) **Resource operations:** If `documentChanges` includes `CreateFile`, `RenameFile`, or `DeleteFile`, apply them in order: CreateFile before any TextEdit to that URI; RenameFile/DeleteFile after all edits to the old URI. If the client does not support resource operations, apply only the `changes` (text edits) and optionally show a message that renames/creates/deletes were skipped. (3) **Undo:** Apply all edits in a single undo group so one Undo reverts the whole change. (4) **After apply:** Send `textDocument/didChange` (or didOpen for new files) so server state stays in sync; do not send for format-on-save if the next action is didSave.
- **Editor integration:** On buffer open: send `didOpen` with URI, languageId, version, and full text. On edit: debounce (300 ms) and send `didChange` (incremental or full per server capability). On save: send `didSave`. Request hover on cursor move (debounce 150 ms; cancel previous); completion on typing (debounce 50-100 ms; cancel previous) or manual trigger; definition/symbol on user action. Map LSP ranges (0-based line, character) to editor line/column; apply diagnostics as decorations; show hover in a tooltip and completion in a dropdown.
- **Fallback:** If the server is **not configured** (missing from preset or PATH), **fails to start**, or **crashes**: no diagnostics, hover, or completion from LSP; use §12.1.4 for go-to-symbol and find-symbol-in-workspace; use §10.1 heuristics for breadcrumbs. Show a non-blocking message ("LSP unavailable for this language") and offer "Retry" or "Open Settings" (dismissible).

#### 10.10.3 Gaps and how we address them

Each gap has a **Solution** so the client never has undefined behavior.

- **Server discovery:** Resolve server binary from preset config (path or command name). If only a name is given (e.g. `rust-analyzer`), look up in **PATH**. **Gap:** Binary not found or not executable. **Solution:** Do not start server; mark LSP unavailable for that language; show "LSP unavailable" and offer Settings/Retry. Allow user to set path per server in Settings (project or app-level). Document in preset/LSP config where to add new languages or override paths.
- **Initialization options:** Some servers need `initializationOptions` (e.g. cargo features, Python venv path). **Gap:** Init options missing or wrong; server fails or behaves poorly. **Solution:** Preset or project config supplies options; pass through in `initialize` request. Document supported options per known server; if server fails during init, treat as server crash and offer Restart/Settings.
- **Multi-root vs single root:** MVP uses **single root** (one workspace root = project root). **Gap:** Server expects multi-root. **Solution:** Send one root in `initialize.rootUri`; do not send `workspace/workspaceFolders` for MVP. If we later support multi-root, send `workspace/workspaceFolders` and handle folder change notifications.
- **Multiple servers per project:** Supported (e.g. Rust + ESLint). **Gap:** Merge strategy for diagnostics/hover/completion when several servers respond. **Solution:** Diagnostics: merge by appending; tag each with server id in UI. Hover: first non-null response wins (or show combined if we support multiple tooltips). Completion: merge lists by server and show; or first server that returns non-empty wins; document chosen strategy. Symbol/definition: first non-empty wins; or show picker if multiple servers return results.
- **Server doesn't support capability:** Server omits a capability in `initialize` response. **Solution:** Client does not send that request; UI hides or disables the feature; fallback per feature (e.g. §12.1.4 for symbols, §10.1 for breadcrumbs).
- **Server returns empty or partial:** e.g. `definition` returns `null`, `documentSymbol` returns `[]`. **Solution:** Treat as "no result"; show "No definition" or use fallback (grep/outline) where specified; do not show error to user for empty.
- **Server returns error:** Request fails with LSP error code. **Solution:** Log; do not update UI with stale data; for user-initiated actions show a short message ("Language server error"); optionally offer Retry. Do not block UI.
- **Timeout:** Request does not complete within configured time (e.g. 5 s). **Solution:** Cancel request; discard result; for hover/completion show nothing or "Timed out"; for user actions show "Request timed out" and offer Retry.
- **Unsupported language:** File language has no configured LSP server. **Solution:** No LSP for that file; use fallbacks (regex outline, grep) where defined; optional hint to add preset or install server.
- **Version mismatch (LSP 3.16 vs 3.17):** Server or client uses different LSP version. **Solution:** Client advertises supported features; only use capabilities both sides declare; for 3.17-only features (e.g. some call hierarchy), check server capability and disable if absent.
- **Init options missing:** User/project did not set required init options. **Solution:** Use documented defaults per server; if server fails or misbehaves, document required options and allow override in Settings.

#### 10.10.4 Potential problems and solutions

Each problem has a **Solution** so the implementer knows exactly what to do.

- **Server crash or hang:** **Solution:** If the server process exits unexpectedly, mark LSP as unavailable for that (project, server); optionally restart once (with backoff, e.g. 2 s). If a request doesn't respond within timeout (e.g. 5 s), cancel it and fall back; do not block the UI. Show "LSP disconnected" and offer Retry.
- **UI blocking:** Long-running LSP requests could freeze the UI. **Solution:** All LSP requests are async; never block the main thread. For user-triggered actions (e.g. rename), show a progress indicator or "Working..."; allow cancel (Escape). Discard stale results when document/position changes (request cancellation).
- **Performance (flooding server):** Too many requests (e.g. hover on every keystroke). **Solution:** Debounce: hover 150 ms, completion 50-100 ms, didChange 300 ms. Cap completion results (e.g. 100 items) if server returns more; show "N more" or truncate. Lazy-load symbol list (e.g. workspace/symbol) when panel opens, not on every keystroke.
- **Memory:** Each LSP server process uses memory. **Solution:** Limit concurrent servers per project (e.g. one per language or per preset); stop idle servers after configurable timeout (no open files of that language for N minutes) to free resources. Limit number of open documents sent to server if needed (e.g. cap at 50); close least-recently-used on overflow and send didClose.
- **Slow or noisy diagnostics:** **Solution:** Debounce `didChange` (300-500 ms) so we don't flood the server. For large workspaces, cap Problems panel (e.g. 500 items) or scope to open files; allow "Load all" or "Show N more." Merge diagnostics from multiple servers; tag by source.
- **Multi-file rename (conflict, partial failure):** Rename returns WorkspaceEdit touching many files; one file is read-only or save fails. **Solution:** Apply edits in order (§10.10.2); if an edit fails (e.g. file locked), stop and show which file failed; do not apply further edits; offer "Retry" or "Apply remaining." Optionally show preview (diff) before apply.
- **Format on save (long file, timeout):** Formatting request takes too long or times out. **Solution:** Set a format timeout (e.g. 5 s); on timeout, save without formatting and optionally show "Format timed out; file saved unformatted." For very large files (e.g. >10k lines), optionally skip format on save or use rangeFormatting for modified regions only.
- **Inlay hints (too many, visibility):** Server returns hundreds of hints; UI is cluttered. **Solution:** Request inlay hints only for visible range; cap number rendered (e.g. 200); or reduce density (e.g. only parameter names, not all types). User can disable inlay hints in Settings.
- **Signature help (multiple overloads, no doc):** Many overloads or missing documentation. **Solution:** Show active overload and parameter; allow next/previous overload (arrows or dropdown). If no doc, show signature only. Timeout/cancel on cursor move.
- **Find references (1000+ results):** Server returns very many locations. **Solution:** Cap displayed results (e.g. 500); show "Showing first 500 of N" and "Load more" or open in panel with virtual scrolling. Group by file; lazy-load file contents on expand.
- **Highlight (large file):** documentHighlight on a huge file is slow or returns many ranges. **Solution:** Debounce (150 ms); cancel on cursor move. Cap highlighted ranges (e.g. 100); if more, show first N and optionally "N more occurrences."
- **Folding (nested depth):** Very deep foldable regions. **Solution:** Use server's folding ranges as-is; editor limits expand depth (e.g. 10 levels) to avoid UI explosion; or collapse beyond depth by default.
- **Document links (broken URI):** Server returns invalid or unresolvable URI. **Solution:** Validate URI before opening; if invalid, show in tooltip but do not open; or open in browser and let browser handle 404. Resolve via documentLink/resolve when server supports it.
- **Color picker (unsupported format):** User chooses a format (e.g. HSL) server doesn't support in colorPresentation. **Solution:** Request colorPresentation with user's preferred format; if server returns empty, keep previous text or show hex only. Fallback: edit as plain text.
- **CodeLens (click race, command failure):** User clicks lens while command is still resolving; or command fails. **Solution:** Disable lens click until resolve completes; show "Loading..." on lens if needed. On command failure, show toast "Command failed" and do not change buffer.
- **Format on type (conflict with user edit):** Server returns edit that overlaps user's next keystroke. **Solution:** Apply format-on-type edit immediately after trigger character; if buffer version changed (user typed again), discard format edit and do not apply. Optional: disable format on type by default to avoid conflicts.
- **Call hierarchy (deep tree):** Very deep incoming/outgoing calls. **Solution:** Lazy-load children on expand; cap depth (e.g. 20 levels) or node count per level; show "N more" at bottom.
- **Semantic tokens (large file, delta):** Full semantic tokens for a big file are expensive; server may support delta. **Solution:** Prefer semanticTokens/range for visible range; if server supports semanticTokens/delta, use it after full once. Fall back to syntax-only if request times out or fails.
- **Chat/agent (stale LSP state):** Agent applies edits; LSP state (diagnostics, symbols) is stale. **Solution:** After applying edits from chat/agent, send didChange so server updates; refresh diagnostics/hover when user focuses the file. Chat/agent "get diagnostics" returns last-known; document that it may be stale until server republishes.

#### 10.10.5 LSP features (MVP) -- editing and refactor

All of the following are **in scope for MVP** when LSP is available for the current language; fallback when the server does not support the capability or when LSP is unavailable is described per feature. **Gaps** and **Potential problems** are listed per feature; see also §10.10.3 and §10.10.4 for cross-cutting items.

- **Code actions (quick fix):** **Behavior:** At a diagnostic (error/warning), show a lightbulb or "Quick fix" action; user invokes it to apply a server-suggested fix (e.g. add import, fix typo, suppress). **How we do it:** Request LSP `textDocument/codeAction` at the cursor or for the diagnostic range (with `context.diagnostics` so server can filter); if the server returns actions, show them in a menu; on select, for unresolved actions call `codeAction/resolve` then apply the returned `WorkspaceEdit` per §10.10.2 (order, resource ops, undo group); notify LSP with `didChange` after apply. **Trigger:** Right-click or lightbulb click at diagnostic/cursor; optional keybinding (e.g. Ctrl+.). **UI:** Menu (panel or inline); single action can be applied directly. **Fallback:** If the server returns no actions or capability is missing, show no lightbulb; user can still fix manually. **Settings:** Optional "Show code actions on save" to batch-apply safe fixes on save. **Gaps:** Server doesn't support codeAction → no lightbulb. Server returns empty → show "No code actions." Server returns error/timeout → show "Code actions unavailable" and do not block. **Potential problems:** Apply fails (e.g. conflict) → show error, do not change buffer; offer Retry. Code action applies to multiple files → apply in order per §10.10.2; on partial failure, stop and report which file failed.

- **Rename:** **Behavior:** User invokes "Rename symbol" (e.g. F2 or context menu) at a symbol; optionally a preview of all changes is shown; on confirm, all references in the workspace are updated. **How we do it:** Call LSP `textDocument/prepareRename` first when supported to get the range and default new name (or to show an error if rename is invalid). If prepareRename returns a range and placeholder, show inline edit or dialog with default name; user confirms or edits name. Then call `textDocument/rename` with the new name; server returns a `WorkspaceEdit`. Apply per §10.10.2; if multi-file, show summary ("Renaming in 3 files") and apply; optionally show diff preview before apply. **Trigger:** F2 or context menu "Rename symbol." **UI:** Inline rename widget or modal with new name; confirm applies; Escape cancels. **Fallback:** If `prepareRename` or `rename` is unsupported or fails, do not offer rename from LSP; optional future: text-based rename (single file or grep-and-replace). **Settings:** None required for MVP. **Gaps:** prepareRename not supported → call rename directly with symbol at cursor as default name. Rename returns empty → show "No references to rename." **Potential problems:** Multi-file rename conflict/partial failure → see §10.10.4 (stop at failure, report file). Large WorkspaceEdit → apply in order; show progress if many files.

- **Format on save:** **Behavior:** When the user saves a file, the buffer is formatted (indentation, line breaks, etc.) according to server/language rules before writing to disk. **How we do it:** On Save, if "Format on save" is enabled, call LSP `textDocument/formatting` (full document) with document URI and options (e.g. tabSize, insertSpaces); apply the returned TextEdit[] to the buffer, then persist and send `didSave`. If the server supports only rangeFormatting, call it for modified ranges or full document in chunks. If the server does not support formatting, save without formatting. **Trigger:** Save (Ctrl+S). **Fallback:** No LSP formatting → save as-is. **Settings:** **Format on save** (checkbox, Settings → Editor or project); default off. **Gaps:** Server doesn't support formatting → save as-is. **Potential problems:** Long file / timeout → see §10.10.4 (timeout then save unformatted; optionally rangeFormat for modified only).

- **Inlay hints:** **Behavior:** Inline, read-only hints in the editor (e.g. parameter names at call sites, inferred types, chained types). Do not affect buffer content or selection. **How we do it:** Request LSP `textDocument/inlayHint` for the **visible range** (or full document if server is fast and document small); **trigger:** on scroll or visible range change, debounce 100 ms; cancel previous request when range changes. Render hints as decorations; support `inlayHint/resolve` if the server returns unresolved hints (e.g. tooltip on hover). **Fallback:** If the server does not support inlay hints, show none. **Settings:** **Show inlay hints** (toggle, Settings → Editor); per-hint-type toggles optional. Persist in redb. **Gaps:** Server doesn't support inlayHint → show none. Server returns empty → no hints. **Potential problems:** Too many hints / visibility → see §10.10.4 (visible range only; cap count; user can disable).

#### 10.10.6 LSP features (MVP) -- navigation and search

See §10.10.3 and §10.10.4 for cross-cutting gaps and problems; feature-specific ones below.

- **Signature help:** **Behavior:** While typing a function call (e.g. after `(`), show a popup with the current parameter highlighted and optional documentation for the overload. **How we do it:** On cursor move or after trigger characters (e.g. `(`, `,`), request LSP `textDocument/signatureHelp` (debounce 100 ms; cancel previous on new trigger). Display active signature and parameter; support multiple overloads (next/previous). **Trigger:** Trigger characters from server capability or default `(`, `,`, `<`. **UI:** Popup near cursor; dismiss on Escape or cursor leave. **Fallback:** No signature help when server does not support it; autocomplete still works. **Settings:** Optional "Trigger signature help on type" (default on). **Gaps:** Server does not support signatureHelp → no popup. Server returns empty → hide popup. **Potential problems:** Multiple overloads or no doc → see §10.10.4 (show signature only; next/previous). Timeout → cancel and hide.

- **Find references:** **Behavior:** User invokes "Find all references" at a symbol; a panel or peek view lists all references (file, line, optional snippet). Clicking opens the file and jumps to the location. **How we do it:** Call LSP `textDocument/references` with the position and optional `includeDeclaration`; present results in a list/tree (grouped by file). On select, open file in editor and go to range. **Trigger:** User action (e.g. Shift+F12 or context menu). **UI:** Panel or peek; keybinding configurable. **Fallback:** When LSP is unavailable, use grep or project index (§12.1.4). **Settings:** Optional "Include declaration" (default on). **Gaps:** Server does not support references → use grep fallback. Returns empty → show "No references." **Potential problems:** 1000+ results → see §10.10.4 (cap display, "Load more", virtual scroll).

- **Highlight occurrences:** **Behavior:** When the cursor is on a symbol, all occurrences in the current file are highlighted. Highlight clears on cursor move or Escape. **How we do it:** On cursor move (debounce 150 ms), request LSP `textDocument/documentHighlight`; cancel previous request; apply returned ranges as read-only decorations. Prefer "read" vs "write" style if server provides a kind. **Fallback:** No highlight when unsupported. **Settings:** Toggle "Highlight occurrences" (Settings → Editor); default on. **Gaps:** Server does not support documentHighlight → no highlight. **Potential problems:** Large file or many ranges → see §10.10.4 (cap ranges, debounce, cancel on move).

- **Go to type definition / implementation / declaration:** **Behavior:** Same UX as go-to-definition: user invokes "Go to type definition", "Go to implementation(s)", or "Go to declaration" (e.g. modifier+click or separate commands); editor opens the target file and jumps to the range. **How we do it:** Request LSP `textDocument/typeDefinition`, `textDocument/implementation`, or `textDocument/declaration` at the cursor. Single location → open and go; multiple → show picker then open chosen. **Trigger:** Keybinding or context menu per command. **Fallback:** If the server does not support a capability, hide or disable that command; no text-based fallback for MVP. **Settings:** Keybindings configurable. **Gaps:** Capability not in server → disable command. Returns empty → show "No type definition" (or implementation/declaration). **Potential problems:** None beyond §10.10.4 (timeout, cancel).

#### 10.10.7 LSP features (MVP) -- display and editing UX

See §10.10.3 and §10.10.4 for cross-cutting gaps and problems; feature-specific ones below.

- **Semantic folding:** **Behavior:** Folding controls (e.g. gutter icons) fold/unfold by semantic regions (function, block, region, import group) instead of by indent only. **How we do it:** Request LSP `textDocument/foldingRange` for the document; map returned ranges to foldable regions in the editor. When the user folds, collapse the corresponding range. **Fallback:** If the server does not support folding range, use indent-based folding only. **Settings:** Toggle "Semantic folding" (default on when LSP supports it). **Gaps:** Server does not support foldingRange → indent-based folding only. **Potential problems:** Nested depth → see §10.10.4 (limit expand depth or collapse beyond N levels).

- **Expand/shrink selection:** **Behavior:** User invokes "Expand selection" or "Shrink selection" (e.g. keybinding); selection grows or shrinks to the next semantic boundary (word → expression → statement → block). **How we do it:** Request LSP `textDocument/selectionRange` with the current selection; server returns a list of nested ranges. Expand: pick the next larger range containing the current selection; shrink: pick the next smaller. **Fallback:** If unsupported, no-op or simple word/line expand (editor heuristic). **Settings:** Keybindings only. **Gaps:** Server does not support selectionRange → editor heuristic (word/line). **Potential problems:** None beyond §10.10.4.

- **Document links:** **Behavior:** Links in comments or strings (URLs, file paths, issue refs) are clickable; click opens the URL in the browser or the file in the editor. **How we do it:** Request LSP `textDocument/documentLink` for the document; optionally `documentLink/resolve` for links that need resolution. Render links as underlined or distinct style; on click, open URI (http(s) → browser; file → editor). **Fallback:** No links when unsupported. **Settings:** Optional "Link preview on hover" (show URL in tooltip). **Gaps:** Server does not support documentLink → no links. **Potential problems:** Broken URI → see §10.10.4 (validate before open; show in tooltip only if invalid).

- **Color picker (CSS/theme):** **Behavior:** Color literals in source (e.g. `#ff0000`, `rgb(255,0,0)`) show a small color swatch in the gutter or inline; click opens a color picker to change the value. **How we do it:** Request LSP `textDocument/documentColor` for the document; for each color, request `textDocument/colorPresentation` with the user's edit (e.g. hex vs rgb). Apply the chosen presentation as a text edit. **Fallback:** No color picker when unsupported; text remains editable as plain text. **Settings:** Toggle "Show color decorators" (default on for known color file types). **Gaps:** Server does not support documentColor/colorPresentation → no color picker. **Potential problems:** Unsupported format → see §10.10.4 (keep previous text or show hex only).

- **CodeLens:** **Behavior:** Inline lenses above certain lines (e.g. "Run test", "3 references", "2 implementations"); click runs the command or navigates. **How we do it:** Request LSP `textDocument/codeLens` for the document; for each lens that has a command, optionally call `codeLens/resolve` to get the command. Render lenses above the line; on click, execute the command (e.g. run test) or apply the command's arguments (e.g. open references). **Fallback:** No CodeLens when unsupported. **Settings:** Toggle "Show CodeLens" (default on); some users find it noisy so it must be turn-offable. **Gaps:** Server does not support codeLens → no lenses. **Potential problems:** Click race or command failure → see §10.10.4 (disable click until resolve; show toast on failure).

- **Format on type:** **Behavior:** When the user types specific trigger characters (e.g. newline, `}`), the server can return an edit to auto-format (e.g. indent, close block). **How we do it:** On typing a trigger character, call LSP `textDocument/onTypeFormatting` with the position and the character; apply the returned edit immediately after the typed character. **Fallback:** No format-on-type when unsupported. **Settings:** Toggle "Format on type" (default off to avoid style conflicts); document trigger characters per server if known. **Gaps:** Server does not support onTypeFormatting → no format on type. **Potential problems:** Conflict with user edit → see §10.10.4 (discard format edit if buffer version changed).

- **Call hierarchy:** **Behavior:** User invokes "Show call hierarchy" at a symbol; a tree or panel shows "Calls from here" (outgoing) and "Calls to here" (incoming). Clicking a call jumps to that location. **How we do it:** Call LSP `textDocument/prepareCallHierarchy` at the cursor; then `callHierarchy/incomingCalls` and/or `callHierarchy/outgoingCalls` (LSP 3.16+). Present as a tree; on node select, open file and go to range. **Fallback:** If the server does not support call hierarchy (or LSP version before 3.16), hide the command. **Settings:** Optional "Default view: incoming / outgoing / both." **Gaps:** Server does not support call hierarchy or LSP < 3.16 → hide command. **Potential problems:** Deep tree → see §10.10.4 (lazy-load, cap depth).

- **Semantic tokens (rich highlighting):** **Behavior:** Syntax highlighting is augmented with semantic token types (e.g. type vs variable vs parameter) from the server for more accurate colors. **How we do it:** Use LSP `textDocument/semanticTokens/full` or `semanticTokens/range` to get token types and modifiers; map to editor theme colors (or a semantic token theme). Merge with or override basic syntax highlighting when both exist (§2.3). **Fallback:** When the server does not support semantic tokens, use syntax-only highlighting. **Settings:** Toggle "Semantic highlighting" (default on when supported). **Gaps:** Server does not support semantic tokens → syntax-only. **Potential problems:** Large file or delta → see §10.10.4 (semanticTokens/range for visible; delta if supported).

#### 10.10.8 LSP and chat/agent integration (MVP)

- **Chat and agent integration:** **Behavior:** Chat and agent flows can use LSP-derived context: e.g. "Explain symbol at cursor" (hover + definition), "List references to this" (Find references), "Quick fix this diagnostic" (code action). One-click apply of code actions from chat or review panel. **How we do it:** FileManager/editor exposes LSP state (diagnostics, symbols, hover, definitions, references, code actions) to the chat/agent layer via a stable interface (e.g. "get diagnostics for file", "get symbol at position", "apply code action"). Assistant-chat and agent flows request this context when building prompts or when the user asks to fix/explain; they invoke "apply code action" or "open definition" as user actions. **Contract:** No change to the open-file or buffer contract (§4.1); LSP state is read-only for chat except for applying code actions (which go through the same apply path as in-editor quick fix). Document the interface and usage in Plans/assistant-chat-design.md §9.1 and Plans/LSPSupport.md §5.1. **Optional verification:** LSP diagnostics gate ("No LSP errors in scope" at tier boundaries) and LSP snapshot in evidence are **optional** and defined in Plans/LSPSupport.md §9.1; see Plans/feature-list.md (Part 2 §4 Verification gates). **Fallback:** When LSP is unavailable, chat/agent use plain text and grep/index as today. **Gaps:** LSP unavailable → no LSP context; use plain text and grep. **Potential problems:** Stale LSP state → see §10.10.4 (send didChange after agent edits; document that get diagnostics may be stale until server republishes).

---

## 11. Language/framework presets

**Done when:** Preset detected or selected on project open; tool download runs non-blocking; LSP mapping per preset used by §10.10; single preset per project with optional switch. **Implement §11 before §10.10 (LSP server mapping) and §10.4 (run/debug configs).** **Preset detection failure:** If no preset matches and user dismisses "Select preset," document behavior (e.g. no run/debug, or generic preset). **Preset storage:** Project config or redb key e.g. `project/{id}/preset` → preset id; file→preset table in §11 or platform_specs.

- **Presets (JetBrains-style):** The app supports **language/framework-aware presets** aligned with what JetBrains offers out of the box: **Rust**, **Java/Kotlin**, **Python**, **PHP**, **Go**, **C# / .NET**, **C/C++**, **JavaScript/TypeScript**, **Ruby**, and optionally **SQL/databases**, **data science**. Each preset defines: default run/debug configs, expected tools (e.g. Cargo, rust-analyzer, LLDB for Rust; for **JavaScript/TypeScript**: Node/npm, **ESLint** for linting), and optional UI defaults (e.g. project layout, test runner). **LSP servers** are specified per preset (§10.10).
- **Preset detection:** When a project is added or opened, detect preset by **file-based heuristics** at project root. **File → preset table (examples):** `Cargo.toml` → Rust; `package.json` + `tsconfig.json` → TypeScript; `package.json` (with or without `eslint` dep or `eslint.config.*`) → JavaScript/ECMAScript; `pyproject.toml` or `requirements.txt` → Python; `composer.json` → PHP; `go.mod` → Go; `*.sln` / `*.csproj` → C#. **ESLint:** For JavaScript/TypeScript, presence of `eslint.config.js` / `eslint.config.mjs` / `eslint.config.ts` (ESLint v10 flat config) or `eslint` in `package.json` dependencies signals ESLint usage; the eslint LSP server is enabled for that preset per §10.10. If **multiple** match (monorepo), use primary by priority or prompt **"Select preset."** If **none** match, show **"Select preset"** dialog with the full list. If the project was configured via **chain start wizard / interviewer**, use interview output (e.g. architecture phase) to set or suggest the preset; user can override. See §12.1.5.
- **Download tools when project is added:** When a project is added or opened for the first time, the app **downloads the correct tools** for the selected preset (e.g. language runtimes, debuggers, linters). **Order and UX:** Do **not** block opening the project. Run tool download **after** the project is considered open and the UI is usable; show **progress** (e.g. "Installing Rust toolchain...") and allow the user to continue working. On **failure** (network, permission, unsupported OS): show clear error with **Retry** and **Skip** ("Use project without full preset"); optionally persist "skip" and offer "Install preset tools" later from Settings or project menu. See §12.1.6.
- **Single preset per project:** One active preset per project (e.g. "Rust" or "Python + Django"). Stored with project config; **switchable** (e.g. Settings → Project → Preset) if the project is multi-language. Combined presets (e.g. "Rust + Node") optional; document in §12.2.5.
- **LSP in presets:** Presets **can include LSP-based tools** (e.g. rust-analyzer, pylsp, eslint, typescript-language-server). LSP is in scope for MVP (§10.10); when a preset specifies an LSP server, the app starts it for the project and uses it for diagnostics, hover, autocomplete, go-to-definition, and symbol search. Fallback to regex/index when LSP is not configured or fails.

---

## 12. Gaps, potential problems, and enhancements

**LSP:** Gaps related to symbol search, diagnostics, and fallback when LSP is unavailable are specified in §10.10; §12.1.4 and §12.2.7 reference §10.10 where resolved.

**Cross-reference (tool permissions):** **Plans/Tools.md** defines the tool permission model and [OpenCode Permissions](https://opencode.ai/docs/permissions/) alignment. **external_directory** (paths outside project cwd) and path-based permission rules may affect what the File Manager and editor can expose or allow; see Tools.md §2.5 and the FileManager row in the cross-plan table there.

### 12.1 Gaps (missing or underspecified)

#### 12.1.1 Click-to-open when editor is floating

**Gap:** When the editor is in its own window, "open file" from chat or File Manager must target the floating editor; it's unclear whether the main window or the floating one receives the file.

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

**Gap:** If a preset's tools fail to download (network, permission, unsupported OS), behavior is unspecified.

**Solution:** (1) **On failure:** Show a **clear error** in the UI (e.g. "Could not install Rust toolchain: [reason]"). Include retry and skip actions. (2) **Retry:** "Retry" re-runs the download/install for that preset. (3) **Skip:** "Use project without full preset" -- project opens with the preset selected but without the optional tools; run/debug may be limited (e.g. "Run" might prompt to install later). Do **not** block opening the project. (4) **Docs:** "Open docs" or "Troubleshoot" link to preset-specific setup or system-requirement docs. (5) Optionally persist "skip this preset's tools" so the user isn't prompted every time; allow "Install preset tools" from Settings or project menu later. Document in §11.

#### 12.1.7 Hot reload debounce

**Gap:** §8.2 says "after short debounce" for browser refresh on save; duration and scope are unspecified.

**Solution:** (1) **Debounce duration:** Use a **per-file** debounce of **300-500 ms** (e.g. 400 ms). On each save of a file that is "watched" for hot reload (the HTML or linked CSS/JS), start or reset a timer; when the timer fires, trigger one refresh of the browser view that shows that file. (2) **Scope:** Per preview instance: each browser instance watching a given HTML file has its own debounce; rapid saves to that file result in one refresh after the last save within the window. (3) **Settings:** Add **Hot reload debounce (ms)** in Settings → Editor or Developer (range e.g. 100-2000 ms); persist in redb. Document default and key in §8.2.

#### 12.1.8 Session-scoped view state scope

**Gap:** §10.7 "session" could mean chat thread, interview session, or app session; where view state is keyed is unclear.

**Solution:** (1) **Define session:** For "session-scoped view state," **session** = **chat thread** (thread id) when the user is in the Assistant/Interview chat. Optionally also key by **interview session id** when in Interview flow. (2) **Keying:** Store view state (open tabs, scroll, cursor, selected range) under a composite key: e.g. `project_id` + `session_id` (thread id or interview session id). When the user switches threads, offer to restore that thread's editor view state if it was previously used. (3) **Fallback:** If no session id (e.g. user never opened chat), use project-only key so behavior matches "per-project" only. Document in §10.7 that session = thread (and optionally interview session) and that state is keyed by project + session.

#### 12.1.9 Review rules storage

**Gap:** §10.8 custom review rules -- where they are stored (project vs app), format, and how they're applied are not specified.

**Solution:** (1) **Storage:** Support both **project-level** and **application-level** rules. Project: e.g. `.puppet-master/review-rules.md` or `.puppet-master/review-rules.yaml` in project root. Application: e.g. in redb under `review_rules` or a user config file in app data dir. Project rules override or extend app rules when a project is selected. (2) **Format:** Prefer **markdown** or **YAML** for readability: e.g. a list of rule descriptions or named rules with description and severity. Example: `- "Flag TODOs in production code"` or `name: require-error-handling; description: "Require error handling here"; severity: warning`. (3) **Application:** When running AI/rule-based review (§10.8), the review engine loads app + project rules and applies them (e.g. inject into Assistant prompt or run a rule evaluator). Reference in agent-rules-context or a short "Review rules" plan so the rules pipeline can load them. Document path and format in §10.8.

#### 12.1.10 Floating editor + multiple windows

**Gap:** With main window + floating editor + possibly detached Chat/File Manager, window count and focus for shortcuts (e.g. Ctrl+S) need clarity.

**Solution:** (1) **Focus rule:** **Editor shortcuts** (Save, Close tab, Go to line, etc.) apply when **any editor window has focus** (docked or floating). So Ctrl+S in a floating editor window saves the current buffer in that window. App-level shortcuts (e.g. command palette Ctrl+P) apply when the main window or a non-editor panel has focus. (2) **Single floating editor:** For MVP, allow **one** floating editor window (one drag-out produces one floating window; if the user drags out again, either replace the existing floating window or re-dock the first and float the second -- document choice). Alternatively allow multiple floating editor groups; then each has its own window and focus rule applies per window. (3) **Z-order:** OS manages window order; no special z-order requirement beyond "focus follows click." Document focus rule and single-vs-multiple floating policy in §2.1 or §2.4.

### 12.2 Potential problems

#### 12.2.1 Performance with many tabs

**Problem:** Dozens of open files plus LRU eviction can cause thrashing (frequent load/unload) or slow startup if persisted state is large.

**Solution:** (1) **LRU cap:** Enforce the **max editor tabs** setting (§2.9); only that many buffers are kept in memory. When opening a new file would exceed the cap, evict the least-recently-used buffer (clear from memory; keep path in tab list). On tab switch to an evicted file, reload from disk. (2) **Lazy load:** When restoring session, load only the **active tab** content immediately; load other tab contents on first switch to that tab. (3) **Persist minimal state:** Persist only **ordered list of paths**, **active tab index**, and optionally **scroll/cursor per tab**; do not persist full buffer content. Recovery/unsaved buffer content is separate (redb or temp). (4) **Startup:** On app start, restore tab list and active tab; load active buffer; defer loading other buffers until the user switches. Document in §10.7 and §2.9.

#### 12.2.2 Detach/snap and Slint

**Problem:** gui-layout-architecture describes detach for Chat and File Manager; the editor has more state (tabs, buffers, multiple groups) and must work when docked or floating.

**Solution:** (1) **Reuse state machine:** Use the same **DOCKED ↔ FLOATING** state machine and **snap zones** (e.g. 25px from main window edge, visual cue on drag) as for Chat/File Manager. One enum per panel type: `PanelDock::Docked { side, width }` | `PanelDock::Floating { window_id, x, y, w, h }`. (2) **Single editor component:** The editor UI component (tabs, groups, content area) is **one component** that can be rendered either **inline in the main layout** (when docked) or **inside its own Slint Window** (when floating). Same component, different parent. (3) **Shared state via app bridge:** All editor state (tabs, buffers, active group, dirty flags) lives in the Rust app; the Slint editor component reads/writes via the backend bridge. So when the user drags the editor out, the floating window shows the same data; no duplication of state. (4) Document in gui-layout-architecture or §2.1 that the editor follows the same detach/snap pattern and that editor state is shared, not copied.

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

**Problem:** Each browser (WebView) instance uses significant memory; many preview windows can exhaust resources.

**Solution:** (1) **Cap:** Enforce a **max browser instances** (e.g. 3-5). When the user tries to open another preview (e.g. "Open in browser" on a second HTML file), either (a) **reuse** an existing instance (e.g. switch its URL to the new file) or (b) **close least-recently-used** and open the new one, or (c) **prompt:** "Max previews reached. Close one or open in existing?" (2) **LRU close:** If cap is reached and user opens a new preview, auto-close the least-recently-used preview window and open the new one; show a brief toast "Closed preview for X to open Y." (3) **Settings:** Add **Max browser previews** in Settings → Editor or Developer (e.g. 1-10); persist in redb. Document in §8 and §9.

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
- 14. **Image viewer & HTML preview:** Image tab/viewer; HTML open in browser; hot reload with debounce (default 400 ms); click-to-context when viewing HTML (per newfeatures.md §15.18).
- 15. **Tabs (Terminal, Browser):** Terminal tabs; browser instance cap and reuse/LRU policy.
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

**Original gaps (now addressed in main body)**

- **Open-file contract (§4, §5):** No single request shape (e.g. `path`, `line?`, `range?`, `target_group?`) or code path for chat, File Manager, and quick open. (A, F)
- **Revert last agent edit / FileSafe (§2.5):** Who invokes whom and event/message shape (e.g. `BufferReverted(path)`) not defined; editor "reloads or is notified" is ambiguous. (A, F)
- **File changed on disk (§2.5, §7):** "On next focus" undefined -- per-tab, per-window, or app-global; who performs the check and when. (A, T, F)
- **Single buffer, multiple views (§2.4, §2.5):** When the same path is open in more than one editor group, no explicit rule that all views share one buffer and stay in sync (cursor/scroll ownership, dirty state). (A, F)
- **Editor state in redb (§2.9):** No schema for keys and value shapes (open tabs, active tab, scroll/cursor, max tabs, session-scoped state). (A, T)
- **Save failure (§2.2):** No behavior for write failure (disk full, permission, path deleted): keep buffer dirty, error + retry / "Save As," no "last saved" update. (A, F)
- **Large-file strategy (§2.7):** Both "truncated + Load full" and "read-only virtualized" mentioned; pick one for MVP. Default threshold and hard cap only in §12.1.3 -- state in §2.7. (T, F)
- **Collapsed editor state (§2.1):** Collapsible strip state (per-session, per-project, or per-window) not specified; affects restore and snap-back. (F)
- **Tab bar model (§2.4):** "Each group has its own tab list (or shares a common tab bar)" -- choose one for MVP. (F)
- **Scroll/cursor persistence (§2.9):** "Optionally scroll/cursor per tab" -- need a default (yes/no) and storage. (F)
- **Image viewer placement (§8.1):** "Same tab area or dedicated pane" -- decide which (or user preference) and document. (T, F)
- **Hot reload (§8.2):** Which files count as "linked" (same dir, `<link>`/`<script>` refs) and debounce default (e.g. 400 ms) only in §12.1.7 -- add to §8.2. (T, F)
- **Line/range from chat (§2.3, §5):** Incoming format (e.g. L12, L12-45) not specified; state that it matches 1-based inclusive. (T)
- **Floating editor policy (§2.1, §12.1.10):** Single vs multiple floating editor windows not decided in main body. (T, F)
- **Definitions:** Terms **buffer**, **tab**, **editor group**, **dirty**, **preset**, and **redb** / **seglog** / **project storage design** / **rewrite-tie-in-memo** (with doc links) not defined here. (T)
- **FileSafe (§2.5):** Referenced but not defined; add pointer (e.g. Plans/FileSafe.md). (T)
- **Discoverability:** How users learn that paths/code blocks in chat are clickable, and that editor/panels can be detached (affordance, hover, tooltip, onboarding). (U)
- **Open already-open file (§2.5, §5):** When file is already open (possibly dirty) and user opens again from chat or File Manager -- focus existing tab vs new tab vs prompt unspecified. (U)
- **@ vs click-to-open (§3, §5):** Intentional difference (context vs open) not explained in UI. (U)
- **Accessibility:** No mention of screen reader, keyboard-only use (tree, tabs, dialogs), focus order, visible focus, ARIA, reduced motion. (U)
- **File Manager tree keyboard:** Arrow keys, Enter to open, type-ahead not specified. (U)
- **Read-only reason (§2.6, §2.7):** UI need not explain why (binary, too large, OS read-only); users can be confused. (U)
- **Save success feedback (§2.2):** No requirement for "Saved" or visible clearing of dirty state. (U)
- **Dirty + file changed on disk (§7):** Order of prompts (unsaved vs disk changed) not spelled out. (U)
- **Transient UI states:** Loading, "Cannot decode as UTF-8", "File not found", "Binary file", "File too large", "Indexing...", open failure -- each needs at least one defined state and copy. (F)
- **Terminal tab "pin" (§9):** Pin semantics (e.g. exclude from "Close others") unspecified; align with or distinguish from editor pin. (F)
- **Project root moved/renamed (§7):** Detection mechanism (watcher, periodic, or on I/O failure) not specified. (A)
- **Symlinks (§7):** "Document follow or show" -- clarify: specify in this spec or impl docs whether symlinks are followed or shown as one node. (T)

**Potential problems**

- **Very large directories (§1, §10.7):** No policy for e.g. node_modules (virtualization depth, row limit, caps). (A)
- **Browser/Assistant boundary (§8, §10.6):** Same browser for preview and agent-driven actions; interface (commands, results) and security not defined. (A)
- **Restore vs lazy load (§2.9, §12.2.1):** §2.9 doesn't state "restore active tab first"; startup could load many buffers before cap. (A)
- **Preset tool download (§11):** Order relative to "project open" and UI during download not specified; blocking or unclear progress hurts UX. (A)
- **Summary and §12 (T):** Summary is one long sentence; §12 holds solutions that could live in main body (e.g. §12.1.3 threshold in §2.7); recover unsaved §2.9 vs §10.9 MVP wording inconsistent.
- **Focus when editor floating (§2.8, §12.2.2):** Which window "editor has focus" for shortcuts and open-file target needs an explicit rule. (F)
- **Max persisted tab count (§12.2.1):** Cap restored list (e.g. 50) so startup/storage stay bounded. (F)
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
