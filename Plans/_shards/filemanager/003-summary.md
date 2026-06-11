# Shard 003: Summary

Source: `Plans/FileManager.md`

Source lines: L20-L121

Source SHA256: `ebfdd61a127ee23dc6ad76cc1ee3e1045b8b95c220b5428e2caf3406b521da2a`

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

