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

## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)


#### Acceptance carry-through
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage
- Resolve artifact open flows by artifact_id and then by linked envelope refs

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/FileManager.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### F-001 - File Manager & IDE-style Editor -- Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: F-001
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: Plans/FileManager.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileManager-S0054
preserved_exact_tokens:
- File Manager & IDE-style Editor -- Plan
- Change Summary
- Summary
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md'
- Project-driven capability activation
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plan'
- External discovery cluster constraints
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/storage-plan.md'
- Editor archetype constraints
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/storage-plan.md'
- Editor adapter implementation-reference constraints
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md'
- Definitions
- Buffer transaction model
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- Table of Contents
- 1. File Manager panel
- 'ContractRef: Plans/Decision_Policy.md, Plans/storage-plan.md §2.3, Plans/Tools.md §2.5'
- 1.1 Drag and drop (external ↔ File Manager)
- 'ContractRef: Plans/Tools.md §2.5, Plans/FileSafe.md'
- 1.1.1 Behavior summary
- 1.1.2 How we're going to do it
- 1.1.3 Gaps and how we address them
- 1.1.4 Potential problems and solutions
negative_constraints:
- Remote project support uses a thin local client/launcher with backend attachment/version management. Remote mode MUST NOT pretend remote is only local with different paths; attachment state, remote version compatibility, write availability, cache/index freshness, and reconnect/degraded state must be
- 'Capability-pack breadth is a product constraint. Plugin/module growth can become dependency and dynamic-loading debt, so packs must be bounded/reused across projects where safe, lazy-loaded only behind explicit project signals, and tested against startup and large-workspace responsiveness. Indexing '
- '- Collaborative / online editors are strongest at room/share-link and share-by-link onboarding, cursor/presence awareness, simple split source+preview flows, `/preview/output` simplicity, and fast collaborative mental models. Puppet Master must not inherit ephemeral or memory-backed state, weak dura'
- '- Preview-generated, preview-originated, and preview-applied source patches plus single-file FileSafe/LSP `/apply-edit/conflict` operations may enter buffer-history as one coherent single-buffer undo group only when they mutate the open source-buffer in place. Multi-file apply-edit, rename, hunk-lev'
- 'Worktree-variant opens are identity-rich rather than path-only. The default GUI action for the same `repo_relative_path` across worktrees is side-by-side compare with `project_id`, `repo_id`, `repo_relative_path`, `left_worktree_id`, `right_worktree_id`, and optional revision selectors; this is the '
- '| **Large drop blocks UI** | Run copy (and optional move) in a **background task**; show progress and allow cancel. Do not block the main thread or the tree UI. |'
- '- Remote editing is MVP scope for FileManager buffers and save/recovery flows. Remote terminal and `/run-debug` execution are deferred or optional runtime-surface capabilities, so FileManager must not promise terminal/run-debug availability merely because a remote-backed file can be edited.'
- The File Manager/editor owns the cached-file-only offline editing affordance. The visible action label is `Work offline (cached files only)` whenever the user can open or keep editing only files that already have a validated local cache or snapshot. `Work offline (cached)` is a legacy shorthand that
- '- **File changed on disk:** When the file on disk has changed since the buffer was loaded or last saved, the editor prompts the user. **When to check:** On **Save** (before overwriting: prompt Reload / Overwrite / Cancel) and when the **editor pane or the file''s tab gains focus** (app-global: when t'
- '- **Binary files:** Read-only with a clear reason: e.g. "Binary file -- cannot edit." Hex view out of scope for MVP.'
- '- **Strategy (MVP):** Use **truncated view + "Load full file"** for files above the threshold. Open read-only with a truncated view (e.g. first N lines) and a "Load full file" control; if the user loads full, allow editing subject to the hard cap. Do not implement read-only virtualized editing in MV'
- '- **Stored per project:** Open tab list (ordered paths), active tab index, and **scroll/cursor position per tab** (default: **persist**). Key: `project_id`. Persisted in **redb** (SSOT: Plans/storage-plan.md §2.3). **Editor state schema (redb):** Store in redb `editor` namespace per SSOT: `tabs.{pro'
- 'In `Plans/FileManager.md` (`/FileManager.md`), symbol-index `/status` language is scoped to Go to symbol and semantic navigation. It must not imply that the regex index owns File Manager search or symbol indexing; FileManager consumes search results and fallback labels while `grep` and Search regex '
- 'FileManager owns the file-tree action surface. `cmd.chat.add_file_reference` is a lock, not a recommendation: Add to Assistant Chat inserts a visible file reference chip into the active composer/thread context and does not inline full file contents as a hidden side effect. File references are file-o'
- Search entrypoints from command palette, keyboard shortcuts, Search panel chrome, and context menus normalize to the Search-owned `cmd.search.*` family. FileManager may reveal or open selected file results, but it must not duplicate search semantics under file-manager-local or legacy `/chat/lsp-loca
- Source Control handoff from FileManager keeps file identity, worktree identity, and compare targets explicit. Handoff prose must not leave unresolved `if needed` or `only if clarification text is needed` conditions; a handoff either routes through a canonical command or is recorded as out of scope f
- File/file-manager surfaces may expose `Open in Source Control`, `Open diff`, and `Open compare`, but they must not absorb branch/history/worktree ownership. Those actions hand off file identity, active `repo_id`, `worktree_id`, and compare target to Source Control instead of inventing a file-surface
- Git/source-control discard/compare/stage actions are not ordinary editor undo. Restore points, rollback, and revert-last-agent-edit remain explicit restore-history actions and must not be hidden behind git-panel affordances. Diff-specific heat-map/change-marker, diff-edit, per-hunk controls, open-in
- Conflicted markers override staged/unstaged styling until resolved, and staged and unstaged state remain visually distinguishable when both exist for one file. Revert/restore outcomes surface through audit/history state plus toast/banner and MUST NOT create a new persistent heat-map class.
compatibility_only_notes:
- Remote project support uses a thin local client/launcher with backend attachment/version management. Remote mode MUST NOT pretend remote is only local with different paths; attachment state, remote version compatibility, write availability, cache/index freshness, and reconnect/degraded state must be
- '- `bench-04`: Project open and navigation require incremental project scanning, small-module architecture, central command predicates for command availability, line-oriented document state where appropriate, plugin compatibility discipline, crash/regression hardening, and first-class file-tree/sideb'
- '- The recurring failure modes to design against are crash-prone lifecycle/save edges, thin-wrapper resize/worker/SSR fragility, plugin/integration compatibility drag, ephemeral collaboration state and weak recovery, and IME/Unicode plus large-input correctness debt.'
- '- Lightweight native editors validate virtualized file-tree and background-scan direction, but their recurring pain points are plugin compatibility lag, regex-heavy UI blocking, memory growth, rendering/platform bugs, and incomplete split/history/navigation surfaces.'
- '- Text mutation sources include user typing and `/paste/delete`, preview-generated bounded source patches, FileSafe/LSP apply-edit paths, backend-owned restore or `/revert/history` refreshes, on-disk-change resolution, and agent write-stream updates for generated files. They all route through the sh'
- The File Manager/editor owns the cached-file-only offline editing affordance. The visible action label is `Work offline (cached files only)` whenever the user can open or keep editing only files that already have a validated local cache or snapshot. `Work offline (cached)` is a legacy shorthand that
- '- Runtime artifact envelopes are attempt-native and bridge-aware: they carry `run_id`, `node_id`, `thread_id`, `attempt_id`, and `artifact_id`; `task_id` remains legacy `/compatibility` display metadata, not the primary execution anchor.'
- '- Normalize legacy `/special-case` IDs into `subject_id` or `object_kind/object_id` before open/navigation handling.'
- '- Node-first routing and attempt-native runtime identity flow through Usage and Evidence by carrying `run_id`, `node_id`, `thread_id`, `attempt_id`, `artifact_id`, and `route_target`/`subject_id` together; FileManager consumes those keys for evidence/artifact opens without requiring tier-first compa'
- Search entrypoints from command palette, keyboard shortcuts, Search panel chrome, and context menus normalize to the Search-owned `cmd.search.*` family. FileManager may reveal or open selected file results, but it must not duplicate search semantics under file-manager-local or legacy `/chat/lsp-loca
stale_retired_dispositions:
- '- Editor tab `/chrome` and secondary state-feedback surfaces show dirty, conflicted, read-only `/degraded`, change-marker, write-lock, stale-disk, changed-on-disk, transient `/save/reload` failure, and recovery attention as orthogonal facts rather than a `/vague` flat status. Save is explicit in MVP'
- '- If a selection was made against stale rendered state, mutating annotation creation must fail explicitly rather than silently rebase to a different span.'
- '4. **Artifact-by-identity**: Artifacts (outputs, logs, diffs) are stored by content hash and indexed by (concern_id, route_target, artifact_type, timestamp); raw paths are deprecated.'
- FileManager consumes terminal and browser tab ownership without collapsing them. Terminal tabs use `terminal_tab_id`, `terminal_pane_id`, and `terminal_session_id` from the terminal model; browser tabs use browser-session identity from the browser owner docs. Pinning, capability badges, and tab labe
- The old placeholder `restore missing §10-§12` is retired. Sections 10, 11, and 12 are live owner sections for editor navigation, file-tree action handoff, and Source Control review behavior; they are not optional appendices.
- 'FileManager §10.2 is the canonical owner for Go to symbol. The command-palette and quick-open symbol picker use `documentSymbol` and `workspace/symbol` when LSP is available, and use heuristic, regex, or indexed symbol fallback behavior when it is not. References to `FileManager §10.9` as the Go to '
- Compare targets default from the active worktree and source-control state. Ambiguous compare targets must surface choices instead of silently selecting a stale branch, remote, or generated artifact.
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/Tools.md`, `Plans/LSPSupport.md`.'
- '**Scope of this document:** This spec defines File Manager, editor, @ mention, click-to-open, image/HTML preview, tabs, and editor enhancements. It defers chat UX details to `Plans/assistant-chat-design.md`, layout to `Plans/FinalGUISpec.md`, and browser click-to-context / agent-driven browser actio'
- '- **seglog:** Canonical append-only event ledger; optional editor lifecycle events for analytics (see project storage design).'
- '- Restore/revert actions and recovery replay are explicit transaction sources with confirmation or recovery context; they may refresh the buffer from durable state, clear or replace dirty state only after the owner confirms the applied version, and must explain what happened to undo history.'
- '- Save authority remains single-owner per file path: one shared buffer, one dirty flag, one last-saved version, and one authoritative save/retry path across split panes, preview surfaces, LSP apply-edit, and agent mutation flows.'
- '- FileManager treats the editor as a shared-buffer, source-canonical workspace: file tree opens and `/targets` buffers, preview surfaces derive from buffers and return bounded patches, and diff/review surfaces compare or mutate buffers without becoming separate authorities. Remote `/SSH` changes the'
- '- [11.1 Canonical tree action catalog](#111-canonical-tree-action-catalog)'
- '- **Context menu:** Summary-only entrypoint for the canonical file-tree action catalog in §11.1 and §11.4. Core actions include create/rename/delete/path copy, workspace-node clipboard actions, Add to Assistant Chat, Open in Terminal, Open With, and Save Local Copy. Aligns with selectable labels and'
- '**Done when:** (1) Open file from §4.1 adds/switches tab and optional line/range; (2) Save writes buffer and clears dirty; (3) Dirty + read-only states visible; (4) Large file threshold and hard cap enforced; (5) Transient UI states (Loading, File not found, etc.) shown consistently. **Open failure:'
- '### 2.4.1A Embedded document annotations and chat handoff boundary'
- '- Durable annotations anchor to canonical source text in the shared buffer, not to rendered DOM state.'
- '- **Stored per project:** Open tab list (ordered paths), active tab index, and **scroll/cursor position per tab** (default: **persist**). Key: `project_id`. Persisted in **redb** (SSOT: Plans/storage-plan.md §2.3). **Editor state schema (redb):** Store in redb `editor` namespace per SSOT: `tabs.{pro'
- '- the inserted mention preserves the canonical file identity/path needed by prompt assembly and click-to-open behavior'
- 'FileManager is the canonical owner of the file-open and artifact-storage contract. When a file is opened (via GUI, CLI, or internal routing), the following rules apply:'
- '1. **Identity-based routing**: If the file path includes a route_target scheme (e.g., `github://owner/repo/file.md`), the open request is resolved through the shared route/open semantics in Contracts_V0.md, not a raw filesystem read.'
- '- Let Contracts_V0 own canonical route_target and OpenSubject contracts'
- '- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based'
- FileManager consumes terminal and browser tab ownership without collapsing them. Terminal tabs use `terminal_tab_id`, `terminal_pane_id`, and `terminal_session_id` from the terminal model; browser tabs use browser-session identity from the browser owner docs. Pinning, capability badges, and tab labe
- The old placeholder `restore missing §10-§12` is retired. Sections 10, 11, and 12 are live owner sections for editor navigation, file-tree action handoff, and Source Control review behavior; they are not optional appendices.
- The broad-sweep meta-findings are canonical for the editor surface. Better-specified implementation-level areas include file-tree behavior, tabs and `/buffers`, split panes, save `/dirty` state, `/drop`, LSP, image `/HTML` preview, keyboard shortcuts, persistence, and click-to-open. Sparse areas tha
- 'FileManager §10.2 is the canonical owner for Go to symbol. The command-palette and quick-open symbol picker use `documentSymbol` and `workspace/symbol` when LSP is available, and use heuristic, regex, or indexed symbol fallback behavior when it is not. References to `FileManager §10.9` as the Go to '
- '### 11.1 Canonical tree action catalog'
- File-tree context menus expose create, rename, delete, copy path, Add to Assistant Chat, Open in Terminal, Open With, Save Local Copy, compare, and reveal actions through canonical `cmd.file.*`, `cmd.chat.*`, and related command IDs rather than ad hoc UI callbacks.
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `665c217a8e576921149964c9a0f864af053a2f6b3ceb2d62b4742bc5c6d7a426`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `FileManager-S0001` through `FileManager-S0054` are preserved in place and mapped in `coverage_map.jsonl` to `F-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
