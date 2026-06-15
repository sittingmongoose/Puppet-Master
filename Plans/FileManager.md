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

### Project-driven capability activation

The File Manager/editor surface belongs to one extensible Puppet Master platform with project-driven capability activation, not separate hard-forked products or rigid personalities. Project-open analysis MUST assemble language, framework, build, review, and remote support as capability packs/modules activated by detected project signals instead of shipping separate shells.

Project open MUST run explicit detection/import logic before enabling capability packs. When signals conflict, are incomplete, or match more than one project interpretation, the UI MUST surface the plausible interpretations and make autodetection visible and overridable before mutating durable project settings.

Indexing is a first-class background subsystem for the editor, file tree, search, and symbol workflows. While an index warms, rebuilds, is missing, or is unavailable, affected surfaces MUST show reduced-capability/degraded-mode state and keep fallback behavior explicit rather than pretending the project is fully indexed.

Diff/review/hosted-repository workflows stay in the same shell as local editing. File Manager, editor, Source Control, and GitHub consumers may hand off ownership between panels, but they MUST preserve one project identity and route review/diff actions through the same open-file and source-control contracts instead of creating separate tools.

Remote project support uses a thin local client/launcher with backend attachment/version management. Remote mode MUST NOT pretend remote is only local with different paths; attachment state, remote version compatibility, write availability, cache/index freshness, and reconnect/degraded state must be visible to the user.

Capability-pack breadth is a product constraint. Plugin/module growth can become dependency and dynamic-loading debt, so packs must be bounded/reused across projects where safe, lazy-loaded only behind explicit project signals, and tested against startup and large-workspace responsiveness. Indexing and external-model sync must be bounded/reused and must not dominate project open, navigation, or editor responsiveness.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plans/BinaryLocator_Spec.md

### External discovery cluster constraints

The File Manager/editor architecture also carries external discovery research-lineage anchors `bench-01`, `bench-04`, `bench-05`, `bench-06`, `bench-07`, `bench-08`, `bench-11`, `bench-15`, `bench-23`, `bench-25`, `bench-27`, and `bench-30`. These labels are not product names, but they identify the research cluster behind the following product constraints.

- `bench-01`: Puppet Master stays a local-first UI while supporting a remote-capable backend/proxy split. The editor core must account for background parsing/highlighting, a Rust-owned editor core, lifecycle-safe save/state handling, and GPU/platform crash risk.
- `bench-04`: Project open and navigation require incremental project scanning, small-module architecture, central command predicates for command availability, line-oriented document state where appropriate, plugin compatibility discipline, crash/regression hardening, and first-class file-tree/sidebar expectations.
- `bench-05`: The File Manager must preserve the file-manager inspiration for preview without download, chunked uploads, archive pack/unpack, direct links, per-user roots/read-only modes, and broad in-browser manage/edit flows. It must avoid monolithic customization debt and harden auth/path behavior.
- `bench-06`, `bench-08`, and `bench-15`: thin wrapper/overlay editors may help embed ergonomics and prop-driven APIs, but they are weak foundations for Puppet Master's deeper diff/workbench ambitions. Treat resize/SSR/bundler/worker/styling edge cases as architecture risk, not late polish.
- Early IDE and editor-engine findings are retained as File Manager/editor lineage, not MCP canon. AI-first IDE patterns validate planning `/execution/review` across editor, terminal, browser, docs, and integrations; editor-engine embeddability and `/customization` are useful only when PM also owns `/layout`, `/diff`, `/merge`, `/runtime`, and `/container` integration boundaries. A marker-based split comparison is not enough for PM's diff/merge goals, and fragile worker `/path/SSR/shadow-DOM` integration remains a failure mode to design against.
- `bench-07`: Lightweight collaborative editing is useful only when revision/reconnect recovery is first-class and the design guards against ephemeral persistence, Unicode/IME desync, and mobile density constraints.
- `bench-11`: first-class test/diff/task widgets must live beside the editor on the native desktop stack. JSON/timer-based hot-exit restore, deep editor affordances, and crash/backup/setup-friction risk are part of the same editor recovery and toolchain design, not follow-up polish.
- `bench-23`, `bench-25`, `bench-27`, and `bench-30`, alongside prior browser/editor-wrapper results, are implementation-reference anchors for operational local seams rather than surface-level editing alone. Preserve atomic save, watcher-driven external-change handling, persistent search/replace/location histories, explicit command registry / palette routing, renderer-independent text cores including piece-table style editing, terminal/build/run routing separated from editing state, and per-language workspace heuristics or synthetic-workspace creation for standalone files.
- The PM-positive implementation pattern is a reusable Rust text core separated from rendering/UI technology, with capability modules around the text core for LSP, build/run, preview, and shell integration instead of baking those services into the buffer model.
- File watching, atomic save, reload/conflict signaling, and explicit histories for search, replace, locations, and recent targets are first-class editor/File Manager services, not afterthoughts derived from transient UI state.
- The recurring cluster ideas to keep are local-first speed with an explicit remote/offline model, incremental/lazy file discovery and background work, first-class preview/manage operations in the file manager, durable session/hot-exit recovery, and native diff/test/task widgets integrated with editing rather than bolted on.
- The recurring failure modes to design against are crash-prone lifecycle/save edges, thin-wrapper resize/worker/SSR fragility, plugin/integration compatibility drag, ephemeral collaboration state and weak recovery, and IME/Unicode plus large-input correctness debt.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/storage-plan.md

### Editor archetype constraints

File Manager/editor implementation also carries midpoint archetype evidence from lightweight native editors, thin wrappers / embeddable editor engines, collaborative / online editors, and terminal-native/modal editors.

External benchmark findings remain grouped by archetype, not just by target: `AI-native workbench/IDE`, `full traditional IDE/workbench`, `embedded editor engine/wrapper`, `collaborative/online editor`, and `terminal-native editor`. These archetypes preserve discovery lineage without turning benchmark labels into product names.

- Lightweight native editors validate virtualized file-tree and background-scan direction, but their recurring pain points are plugin compatibility lag, regex-heavy UI blocking, memory growth, rendering/platform bugs, and incomplete split/history/navigation surfaces.
- Thin wrappers / embeddable editor engines are strongest at host/editor separation, small integration footprint, direct access to underlying editor instances, and easy framework embedding. Puppet Master must still treat resize/container fragility, whole-buffer rehighlighting, global shims, worker/path/SSR/shadow-DOM issues, accessibility limitations, weak diff/merge support, and host apps needing deep editor-specific knowledge as architectural risks.
- Collaborative / online editors are strongest at room/share-link and share-by-link onboarding, cursor/presence awareness, simple split source+preview flows, `/preview/output` simplicity, and fast collaborative mental models. Puppet Master must not inherit ephemeral or memory-backed state, weak durable storage, reconnect/forced-refresh flows, limited multi-buffer/workspace models, no synced scrolling, `/sanitization` shortcuts, or backend/API dependency risk as hidden defaults.
- Terminal-native/modal editors are strongest at command discoverability, small-footprint responsiveness, async/lazy file loading, safe save/reload handling, and cache-conscious text storage. Those strengths can inform editor command design without making the broader File Manager/editor surface terminal-owned.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/storage-plan.md

### Editor adapter implementation-reference constraints

The early implementation-reference cluster keeps source-lineage anchors `bench-06`, `bench-07`, `bench-08`, `bench-12`, `bench-16`, `bench-18`, and `bench-26` for editor integration constraints. Those references are useful patterns, not full workbench references: many compelling demos are thin editor wrappers, browser-first shared-document apps, or single-file/browser-runner shells.

- Keep the editor adapter thin and let the host/workspace own file/project/runtime identity. The editor surface renders and edits; it does not own workspace truth, execution transport, or project identity.
- Preserve selection/caret explicitly when re-highlighting or applying controlled external value updates.
- Avoid feedback loops by using silent/guarded update paths when host state is mirrored back into the live editor.
- Keep split-pane/editor-instance undo ownership explicit instead of accidentally shared across panes or wrapper instances.
- Unicode-aware OT/revision transforms, cursor rebasing, and snapshot persistence are reusable Rust-side patterns for collaborative or remote-edit seams.
- Deterministic extension/file-name based language fallback is a degraded path only; it is not a substitute for real detection/indexing/LSP.
- Separate execution transport from editor state even when a browser-first or /browser-runner reference proves useful elsewhere.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

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

Day-to-day tree interaction is implementation-ready and carries implementation-readiness detail: header search is an active repo/worktree tree filter, not universal search, full-text search, or a mixed-root result surface. Matching includes name-only and repo-relative path matches; ignored files remain dimmed by default or absent when Hide ignored is enabled. Floating-window File Manager behavior uses the same filter, `/worktree-aware` repo_id/worktree_id context, and Source Control strip (`Open in Source Control`, `Open diff`, `Open compare`) as the docked panel.

Worktree-variant opens are identity-rich rather than path-only. The default GUI action for the same `repo_relative_path` across worktrees is side-by-side compare with `project_id`, `repo_id`, `repo_relative_path`, `left_worktree_id`, `right_worktree_id`, and optional revision selectors; this is the same-file-across-worktrees rule for compare/open identity. A `/chip` may switch variants only inside a dedicated compare or multi-variant inspection surface, not as the primary ordinary editor-tab model. The editor `/header/status/breadcrumb` area shows `current worktree` plus `other variants available`, and `/recent/changed-file`, chat activity cards, search results, and review links must open the correct worktree variant rather than whichever tab is active. Normal editor tabs are path-backed and file-watch-backed to one concrete file identity; PM must not implement a content-swapping tab that hides dirty state, undo history, save target, file-watch identity, or chat/diff routing.

Mixed-worktree search/recent/changed-file lists show row-level and `/file-level` worktree-context badges or `/banners` when results from multiple worktrees or a mixed-root set appear together. Ordinary File Manager trees scoped to one active single-worktree root do not need duplicate per-row worktree icons. The design bias is explicit: edit one concrete variant, compare across variants explicitly, switch variants deliberately, expose `Open other worktree version`, `Compare with worktree...`, and optional `/dropdown` selection only as explicit compare/open actions, and never hide worktree context behind a generic tab that silently changes identity. Source Control owns the stronger `/switch/manage/conflict` worktree UI.

ContractRef: Plans/Decision_Policy.md, Plans/storage-plan.md §2.3, Plans/Tools.md §2.5

- **Placement:** Docked File Manager is the Activity Bar side-panel occupant in the single right-hand shell slot by default, with the same detachable/pop-out behavior as Chat and re-docking back to that slot. Per FinalGUISpec §4.1, Composergui5 §5, and feature-list layout: header ("FILES"), refresh, pop-out; search; virtualized file tree; optional Git status strip.
- **Virtualized file tree:** Only visible nodes are rendered; scroll position determines which slice of the tree is shown. Total height uses an estimated row height (AutoDecision: `row_height_px = 24`) so the scrollbar is correct. Supports deep trees; **very large directories** (e.g. node_modules): virtualize by row, apply a row cap per directory (AutoDecision: 10_000 entries; key `file_manager/row_cap_per_directory`) with "Show more" or type-ahead to narrow; AutoDecision: no explicit depth limit (children are loaded lazily on expand).
- **Behavior:** Lists all files in the current project. **Selecting a file opens it in the in-app IDE-style editor** (§2). File Manager and editor share the same project context.
- **.gitignore / exclude:** File tree respects `.gitignore` (and optionally a project exclude list) as the File Manager's gitignore-aware traversal contract. Ignored files/folders are **dimmed** by default. Optional user setting **"Hide ignored"** hides them entirely (toggle in header or Settings).
- **Context menu:** Summary-only entrypoint for the canonical file-tree action catalog in §11.1 and §11.4. Core actions include create/rename/delete/path copy, workspace-node clipboard actions, Add to Assistant Chat, Open in Terminal, Open With, and Save Local Copy. Aligns with selectable labels and context menus (AGENTS.md).
- **Drag and drop (external ↔ File Manager):** User can **drop** files/folders from the desktop (or another app) **onto** a folder or project root in the tree (items are copied into that folder), and **drag** files/folders **out** of the tree onto the desktop or another app (copied to drop target). Copy is default; optional modifier for move. Full specification: **§1.1**.
- **Expand/collapse persistence:** Which folders are expanded is persisted per project (e.g. in redb under project key); restore on reopen.
- **Keyboard:** Arrow keys navigate the tree; Enter opens the selected file (or expands/collapses folders). Type-ahead (or search) narrows to matching nodes. Keyboard-only use must be supported for accessibility.
- **Current file ("you are here"):** When the editor has focus, optionally highlight and scroll the File Manager tree to the current file so the two surfaces stay visually connected.
- The selection-model keeps one active row while allowing additive/range multi-select for drag-out, delete, and path-copy. Open actions are `/open-on-click` and open-on-enter against the active row, not bulk-open of every selected file. `New file`, `New folder`, and `Rename` require a single concrete target context; `Delete` may operate on multi-select with recursive confirmation; `Copy full path` copies one absolute path for single-select or a newline-delimited list for multi-select. Create/rename rejects empty names, `.` / `..`, separators, and platform-reserved names before mutation; `/reveal` plus current-file `/highlight` is required when the file exists in-tree, and the GUI must disclose when filters or ignored settings hide it.
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
3. **Chat edit-card open target**: For chat `file-edit` cards, the path `to-open` resolves from `working_directory + relative_path`: the card displays the worktree-relative path, and the File Manager/editor opens the worktree's filesystem location as a real file on disk at the worktree path without a special rewrite layer.
4. **Artifact-by-identity**: Artifacts (outputs, logs, diffs) are stored by content hash and indexed by (concern_id, route_target, artifact_type, timestamp); raw paths are deprecated.
5. **Open-file visibility**: The open-file list visible in the GUI is filtered by the active execution_role and the current approval_scope. Files opened in restricted approval scopes are not shown to unprivileged users.

### Route/open rules

#### Acceptance carry-through
- Let Contracts_V0 own canonical route_target and OpenSubject contracts
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based
- Keep route_target small with subject_id or object_kind/object_id identity
- Limit subject_id families to doc:/artifact:, keep inspector_target secondary, and override only necessary destination/context state
- Keep `OpenFile { path, line?, range?, target_group? }` as a file-system/editor realization only: `open-file`, `file-open`, `/navigation`, line `/range`, and `target_group` route workspace file paths, not every openable object.
- Use `OpenArtifact` for identity-native runtime-artifact opens: resolve `artifact_id` first, then follow envelope refs to `content_ref`, `linked_artifact_id`, `logical_artifact_id`, receipt-like refs, `attempt-level` evidence lineage, and Source Control, GitHub, Docker, or Kubernetes surfaces when relevant.
- Runtime artifact envelopes are attempt-native and bridge-aware: they carry `run_id`, `node_id`, `thread_id`, `attempt_id`, and `artifact_id`; `task_id` remains legacy `/compatibility` display metadata, not the primary execution anchor.
- Evidence artifacts such as `evidence`, `validation_test`, `failed_attempts`, and `before_after_snapshot` are attempt-native whenever produced by node worker or `/verifier/reviewer` flows.
- Route shell-state overrides only the necessary destination/context state; shell-state never replaces `subject_id`, `/object_id`, `object_kind`, or `object_kind/object_id` identity.
- Normalize legacy `/special-case` IDs into `subject_id` or `object_kind/object_id` before open/navigation handling.
- Tool/runtime artifact linkage is direct: `/tool` traces link to artifact refs, artifacts link back to originating `/attempt` and tool refs, and receipts preserve run/attempt plus cross-surface refs.
- FileManager route/open handling keeps ref families distinct instead of collapsing them under one loose link idea: inspection `/detail` refs, report `/evidence` refs, provenance `/source` refs, receipt `/external-operation` refs, and navigation `/deep-link` refs remain separate inputs to `OpenSubject`, `OpenArtifact`, or workspace-file realization.
- Node-first routing and attempt-native runtime identity flow through Usage and Evidence by carrying `run_id`, `node_id`, `thread_id`, `attempt_id`, `artifact_id`, and `route_target`/`subject_id` together; FileManager consumes those keys for evidence/artifact opens without requiring tier-first compatibility translation.
- FileManager's `runtime-identity` open path aligns `/artifact` and evidence keys with attempt-native records: `evidence`, `validation_test`, `failed_attempts`, `before_after_snapshot`, `content_ref`, `linked_artifact_id`, `logical_artifact_id`, and receipt-like refs resolve by artifact identity before path realization.

### Error recovery in file/artifact access

If a file path is broken or a route_target is unreachable:
- Log a visibility deferral (do not fail the entire run).
- Emit a navigable error in the concern record so the user can inspect what went wrong.
- Provide a fallback route (e.g., workspace://project/concern) for results if the primary route was unavailable.
- Search-in-files and Search side panel handoffs use the Search-owned `cmd.search.find_in_files` and `cmd.search.open_result` route; FileManager records only route/open recovery state. For remote `/SSH` file operations, failed open, save, listing, and search handoffs classify before recovery: network or trust failures map to `network_blocked_by_policy`, `host_unreachable`, or `host_untrusted`; access refusal maps to `permission_denied`; missing paths map to `path_not_found` / `File not found`. These classifications preserve the user-visible network vs permission vs not-found distinction and propagate to Search/FileManager UI state.

## 5. Open targets and chooser behavior

FileManager open targets are source-backed and identity-preserving. `cmd.file.open_with` offers PM-native targets first: `source_editor`, `image_viewer`, `workspace_preview`, `detached_preview`, and `diff_review`. `system_default` is a separate future handoff through `cmd.file.open_in_system_default`, not the MVP fallback for PM-native open behavior.

## 6. Preview subjects and rendered document modes

Preview subjects preserve the source file or artifact identity before selecting a renderer. Markdown, Mermaid, HTML, SVG, image, and generated document previews use shared preview/session identity so chat, editor, browser, and FileManager links resolve to the same subject instead of opening unrelated panes.

## 7. Browser and terminal handoff boundaries

Browser and terminal entrypoints are FileManager placement/launch affordances, not runtime ownership. Browser session classes, DevTools, click-to-context, capture, takeover, and permission defaults remain owned by the promoted browser specs and UI command catalog; terminal sessions remain owned by terminal/runtime owners. FileManager records the route, target, and reveal context.

## 8. Image viewer and HTML preview

Image viewer and HTML preview are first-class FileManager preview surfaces. Image viewing uses `image_viewer` identity and preserves path/artifact provenance; HTML preview may open as `workspace_preview` or `detached_preview` and must disclose runtime unavailable or degraded browser capability instead of substituting screenshots as a pseudo-browser.

### 8.1 Image viewer

The image viewer opens workspace or artifact images with provenance, zoom, copy path, reveal, and open-with affordances while keeping image identity distinct from browser-session identity.

### 8.2 HTML and browser preview

HTML preview uses source-backed preview subjects and may route to workspace or detached browser preview when browser capability is available. Browser-specific capture, mutation, DevTools, and permissions remain owned by the browser specs and command catalog.

## 9. Tabs: Editor, Terminal, Browser

FileManager consumes terminal and browser tab ownership without collapsing them. Terminal tabs use `terminal_tab_id`, `terminal_pane_id`, and `terminal_session_id` from the terminal model; browser tabs use browser-session identity from the browser owner docs. Pinning, capability badges, and tab labels must keep terminal tab state separate from browser-tab state, so the source shorthand `/cap/browser-tab` is retired as an ambiguous combined concept rather than a live tab type.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

## 10. Editor navigation and semantic affordances

The old placeholder `restore missing §10-§12` is retired. Sections 10, 11, and 12 are live owner sections for editor navigation, file-tree action handoff, and Source Control review behavior; they are not optional appendices.

### 10.1 Breadcrumbs and outline

FileManager owns the editor breadcrumb strip and outline. When LSP is available, breadcrumbs and outline data use `documentSymbol`; when LSP is unavailable, the fallback path uses heuristic or regex outline data and labels the degraded state.

The broad-sweep meta-findings are canonical for the editor surface. Better-specified implementation-level areas include file-tree behavior, tabs and `/buffers`, split panes, save `/dirty` state, `/drop`, LSP, image `/HTML` preview, keyboard shortcuts, persistence, and click-to-open. Sparse areas that must remain visible as product seams include rename, delete, duplicate, `/compare`, patch/conflict handling, symbol-index fallback, file watcher behavior, remote SSH/LSP, terminal tabs, build/debug integration, session-view restore, file-tree refresh, and bulk operations.

Already-strong coverage remains explicit: image viewing is first-class in `§8.1` and `§14`, HTML/browser preview and hot reload are covered in `§8.2` and `§14`, browser evidence capture includes screenshots/traces/videos, and `cmd.browser` / `cmd.browser.*` command routing belongs to the browser command family. Click-to-open from files-touched, `Read:`, and `Edited:` entries remains shared with `assistant-chat-design.md`.

### 10.2 Go to symbol and semantic navigation

FileManager §10.2 is the canonical owner for Go to symbol. The command-palette and quick-open symbol picker use `documentSymbol` and `workspace/symbol` when LSP is available, and use heuristic, regex, or indexed symbol fallback behavior when it is not. References to `FileManager §10.9` as the Go to symbol owner are stale and must be corrected rather than inventing a new §10.9 owner.

In `Plans/FileManager.md` (`/FileManager.md`), symbol-index `/status` language is scoped to Go to symbol and semantic navigation. It must not imply that the regex index owns File Manager search or symbol indexing; FileManager consumes search results and fallback labels while `grep` and Search regex acceleration stay under Tools and storage-plan.

### 10.3 Diagnostics, gutter markers, and change markers

Diagnostics, gutter markers, and editor change markers render in the editor surface, consume LSP or fallback projections, and preserve the open-file identity from §4.1.

### 10.4 Definition, references, hover, and code actions

Definition, references, hover, code actions, formatting, rename, and apply-edit flows route through the FileManager editor surface and use FileSafe where a mutation is applied.

## 11. File tree actions, local filter, and chat handoff

FileManager owns the file-tree action surface. `cmd.chat.add_file_reference` is a lock, not a recommendation: Add to Assistant Chat inserts a visible file reference chip into the active composer/thread context and does not inline full file contents as a hidden side effect. File references are file-only in MVP; folder insertion is out of scope.

Search entrypoints from command palette, keyboard shortcuts, Search panel chrome, and context menus normalize to the Search-owned `cmd.search.*` family. FileManager may reveal or open selected file results, but it must not duplicate search semantics under file-manager-local or legacy `/chat/lsp-local` names.

### 11.1 Canonical tree action catalog

File-tree context menus expose create, rename, delete, copy path, Add to Assistant Chat, Open in Terminal, Open With, Save Local Copy, compare, and reveal actions through canonical `cmd.file.*`, `cmd.chat.*`, and related command IDs rather than ad hoc UI callbacks.

Tree-level and tree-node `/menu` contracts include Copy / Cut / Paste, Copy relative path, Add to Assistant Chat, Open With, Download / Save Local Copy, and `/open-containing-folder` or reveal when supported. `Save As` remains editor-oriented; tree copy/cut/paste and `/export` flows use copy-vs-move and transfer semantics, so this area is no longer under-specified by a short menu label list.

Copy/Cut/Paste for tree nodes uses a dedicated file-operation clipboard model across FileManager `/surfaces`, not text-selection clipboard semantics. `Copy` duplicates on paste, `Cut` marks a pending move, paste targets must be a folder or project root, and path validation plus conflict handling reuse drag/drop rules. Open With selects PM-native surfaces first; `system-default` remains a separate future handoff rather than part of the MVP PM-native target set.

### 11.2 Clipboard, drag/drop, and transfer engine

Clipboard, drag/drop, upload, download, and archive flows reuse the File Manager transfer contracts from the external discovery constraints and must keep path hardening, read-only state, and transfer progress explicit.

### 11.3 Local tree filter, selection, and current-file reveal

The local tree filter is a File Manager filter/type-ahead, not semantic search. Current-file reveal uses the open-file contract and may reveal an existing tree node instead of opening a duplicate buffer.

### 11.4 Open With and Save Local Copy

`cmd.file.open_with` is the PM-native Open With command for MVP editor and preview targets. The MVP-native target set is exactly `source_editor`, `image_viewer`, `workspace_preview`, `detached_preview`, and `diff_review`. `system_default` is not part of the canonical MVP target enum for this command; future OS handoff must use a separate explicit command such as `cmd.file.open_in_system_default`.

`Open With…` is the user-facing chooser label for `cmd.file.open_with`; it must resolve to one of the PM-native targets above rather than a hidden preview host or system-default fallback.

`cmd.file.save_local_copy` is the explicit Download / Save Local Copy `/copy-out` flow for workspace nodes: it exports a readable source to a user-chosen local destination without changing the node's project-relative path identity. For remote projects, this is the canonical remote-to-local escape hatch and remains distinct from tree Copy/Paste, editor Save As, or a move into the workspace.

## 12. Source Control handoff, compare, and review

Source Control handoff from FileManager keeps file identity, worktree identity, and compare targets explicit. Handoff prose must not leave unresolved `if needed` or `only if clarification text is needed` conditions; a handoff either routes through a canonical command or is recorded as out of scope for the current surface.

### 12.1 File-tree Source Control strip and diff entrypoints

The file tree may expose Source Control status, compare, and diff entrypoints, but ownership of repository state remains with Source Control and worktree contracts.

File/file-manager surfaces may expose `Open in Source Control`, `Open diff`, and `Open compare`, but they must not absorb branch/history/worktree ownership. Those actions hand off file identity, active `repo_id`, `worktree_id`, and compare target to Source Control instead of inventing a file-surface history model.

Chat owns inline operation cards for `files changed` and `code diffs`, while File Editor and compare surfaces own source-level `/diff` viewing and `/focus` for concrete files and `/subjects`. FileManager may route preview-generated edits, Open diff, Open compare, `/file-manager` and `/file-manager/source-control` entrypoints, and `/history/worktree` handoff for repo-wide or multi-file changes, but FileSafe owns mutation safety and restore-before-rerun enforcement and Source Control remains the git-native owner.

The GUI ownership split is stable: the Source Control side panel owns change lists, Git mutations, compare target selection, and `history/graph/worktree` pivots; docked editor diff/review is the canonical detailed in-shell surface; detached review windows are optional large-screen focused review surfaces; chat remains compact preview/audit only; and editor gutter plus scrollbar overview own heat-map summaries and change-marker state-feedback.

### 12.2 Compare-target defaults

Compare targets default from the active worktree and source-control state. Ambiguous compare targets must surface choices instead of silently selecting a stale branch, remote, or generated artifact.

### 12.3 Hunk actions, conflict review, and diff-local search

Hunk actions and conflict review use the diff/review owner contracts. FileManager may launch or reveal those flows but does not bypass review policy. Stage, unstage, discard, apply, expand/collapse, search-within-diff, and conflict-resolution review UX stay Source Control or review-owner behavior even when FileManager provides the entrypoint.

FileManager diff/review entrypoints must preserve the later reconciliation ownership: `GitHub_Integration.md` owns compare-target defaults, hunk actions, conflict review, and diff-local search; `UI_Command_Catalog.md` owns `cmd.git` / `cmd.git.*` coverage; `assistant-chat-design.md` owns `cmd.chat.revert` default semantics and chat-thread diff exposure. The hunk catalog includes `/apply/review/conflict`, `/reject/stage/unstage/revert/collapse`, `/unstage`, `/comments`, `/reanchor`, and large-directory-safe review loading; if merge strategy is unavailable, the surface must show conflict UI or reject rather than silently applying. Generated-vs-workspace-file visibility, `/file-manager` location, `/unstaged/conflicted` ownership, and conflict-resolution routing remain explicit.

### 12.4 Change-marker ownership and revert boundaries

Change markers in the editor are visual projections over source-control and FileSafe state. Revert actions must identify the exact file, hunk, or persisted mutation being reverted.

Git/source-control discard/compare/stage actions are not ordinary editor undo. Restore points, rollback, and revert-last-agent-edit remain explicit restore-history actions and must not be hidden behind git-panel affordances. Diff-specific heat-map/change-marker, diff-edit, per-hunk controls, open-in-diff, scrollbar change-marker behavior, and diff-surface undo grouping are required editor projections over compare state, not optional source-control decoration. Top-level-doc and `assistant-chat-design.md` links such as files-touched and open-in-editor are routing affordances, not replacements for source-buffer review state.

Conflicted markers override staged/unstaged styling until resolved, and staged and unstaged state remain visually distinguishable when both exist for one file. Revert/restore outcomes surface through audit/history state plus toast/banner and MUST NOT create a new persistent heat-map class.

The diff-affecting taxonomy is canonical: source-buffer edits include typing, preview-originated bounded patch apply, assistant patch apply, and conflict-result text edits in source-backed panes; git mutations include stage, unstage, discard, `stash push/pop`, mark conflict resolved, and hunk-level Git actions; restore/rollback actions include Revert last agent edit, `Restore to…`, checkpoint restore, rewind, and rollback. These resolve to confirmed restore events that refresh affected buffers rather than popping a local editor stack.

Diff undo/redo remains scoped by action class: single-file assistant edits, multi-file assistant edits, hunk-level Git actions, patch-apply / preview-apply actions, and conflict-resolution actions use the grouping rules above and never collapse into one global editor undo stack. Chat routing exposes the `files-touched strip`, `diff card`, `open-in-editor`, and `open-in-diff` as distinct affordances; revert scope must be declared as `last edit`, `last turn`, per-file, or per-thread, with audit/history representation preserved after revert or rollback. GUI ownership remains split across docked editor diff, detached review window, Source Control side-panel pivot / selection state, scrollbar heat-map / gutter change markers, and dirty / staged / conflicted / reverted feedback loops.

## 13. Preview refresh and hot reload controls

Preview refresh and hot reload controls live where the preview subject is visible. FileManager may expose refresh, reopen, detach, and reveal actions for workspace previews and browser-backed previews, but command ids and browser/session behavior remain with the browser and UI command owners. Hot reload state is visible as preview/runtime status, not as a hidden file watcher side effect.

## 14. Rendering, browser preview, and detached preview compatibility

Section 14 is the FileManager anchor for rendering and preview placement. It preserves the source-backed rendering split for Markdown, Mermaid, HTML, SVG, and images; browser preview remains editor-tab-first and detached-window-capable through `workspace_preview`, `detached_preview`, `preview_subject_id`, and `browser_session_id`. `/cap/browser-tab` is compatibility shorthand only and not a live tab type.

### 14.6 Browser preview and hot reload controls

Hot reload controls appear only when the owning preview/runtime session exposes a refreshable subject. FileManager may reveal, refresh, detach, or reopen that subject, while browser runtime behavior and command ids remain with the browser and UI command owners.

## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)


#### Acceptance carry-through
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage
- Resolve artifact open flows by artifact_id and then by linked envelope refs

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/FileManager.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### F-002 - File Manager Editor Scope And Compliance

```yaml
plan_unit_id: F-002
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the File Manager, in-app IDE-style editor, @ mention, click-to-open, image/HTML preview, tabs, and editor enhancement scope while deferring chat UX, layout, browser actions, and storage terms to their owner docs.
gui_related: true
gui_classification_reason: This unit defines user-visible File Manager/editor/chat integration scope and authored help-copy alignment.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_editor_scope_and_compliance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0003
preserved_exact_tokens:
- Puppet Master
- File Manager
- IDE-style editor
- "@ mention"
- click-to-open
- redb
- seglog
- ELI5/Expert copy alignment
- ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Chat UX details defer to assistant-chat-design; layout defers to FinalGUISpec; browser click-to-context and agent-driven browser actions defer to the promoted browser owner docs.
owner_hints:
- Plans/FileManager.md
```

### F-003 - Project Driven Capability Activation

```yaml
plan_unit_id: F-003
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager/editor capability packs are activated by detected project signals after explicit detection/import logic, with plausible interpretations visible and overridable, indexing degraded states explicit, remote attachment state visible, and capability-pack breadth bounded and lazy-loaded.
gui_related: true
gui_classification_reason: This unit governs visible project-open detection, degraded states, and remote support affordances.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: project_driven_capability_activation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0004
preserved_exact_tokens:
- MUST assemble
- Project open MUST run explicit detection/import logic
- autodetection visible and overridable
- reduced-capability/degraded-mode state
- Remote mode MUST NOT pretend remote is only local with different paths
- bounded/reused
- lazy-loaded
- ContractName:Plans/Architecture_Invariants.md
negative_constraints:
- Remote mode must not pretend remote is only local with different paths.
- Indexing and external-model sync must be bounded/reused and must not dominate project open, navigation, or editor responsiveness.
compatibility_only_notes:
- Remote project support uses a thin local client/launcher with backend attachment/version management.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Mixed project-detection backend behavior and visible degraded/remote UI state are kept together for source preservation; later implementation may split detection service and UI projection work.
```

### F-004 - External Discovery Cluster Constraints

```yaml
plan_unit_id: F-004
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  External discovery research-lineage anchors constrain the editor/File Manager toward local-first remote-capable operation, incremental scanning, first-class preview/manage operations, durable recovery, native diff/test/task widgets, reusable Rust text core, atomic save/watch handling, and explicit histories while rejecting known fragility modes.
gui_related: true
gui_classification_reason: This unit carries file-tree/sidebar, preview, and editor recovery product constraints with visible surface implications.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: external_discovery_cluster_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0005
preserved_exact_tokens:
- bench-01
- bench-04
- bench-05
- bench-06
- bench-08
- bench-15
- bench-23
- bench-25
- bench-27
- bench-30
- Rust text core
- atomic save
- watcher-driven external-change handling
- persistent search/replace/location histories
negative_constraints:
- Puppet Master must avoid monolithic customization debt and harden auth/path behavior.
- A marker-based split comparison is not enough for PM diff/merge goals.
- Fragile worker /path/SSR/shadow-DOM integration remains a failure mode to design against.
compatibility_only_notes:
- External discovery labels are research-lineage anchors, not product names.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Span mixes implementation-reference architecture constraints with visible File Manager/editor behavior; this PlanUnit preserves the grouped research-lineage cluster.
```

### F-005 - Editor Archetype Constraints

```yaml
plan_unit_id: F-005
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor archetype evidence is grouped by AI-native workbench/IDE, traditional IDE/workbench, embedded wrapper, collaborative/online editor, and terminal-native editor, preserving useful strengths while rejecting hidden defaults such as ephemeral state, weak recovery, limited workspace models, and terminal ownership of the broader surface.
gui_related: true
gui_classification_reason: This unit constrains visible editor/workbench behavior and collaboration affordances.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_archetype_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0006
preserved_exact_tokens:
- AI-native workbench/IDE
- full traditional IDE/workbench
- embedded editor engine/wrapper
- collaborative/online editor
- terminal-native editor
- room/share-link
- terminal-native editor
negative_constraints:
- Puppet Master must not inherit ephemeral or memory-backed state, weak durable storage, reconnect/forced-refresh flows, limited multi-buffer/workspace models, no synced scrolling, sanitization shortcuts, or backend/API dependency risk as hidden defaults.
- Terminal-native strengths can inform command design without making the broader File Manager/editor surface terminal-owned.
compatibility_only_notes:
- Lightweight native editors validate direction but also carry plugin compatibility, memory, rendering, and incomplete split/history/navigation risks.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Archetype evidence includes visible UI strengths and backend architecture risks; kept source-preserving as one archetype summary.
```

### F-006 - Editor Adapter Implementation Reference Constraints

```yaml
plan_unit_id: F-006
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The editor adapter stays thin: host/workspace owns file, project, runtime, execution transport, and project identity while the editor renders and edits; selection/caret, guarded updates, split-pane undo ownership, Unicode/revision transforms, degraded language fallback, and execution-transport separation remain explicit.
gui_related: false
gui_classification_reason: This unit defines adapter/runtime ownership constraints, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_adapter_implementation_reference_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0007
preserved_exact_tokens:
- thin
- host/workspace own file/project/runtime identity
- selection/caret
- silent/guarded update paths
- split-pane/editor-instance undo ownership
- Unicode-aware OT/revision transforms
- Deterministic extension/file-name based language fallback
- degraded path
negative_constraints:
- Deterministic extension/file-name based language fallback is degraded only, not a substitute for real detection/indexing/LSP.
- The editor surface does not own workspace truth, execution transport, or project identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-007 - File Manager Editor Definitions

```yaml
plan_unit_id: F-007
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager defines Buffer, Tab, Editor group, Dirty, Preset, redb, seglog, and FileSafe terms for the editor and File Manager surface.
gui_related: true
gui_classification_reason: Definitions describe user-visible editor concepts such as buffers, tabs, groups, dirty state, and presets.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_editor_definitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0008
preserved_exact_tokens:
- Buffer
- Tab
- Editor group
- Dirty
- Preset
- redb
- seglog
- FileSafe
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- seglog is the canonical append-only event ledger; FileSafe owns patch/apply/verify pipeline guards.
owner_hints:
- Plans/FileManager.md
```

### F-008 - Shared Buffer Transaction And Save Authority

```yaml
plan_unit_id: F-008
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  All user, preview, agent, FileSafe/LSP, restore/revert, and recovery replay mutations enter the shared buffer through typed transaction sources before dirty state, undo grouping, and save authority update; one save authority per file path governs split panes, previews, LSP edits, and agent mutations.
gui_related: false
gui_classification_reason: This unit defines buffer transaction, save, history, and mutation authority behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: shared_buffer_transaction_and_save_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0009
preserved_exact_tokens:
- typed transaction sources
- Save authority remains single-owner per file path
- one shared buffer
- one dirty flag
- one authoritative save/retry path
- /paste/delete
- /revert/history
- /undo
- /redo
- Restore to… / History
- MUST NOT masquerade as ordinary editor undo
- Remote `/SSH`
negative_constraints:
- Multi-file apply-edit, rename, hunk-level patch-apply, repo/worktree restore, and conflict-resolution flows must not masquerade as ordinary editor undo.
- Editor Ctrl+Z never becomes cross-file global undo.
- Runtime safe points remain internal blocked recovery anchors and are not restore points.
compatibility_only_notes:
- legacy `unsaved-content` wording maps to recover-unsaved handling on /quit and /later.
stale_retired_dispositions: []
owner_boundary_notes:
- FileSafe, LSPSupport, FinalGUISpec, and storage-plan own adjacent mutation, LSP, UI, and storage behavior.
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Span mixes buffer transaction classes, visible requested/effective modes, and restore/history boundaries; this unit preserves the shared authority contract.
```

### F-009 - File Manager Panel MVP Tree Behavior

```yaml
plan_unit_id: F-009
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The File Manager panel lists project files under root, opens selected files through the editor open-file contract, virtualizes large trees, restores expand/collapse state, exposes Hide ignored and row-cap settings, and shows explicit open/refresh/empty/permission error states.
gui_related: true
gui_classification_reason: This unit defines visible File Manager tree behavior, settings, and error states.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_panel_mvp_tree_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0011
preserved_exact_tokens:
- File Manager panel
- Done when
- Virtualized tree handles 10k+ rows
- Open failed
- Refresh failure
- Empty project
- No permission on subfolder
- Hide ignored
- Row cap per directory
- file_manager/expanded/{project_id}
- file_manager/row_cap_per_directory
negative_constraints:
- Open failure must not leave the tree in an inconsistent state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Source span also includes worktree identity and context-menu/layout details split into F-010 and F-011.
```

### F-010 - Worktree Aware File Identity

```yaml
plan_unit_id: F-010
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Worktree-variant opens are identity-rich: same repo-relative path across worktrees defaults to side-by-side compare with project, repo, path, left/right worktree, and optional revision identity; ordinary tabs stay path-backed to one concrete file identity and must not hide dirty state, undo history, save target, file-watch identity, or chat/diff routing.
gui_related: true
gui_classification_reason: This unit governs visible worktree variant compare/open behavior and editor tab identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: worktree_aware_file_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0011
preserved_exact_tokens:
- same-file-across-worktrees
- project_id
- repo_id
- repo_relative_path
- left_worktree_id
- right_worktree_id
- current worktree
- other variants available
- Open other worktree version
- Compare with worktree...
- content-swapping tab
negative_constraints:
- PM must not implement a content-swapping tab that hides dirty state, undo history, save target, file-watch identity, or chat/diff routing.
- A worktree variant chip may switch variants only inside compare or multi-variant inspection, not ordinary editor-tab identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Source Control owns stronger switch/manage/conflict worktree UI.
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from File Manager panel behavior so worktree identity does not get buried in generic tree behavior.
```

### F-011 - Panel Placement Context Menu Keyboard And Accessibility

```yaml
plan_unit_id: F-011
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager panel placement supports left/right dock or pop-out, optional detach/snap behavior, filter/search, .gitignore dimming or hiding, context menu entrypoints for canonical tree actions, active-row plus multi-select behavior, create/rename validation, reveal/current-file highlighting, and keyboard-only accessibility.
gui_related: true
gui_classification_reason: This unit covers visible panel placement, context menus, keyboard interaction, and accessibility.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: panel_placement_context_menu_keyboard_accessibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0011
preserved_exact_tokens:
- pop-out
- left sidebar
- right sidebar
- Search/filter box
- dock/pin position
- Detach/snap
- Context menu
- Add to Assistant Chat
- Open in Terminal
- Open With
- Save Local Copy
- Arrow keys
- Enter
- multi-select
- Copy full path
- reveal
- current-file /highlight
negative_constraints:
- Open actions are open-on-click and open-on-enter against the active row, not bulk-open of every selected file.
- Create/rename rejects empty names, . / .., separators, and platform-reserved names before mutation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from File Manager panel MVP tree behavior for GUI interaction details.
```

### F-012 - External Drag Drop Behavior Summary

```yaml
plan_unit_id: F-012
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager external drag/drop supports dropping files/folders onto project folders with copy default, Shift-move semantics, valid drop target validation, tree refresh/progress, drag-out URIs for project files, and deterministic per-item handling for multi-select operations.
gui_related: true
gui_classification_reason: This unit governs user-visible external drag/drop behavior and multi-selection operations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: external_drag_drop_behavior_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0013
preserved_exact_tokens:
- Drag and drop
- external ↔ File Manager
- copy
- move
- Shift
- valid drop targets
- multi-selection
- lexicographic by normalized source path
- name conflicts
- ContractRef: Plans/Tools.md §2.5, Plans/FileSafe.md
negative_constraints:
- Drag/drop operations must reject paths outside the project through security validation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-013 - Drag Drop Implementation And Feedback

```yaml
plan_unit_id: F-013
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Drag/drop implementation uses platform file-drop APIs for Windows, macOS, and Linux, normalizes and validates target paths under the project root, provides conflict dialog or setting behavior, performs large copy/move in background tasks with progress/cancel, and shows visual drag target plus post-drop feedback.
gui_related: true
gui_classification_reason: This unit defines visible drag target feedback and platform drag/drop implementation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: drag_drop_implementation_and_feedback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0014
preserved_exact_tokens:
- IDropTarget
- CF_HDROP
- DoDragDrop
- NSDraggingDestination
- NSPasteboardTypeFileURL
- Xdnd
- Wayland
- text/uri-list
- Normalize
- under the project root
- Name conflict dialog
- background task
- progress
- visual drag target
negative_constraints:
- Large drop operations must not block the main thread or tree UI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Implementation and user feedback details are combined in the source span.
```

### F-014 - Drag Drop Gaps Security And Failure Handling

```yaml
plan_unit_id: F-014
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Drag/drop gap handling covers cross-platform behavior, directory drops, move-versus-copy clarity, name conflicts, symlink policy, sensitive path exposure, cancellation, errors, locked files, path-too-long messages, project-root write guards, permission-denied errors, disk-space checks, rollback cleanup, and background execution.
gui_related: true
gui_classification_reason: This unit covers user-visible drag/drop failure handling and security prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: drag_drop_gaps_security_failure_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0016
preserved_exact_tokens:
- Symlinks
- Sensitive path exposure
- Cancel / failure mid-copy
- Locked files / permissions
- Path too long
- project-root write guard
- permission-denied
- insufficient space
- rollback cleanup
- background task
negative_constraints:
- Dragged-in paths must be validated against allowed workspace/project boundaries before mutation.
- Do not block the main thread or tree UI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Security/backend failure and user-visible error handling are preserved together from adjacent spans.
```

### F-015 - Deferred Drag Drop Enhancements

```yaml
plan_unit_id: F-015
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Deferred drag/drop enhancements include internal reorder for custom sort, same-filesystem move fallback, undo toast for recent copies, drag-to-chat attachment, and Settings options for default drop action, conflict policy, and show hidden files.
gui_related: true
gui_classification_reason: This unit captures optional visible drag/drop enhancements and settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: deferred_drag_drop_enhancements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0017
preserved_exact_tokens:
- Internal reorder
- Move instead of copy
- Undo toast
- Drag to chat
- Default drop action
- Conflict policy
- Show hidden files
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These are enhancements, not MVP hard blockers unless promoted by later owner docs.
owner_hints:
- Plans/FileManager.md
```

### F-016 - IDE Style Editor MVP Acceptance

```yaml
plan_unit_id: F-016
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The in-app IDE-style editor MVP opens files from the open-file contract, saves buffers, shows dirty and read-only states, enforces large-file limits, shows transient states, handles empty-file behavior, preserves canonical paths, and records cursor/scroll payload shape and highlight duration settings.
gui_related: true
gui_classification_reason: This unit defines visible editor MVP acceptance behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: ide_style_editor_mvp_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0018
preserved_exact_tokens:
- In-app IDE-style editor (MVP)
- Open failure
- Empty file behavior
- canonical path
- §4.1
- { line, column, scroll_y }
- editor/highlight_duration_ms
- Loading
- File not found
negative_constraints:
- Editor behavior must enforce large file threshold and hard cap.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-017 - Editor Placement Layout Detach And Tabs

```yaml
plan_unit_id: F-017
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor placement uses the File Editor strip and supports docked visibility, detach/redock, one floating editor window, tabs with active-buffer switching, close/unsaved prompts, reorder, and persistence.
gui_related: true
gui_classification_reason: This unit defines editor placement, layout, detach, and tab UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_placement_layout_detach_and_tabs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0019
preserved_exact_tokens:
- File Editor strip
- Placement
- layout
- detach
- redock
- one floating editor window
- tabs
- reorder
- persistence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-018 - Editing Save State Model

```yaml
plan_unit_id: F-018
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor save state keeps dirty, read-only, degraded, change-marker, write-lock, stale-disk, changed-on-disk, transient save/reload failure, and recovery attention as orthogonal facts; Save is explicit, save failure leaves dirty state intact with retry, save-as, and reason, and shared buffers remain authoritative.
gui_related: true
gui_classification_reason: This unit covers user-visible dirty/read-only/degraded/change-marker/write-lock/stale-disk facts and save behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editing_save_state_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0020
preserved_exact_tokens:
- dirty
- read-only
- /degraded
- change-marker
- write-lock
- stale-disk
- changed-on-disk
- Save is explicit
- save failure leaves dirty
- retry
- save-as
- ContractName:Plans/storage-plan.md
negative_constraints:
- Save failure must not silently clear dirty state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Source span also carries revert/restore and remote recovery contracts split into F-019 and F-020.
```

### F-019 - Revert Restore Boundaries

```yaml
plan_unit_id: F-019
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Revert and restore flows route through explicit backend-owned restore history: cmd.chat.revert resolves target_message_id or latest assistant turn, whole-turn multi-file restores update each buffer via backend refresh notification, and document pane restore/history uses the same restore pipeline without owning separate restore points.
gui_related: false
gui_classification_reason: This unit defines backend restore/revert routing and history boundaries, not GUI layout.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: revert_restore_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0020
preserved_exact_tokens:
- cmd.chat.revert
- target_message_id
- latest assistant turn
- whole-turn multi-file restore
- backend refresh notification
- Restore to… / History
- document pane
- restore points
negative_constraints:
- Neither File Editor nor document pane stores or manufactures restore points independently.
- Restore/revert must not create separate history branches.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from editing/save source span to keep backend restore history separate from GUI save states.
```

### F-020 - Recover Unsaved And Remote Backed Recovery

```yaml
plan_unit_id: F-020
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Recover-unsaved is required for local and remote-backed buffers; recovered remote-backed buffers represent local unsaved memory only, show the exact recovery banner, and must reconnect or revalidate destination before save or flush claims remote success.
gui_related: true
gui_classification_reason: This unit governs visible recover-unsaved and remote-backed recovery banners and states.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: recover_unsaved_remote_backed_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0020
preserved_exact_tokens:
- Recover unsaved
- local and remote-backed buffers
- Recovered local edits — remote destination not yet synchronized
- reconnect
- revalidate
- remote save/flush
- remote terminal
- /run-debug
negative_constraints:
- Remote terminal and /run-debug execution must not be promised merely because a remote-backed file can be edited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from broader editing/save source span for recovery-specific user-visible behavior.
```

### F-021 - Remote Offline Cached File Wording

```yaml
plan_unit_id: F-021
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager/editor owns cached-file-only offline editing: live UI uses Work offline (cached files only), legacy Work offline (cached) is compatibility shorthand only, no cached snapshot disables or shows no-cached-files state, and remote degraded states disclose host, pending write, read-only, search, git, shell, LSP, and file write availability.
gui_related: true
gui_classification_reason: This unit defines visible offline/cached-file labels and remote degraded states.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: remote_offline_cached_file_wording
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0021
preserved_exact_tokens:
- Work offline (cached files only)
- Work offline (cached)
- legacy shorthand
- no-cached-files state
- Remote host reconnecting
- Remote host unavailable
- Pending remote write
- Remote file is read-only
- remote `/offline`
negative_constraints:
- Live UI copy must not alternate between Work offline (cached files only) and legacy shorthand.
- When disconnected, remote file listings, searches/diffs, git, shell, LSP, and file writes must not pretend to be live.
compatibility_only_notes:
- Work offline (cached) may appear only in migration aliases, telemetry lineage, or compatibility notes.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-022 - Display Navigation Line Range And Highlighting

```yaml
plan_unit_id: F-022
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor display and navigation show line numbers, open and scroll to requested line/range data, highlight read-only ranges, clamp beyond-EOF requests, support go-to-line, and use basic syntax highlighting with LSP semantic highlighting augmentation or fallback.
gui_related: true
gui_classification_reason: This unit defines visible editor display, line navigation, highlighting, and syntax behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: display_navigation_line_range_highlighting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0022
preserved_exact_tokens:
- Line numbers
- Go to line / range
- 12
- 12-45
- L12-L45
- 1-based, inclusive
- highlights the range
- AutoDecision: default 5 s
- Clamped to line N
- .rs
- .py
- .md
- .json
- .toml
- .html
- .css
- .js
- semantic highlighting
negative_constraints:
- Unknown extension or plain text has no highlighting beyond fallback behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-023 - Split Panes And Editor Groups

```yaml
plan_unit_id: F-023
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Split editor panes are MVP scope with multiple editor groups, one tab list and active tab per group, one shared buffer per file path, focused group open targeting by default, optional Open in other group/new group actions, and per-view cursor and scroll state.
gui_related: true
gui_classification_reason: This unit defines visible split-pane editor group behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: split_panes_and_editor_groups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0023
preserved_exact_tokens:
- Split editor panes
- multiple editor groups
- Tab bar model (MVP)
- one buffer per file path
- active (focused) editor group
- Open in other group
- Open in new group
- Cursor/scroll position is per-view
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-024 - Embedded Document Pane Shared Buffer And Write Lock

```yaml
plan_unit_id: F-024
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Embedded document pane shares the same file buffer, dirty state, save authority, restore pipeline, and history model as File Editor; when DocumentPane status is writing…, File Editor and document pane are write-locked/read-only for user edits with a visible lock banner while streaming updates still apply.
gui_related: true
gui_classification_reason: This unit governs visible embedded document pane editing, read-only, and lock states.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: embedded_document_pane_shared_buffer_write_lock
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0024
preserved_exact_tokens:
- Embedded document pane
- same file buffer
- one dirty state
- same restore pipeline
- writing…
- read-only
- Locked: agent is writing this document
- Streaming updates
- shared-buffer invariant
negative_constraints:
- The lock is an interaction rule only; it does not create a separate buffer or history branch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Combines shared-buffer backend invariant with visible write-lock/banner behavior.
```

### F-025 - Embedded Annotation Chat Handoff Boundary

```yaml
plan_unit_id: F-025
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Embedded document annotations and chat handoff share document identity and buffer state while keeping annotation and composer-prep state adjacent to, not part of, file buffers: annotations anchor to canonical source text, send selection to chat does not mutate the buffer, and stale rendered selections fail explicitly.
gui_related: false
gui_classification_reason: This unit defines annotation and chat handoff state boundaries rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: embedded_annotation_chat_handoff_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0025
preserved_exact_tokens:
- Embedded Document Pane
- annotations
- chat handoff
- canonical source text
- rendered DOM state
- second buffer
- second dirty flag
- separate undo/history branch
- Send selection to chat
- thread-scoped composer-prep state
- stale rendered state
negative_constraints:
- Creating or resolving annotations must not create a second buffer, second dirty flag, or separate undo/history branch.
- Stale rendered-state annotation creation must fail explicitly rather than silently rebase.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-026 - Data Model Dirty State And Changed On Disk Prompt

```yaml
plan_unit_id: F-026
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor data model uses one buffer per file path and no duplicate tabs per group; dirty state reflects in-memory versus last-saved content, revert prompts before discarding dirty data, and file-changed-on-disk checks on save or focus show one combined prompt for dirty plus changed-on-disk cases.
gui_related: true
gui_classification_reason: This unit defines visible buffer dirty state and file-changed prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: data_model_dirty_state_changed_on_disk_prompt
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0026
preserved_exact_tokens:
- One buffer per file path
- one tab per path per group
- Dirty state
- Revert (reload from disk)
- Discard unsaved changes and reload?
- File changed on disk
- Reload / Overwrite / Cancel
- Do not check on every keystroke
- File changed on disk. You have unsaved changes. Reload (discard yours) / Overwrite disk / Cancel
negative_constraints:
- Do not show two separate dialogs in sequence for dirty plus file-changed-on-disk.
- Do not check for file-changed-on-disk on every keystroke.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Span combines buffer data model and visible prompt behavior.
```

### F-027 - Text Encoding File Type And Read Only Reasons

```yaml
plan_unit_id: F-027
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor text behavior includes per-buffer undo/redo, selection and clipboard, optional word wrap, monospace font, UTF-8 editable text, line-ending preservation, explicit Save only, binary/read-only file handling, and user-visible read-only reasons.
gui_related: true
gui_classification_reason: This unit covers visible text behavior, decode errors, binary/read-only states, and editor settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: text_encoding_file_type_read_only_reasons
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0027
preserved_exact_tokens:
- Undo/redo
- Ctrl+Z
- Ctrl+Shift+Z
- Ctrl+Y
- Copy, Cut, Paste
- UTF-8
- Cannot decode as UTF-8
- Only on explicit Save
- Binary file -- cannot edit.
- Read-only on disk
- File too large
- read-only reason in UI
negative_constraints:
- No auto-save in MVP.
- Hex view is out of scope for MVP.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-028 - Large File Strategy And Limits

```yaml
plan_unit_id: F-028
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Large-file MVP uses truncated read-only view plus Load full file above the line threshold, enforces a 10 000-line default and 5 MB hard cap, offers read-only/system-editor alternatives above cap, and persists configurable editor thresholds.
gui_related: true
gui_classification_reason: This unit defines visible large-file affordances and settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: large_file_strategy_and_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0028
preserved_exact_tokens:
- truncated view + "Load full file"
- 10 000 lines
- 5 MB
- File too large to edit
- View read-only (truncated)
- Open in system editor
- Large file threshold (lines)
- Hard cap (MB)
negative_constraints:
- Do not implement read-only virtualized editing in MVP unless needed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-029 - Editor Keyboard Shortcuts And Focus Policy

```yaml
plan_unit_id: F-029
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor focus handles Save, Close tab, Go to line, Next/Previous tab, Save As, and app/chat shortcut routing; floating editor windows handle editor shortcuts when any editor window has OS focus and open-file actions target/focus the floating editor.
gui_related: true
gui_classification_reason: This unit covers user-visible keyboard shortcuts and floating-editor focus routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_keyboard_shortcuts_focus_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0029
preserved_exact_tokens:
- Ctrl+S
- Ctrl+W
- Ctrl+G
- Ctrl+Tab
- Ctrl+Shift+Tab
- Save As
- Floating editor
- OS focus
- open the file there
negative_constraints:
- When focus is elsewhere, app/chat shortcuts apply instead of editor shortcuts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-030 - Editor Persistence Schema

```yaml
plan_unit_id: F-030
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor persistence stores open tab order, active tab index, scroll/cursor state, max tabs, session view state, layout/recent files, lazy-load restore behavior, persisted tab cap, dirty-buffer exit prompts, and recover-unsaved availability using redb-backed per-project/session keys without persisting full buffer content.
gui_related: true
gui_classification_reason: This unit defines persisted editor tab, cursor, and layout state visible across sessions.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_persistence_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0030
preserved_exact_tokens:
- tabs.{project_id}
- active_tab.{project_id}
- scroll_cursor.{project_id}.{path_hash}
- max_tabs
- session.{project_id}.{session_id}
- Do not persist full buffer content
- editor.max_persisted_tabs
- default `50`
- Dirty buffers on exit
- Recover unsaved
negative_constraints:
- Do not persist full buffer content as ordinary editor state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Source span also contains transient state and accessibility requirements split into F-031.
```

### F-031 - Transient Editor States And Accessibility

```yaml
plan_unit_id: F-031
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor and File Manager surfaces show consistent transient UI states and support keyboard-only operation, focus indicators, logical focus order, screen-reader-friendly labels where available, and reduced-motion preferences.
gui_related: true
gui_classification_reason: This unit covers visible loading/error states and accessibility behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: transient_editor_states_and_accessibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0030
preserved_exact_tokens:
- Loading...
- Decoding...
- Cannot decode as UTF-8
- File not found
- Deleted
- Binary file
- File too large
- Indexing...
- Open failed
- keyboard-only use
- visible focus indicators
- logical focus order
- screen reader-friendly labels
- reduced-motion preferences
negative_constraints:
- Editor and File Manager must not be mouse-only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from persistence schema so accessibility and transient UI states are independently addressable.
```

### F-032 - Mention In Chat Identity Preserving References

```yaml
plan_unit_id: F-032
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The @ mention system is project-scoped and identity-preserving: invoking @ opens a picker rooted in active project context, sources can include recent/modified/folder/symbol results, inserted mentions preserve canonical file identity/path, and already-open references resolve to existing editor state.
gui_related: true
gui_classification_reason: Although span_map inferred non-GUI, this unit governs the visible @ mention picker and chat navigation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: mention_in_chat_identity_preserving_references
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0031
preserved_exact_tokens:
- "@ mention"
- project-scoped
- identity-preserving
- recent files
- modified files
- folder navigation
- symbol-aware results
- canonical file identity/path
- Assistant and Interview chat surfaces
- existing editor state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI-related classification corrects span_map inference because this span defines visible chat picker/navigation behavior.
owner_hints:
- Plans/FileManager.md
```

### F-033 - File Manager Editor Chat Shared Project Integration

```yaml
plan_unit_id: F-033
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager, editor, and chat share one project context, @ mention uses the same file list as File Manager, and clicking a file path or code block in chat opens the file in the editor.
gui_related: true
gui_classification_reason: Although span_map inferred non-GUI, this unit governs visible click-to-open integration between chat and editor.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_editor_chat_shared_project_integration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0032
preserved_exact_tokens:
- same project context
- "@ mention resolution"
- same file list
- single source of truth for project files
- Clicking a file path or code block in chat opens the file in the editor
- §5
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI-related classification corrects span_map inference because this span defines visible click-to-open behavior.
owner_hints:
- Plans/FileManager.md
```

### F-034 - Identity-Based Open Routing And Worktree File Realization

```yaml
plan_unit_id: F-034
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns identity-based file-open routing: route_target paths resolve through
  Contracts_V0 route/open semantics, opened files bind to the active worktree
  execution_unit_context, and chat file-edit cards open the worktree filesystem path resolved from
  working_directory + relative_path without a special rewrite layer.
gui_related: true
gui_classification_reason: >-
  This unit governs visible file/editor open behavior from GUI, CLI, chat cards, and internal
  routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: identity_based_open_routing_and_worktree_file_realization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0033"
preserved_exact_tokens:
- "route_target"
- "github://owner/repo/file.md"
- "execution_unit_context"
- "working_directory + relative_path"
- "to-open"
- "real file on disk"
- "worktree path"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0 owns shared route/open semantics; FileManager realizes workspace file opens rather than raw route_target reads."
owner_hints:
- "Plans/FileManager.md"
```

### F-035 - Artifact Identity Storage And Approval-Scoped Open Visibility

```yaml
plan_unit_id: F-035
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Artifact opens are identity-backed and approval-scoped: artifacts are stored by content hash
  with concern_id, route_target, artifact_type, and timestamp identity, raw paths are deprecated,
  and the GUI open-file list filters by active execution_role and approval_scope.
gui_related: true
gui_classification_reason: >-
  This unit affects the GUI open-file list and approval-scoped visibility of opened files and
  artifacts.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: artifact_identity_storage_and_approval_scoped_open_visibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0033"
preserved_exact_tokens:
- "content hash"
- "(concern_id, route_target, artifact_type, timestamp)"
- "raw paths are deprecated"
- "execution_role"
- "approval_scope"
- "Open-file visibility"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Raw paths are deprecated for artifact identity."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-036 - Route Target And OpenFile Boundary Rules

```yaml
plan_unit_id: F-036
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Route/open handling keeps Contracts_V0 as owner for canonical route_target and OpenSubject
  contracts, keeps Crosswalk limited to primitive boundary ownership, and keeps OpenFile narrow as
  a filesystem/editor realization for path, optional line/range, target_group, navigation, and
  workspace file paths.
gui_related: false
gui_classification_reason: >-
  This unit defines routing and owner-boundary contracts rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: route_target_and_openfile_boundary_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0034"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0035"
preserved_exact_tokens:
- "route_target"
- "OpenSubject"
- "Crosswalk"
- "OpenFile { path, line?, range?, target_group? }"
- "open-file"
- "file-open"
- "/navigation"
- "line /range"
- "target_group"
negative_constraints:
- "OpenFile must not become the owner for every openable object."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0 owns route_target and OpenSubject; Crosswalk owns primitive boundary ownership; FileManager owns narrow workspace-file realization."
owner_hints:
- "Plans/FileManager.md"
```

### F-037 - OpenArtifact Attempt-Native Resolution

```yaml
plan_unit_id: F-037
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  OpenArtifact resolves identity-native runtime-artifact opens by artifact_id first, then follows
  envelope references to content_ref, linked_artifact_id, logical_artifact_id, receipt-like refs,
  attempt-level evidence lineage, and Source Control, GitHub, Docker, or Kubernetes surfaces when
  relevant.
gui_related: false
gui_classification_reason: >-
  This unit defines artifact identity resolution and runtime envelope linkage.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: openartifact_attempt_native_resolution
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0035"
preserved_exact_tokens:
- "OpenArtifact"
- "artifact_id"
- "content_ref"
- "linked_artifact_id"
- "logical_artifact_id"
- "receipt-like refs"
- "attempt-level"
- "run_id"
- "node_id"
- "thread_id"
- "attempt_id"
- "task_id"
negative_constraints: []
compatibility_only_notes:
- "task_id remains legacy /compatibility display metadata, not the primary execution anchor."
stale_retired_dispositions: []
owner_boundary_notes:
- "Runtime artifact envelopes carry run_id, node_id, thread_id, attempt_id, and artifact_id."
owner_hints:
- "Plans/FileManager.md"
```

### F-038 - Route Open Ref Family Separation

```yaml
plan_unit_id: F-038
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager route/open handling keeps inspection detail refs, report evidence refs, provenance
  source refs, receipt external-operation refs, and navigation deep-link refs distinct as inputs
  to OpenSubject, OpenArtifact, or workspace-file realization.
gui_related: false
gui_classification_reason: >-
  This unit defines route/open taxonomy and identity boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: route_open_ref_family_separation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0035"
preserved_exact_tokens:
- "/detail"
- "/evidence"
- "/source"
- "/external-operation"
- "/deep-link"
- "OpenSubject"
- "OpenArtifact"
- "workspace-file realization"
- "subject_id"
- "object_kind/object_id"
negative_constraints: []
compatibility_only_notes:
- "Normalize legacy /special-case IDs into subject_id or object_kind/object_id before open/navigation handling."
stale_retired_dispositions: []
owner_boundary_notes:
- "FileManager consumes route_target and subject_id identity without collapsing ref families under one loose link idea."
owner_hints:
- "Plans/FileManager.md"
```

### F-039 - File And Artifact Open Recovery Classification

```yaml
plan_unit_id: F-039
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Broken file paths or unreachable route_targets log visibility deferral, emit a navigable concern
  error, provide a fallback route when primary routing is unavailable, and classify remote SSH
  open/save/list/search failures before recovery while preserving network, permission, and
  not-found distinctions in Search/FileManager UI state.
gui_related: true
gui_classification_reason: >-
  This unit governs navigable user-visible recovery state for broken file, artifact, Search, and
  remote SSH access.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: file_and_artifact_open_recovery_classification
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0036"
preserved_exact_tokens:
- "visibility deferral"
- "navigable error"
- "workspace://project/concern"
- "cmd.search.find_in_files"
- "cmd.search.open_result"
- "network_blocked_by_policy"
- "host_unreachable"
- "host_untrusted"
- "permission_denied"
- "path_not_found"
- "File not found"
- "remote /SSH"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Search owns cmd.search.find_in_files and cmd.search.open_result; FileManager records route/open recovery state."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span mixes backend recovery classification with user-visible Search/FileManager UI state;
  both remain source-preserved in one unit for this standardization pass.
```

### F-040 - Terminal And Browser Tab Identity Separation

```yaml
plan_unit_id: F-040
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager consumes terminal and browser tab ownership without collapsing them: terminal tabs
  use terminal_tab_id, terminal_pane_id, and terminal_session_id from the terminal model, browser
  tabs use browser-session identity from browser owner docs, and pinning, capability badges, and
  labels keep the state separate.
gui_related: true
gui_classification_reason: >-
  This unit governs visible tabs, labels, pinning, and capability badges.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: terminal_and_browser_tab_identity_separation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0037"
preserved_exact_tokens:
- "terminal_tab_id"
- "terminal_pane_id"
- "terminal_session_id"
- "browser-session identity"
- "Pinning"
- "capability badges"
- "tab labels"
- "/cap/browser-tab"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The source shorthand /cap/browser-tab is retired as an ambiguous combined concept rather than a live tab type."
owner_boundary_notes:
- "Terminal and browser owner docs define their respective tab/session identity models."
owner_hints:
- "Plans/FileManager.md"
```

### F-041 - Live Section 10-12 Ownership Restoration

```yaml
plan_unit_id: F-041
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The old restore missing §10-§12 placeholder is retired; sections 10, 11, and 12 are live owner
  sections for editor navigation, file-tree action handoff, and Source Control review behavior and
  are not optional appendices.
gui_related: false
gui_classification_reason: >-
  This unit records canonical owner-section restoration and stale placeholder retirement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: live_section_10_12_ownership_restoration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0038"
preserved_exact_tokens:
- "restore missing §10-§12"
- "Sections 10, 11, and 12"
- "editor navigation"
- "file-tree action handoff"
- "Source Control review behavior"
- "not optional appendices"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The old placeholder restore missing §10-§12 is retired."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-042 - Breadcrumb And Outline LSP Fallback

```yaml
plan_unit_id: F-042
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the editor breadcrumb strip and outline; available LSP data uses
  documentSymbol, fallback uses heuristic or regex outline data, and degraded state is labeled
  when LSP is unavailable.
gui_related: true
gui_classification_reason: >-
  This unit governs visible editor breadcrumb and outline surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: breadcrumb_and_outline_lsp_fallback
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0039"
preserved_exact_tokens:
- "breadcrumb strip"
- "outline"
- "documentSymbol"
- "heuristic or regex outline data"
- "degraded state"
- "LSP"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-043 - Editor Surface Seams And Strong Preview Coverage

```yaml
plan_unit_id: F-043
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager keeps broad editor meta-findings canonical, preserves sparse implementation seams as
  visible product seams, keeps image and HTML/browser preview coverage explicit, keeps cmd.browser
  command routing with the browser command family, and shares click-to-open from files-touched,
  Read:, and Edited: entries with assistant-chat-design.
gui_related: true
gui_classification_reason: >-
  This unit carries user-visible editor, preview, browser, and chat routing surface boundaries.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: editor_surface_seams_and_strong_preview_coverage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0039"
preserved_exact_tokens:
- "/buffers"
- "/dirty"
- "/drop"
- "image /HTML preview"
- "rename"
- "delete"
- "duplicate"
- "/compare"
- "patch/conflict handling"
- "symbol-index fallback"
- "remote SSH/LSP"
- "cmd.browser"
- "cmd.browser.*"
- "files-touched"
- "Read:"
- "Edited:"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Browser preview and cmd.browser routing belong to the browser owner docs; click-to-open from chat entries is shared with assistant-chat-design.md."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span mixes strong existing preview coverage, sparse editor seams, and cross-doc browser/chat
  routing boundaries; later implementation may split those surfaces.
```

### F-044 - Go To Symbol Owner And Fallbacks

```yaml
plan_unit_id: F-044
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager §10.2 is the canonical owner for Go to symbol; command-palette and quick-open symbol
  picker behavior uses documentSymbol and workspace/symbol when LSP is available and heuristic,
  regex, or indexed symbol fallbacks when it is not.
gui_related: true
gui_classification_reason: >-
  This unit governs command-palette and quick-open symbol picker behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: go_to_symbol_owner_and_fallbacks
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0040"
preserved_exact_tokens:
- "FileManager §10.2"
- "Go to symbol"
- "command-palette"
- "quick-open symbol picker"
- "documentSymbol"
- "workspace/symbol"
- "heuristic, regex, or indexed symbol fallback"
- "FileManager §10.9"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "References to FileManager §10.9 as the Go to symbol owner are stale and must be corrected rather than inventing a new §10.9 owner."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-045 - Symbol Index Status Search Boundary

```yaml
plan_unit_id: F-045
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Symbol-index /status language in FileManager is scoped to Go to symbol and semantic navigation;
  FileManager consumes search results and fallback labels while grep and Search regex acceleration
  stay under Tools and storage-plan.
gui_related: true
gui_classification_reason: >-
  This unit governs visible symbol-index status and fallback labels while preserving Search
  ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: symbol_index_status_search_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0040"
preserved_exact_tokens:
- "symbol-index /status"
- "/FileManager.md"
- "grep"
- "Search regex acceleration"
- "Tools"
- "storage-plan"
- "fallback labels"
negative_constraints:
- "Symbol-index /status language must not imply that the regex index owns File Manager search or symbol indexing."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Search and grep acceleration remain under Tools and storage-plan; FileManager consumes results and labels."
owner_hints:
- "Plans/FileManager.md"
```

### F-046 - Diagnostics Gutter And Change Marker Projection

```yaml
plan_unit_id: F-046
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Diagnostics, gutter markers, and editor change markers render in the editor surface, consume LSP
  or fallback projections, and preserve open-file identity from §4.1.
gui_related: true
gui_classification_reason: >-
  Diagnostics, gutter markers, and change markers are visible editor projections.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diagnostics_gutter_and_change_marker_projection
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0041"
preserved_exact_tokens:
- "Diagnostics"
- "gutter markers"
- "editor change markers"
- "LSP"
- "fallback projections"
- "§4.1"
- "open-file identity"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-047 - Editor Semantic Actions And FileSafe Mutation Boundary

```yaml
plan_unit_id: F-047
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Definition, references, hover, code actions, formatting, rename, and apply-edit flows route
  through the FileManager editor surface, with FileSafe used whenever a mutation is applied.
gui_related: true
gui_classification_reason: >-
  Definition, hover, code action, formatting, rename, and apply-edit flows are visible editor
  actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: editor_semantic_actions_and_filesafe_mutation_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0042"
preserved_exact_tokens:
- "Definition"
- "references"
- "hover"
- "code actions"
- "formatting"
- "rename"
- "apply-edit"
- "FileSafe"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-048 - Add To Assistant Chat File Reference Lock

```yaml
plan_unit_id: F-048
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the file-tree action surface, and cmd.chat.add_file_reference is a lock: Add to
  Assistant Chat inserts a visible file reference chip into the active composer or thread context,
  file references are file-only in MVP, and folder insertion is out of scope.
gui_related: true
gui_classification_reason: >-
  This unit governs the visible Add to Assistant Chat action and composer reference chip.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: add_to_assistant_chat_file_reference_lock
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0043"
preserved_exact_tokens:
- "cmd.chat.add_file_reference"
- "lock, not a recommendation"
- "Add to Assistant Chat"
- "visible file reference chip"
- "active composer/thread context"
- "file-only in MVP"
- "folder insertion is out of scope"
negative_constraints:
- "Add to Assistant Chat must not inline full file contents as a hidden side effect."
- "Folder insertion is out of scope for MVP."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-049 - Search Entrypoint Delegation

```yaml
plan_unit_id: F-049
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Search entrypoints from command palette, keyboard shortcuts, Search panel chrome, and context
  menus normalize to the Search-owned cmd.search.* family; FileManager may reveal or open selected
  file results but must not duplicate Search semantics under file-manager-local or legacy
  /chat/lsp-local names.
gui_related: true
gui_classification_reason: >-
  This unit governs command palette, keyboard shortcut, Search panel, and context-menu entrypoints
  visible to users.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: search_entrypoint_delegation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0043"
preserved_exact_tokens:
- "cmd.search.*"
- "Search panel chrome"
- "command palette"
- "keyboard shortcuts"
- "context menus"
- "file-manager-local"
- "/chat/lsp-local"
negative_constraints:
- "FileManager must not duplicate search semantics under file-manager-local or legacy /chat/lsp-local names."
compatibility_only_notes:
- "Legacy /chat/lsp-local search semantics normalize to Search-owned cmd.search.* behavior."
stale_retired_dispositions: []
owner_boundary_notes:
- "Search owns search semantics; FileManager may reveal or open selected file results."
owner_hints:
- "Plans/FileManager.md"
```

### F-050 - Canonical File Tree Action Catalog

```yaml
plan_unit_id: F-050
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File-tree context menus expose create, rename, delete, copy path, Add to Assistant Chat, Open in
  Terminal, Open With, Save Local Copy, compare, and reveal actions through canonical cmd.file.*,
  cmd.chat.*, and related command IDs rather than ad hoc UI callbacks.
gui_related: true
gui_classification_reason: >-
  This unit governs visible file-tree context menu actions and command IDs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: canonical_file_tree_action_catalog
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0044"
preserved_exact_tokens:
- "create"
- "rename"
- "delete"
- "copy path"
- "Add to Assistant Chat"
- "Open in Terminal"
- "Open With"
- "Save Local Copy"
- "compare"
- "reveal"
- "cmd.file.*"
- "cmd.chat.*"
negative_constraints:
- "File-tree actions must use canonical command IDs rather than ad hoc UI callbacks."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-051 - Tree Node Clipboard And Menu Semantics

```yaml
plan_unit_id: F-051
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Tree-level and tree-node menus include clipboard, path, chat, Open With, Download / Save Local
  Copy, and reveal actions; tree Copy/Cut/Paste uses a dedicated file-operation clipboard model
  where Copy duplicates on paste, Cut marks a pending move, paste targets are folder or project
  root, and validation/conflict handling reuse drag/drop rules.
gui_related: true
gui_classification_reason: >-
  This unit governs visible tree-node menu and clipboard behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: tree_node_clipboard_and_menu_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0044"
preserved_exact_tokens:
- "Copy / Cut / Paste"
- "Copy relative path"
- "/open-containing-folder"
- "Download / Save Local Copy"
- "Save As"
- "tree copy/cut/paste"
- "/export"
- "dedicated file-operation clipboard model"
- "Copy duplicates on paste"
- "Cut marks a pending move"
- "system-default"
negative_constraints: []
compatibility_only_notes:
- "system-default remains a separate future handoff rather than part of the MVP PM-native target set."
stale_retired_dispositions: []
owner_boundary_notes:
- "Save As remains editor-oriented; tree copy/cut/paste and export flows use copy-vs-move and transfer semantics."
owner_hints:
- "Plans/FileManager.md"
```

### F-052 - Transfer Engine Progress And Hardening

```yaml
plan_unit_id: F-052
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Clipboard, drag/drop, upload, download, and archive flows reuse File Manager transfer contracts
  and keep path hardening, read-only state, and transfer progress explicit.
gui_related: true
gui_classification_reason: >-
  This unit has visible transfer progress and read-only-state implications.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: transfer_engine_progress_and_hardening
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0045"
preserved_exact_tokens:
- "Clipboard"
- "drag/drop"
- "upload"
- "download"
- "archive"
- "File Manager transfer contracts"
- "path hardening"
- "read-only state"
- "transfer progress explicit"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-053 - Local Tree Filter And Current File Reveal

```yaml
plan_unit_id: F-053
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The local tree filter is a File Manager filter/type-ahead rather than semantic search, and
  current-file reveal uses the open-file contract and may reveal an existing tree node instead of
  opening a duplicate buffer.
gui_related: true
gui_classification_reason: >-
  This unit governs visible File Manager filter/type-ahead and current-file reveal behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: local_tree_filter_and_current_file_reveal
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0046"
preserved_exact_tokens:
- "local tree filter"
- "filter/type-ahead"
- "not semantic search"
- "Current-file reveal"
- "open-file contract"
- "existing tree node"
- "duplicate buffer"
negative_constraints:
- "The local tree filter must not become semantic search."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-054 - PM-Native Open With Target Enum

```yaml
plan_unit_id: F-054
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  cmd.file.open_with is the PM-native Open With command for MVP editor and preview targets; Open
  With… resolves to exactly source_editor, image_viewer, workspace_preview, detached_preview, or
  diff_review rather than a hidden preview host or system-default fallback.
gui_related: true
gui_classification_reason: >-
  This unit governs the visible Open With chooser label and PM-native target set.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: pm_native_open_with_target_enum
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0047"
preserved_exact_tokens:
- "cmd.file.open_with"
- "source_editor"
- "image_viewer"
- "workspace_preview"
- "detached_preview"
- "diff_review"
- "Open With…"
- "system_default"
- "cmd.file.open_in_system_default"
negative_constraints:
- "system_default is not part of the canonical MVP target enum for cmd.file.open_with."
- "Open With… must not resolve to a hidden preview host or system-default fallback."
compatibility_only_notes:
- "Future OS handoff must use a separate explicit command such as cmd.file.open_in_system_default."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-055 - Save Local Copy Copy-Out Flow

```yaml
plan_unit_id: F-055
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  cmd.file.save_local_copy is the explicit Download / Save Local Copy copy-out flow for workspace
  nodes: it exports a readable source to a user-chosen local destination without changing
  project-relative path identity, is the remote-to-local escape hatch for remote projects, and
  remains distinct from tree Copy/Paste, editor Save As, or moving into the workspace.
gui_related: true
gui_classification_reason: >-
  This unit governs visible Download / Save Local Copy export behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: save_local_copy_copy_out_flow
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0047"
preserved_exact_tokens:
- "cmd.file.save_local_copy"
- "Download / Save Local Copy"
- "/copy-out"
- "user-chosen local destination"
- "project-relative path identity"
- "remote-to-local escape hatch"
- "tree Copy/Paste"
- "editor Save As"
- "move into the workspace"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Save Local Copy does not change the node project-relative path identity."
owner_hints:
- "Plans/FileManager.md"
```

### F-056 - Source Control Handoff Command Boundary

```yaml
plan_unit_id: F-056
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Source Control handoff from FileManager keeps file identity, worktree identity, and compare
  targets explicit; handoff prose cannot leave unresolved clarification conditions and must either
  route through a canonical command or record the behavior as out of scope for the current
  surface.
gui_related: false
gui_classification_reason: >-
  This unit defines command/routing boundary and owner handoff rules.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: source_control_handoff_command_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0048"
preserved_exact_tokens:
- "file identity"
- "worktree identity"
- "compare targets"
- "if needed"
- "only if clarification text is needed"
- "canonical command"
- "out of scope"
negative_constraints:
- "Handoff prose must not leave unresolved if needed or only if clarification text is needed conditions."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Source Control handoff either routes through a canonical command or is out of scope for the FileManager surface."
owner_hints:
- "Plans/FileManager.md"
```

### F-057 - File Tree Source Control Entry Points

```yaml
plan_unit_id: F-057
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The file tree may expose Source Control status, Open in Source Control, Open diff, and Open
  compare entrypoints, but repository state ownership remains with Source Control and worktree
  contracts, with file identity, active repo_id, worktree_id, and compare target handed off
  explicitly.
gui_related: true
gui_classification_reason: >-
  This unit governs visible file-tree Source Control status, compare, and diff entrypoints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: file_tree_source_control_entry_points
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0049"
preserved_exact_tokens:
- "Source Control status"
- "Open in Source Control"
- "Open diff"
- "Open compare"
- "repo_id"
- "worktree_id"
- "compare target"
- "branch/history/worktree ownership"
negative_constraints:
- "File/file-manager surfaces must not absorb branch/history/worktree ownership or invent a file-surface history model."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Repository state remains with Source Control and worktree contracts."
owner_hints:
- "Plans/FileManager.md"
```

### F-058 - Diff Review Surface Ownership Split

```yaml
plan_unit_id: F-058
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Diff and review ownership is split across chat inline operation cards, File Editor and compare
  source-level viewing, FileManager preview/open entrypoints, FileSafe mutation safety and
  restore-before-rerun enforcement, Source Control git-native ownership, docked editor review,
  optional detached review windows, Source Control side panel pivots, compact chat preview/audit,
  and editor gutter or scrollbar state feedback.
gui_related: true
gui_classification_reason: >-
  This unit governs visible diff/review, chat, Source Control panel, editor gutter, and detached
  review surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diff_review_surface_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0049"
preserved_exact_tokens:
- "files changed"
- "code diffs"
- "/diff"
- "/focus"
- "/subjects"
- "preview-generated edits"
- "Open diff"
- "Open compare"
- "/file-manager"
- "/file-manager/source-control"
- "/history/worktree"
- "restore-before-rerun"
- "history/graph/worktree"
- "heat-map summaries"
- "change-marker state-feedback"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Chat owns inline operation cards; File Editor and compare own source-level viewing; FileSafe owns mutation safety; Source Control remains the git-native owner."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span intentionally mixes FileManager entrypoints, FileSafe mutation safety, Source Control
  ownership, chat previews, and detailed review surfaces; later implementation may split by owner
  surface.
```

### F-059 - Compare Target Defaults And Choice Surfacing

```yaml
plan_unit_id: F-059
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Compare targets default from active worktree and source-control state, and ambiguous compare
  targets must surface choices instead of silently selecting a stale branch, remote, or generated
  artifact.
gui_related: true
gui_classification_reason: >-
  This unit requires ambiguous compare choices to surface to the user.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: compare_target_defaults_and_choice_surfacing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0050"
preserved_exact_tokens:
- "Compare targets"
- "active worktree"
- "source-control state"
- "stale branch"
- "remote"
- "generated artifact"
negative_constraints:
- "Ambiguous compare targets must surface choices instead of silently selecting a stale branch, remote, or generated artifact."
compatibility_only_notes: []
stale_retired_dispositions:
- "Silent stale branch, remote, or generated-artifact selection is disallowed."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-060 - Hunk Conflict And Diff Search Launch Boundary

```yaml
plan_unit_id: F-060
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Hunk actions and conflict review use diff/review owner contracts; FileManager may launch or
  reveal stage, unstage, discard, apply, expand/collapse, search-within-diff, and
  conflict-resolution review flows but does not bypass review policy.
gui_related: true
gui_classification_reason: >-
  This unit governs visible hunk action, conflict review, and diff-local search entrypoints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: hunk_conflict_and_diff_search_launch_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0051"
preserved_exact_tokens:
- "hunk actions"
- "conflict review"
- "Stage"
- "unstage"
- "discard"
- "apply"
- "expand/collapse"
- "search-within-diff"
- "conflict-resolution review UX"
negative_constraints:
- "FileManager may launch or reveal review flows but must not bypass review policy."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Diff/review owner contracts own hunk actions and conflict review behavior."
owner_hints:
- "Plans/FileManager.md"
```

### F-061 - Hunk Catalog Reconciliation Owners

```yaml
plan_unit_id: F-061
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager diff/review entrypoints preserve later reconciliation ownership across
  GitHub_Integration.md, UI_Command_Catalog.md cmd.git coverage, assistant-chat-design.md
  cmd.chat.revert defaults and chat-thread diff exposure, and the hunk catalog; if merge strategy
  is unavailable, the surface shows conflict UI or rejects instead of silently applying.
gui_related: true
gui_classification_reason: >-
  This unit governs visible hunk/review command UX and cross-owner command routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: hunk_catalog_reconciliation_owners
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0051"
preserved_exact_tokens:
- "GitHub_Integration.md"
- "UI_Command_Catalog.md"
- "cmd.git"
- "cmd.git.*"
- "assistant-chat-design.md"
- "cmd.chat.revert"
- "/apply/review/conflict"
- "/reject/stage/unstage/revert/collapse"
- "/unstage"
- "/comments"
- "/reanchor"
- "large-directory-safe review loading"
- "/file-manager"
- "/unstaged/conflicted"
negative_constraints:
- "If merge strategy is unavailable, the surface must show conflict UI or reject rather than silently applying."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "GitHub_Integration.md owns compare-target defaults, hunk actions, conflict review, and diff-local search; UI_Command_Catalog.md owns cmd.git coverage; assistant-chat-design.md owns cmd.chat.revert defaults and chat-thread diff exposure."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  This span carries multiple owner-doc reconciliation boundaries for hunk actions, command
  catalog, chat revert, and conflict UI.
```

### F-062 - Change Marker Projection And Exact Revert Identity

```yaml
plan_unit_id: F-062
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Change markers in the editor are visual projections over source-control and FileSafe state, and
  revert actions identify the exact file, hunk, or persisted mutation being reverted.
gui_related: true
gui_classification_reason: >-
  Change markers and revert actions are visible editor/review behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: change_marker_projection_and_exact_revert_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "Change markers"
- "visual projections"
- "source-control"
- "FileSafe state"
- "exact file"
- "hunk"
- "persisted mutation"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-063 - Git Mutations Versus Restore History Boundary

```yaml
plan_unit_id: F-063
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Git source-control discard, compare, and stage actions are not ordinary editor undo; restore
  points, rollback, and revert-last-agent-edit remain explicit restore-history actions,
  diff-specific projections are required over compare state, and
  conflicted/staged/unstaged/reverted feedback stays visually distinct without creating a new
  persistent heat-map class.
gui_related: true
gui_classification_reason: >-
  This unit governs visible undo/revert controls, git-panel affordances, heat maps, and change
  markers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: git_mutations_versus_restore_history_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "Git/source-control discard/compare/stage"
- "ordinary editor undo"
- "Restore points"
- "rollback"
- "revert-last-agent-edit"
- "diff-specific heat-map/change-marker"
- "diff-edit"
- "per-hunk controls"
- "open-in-diff"
- "scrollbar change-marker"
- "Conflicted markers"
- "staged and unstaged"
- "toast/banner"
- "persistent heat-map class"
negative_constraints:
- "Git/source-control discard/compare/stage actions are not ordinary editor undo."
- "Restore points, rollback, and revert-last-agent-edit must not be hidden behind git-panel affordances."
- "Conflicted markers override staged/unstaged styling until resolved."
- "Revert/restore outcomes MUST NOT create a new persistent heat-map class."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-064 - Diff-Affecting Taxonomy And Restore Event Refresh

```yaml
plan_unit_id: F-064
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The diff-affecting taxonomy distinguishes source-buffer edits, git mutations, and
  restore/rollback actions, and those actions resolve to confirmed restore events that refresh
  affected buffers rather than popping a local editor stack.
gui_related: true
gui_classification_reason: >-
  This unit governs source-buffer refresh and review-state feedback after diff-affecting actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diff_affecting_taxonomy_and_restore_event_refresh
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "source-buffer edits"
- "typing"
- "preview-originated bounded patch apply"
- "assistant patch apply"
- "conflict-result text edits"
- "stage"
- "unstage"
- "discard"
- "stash push/pop"
- "mark conflict resolved"
- "Restore to…"
- "checkpoint restore"
- "rewind"
- "rollback"
- "confirmed restore events"
- "refresh affected buffers"
negative_constraints:
- "Diff-affecting restore events refresh affected buffers rather than popping a local editor stack."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-065 - Diff Undo Scope And Chat Diff Affordances

```yaml
plan_unit_id: F-065
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Diff undo/redo scope remains action-class based and never collapses into one global editor undo
  stack; chat routing exposes files-touched strip, diff card, open-in-editor, and open-in-diff as
  distinct affordances, revert scope is declared as last edit, last turn, per-file, or per-thread,
  and GUI ownership remains split across docked editor diff, detached review, Source Control
  side-panel state, scrollbar heat-map, gutter markers, and dirty/staged/conflicted/reverted
  feedback loops.
gui_related: true
gui_classification_reason: >-
  This unit governs visible chat, diff, editor affordances and undo scope declarations.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diff_undo_scope_and_chat_diff_affordances
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "single-file assistant edits"
- "multi-file assistant edits"
- "hunk-level Git actions"
- "patch-apply / preview-apply actions"
- "conflict-resolution actions"
- "one global editor undo stack"
- "files-touched strip"
- "diff card"
- "open-in-editor"
- "open-in-diff"
- "last edit"
- "last turn"
- "per-file"
- "per-thread"
- "docked editor diff"
- "detached review window"
- "Source Control side-panel pivot"
- "scrollbar heat-map"
- "dirty / staged / conflicted / reverted feedback loops"
negative_constraints:
- "Diff undo/redo actions never collapse into one global editor undo stack."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "GUI ownership remains split across docked editor diff, detached review window, Source Control side-panel pivot/selection state, scrollbar heat-map/gutter change markers, and dirty/staged/conflicted/reverted feedback loops."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span mixes action-class undo grouping, chat routing affordances, revert scope labels, and
  GUI surface ownership.
```

### F-066 - Runtime Artifact Open By Identity Addendum

```yaml
plan_unit_id: F-066
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The Runtime Artifact Open-by-Identity Consolidation Addendum makes runtime artifacts
  attempt-native by default with artifact identity, routing refs, content refs, and provider/usage
  linkage, and resolves artifact open flows by artifact_id before linked envelope refs.
gui_related: false
gui_classification_reason: >-
  This addendum defines runtime artifact identity resolution rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: runtime_artifact_open_by_identity_addendum
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0053"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0054"
preserved_exact_tokens:
- "Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)"
- "attempt-native"
- "artifact identity"
- "routing refs"
- "content refs"
- "provider/usage linkage"
- "artifact_id"
- "linked envelope refs"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-001 - File Manager Retired Source-Preserving Bridge

```yaml
plan_unit_id: F-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The former FileManager source-preserving bridge is retired after Phase 2B atomized
  FileManager-S0001 through FileManager-S0054 into F-002 through F-066 and structurally
  dispositioned the owner map, PlanUnits heading, retired bridge lineage, and Migration Coverage.
  F-001 remains only as migration lineage for the retired bridge span and must not re-own atomized
  source coverage.
gui_related: false
gui_classification_reason: >-
  The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map
  preserves gui_related_inferred=true from the historical broad bridge span.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "F-001 no longer uses the source-preserving PlanUnit compile hint."
- "F-002 through F-066 own product coverage for FileManager-S0001 through FileManager-S0054."
- "FileManager-S0055, S0056, and S0058 are structural owner-map, heading, and migration-coverage dispositions."
- "The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0057"
preserved_exact_tokens:
- "F-001"
- "source_preserving_planunit"
- "source_preserving_bridge_retired"
- "F-002"
- "F-066"
- "FileManager-S0001"
- "FileManager-S0058"
- "Owner / Consumer Map"
- "PlanUnits"
- "Migration Coverage"
negative_constraints:
- "Do not remap atomized FileManager spans back to F-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to F-001 remain auditable."
stale_retired_dispositions: []
owner_boundary_notes:
- "F-002 through F-066 own product coverage for FileManager-S0001 through FileManager-S0054."
owner_hints:
- "Plans/FileManager.md"
```
## Migration Coverage

Original hash: `665c217a8e576921149964c9a0f864af053a2f6b3ceb2d62b4742bc5c6d7a426`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B batch 054 atomized or structurally dispositioned `FileManager-S0001` through `FileManager-S0032` into `F-002` through `F-033`. Phase 2B batch 055 atomized `FileManager-S0033` through `FileManager-S0054` into `F-034` through `F-066`, structurally dispositioned `FileManager-S0055`, `FileManager-S0056`, and `FileManager-S0058`, and retired `F-001` as a `source_preserving_bridge_retired` migration-lineage unit for `FileManager-S0057`. FileManager.md now has no residual source-preserving product coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, or executable build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### F-067 - Preview Browser Terminal And Hot Reload Recovery Compile Addendum

```yaml
plan_unit_id: F-067
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns file-surface placement for editor, terminal, browser tab, image viewing, HTML/browser preview, and hot-reload entrypoints.
  Missing Sections 5 through 8 and 13 through 14, plus the three-line Section 9 Tabs stub, must recover by consuming live browser,
  terminal, preview, persistence, and command-owner PlanUnits rather than inventing separate FileManager-only behavior.
gui_related: true
gui_classification_reason: This unit governs visible file manager tabs, previews, browser/terminal panes, image viewing, and hot-reload controls.
depends_on: [F-002, F-009, F-010]
unblocks: [F3-387]
acceptance_criteria:
  - Image viewing remains first-class where FileManager references Sections 8.1 and 14.
  - HTML/browser preview and hot reload controls resolve to FileManager placement plus Section15/UI Command behavior owners.
  - Section 9 Tabs covers Editor, Terminal, and Browser without re-owning terminal or browser runtime internals.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual FileManager cross-reference review
risk_class: file_surface_anchor_loss
reasoning_tier: standard
context_scope: file_manager_preview_tabs
implementation_surfaces: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: file_surface_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0016
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0048
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0049
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0050
  - source_ref:chat:next-gui-filemanager-cluster
preserved_exact_tokens: ["§5", "§8.1", "§8.2", "§9", "§13", "§14", "§14.6", "Tabs: Editor, Terminal, Browser", "built-in browser", "browser/terminal tabs", "hot-reload controls", "image viewing"]
negative_constraints:
  - Do not make FileManager the browser behavior SSOT.
  - Do not leave the Tabs section as a three-line stub when compiling this recovery.
owner_hints: [Plans/FileManager.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md]
```

## Ledger Compile Addendum - pldg-20260614-002

### F-068 - Shared Mutation Session Actions

```yaml
plan_unit_id: F-068
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager edit, rename, delete, duplicate, patch, preview-edit, and generated-output apply actions
  must open or join a FileSafe mutation session before mutation. The UI derives save, apply, discard,
  stage, retry, request approval, resolve conflict, open diff, and rollback actions from session state,
  permission result, conflict policy, preview trust, watcher snapshot, and degraded/offline/LSP state.
gui_related: true
gui_classification_reason: FileManager mutation actions, buttons, diffs, and conflict controls are user-visible UI behavior.
depends_on: [F-067, F2-188]
unblocks: []
acceptance_criteria:
  - Mutating FileManager actions join a FileSafe mutation session before side effects.
  - UI actions derive from structured session state and guard inputs rather than local ad hoc checks.
  - Preview-edit and generated-output apply flows share the same mutation-session model as user/agent edits.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: filemanager_mutation_bypass
reasoning_tier: high
context_scope: filemanager_mutation_session_actions
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: filemanager_mutation_session_actions, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0082
  - pldg-20260614-002-part-3-fable-cleanup:atom-0083
preserved_exact_tokens: ["rename/delete/duplicate", "patch/conflict handling", "FileManager mutation UI derives actions from structured session"]
negative_constraints:
  - Do not implement FileManager mutating actions without FileSafe session state.
  - Do not derive conflict or rollback controls from unstructured error messages.
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
```

### F-069 - Operation Conflict Lifecycle

```yaml
plan_unit_id: F-069
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager operations use a controlled lifecycle for pending, running, needs_user_resolution,
  applying, succeeded, failed, and cancelled states. Conflict payloads carry conflict_id, target refs,
  baseline/current/proposed refs, conflict_kind, affected ranges or paths, actor/runtime_identity,
  recoverability, allowed_action_ids, selected resolution, evidence refs, and rollback refs. Patch,
  compare, rename, delete, duplicate, and bulk operations must use this lifecycle before mutating files.
gui_related: true
gui_classification_reason: Operation status, conflict resolution, compare, patch, and bulk controls are user-visible FileManager behavior.
depends_on: [F-068]
unblocks: []
acceptance_criteria:
  - FileManager operation states are controlled and typed.
  - Conflict payloads identify target, baseline/current/proposed refs, conflict kind, recoverability, actions, resolution, evidence, and rollback.
  - Patch, compare, rename, delete, duplicate, and bulk operations do not use ad hoc conflict state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: file_operation_conflict_drift
reasoning_tier: high
context_scope: filemanager_operation_conflict_lifecycle
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md]
node_compile_hint: {mode: filemanager_operation_conflict_lifecycle, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0085
  - pldg-20260614-002-part-3-fable-cleanup:atom-0086
preserved_exact_tokens: ["compare", "patch/conflict handling", "bulk operations", "FileManager operation/conflict lifecycle"]
negative_constraints:
  - Do not mutate files after a conflict without selected resolution and rollback refs.
  - Do not collapse needs_user_resolution into failed.
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md]
```

### F-070 - Degraded State And Preview Trust

```yaml
plan_unit_id: F-070
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager surfaces must model degraded state and preview trust explicitly. Environment state carries
  local, remote SSH, offline, cache-only, watcher-degraded, LSP-degraded, symbol-index-degraded,
  permission-degraded, and build/debug-unavailable inputs. Preview trust carries trusted, generated,
  sandboxed, stale, blocked, and fallback states plus evidence refs. UI actions, refresh behavior,
  preview fallback, open-in-editor, symbol navigation, build/debug affordances, and trust warnings derive
  from those structured states.
gui_related: true
gui_classification_reason: Degraded banners, preview trust, refresh, symbol navigation, and build/debug affordances are user-visible FileManager UI.
depends_on: [F-068]
unblocks: []
acceptance_criteria:
  - FileManager exposes structured degraded-state and preview-trust inputs.
  - Watcher, remote SSH, offline cache, LSP, symbol-index, preview, and build/debug conditions drive actions and disclosures.
  - Preview fallback and trust warnings are not inferred from file extension or path alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: filemanager_degraded_state_drift
reasoning_tier: high
context_scope: filemanager_degraded_preview_trust
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: filemanager_degraded_preview_trust, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0088
  - pldg-20260614-002-part-3-fable-cleanup:atom-0089
preserved_exact_tokens: ["remote SSH/LSP", "symbol-index fallback", "file-watcher behavior", "remote cache/offline/LSP degraded states", "preview trust/fallback"]
negative_constraints:
  - Do not render stale or sandboxed previews as trusted live source.
  - Do not hide watcher/LSP/symbol-index degradation behind generic file errors.
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
```

### F-071 - Workspace Adjunct Sessions

```yaml
plan_unit_id: F-071
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager workspace adjunct sessions cover terminal tabs, build/debug sessions, compare sessions,
  symbol-index sessions, remote SSH/LSP sessions, session-view restore, file-tree refresh, and bulk
  operation sessions. Each adjunct session carries session_id, workspace/worktree scope, actor/runtime_identity,
  target refs, lifecycle state, degraded/trust inputs, evidence refs, restore token, and owning surface so
  FileManager can restore views without re-owning terminal, LSP, build, debug, or remote transport internals.
gui_related: true
gui_classification_reason: Workspace tabs, session restore, terminal/build/debug controls, file-tree refresh, and bulk operation views are user-visible UI.
depends_on: [F-067, F-070]
unblocks: []
acceptance_criteria:
  - Adjunct sessions have identity, lifecycle, degraded/trust inputs, evidence refs, restore token, and owner surface.
  - Session-view restore does not imply FileManager owns terminal, LSP, build/debug, or remote transport behavior.
  - File-tree refresh and bulk operations use adjunct session state instead of untracked local UI state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: filemanager_adjunct_session_drift
reasoning_tier: standard
context_scope: filemanager_workspace_adjunct_sessions
implementation_surfaces: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/LSPSupport.md]
node_compile_hint: {mode: filemanager_workspace_adjunct_sessions, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0091
  - pldg-20260614-002-part-3-fable-cleanup:atom-0092
preserved_exact_tokens: ["terminal tabs", "build/debug integration", "session-view restore", "file-tree refresh", "bulk operations"]
negative_constraints:
  - Do not let FileManager re-own terminal, LSP, build/debug, or remote transport internals.
  - Do not restore workspace views from unversioned UI-only state.
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/LSPSupport.md]
```
