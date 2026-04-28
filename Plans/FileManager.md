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
10. [Editor navigation and semantic affordances](#10-editor-navigation-and-semantic-affordances)
    - [10.1 Breadcrumbs and outline](#101-breadcrumbs-and-outline)
    - [10.2 Go to symbol and semantic navigation](#102-go-to-symbol-and-semantic-navigation)
    - [10.3 Diagnostics, gutter markers, and change markers](#103-diagnostics-gutter-markers-and-change-markers)
    - [10.4 Definition, references, hover, and code actions](#104-definition-references-hover-and-code-actions)
11. [File tree actions, local filter, and chat handoff](#11-file-tree-actions-local-filter-and-chat-handoff)
    - [11.1 Canonical tree action catalog](#111-canonical-tree-action-catalog)
    - [11.2 Clipboard, drag/drop, and transfer engine](#112-clipboard-dragdrop-and-transfer-engine)
    - [11.3 Local tree filter, selection, and current-file reveal](#113-local-tree-filter-selection-and-current-file-reveal)
    - [11.4 Open With and Save Local Copy](#114-open-with-and-save-local-copy)
12. [Source Control handoff, compare, and review](#12-source-control-handoff-compare-and-review)
    - [12.1 File-tree Source Control strip and diff entrypoints](#121-file-tree-source-control-strip-and-diff-entrypoints)
    - [12.2 Compare-target defaults](#122-compare-target-defaults)
    - [12.3 Hunk actions, conflict review, and diff-local search](#123-hunk-actions-conflict-review-and-diff-local-search)
    - [12.4 Change-marker ownership and revert boundaries](#124-change-marker-ownership-and-revert-boundaries)
13. [Git Status Integration](#13-git-status-integration)
14. [Markdown, Mermaid, HTML, SVG, and Image Rendering](#14-markdown-mermaid-html-svg-and-image-rendering-rewrite-addendum----2026-03-07)

## 1. File Manager panel

**Done when:** (1) Tree lists all project files under root; (2) Selecting a file opens it in the editor via §4.1; (3) Virtualized tree handles 10k+ rows without freezing; (4) Expand/collapse state restores per project on reopen. **Error handling:** **Open failed** -- If opening the selected file fails (permission denied, not found, too large), show "Open failed" with brief reason in status or toast; do not leave tree in inconsistent state. **Refresh failure** -- If directory read fails (e.g. permission), show error on that node and optionally "Retry." **Edge cases:** **Empty project** -- Show "No files" or project root only; no crash. **No permission on subfolder** -- Show node but mark or filter; AutoDecision: show node as inaccessible and do not enumerate children. **Expand/collapse persistence:** Redb key e.g. `file_manager/expanded/{project_id}` → list of expanded path prefixes or node ids (§2.9). **Requires** §4.1 open-file contract before "select file opens it"; requires project context (project root). **Settings:** **Hide ignored** (toggle): Settings → File Manager (or header); default off (ignored dimmed); persist in redb. **Row cap per directory:** AutoDecision: default 10_000 entries; configurable; persist in redb key `file_manager/row_cap_per_directory`.

ContractRef: Plans/Decision_Policy.md, Plans/storage-plan.md §2.3, Plans/Tools.md §2.5

- **Placement:** Pop-out side window (like the chat pop-out), default left. Per Composergui5 §5 and feature-list layout: header ("FILES"), refresh, pop-out; search; virtualized file tree; optional Git status strip.
- **Virtualized file tree:** Only visible nodes are rendered; scroll position determines which slice of the tree is shown. Total height uses an estimated row height (AutoDecision: `row_height_px = 24`) so the scrollbar is correct. Supports deep trees; **very large directories** (e.g. node_modules): virtualize by row, apply a row cap per directory (AutoDecision: 10_000 entries; key `file_manager/row_cap_per_directory`) with "Show more" or type-ahead to narrow; AutoDecision: no explicit depth limit (children are loaded lazily on expand).
- **Behavior:** Lists all files in the current project. **Selecting a file opens it in the in-app IDE-style editor** (§2). File Manager and editor share the same project context.
- **.gitignore / exclude:** File tree respects `.gitignore` (and optionally a project exclude list). Ignored files/folders are **dimmed** by default. Optional user setting **"Hide ignored"** hides them entirely (toggle in header or Settings).
- **Context menu:** Summary-only entrypoint for the canonical file-tree action catalog in §11.1 and §11.4. Core actions include create/rename/delete/path copy, workspace-node clipboard actions, Add to Assistant Chat, Open in Terminal, Open With, and Save Local Copy. Aligns with selectable labels and context menus (AGENTS.md).
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

- **Editable content:** Opened files are editable (not read-only preview). User edits update one shared authoritative buffer per file path.
- **Save:** Save writes the current buffer to the file path. On success, dirty state clears and the user sees explicit success feedback. On failure (disk full, permission denied, path deleted, read-only file, disconnected remote destination), the buffer stays dirty, last-saved state does not advance, and the user gets visible recovery actions such as `Retry` and optional `Save As`.
- **Unsaved indicator:** Each tab shows unsaved state, and at least one other stable shell location must also surface that state so it remains visible when the tab strip is crowded.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/FinalGUISpec.md

- **Revert:** `Revert` reloads from disk. `Revert last agent edit` is a chat-owned restore action that routes through `cmd.chat.revert`; the editor never fabricates the revert itself.
- **Revert last agent edit contract:** When `target_message_id` is omitted, the backend resolves it to the latest assistant turn in the active thread that produced persisted file mutations. If that turn touched multiple files, the revert applies to the whole turn across all affected files. After revert, the backend emits a refresh notification and the editor reloads the affected buffers.
- **Restore to… / History:** The editor and document pane fetch restore points from the backend store and invoke the same restore pipeline; neither surface stores or manufactures restore points independently.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/FileSafe.md

- **Recover unsaved (required MVP):** Unsaved-buffer recovery is required for both local and remote-backed buffers.
- Recovery snapshots represent local unsaved buffer state only; they do not imply that a remote write succeeded.
- For recovered remote-backed buffers, the banner copy is: `Recovered local edits — remote destination not yet synchronized`.
- A recovered remote-backed buffer must reconnect or revalidate the destination before save/flush can claim success.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

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
- `@` mention resolution uses the same file list as the File Manager (single source of truth for project files).
- Clicking a file path or code block in chat opens the file in the editor; see §5.

### 4.1 Open-file contract

FileManager is the canonical owner of the file-open and artifact-storage contract. When a file is opened (via GUI, CLI, or internal routing), the following rules apply:

1. **Identity-based routing**: If the file path includes a route_target scheme (e.g., `github://owner/repo/file.md`), the open request is resolved through the shared route/open semantics in Contracts_V0.md, not a raw filesystem read.
2. **Worktree binding**: Opened files are bound to the active worktree via an execution_unit_context; artifacts opened in different worktrees have separate identity chains.
3. **Artifact-by-identity**: Artifacts (outputs, logs, diffs) are stored by content hash and indexed by (concern_id, route_target, artifact_type, timestamp); raw paths are deprecated.
4. **Open-file visibility**: The open-file list visible in the GUI is filtered by the active execution_role and the current approval_scope. Files opened in restricted approval scopes are not shown to unprivileged users.

### Route/open rules

#### Acceptance carry-through
- Let Contracts_V0 own canonical route_target and OpenSubject contracts
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based
- Keep route_target small with subject_id or object_kind/object_id identity
- Limit subject_id families to doc:/artifact:, keep inspector_target secondary, and override only necessary destination/context state

### Error recovery in file/artifact access

If a file path is broken or a route_target is unreachable:
- Log a visibility deferral (do not fail the entire run).
- Emit a navigable error in the concern record so the user can inspect what went wrong.
- Provide a fallback route (e.g., workspace://project/concern) for results if the primary route was unavailable.

## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)

#### Acceptance carry-through
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage
- Resolve artifact open flows by artifact_id and then by linked envelope refs
