# File Manager — specification deep dive

**Date:** 2026-07-26
**Subject:** the File Manager side panel (`panel_id: files`) as specified across `Plans/**`,
as built in `Concepts/PMConcept7.html`, and as proposed in
`Concepts/rail-concepts/c2-cozy-shelves-files.html`.
**Status:** review only. Nothing under `Plans/`, `Concepts/rail-concepts/` or
`Concepts/pm6-build/` was modified to produce this document.

## Provenance and confidence

A mechanical sweep read 70,853 lines across 22 `Plans/` documents using 30 extraction
agents. Raw extractions were deduped into **209 canonical requirements** in three groups
(tree-and-layout 57, operations-and-git 77, discovery-and-open 75); **8** extractions were
dropped as bogus. Roughly **140** are marked normative (`mustHave`). Three auditors then
checked the result against the current implementation, the chosen design grammar (Cozy
Shelves), and the command wiring. I have independently verified the wiring-matrix
measurements (`Plans/Wiring_Matrix.production.json`, 556 entries, 13 File-Manager rows)
and spot-checked the concept-file line citations.

**Two systemic caveats on the evidence, stated up front:**

1. **Double line-numbering.** Extractions arrive under two numbering baselines for the same
   documents (raw `Doc.md:NNN` versus `FinalGUISpec.md:NNNNN`, `FileManager.md`,
   `assistant-chat-design.md`). Several merged requirements may be the same spec sentence
   cited twice at different offsets. Both refs are preserved below rather than guessed at.
   Before acting on any single citation, confirm the line still says what is quoted.
2. **Owner-doc holes.** `Plans/FileManager.md:4230` (F-067) records that **Sections 5-8 and
   13-14 are missing** and Section 9 (Tabs) is a three-line stub. Section 13 "Git Status
   Integration" survives only in the table of contents and change summary
   (`Plans/FileManager.md:9`). Other documents cite those sections as owners. Any
   requirement below whose only home is one of those sections is *asserted but unowned*.

Where a category is thin, this document says so rather than implying even coverage.

---

# 1. What the file manager must do

Legend: **N** = normative (`mustHave: true`); **O** = supporting/optional or stated at
shell level without naming the panel. "Cmd/state" lists the command ids and state tokens
the spec binds to that requirement; an empty cell means the spec names the behaviour and
assigns no command id — that absence is itself a finding (see §5).

## 1.1 Panel identity, placement, and shell contract

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.1.1 | Panel id `files`, canonical label `File Manager`, purpose "Project tree, local tree filter, file actions, and editor handoff". Required activity-bar side-panel item alongside `search`, `chat`, `source_control`, `github_actions`, `docker_manager`, `artifacts`, `run_debug`. First-class owner surface with its own owner doc. | N | FinalGUISpec.md:677, :1654, :11409; newfeatures.md:42 | `cmd.panel.switch` |
| 1.1.2 | Occupies the **single right-hand side-panel slot**, one occupant visible at a time, `last-click wins`. `panels/file_manager_panel.slint` placement is `Side panel`. Activity-bar labels, tooltips, shortcuts and command ids MUST use the same surface vocabulary across chrome, palette and wiring tables. `Activity Bar + Primary Content + Side Panel + Bottom Panel` is a final, non-revisitable shell decision. | N | FinalGUISpec.md:664, :551, :16622, :18581; GUI_Rebuild_Requirements_Checklist.md:128; Wiring_Matrix.md:544 | states `single side-panel slot`, `last-click wins` |
| 1.1.3 | File Manager is first in the `project` activity-bar group (File Manager, Search, Source Control). The PMConcept7 trim of 2026-07-23 removed the `work` group entirely and left `project` untouched. | O | FinalGUISpec.md:27676, :677 | `cmd.panel.switch` |
| 1.1.4 | Side panel is a `VerticalLayout` 240-480px, resizable, one surface visible, detachable where supported. **Minimum width 240px**; a resize drag below that clamps at 240px. Legacy `/File` labels are migration labels, not separate pages. | O | FinalGUISpec.md:551, :968 | — |
| 1.1.5 | Responsive breakpoints: >=1360px full; 1080-1359px side panel at min 240px; 720-1079px side panel auto-collapses to a 48px icon tab and the bottom panel to a 24px header row; <720px single column, panels as overlays/drawers. Activity bar stays 48px at all breakpoints. | O | FinalGUISpec.md:2074 | — |
| 1.1.6 | Density metric: at 1920x1080 primary content is at least 900px wide with both panels open; space accounting uses **380px** as the default side-panel width (48px collapsed). | O | FinalGUISpec.md:620 | — |
| 1.1.7 | Panel header chrome per FinalGUISpec §4.1 / Composergui5 §5: header ("FILES"), refresh, pop-out; search; virtualized file tree; optional Git status strip. | O | FileManager.md:165 | — |
| 1.1.8 | Header carries the active repo/worktree chip plus the local tree-search field. If the current file is hidden by `/hidden` or `/ignored` filters the GUI MUST disclose that instead of silently failing reveal. Stronger repo/worktree state stays in the compact strip or Source Control. | N | FinalGUISpec.md:1658, :11440 | states `hidden`, `ignored` |
| 1.1.9 | `file/editor surface` is listed among the primary in-window **persistent** shell surfaces, with a ContractRef to `Plans/FileManager.md`. | O | Section15_MVP_Promoted_Features_Spec.md:42 | — |
| 1.1.10 | No feature may depend on a floating transient overlay as its only canonical navigation model when the same information participates in persistence, restore, or multi-tab/window behaviour. File/tree navigation does participate, so it cannot be overlay-only. | N | Section15_MVP_Promoted_Features_Spec.md:62 | — |
| 1.1.11 | Older side-panel occupant lists (and legacy `Docker Manage` naming) are **migration evidence only**; stale checklist proof text is not a readiness signal. | N | GUI_Rebuild_Requirements_Checklist.md:118 | state `migration evidence only` |
| 1.1.12 | Diff/review/hosted-repository workflows MUST live in the same shell as local editing; owners keep boundaries but must compose inside the shared IDE shell. | N | Architecture_Invariants.md:333 | — |
| 1.1.13 | File-explorer ergonomics, context menus and terminal cwd behaviour are retained as binding architecture constraints; selection and navigation models are **shared across surfaces**, not reimplemented per view. | O | Architecture_Invariants.md:356 | — |

## 1.2 Detach, dock, and per-project layout

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.2.1 | File Manager is a **required detachable surface** (with Search, Chat, bottom terminal workspace, editor-embedded terminals). Re-docking restores the same logical surface identity; detachment never changes canonical identity; detached tree keeps behaviour and alignment. | N | FinalGUISpec.md:828, :7212, :664, :11411 | states `DOCKED`, `FLOATING` |
| 1.2.2 | Per-panel state machine DOCKED <-> FLOATING using the same Slint component inline or as a separate `Window` root. `PanelDock` is `Docked { side, width_px }` or `Floating { window_id, x, y, width, height }`. `DockSide::Right` is the default for Chat and File Manager. Rust modules: `src/panels/registry.rs`, `layout.rs`, `snap.rs`, plus `effects/` and `theme/`. | O | FinalGUISpec.md:910, :7519, :15097 | states `DOCKED`, `FLOATING` |
| 1.2.3 | Undock triggers: double-click title tab, drag away from edge, pop-out button, right-click tab menu, `Ctrl+Shift+\`, or command palette. The palette route is named with **no command id**. | O | FinalGUISpec.md:7570 | (none assigned) |
| 1.2.4 | Snap zones for a dragged floating panel: 25px proximity threshold, 2px `Theme.accent-blue` strip on the target edge, dock on drop and close the floating window, instant snap (no easing). Nearer panel wins; ties go to the most recently moved. | O | FinalGUISpec.md:931, :7619, :15097 | — |
| 1.2.5 | Detach discoverability: 6-dot grip with tooltip, explicit "Pop Out" button, one-time first-run hint for Chat or File Manager. Exact copy preserved: "Drag to detach, or double-click to pop out.", "Pop Out", "This panel can be popped out into its own window.", "Try it", "Dismiss". | O | FinalGUISpec.md:7721; FileManager.md:175 | — |
| 1.2.6 | Floating File Manager parity: same filter, same worktree-aware `repo_id`/`worktree_id` context, same Source Control strip (`Open in Source Control`, `Open diff`, `Open compare`). Drag-and-drop must still work — the floating window receives drag/drop events and needs an OS-D&D-participating window handle. | O | FileManager.md:157 | — |
| 1.2.7 | Dock state (side + width, or floating geometry), activity-bar icon order and last-visible panel persist per project in redb keyed by `project_id`, restored on startup and project switch. Floating windows on a disconnected monitor fall back to docked; display-change events re-dock orphans at runtime. | O | FinalGUISpec.md:957, :7769 | — |
| 1.2.8 | Panel widths, docking, tree/session state, `/chrome`, `/sort/layout` filters are **view state only** and must not hide or distort a routed target. FileSafe may audit them only when they change mutation prompting or guard-visible destination state. | O | Contracts_V0.md:2018; FileSafe.md:64 | state `active_subview` |

## 1.3 Tree structure, rows, and visual state

This is the **thinnest** area of the sweep relative to its importance. Row rendering
(indent, icon set, badge placement), sort order, folders-first rules, empty/loading/error
tree states and any row-level theming token list are **not specified anywhere** in the
70,853 lines read. What exists:

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.3.1 | Panel core acceptance: (1) tree lists all project files under root; (2) selecting a file opens it in the editor via the §4.1 open-file contract; (3) **virtualized tree handles 10k+ rows without freezing**; (4) expand/collapse restores per project on reopen. Required summary: project tree with local filter, expand/collapse persistence, current-file reveal. | N | FileManager.md:155; FinalGUISpec.md:1654 | — |
| 1.3.2 | Reveal plus current-file highlight is required when the file exists in-tree; the GUI must disclose when filters or ignored settings hide it. With editor focus the tree highlights and scrolls to the current file. | N | FileManager.md:173, :174; FinalGUISpec.md:1654 | — |
| 1.3.3 | Tree rows carry **read-only** Git status badges (preserved token "Git status badges"); mutating Git behaviour routes to Source Control. | N | FinalGUISpec.md:11411 | — |
| 1.3.4 | Row git status comes from coalesced **background SCM projections**; Git/SCM subprocess work is never an editor or UI hot-path dependency. No shelling out per keystroke, paint, or tree-row render. Explicit revalidation is requested before mutation. | N | Architecture_Invariants.md:359 | states `projection consumed`, `explicit revalidation before mutation` |
| 1.3.5 | The projection the tree reads is `sc_projection.v1:{project_id}` holding branch, diff state, staged files, commit-message draft, repo projections, compare origins, review context. Editor markers consume it and do not become a substitute owner. | N | storage-plan.md:12487 | states `branch`, `diff state`, `staged files` |
| 1.3.6 | Ignored files/folders are **dimmed by default**; the optional "Hide ignored" setting hides them entirely (toggle in the panel header or Settings > File Manager, default off, persisted in redb). Product vocabulary names exactly two treatments: dimming and hiding. `.gitignore` (plus optional project exclude list) drives gitignore-aware traversal. | N | FileManager.md:155, :168; FinalGUISpec.md:11438; Commands_System.md:208; FileSafe.md:44 | states `dimmed`, `hidden` |
| 1.3.7 | Discovery-local `path_kind` values are `file`, `directory`, `symlink`, `virtual_cache_entry`, `remote_entry` — rows must be able to represent all five as distinct kinds. | O | Contracts_V0.md:18277 | those five states |
| 1.3.8 | Resource identity is explicit and typed: workspace file, scratch/history/generated/remote/session-bound resource, provider-owned runtime object. **Identity and capabilities are not inferred from view placement or path shape.** | N | Architecture_Invariants.md:361 | those three states |
| 1.3.9 | Runtime artifacts MUST NOT be forced through fake repo paths to survive cleanup, `/archive/remove`, retention or bundle moves. Do not use shell-state, current tab, filesystem path or timestamp heuristics as primary identity for historical documents or runs. | N | Runtime_Artifacts_Panel.md:114, :1139 | — |
| 1.3.10 | A packaged Markdown/text artifact appears as **two sibling tree entries**: the original filename annotated `# pointer stub (derived)` and `<filename>.docset/` annotated `# Document Set directory (canonical)`, whose children are `00-index.md`, `manifest.json`, ordered `NN-*.md`/`NN-*.txt` shards and `evidence/`. Marked `gui_related: true` "This unit concerns user-visible file/path presentation". | N | Document_Packaging_Policy.md:224 | states `pointer stub (derived)`, `Document Set directory (canonical)` |
| 1.3.11 | Canonical-vs-derived rule for the pair: when `.docset/` exists it is canonical and the stub is derived; when it does not, the `.md`/`.txt` file is canonical. **No panel affordance is named for presenting this.** | O | Document_Packaging_Policy.md:279 | — |
| 1.3.12 | Mixed-worktree search/recent/changed lists show row-level and file-level worktree-context badges or banners. Ordinary single-worktree trees do not need per-row worktree icons. | O | FileManager.md:161 | — |
| 1.3.13 | Worktree indicators use a theme branch/tree glyph from the icon set (never emoji); colours resolve through `icon-secondary` (clean), `accent-warning` (dirty), `accent-error` (conflict), never hardcoded hex. Non-goals preserved verbatim: "No emojis in the GUI", "No \"Bind Existing\" in MVP". | N | assistant-chat-design.md:3466, :21441 | states `clean`, `dirty`, `conflict` |
| 1.3.14 | Deep subviews stay discoverable via visible affordances, palette coverage, Customize/Show Advanced, default-open/default-collapsed state, pinned sections, remembered expansion, and summary-vs-detail modes. Cross-surface rule; constrains default expansion of tree sections. | O | FinalGUISpec.md:6794 | — |
| 1.3.15 | Detection/hot-reload modules: `src/detect/scanner.rs` (project root scanning for marker files), `src/hotreload/watcher.rs` (notify-based file watcher), `builder.rs`. Marker-file root detection establishes what a tree can show; the notify watcher keeps contents fresh. | O | FinalGUISpec.md:15368 | — |
| 1.3.16 | File watcher/LRU behaviour is owned by the named anchor "File watcher and LRU eviction": `watch_root_ref`, `event_kind`, `path_ref`, `debounce_ms=100`, `max_cached_entries=10000`, eviction least-recently-viewed then lexical path. | O | FileManager.md:4491 | — |

**Coverage note.** Row anatomy, indent geometry, sort, folders-first, hover behaviour,
empty state, loading state and error state are **unspecified**. Any implementation will be
inventing them; they should be written into `Plans/FileManager.md` §4 rather than
discovered in code.

## 1.4 Filter, discovery, ranking, and reveal

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.4.1 | Header search is an **active repo/worktree tree filter**, not universal, full-text, or semantic search, and not a mixed-root result surface. Matching includes name-only and repo-relative-path matches. No persistent find-in-files results live in the panel. `search_panel_state` and `cmd.search.*` result ids must not become a second FM search surface. | N | FileManager.md:157, :3345; FinalGUISpec.md:747, :750, :753, :705, :1657, :6951, :11438; Commands_System.md:208 | `cmd.search.show`, `cmd.search.*` |
| 1.4.2 | Search entrypoints from palette, shortcuts, Search chrome and context menus normalize to the Search-owned `cmd.search.*` family. FM may reveal or open selected results but must not duplicate search semantics under FM-local or legacy chat/lsp-local names. | N | FileManager.md:496, :3122; FinalGUISpec.md:705; assistant-chat-design.md:989, :990 | `cmd.search.find_in_files`, `cmd.search.open_result` |
| 1.4.3 | FM search scope follows the **current file manager root** — worktree root while showing a worktree, project root otherwise. Distinct from palette quick-open and from chat `@file` resolution. | O | assistant-chat-design.md:3391, :20921; FinalGUISpec.md:750 | — |
| 1.4.4 | Quick-open (`Ctrl+P` / `Ctrl+K`) stays **project-scoped** even while the tree is worktree-rooted; GUI search surfaces must not imply the retrieval corpus narrowed to the active worktree. | N | assistant-chat-design.md:20944; FinalGUISpec.md:750, :6951 | state `project-scoped` |
| 1.4.5 | FM type-ahead delegates fuzzy/frecency file and directory ranking to the shared **DiscoveryService** rather than a parallel path lookup. `file_manager` is a first-class discovery `surface_type`, distinct from `quick_open` and `search_path_filter`. No parallel `cmd.discovery.*` GUI family; no renaming of established GUI command names. | N | FileManager.md:4445; FinalGUISpec.md:26142; UI_Command_Catalog.md:7074; Contracts_V0.md:18251 | state `file_manager` |
| 1.4.6 | FM type-ahead **preserves DiscoveryService ranking order** unless it discloses a local sort/filter; no undisclosed second ranking pass. | N | FinalGUISpec.md:26150; FileManager.md:4445 | state `local sort/filter disclosed` |
| 1.4.7 | Policy filtering runs **before** indexing and ranking: FileSafe rules, ignore rules, secret exclusions, symlink policy, root/home guardrails, project/worktree boundaries, remote authorized-root boundaries — or an equivalent no-leak guarantee. Denied / `hidden_by_policy` candidates must not leak filenames, counts, rank gaps, matched ranges, display paths or rank explanations. `candidate_count` is post-policy only; `selected_result_ids` are opaque. | N | FileSafe.md:13512; FileManager.md:4445 | states `stale`, `fallback`, `remote`, `SSH`, `denied`, `hidden_by_policy`, `no-results` |
| 1.4.8 | Ignore handling, search/index walks and tree visibility share **one deliberate policy layer** so File Manager, Search, LSP/indexing, Source Control and preview cannot diverge. The File Manager must not carry its own local ignore or hidden-file visibility rules. Ignore-aware traversal is a prerequisite for a guarded action. | N | Architecture_Invariants.md:362; FileSafe.md:44 | — |
| 1.4.9 | Discovery-local `target_kind` is closed to `file`, `directory`, `file_or_directory`, `module`, `test`, `doc`, `config`, `content_candidate`, `mixed` and must not be merged with `route_target.target_kind`. | N | Contracts_V0.md:18259 | those nine states |
| 1.4.10 | Discovery-local `match_type` is closed to `exact_path`, `prefix_path`, `fuzzy_path`, `basename`, `path_segment`, `extension`, `abbreviation`, `symbol_adjacent`, `frecency_boost`, `context_proximity`, `git_manifest`, `remote_manifest`, `fallback_scan`; each candidate reports which produced it. | N | Contracts_V0.md:18281 | those states |
| 1.4.11 | Reveal disclosure is exposed alongside local filtering and owner-boundary routing; current-file reveal uses the open-file contract and may reveal an existing node instead of opening a duplicate buffer. **The spec names "reveal disclosure" and enumerates no reveal targets or copy.** | O | FinalGUISpec.md:11410; FileManager.md:3345 | — |
| 1.4.12 | Local tree search, remote tree search, diff search and editor-buffer search may persist query/filter/focus, but write-capable actions must bind to the same project, host, repo/worktree and recover-unsaved context that owns the buffer. A stale cross-ref can reopen a query but cannot claim write authority. | N | storage-plan.md:942 | — |
| 1.4.13 | Project Search state persists under `search_projection.v1:{project_id}` (last query, results, filter state, scope). Diff-local search is **not** persisted as project Search state. | O | storage-plan.md:12486 | — |
| 1.4.14 | Per-surface filter state persists per project; deep links record whether the destination applies a visible context-filter chip or an isolated focus mode, and store the inherited-filter marker needed to clear it in one action without erasing saved project filters. | O | storage-plan.md:940 | — |
| 1.4.15 | Background indexing/search is a preserved product requirement — file search/indexing runs in the background rather than blocking the panel. No index scope, trigger or query syntax is specified. | N | newfeatures.md:45 | — |
| 1.4.16 | Remote non-Git projects use a PM-managed sparse n-gram indexer helper shipped per architecture (x86_64, aarch64), architecture detected by `uname -m` over SSH, transferred by scp, integrity-checked by xxh3. No matching binary means fallback to unindexed ripgrep over SSH with **degraded acceleration surfaced**, never cross-architecture execution. ~5 MB helper left for reuse, optional cleanup on close/disconnect. | O | BinaryLocator_Spec.md:216 | states `degraded acceleration`, `unindexed ripgrep over SSH` |
| 1.4.17 | Discovery keeps local worktrees, branches, SSH roots, `requested_remote_identity`, `effective_remote_identity`, host/root/repo/branch/worktree refs and cache provenance separate. SSH discovery must pass with no local checkout. Branch/worktree switches cannot reuse stale wrong-branch indexes as fresh truth. | N | WorktreeGitImprovement.md:5133 | states `no local checkout`, `no silent local fallback` |
| 1.4.18 | Go to symbol is owned by **FileManager §10.2**: palette and quick-open symbol picker use `documentSymbol` and `workspace/symbol` when LSP is available, heuristic/regex/indexed fallbacks otherwise. References to §10.9 are stale. | O | FileManager.md:2860; LSPSupport.md:310 | — |
| 1.4.19 | Symbol-index status language is scoped to Go to symbol and semantic navigation only; grep and Search regex acceleration remain text-search vocabulary and must not be labelled LSP symbol health. The Search panel must not become a second default symbol browser. | N | FileManager.md:2913; LSPSupport.md:311 | state `fallback labels` |
| 1.4.20 | Project-scoped universal search, left-panel content search and file-manager search remain product/search surfaces, **not User Commands**. File tree actions and editor/file operations use canonical UICommands, not user-authored presets. | O | Commands_System.md:208 | — |
| 1.4.21 | Navigation actions distinguish `none` selection from open/focus/navigate/deep-link, from open evidence/history/ledger/source-control, and from tab-local filter/sort/search changes; cross-tab routes preserve filter/select target context. | O | Crosswalk.md:273 | states `none`, `open`, `focus`, `navigate`, `deep-link` |

**Coverage note.** The filter *UX* is unspecified: no match highlighting, no result ordering
within the tree, no rule on whether non-matching folders collapse, no debounce, no
clear-filter affordance, no empty-state copy, no statement on whether filtering preserves
expand/collapse state. Sort order is unspecified anywhere in 209 requirements.

## 1.5 Selection, keyboard, and accessibility

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.5.1 | `cmd.file.delete` takes `paths: string[]`; `cmd.file.copy_nodes` and `cmd.file.cut_nodes` take `{ project_id, paths[] }` — the array shape is what carries **multi-selection**. | N | UI_Command_Catalog.md:351, :353, :355 | `cmd.file.delete`, `cmd.file.copy_nodes`, `cmd.file.cut_nodes` |
| 1.5.2 | The user can drag multiple selected items; all go to one drop target; operation order is lexicographic by normalized source path; conflicts handled per item. | O | FileManager.md:191 | — |
| 1.5.3 | Keyboard and screen-reader alternatives to drag and drop are required: Paste from clipboard, Copy path to clipboard, and a "Drop target: {folder path}" announcement. | N | FileManager.md:225 | — |
| 1.5.4 | `/selection` and `/worktree` focus are **routing identities**, not consumer-owned local state. | O | Crosswalk.md:240 | — |
| 1.5.5 | Every interactive element maps to exactly one wired `UICommandID` recorded in the wiring matrix; dispatch is a typed UICommand envelope. Missing actions must not remain anonymous context-menu-only behaviour. | N | Architecture_Invariants.md:140, :232; FinalGUISpec.md:11500 | — |
| 1.5.6 | Accessibility evidence chain per control: `ui_element_id -> accessible_name -> role -> keyboard_contract -> state_attributes -> disabled_reason_projection -> ui_command_id -> handler`. | N | Wiring_Matrix.md:193 | — |
| 1.5.7 | Panel docked/floating state and theme name are exposed to assistive technology; focus returns to the main window when a floating panel closes and Tab does not cross window boundaries. | O | FinalGUISpec.md:2139, :966, :7820 | — |

**Coverage note — this is the largest hole in the sweep.** No requirement anywhere
specifies tree keyboard navigation (arrow keys, Left/Right expand-collapse, Home/End,
type-ahead-to-row, Enter/Space activation, F2, Delete), multi-select semantics beyond the
array payload shape, or a tree accessibility contract beyond a single "accessible label"
mention. `role="tree"`, `aria-level`, `aria-selected` and roving focus appear nowhere.
The grammar auditor is right that under a flattened row model `aria-level` becomes the
*only* channel by which depth reaches assistive technology — so this omission escalates
from gap to blocker the moment the tree is built the only way Slint permits.

## 1.6 File operations: create, rename, delete, clipboard

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.6.1 | New file, New folder and Rename require a **single concrete target context**. Create/rename rejects empty names, `.`, `..`, separators and platform-reserved names **before mutation**. | N | FileManager.md:174 | — |
| 1.6.2 | `cmd.file.new_file` / `cmd.file.new_folder` create under a parent path and emit `file.created` / `folder.created`. | N | UI_Command_Catalog.md:348, :349; storage-plan.md:958 | those two commands |
| 1.6.3 | `cmd.file.rename` renames at `path`, emits `file.renamed` or `folder.renamed`, and affects **both** File Manager and File Editor — editor tab identity follows the rename. | N | UI_Command_Catalog.md:350; storage-plan.md:958 | `cmd.file.rename` |
| 1.6.4 | `cmd.file.delete { project_id, paths: string[] }` emits `file.deleted` or `folder.deleted`. | N | UI_Command_Catalog.md:351; storage-plan.md:958 | `cmd.file.delete` |
| 1.6.5 | Copy/Cut/Paste use a **dedicated file-operation clipboard model**, not text-selection semantics: Copy duplicates on paste, Cut marks a pending move, paste targets must be a folder or the project root, path validation and conflict handling reuse the drag/drop rules. `cut-pending` stays **visibly armed** until paste or clear. Successful paste uses the same progress and toast feedback as drag/drop. Save As stays editor-oriented and separate. | N | FileManager.md:504, :3235; FinalGUISpec.md:1660, :11490 | states `pending move`, `cut-pending` |
| 1.6.6 | `cmd.file.paste_nodes` emits `file.copied` / `file.moved` / `folder.copied` / `folder.moved`. Copy/cut produce no persisted domain event (clipboard intent). The destination slot is typed payload vocabulary, never inferred from display text. | N | UI_Command_Catalog.md:353, :355; storage-plan.md:958 | `cmd.file.paste_nodes`; states `copy`, `move` |
| 1.6.7 | Clipboard, drag/drop, upload, download and archive flows all reuse the File Manager transfer contracts and MUST keep **path hardening, read-only state and transfer progress explicit**. | N | FileManager.md:504, :3293 | states `read-only`, `transfer progress` |
| 1.6.8 | `cmd.file.save_local_copy { project_id, paths[], destination_hint? }` is the Download / Save Local Copy copy-out: exports a readable source to a user-chosen local destination **without changing project-relative path identity**, emits `file.exported` / `folder.exported`, is the canonical remote-to-local escape hatch, and is distinct from tree Copy/Paste, editor Save As and moving a file into the workspace. | N | FileManager.md:520, :3453; UI_Command_Catalog.md:357 | `cmd.file.save_local_copy` |
| 1.6.9 | `cmd.file.open_with { project_id, path, target }` is PM-native for MVP editor and preview targets owned by FileManager §11.4. MVP target enum is exactly `source_editor`, `image_viewer`, `workspace_preview`, `detached_preview`, `diff_review`. `system_default` is **not** in the enum; Open With must not resolve to a hidden preview host or system-default fallback; future OS handoff needs a separate `cmd.file.open_in_system_default`. | N | FileManager.md:3397; UI_Command_Catalog.md:356, :363, :364; storage-plan.md:958 | those five target states |
| 1.6.10 | File-tree actions map to the canonical `cmd.file.*` family, co-owned by `Plans/FileManager.md` and `Plans/UI_Command_Catalog.md`, and reuse the FileSafe-backed transfer/mutation path rather than a separate route. | N | Wiring_Matrix.md:551 | `cmd.file.*` |
| 1.6.11 | Canonical file command ids per the FABLE addendum are `cmd.file.create`, `cmd.file.rename`, `cmd.file.move`, `cmd.file.delete`, `cmd.file.copy_path`, `cmd.file.reveal`, `cmd.file.open`, `cmd.file.refresh`. | N | FileManager.md:4491 | those eight |
| 1.6.12 | Rename, delete, duplicate, bulk operations, refresh-after-operation and `/transaction/conflict` handling are FileSafe-relevant mutation surfaces whenever they mutate workspace files or claim rollback. **No command ids exist for duplicate or bulk anywhere in the corpus.** | N | FileSafe.md:40 | state `/transaction/conflict` |
| 1.6.13 | Operations use controlled `operation_type` values `create`, `edit`, `rename`, `delete`, `duplicate`, `move`, `patch`, `bulk`; compare is a read-only session, not a mutation. | N | FileManager.md:4310 | those eight |
| 1.6.14 | File operations are **typed backend services** with policy/error handling, not ad-hoc UI calls; remote/runtime orchestration is an explicit control plane with `/bootstrap` diagnostics. | O | newfeatures.md:46 | — |
| 1.6.15 | File-manager operational GUI coverage stays MVP and implementation-ready for `/delete/duplicate/bulk`, `/refresh/conflicts`, generated-vs-workspace identity, `/open/save/export`, `/hiding`, `/test/share`, `/ignored-file` behaviour, reveal/reuse rules, chat-thread diff exposure, multi-surface routing, exact-session terminal reveal. | O | FinalGUISpec.md:1661 | — |

**Coverage note.** No document states whether delete is trash or permanent, whether it
confirms, or how it interacts with the platform trash adapter named at
`Architecture_Invariants.md:371`. Refresh-after-operation and tree invalidation are asserted
for drops but not for paste, rename or delete.

## 1.7 Drag and drop

The strongest-specified area in the corpus — `FileManager.md` §187-§224 is near
implementation level.

| # | Requirement | N/O | Spec refs |
|---|---|---|---|
| 1.7.1 | Drop onto File Manager: dragging files/folders from desktop, picker or another app onto a folder row or the project root **copies** them in; the tree refreshes/invalidates so new items appear; a collapsed target folder may expand and scroll to show them. Drag out: dragging tree items to desktop/OS folder/another app copies them and leaves sources unchanged unless a move modifier was used. Done when: drop copies and tree refreshes, drag out provides URIs, copy/move modifier documented, conflict dialog or setting works, progress shown for large drops, security checks reject paths outside the project. | N | FileManager.md:187; FinalGUISpec.md:1656 |
| 1.7.2 | Default is **copy in both directions**. AutoDecision: Shift triggers move (copy then delete source on success). If the source delete fails after a successful copy, leave both in place and show an error — never a half-moved state. | N | FileManager.md:189 |
| 1.7.3 | Only folder nodes and the project root row accept drops; dropping on a file row does nothing. The drop target is the folder containing the row dropped on, or the project root for the root row. The target is the row **under the cursor at drop time**, not the selected row, so the tree must hit-test the cursor. An expanded-but-empty folder is a valid target. | N | FileManager.md:190 |
| 1.7.4 | During drag-over, highlight the drop target row (background or border). Use a cursor or drag image indicating copy versus move when the modifier is held, where the platform supports it. | O | FileManager.md:214 |
| 1.7.5 | Platform formats behind **one adapter trait** with cross-platform tests: Windows `IDropTarget` + `CF_HDROP`, `DoDragDrop`; macOS `NSDraggingDestination`/`NSDraggingSource` with `NSPasteboardTypeFileURL` (or `NSFilenamesPboardType`); Linux `Xdnd`/Wayland with `text/uri-list` in and out (file:// URIs). If the UI stack exposes native drop events, use those and document registered formats. Covers OS-to-app drops, not intra-tree reorder. | N | FileManager.md:197; FinalGUISpec.md:2956, :17719; Commands_System.md:208 |
| 1.7.6 | Single-file drops without conflicts may execute immediately; **multi-file and directory drops run a preflight** so conflicts and invalid targets are found before copying. Option A (default): per-conflict dialog or one listing dialog — "File already exists: {name}. Overwrite / Keep both (rename to e.g. name (1)) / Cancel." Keep both appends (1), (2) until free. Cancel aborts the **whole** drop before copying any item. Option B (setting): Settings > File Manager "When dropping, if name exists" -> Always ask / Always overwrite / Always keep both (rename). | N | FileManager.md:209 |
| 1.7.7 | In-project drag defaults to copy so external and in-project drops share one conflict model; Shift switches to move within project. | O | FileManager.md:224 |
| 1.7.8 | Deferred/optional: drag to reorder within the tree, "Move as default on the same filesystem" (**rejected** — copy stays default for safety), Undo in the post-drop toast, drag to chat attachment, and Settings options for default drop action, conflict policy and Show hidden files. | O | FileManager.md:1308 |
| 1.7.9 | OS-facing behaviour is its own seam: open/reveal, dialogs, drag/drop, file watching, URL handoff, path normalization and process/PTY integration go through platform adapters. Adapters own native dialogs, OS open/reveal/**trash**, drag/drop payload translation, watcher backends, keychain, path/symlink/case-sensitivity queries, clipboard/IME/accessibility bridging, browser/webview embedding. | N | Architecture_Invariants.md:360, :371 |

## 1.8 Mutation safety (FileSafe)

| # | Requirement | N/O | Spec refs | States |
|---|---|---|---|---|
| 1.8.1 | FileSafe owns the guard inputs for shared mutation sessions spanning user edits, agent edits, preview edits and FileManager operations — FM edits cannot be modelled separately. A session must carry `mutation_id`, `session_id`, actor/`runtime_identity`, `source_surface`, project/package/seam/lane/worktree scope, file identity/path, target refs, base version/digest, baseline hash, operation type, dirty-state snapshot, watcher snapshot, trust/degraded state, preview/trust mode, LSP/index availability, remote/offline/cache/watch state, permission result, conflict policy, resulting version/digest, artifact/evidence refs and rollback/safe-point refs **before mutation proceeds**. | N | FileSafe.md:13303, :38 | `mutation_id`, `source_surface`, `dirty-state snapshot`, `watcher snapshot` |
| 1.8.2 | Mutation-session `conflict_policy` is `fail_if_changed`, `auto_merge_if_clean`, `require_review`, `staged_preview_only`, `force_with_backup`; `status` is `draft`, `validating`, `pending_review`, `applied`, `conflicted`, `rolled_back`, `failed`, `abandoned`. Conflict payloads carry `conflict_id`, target refs, baseline/current/proposed refs, `conflict_kind`, affected ranges/paths, actor, recoverability, `allowed_action_ids`, selected resolution, evidence refs, rollback refs. Do not mutate after a conflict without selected resolution and rollback refs; do not leave `operation_type`/`conflict_policy` unconstrained strings; do not treat compare as a mutation. | N | FileManager.md:4310 | the eight status values |
| 1.8.3 | PM-mediated writes insert into the dirty layer **synchronously before returning success** (the `agent-write-then-grep CRITICAL FIX`); the dirty entry is generation-aware and lands before write success is surfaced. | N | Wiring_Matrix.md:583 | `SYNCHRONOUSLY`, `generation-aware dirty entry` |
| 1.8.4 | Existing uncommitted user changes are preserved and inventoried. PM MUST NOT silently commit, stash, discard, reset, overwrite or mingle with them; it creates evidence-backed isolation or blocks unsafe mutation. | N | FileSafe.md:13399 | `dirty repository`, `uncommitted user changes` |
| 1.8.5 | Project discovery (paths, repo presence, branch, remotes, status, file tree, package managers, frameworks, config, architecture signals, test commands) is **read-only**; worktree allocation and execution safe points belong to Executor provisioning and must not be an implicit side effect. | N | FileSafe.md:13398 | `read-only project discovery` |
| 1.8.6 | Project-open detection/import MUST run explicitly before capability activation, reading language markers, framework files, build/run metadata, hosted-repo state, remote-host state, provider capability reports and user overrides. | N | Architecture_Invariants.md:330 | — |
| 1.8.7 | A non-Git project may remain non-Git; FileSafe provides safe-point and rollback coverage while mutating work is **serialized** unless a proven concurrent-write isolation adapter exists. The panel must not force Git adoption. | N | FileSafe.md:13399 | `non-Git`, `serialized mutations` |
| 1.8.8 | FileSafe consumes FinalGUISpec/storage-plan/FileManager open and reveal ownership as adjacent contracts and owns only whether mutations, restore-before-rerun and guard outcomes fail closed. It may block terminal-first, Unix-native and browser-runner flows — including platform-specific reveal — when they would bypass canonical scope, recovery or event logging. A native "reveal in file browser" must route through canonical scope and event logging. | N | FileSafe.md:38, :54, :66 | `route_target`, `/open-by-identity`, `/reveal` |
| 1.8.9 | Diff-affecting taxonomy separates source-buffer edits, git mutations (stage, unstage, discard, stash, mark resolved) and restore/rollback actions. Restore actions resolve to confirmed restore events that **refresh affected buffers** rather than popping a local editor stack. | N | FileManager.md:3970 | — |

## 1.9 Git and Source Control consumption

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.9.1 | The tree may expose Source Control status, `Open in Source Control`, `Open diff` and `Open compare`, handing off file identity, active `repo_id`, `worktree_id` and compare target explicitly. Repository-state ownership stays with Source Control. File surfaces MUST NOT absorb branch/history/worktree ownership or invent a file-surface history model. | N | FileManager.md:530, :3562 | those four states |
| 1.9.2 | Handoff prose must not leave unresolved "if needed" conditions; each handoff either routes through a canonical command or records the behaviour as out of scope. | N | FileManager.md:3508 | — |
| 1.9.3 | Source Control and `WorktreeGitImprovement.md` own Git/worktree object navigation; `FileManager.md` only preserves path/root context on handoff. Worktree selection, `open-in-SCM` and SC pivots are **object navigation**, preserving `/package`, `/worktree`, `repo_id`, `worktree_id`, `/node/attempt` and package-level rollback/retry context. Crosswalk names `open-in-SCM` with **no command id**. | N | Crosswalk.md:98 | — |
| 1.9.4 | Compare targets default from the **active worktree** and source-control state; ambiguous compare targets must surface choices instead of silently selecting a stale branch, remote or generated artifact. | N | FileManager.md:538, :3684 | — |
| 1.9.5 | FileManager may **launch or reveal** Stage, unstage, discard, apply, expand/collapse, search-within-diff and conflict-resolution flows but MUST NOT bypass review policy. | N | FileManager.md:3736 | — |
| 1.9.6 | Hunk-catalog reconciliation spans GitHub_Integration.md, `cmd.git.*` coverage, `cmd.chat.revert` defaults and large-directory-safe review loading. If a merge strategy is unavailable the surface MUST show conflict UI or reject rather than silently applying. | N | FileManager.md:3791 | `cmd.git.*`, `cmd.chat.revert` |
| 1.9.7 | Change markers in the editor are visual **projections** over source-control and FileSafe state; revert actions identify the exact file, hunk or persisted mutation. | O | FileManager.md:3855 | — |
| 1.9.8 | Git discard/compare/stage are not ordinary editor undo. `conflicted` markers **override** `staged`/`unstaged` styling until resolved; `staged` and `unstaged` stay visually distinguishable when both exist for one file; revert/restore outcomes surface through audit/history plus toast/banner and must not create a new persistent heat-map class. | N | FileManager.md:3905, :552 | `conflicted`, `staged`, `unstaged`, `reverted` |
| 1.9.9 | Diff undo/redo scope is **action-class based** (single-file assistant edits, multi-file assistant edits, hunk-level Git actions, patch/preview apply, conflict resolution) and never collapses into one global editor undo stack. Revert scope is declared as last edit, last turn, per-file or per-thread. | N | FileManager.md:4031 | `dirty`, `staged`, `conflicted`, `reverted` |
| 1.9.10 | Any file opened for comparison routes into the **shared diff/review pipeline** with hunk-level actions, not a bespoke compare view. | N | newfeatures.md:45 | — |
| 1.9.11 | Chat and file-tree surfaces are **consumers** of Source Control and GitHub Actions command contracts, not independent feature-owner command namespaces; `git*` and `actions*` namespaces stay reserved. GATE-010 must fail if violated. | N | Progression_Gates.md:366; Crosswalk.md:476, :3043, :3077 | `git*`, `actions*` |
| 1.9.12 | Adding a git command reachable from the tree is broad-pass work: command-family expansion requires wiring-matrix expansion and renewed GATE-010 coverage. | N | Progression_Gates.md:365 | — |
| 1.9.13 | Source Control review persistence stores last compare target, left/right targets, review filters (`ignore-whitespace`, `file filter`, `collapse-unchanged`), `generated-file visibility` and local review-comment state, reached through `cmd.source_control.open_review`, `review.open/swap/filter`, `set_compare_target`, `toggle_generated_filter`. | O | storage-plan.md:12552 | those commands |
| 1.9.14 | Conflict-assistant persistence stores conflict presentation mode, external merge-tool preference and the **auto-open first conflicted file toggle** — which directly drives which file the panel opens. Commands: `cmd.source_control.open_conflict`, `open_merge_editor`, `resolve_conflict_side`, `mark_conflict_resolved`. These record resolution events and blocked-state handoff outcomes, not conflict content. | O | storage-plan.md:12563 | those commands |
| 1.9.15 | `github_actions.project_state.{project_id}` stores preferred diff target, auto-open failing-file hints, heuristic-match toggle, correlation confidence threshold, branch-diff preference and auto-open related worktree preference. Log-to-file correlation candidates remain **evidence with confidence and uncertainty labels** — files opened from Actions must carry those labels. ContractRef names `Plans/FileManager.md`. | N | storage-plan.md:12635 | `candidate related diffs`, `confidence and uncertainty labels` |
| 1.9.16 | `operation_receipt_record` SCM lineage fields (`repo_id`, `worktree_id`, `worktree_path`, `branch_name`, `branch_ref`, `branch_head_state`, `baseline_commit_oid`, `head_commit_oid`, `safe_point_id`, `changed_files`, `changed_paths`, `conflict_state`, `conflict_refs`, `rollback_available`, `rollback_ref`, `restore_command_or_action`, `compare_target_ref`, `pr_ref`) are the source of worktree/branch/conflict/rollback context for a file-changing action — never surface-local derivation. | N | Runtime_Artifacts_Panel.md:387 | — |
| 1.9.17 | Source-control projections appear only as owner-receipt fields; consuming panels project them without owning them, and stale or missing owner records **degrade** the view rather than becoming final evidence. | N | Runtime_Artifacts_Panel.md:851 | — |
| 1.9.18 | PM-managed git/file roots (managed Unraid template repos, `live-run` artifact directories) MUST appear through Source Control / Orchestrator worktree visibility, never as hidden side roots. | N | Architecture_Invariants.md:318 | — |
| 1.9.19 | `regex_index/` lives under `.puppet-master/` managed state, not inside the user's repo working tree; regex-index directories set OS indexer exclusions (`FILE_ATTRIBUTE_NOT_CONTENT_INDEXED`, `.metadata_never_index`). | O | storage-plan.md:387 | — |
| 1.9.20 | Source Control owns worktree inventory and actions (`Changes`, `History`, `Graph`, `Worktrees`, `Branches / Stash`) as a separate first-class surface. The file manager is never named as an owner, so tree worktree affordances are consumer-side. Verification fails if Source Control becomes lane-first canon or Orchestrator duplicates raw worktree inventory. | N | Document_Packaging_Policy.md:92; GUI_Rebuild_Requirements_Checklist.md:69, :103; newfeatures.md:15 | those five subview states |

**Coverage note.** The git **badge vocabulary** has no owner text. `FinalGUISpec.md:11411`
requires read-only badges on rows; `FileManager.md` §13 "Git Status Integration" exists only
in the TOC and change summary (`FileManager.md:9`) — its body was replaced. There is no
badge state list, no icon set, and no precedence rule beyond conflicted > staged/unstaged.

## 1.10 Worktrees

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.10.1 | Canonical file identity for thread-bound chat, debug, Source Control and GitHub pivots is `{ repo_id, worktree_id, relative_path }` — **path alone is not sufficient**. The same relative path in two worktrees is two different open subjects unless a compare session binds them. Thread-scoped opens default to the thread's bound `worktree_id`; a fallback to the selected worktree must be labelled explicitly. Projection keys are `project_id/repo_id/worktree_id`; the compact `/repo_id/worktree_id` display is a label over canonical ids. | N | assistant-chat-design.md:2973; WorktreeGitImprovement.md:287 | — |
| 1.10.2 | `repo_id` is stable per project repo root (`gitrepo::<project_id>::<vcs_root_fingerprint>`); `worktree_id` is stable per concrete worktree instance (`worktree::<repo_id>::<worktree_realpath_fingerprint>`); `worktree_path` is **display and navigation state only**. A recovered or recreated path gets a new durable instance marker. | N | storage-plan.md:946; WorktreeGitImprovement.md:287 | — |
| 1.10.3 | Assistant thread worktree paths are `.puppet-master/worktrees/thread-{short_id}`, with numeric suffixes (`-2`) on collision; `worktree_id` remains the record identity and MUST NOT make `wt-*` the filesystem path model. | N | assistant-chat-design.md:2957 | — |
| 1.10.4 | When `file_manager.worktree_follow_thread` is true the FM root switches to the thread's bound worktree on thread focus (`worktree_path` -> set FM root). ACD-385: follow with breadcrumb glyph, branch name, binary swap toggle, reset on thread switch, accessible label. Worktree binding wires FM roots deterministically alongside Source Control, LSP `root_identity` and executor `working_directory`. | O | assistant-chat-design.md:20872; Wiring_Matrix.md:518 | states `worktree_follow_thread true`, `worktree_path`, `project_root` |
| 1.10.5 | Project redb key `config:project:{pid}:file_manager.worktree_follow_thread` (bool, default **true**, label "File manager follows active thread's worktree", description "When true, file manager switches on thread focus") lives in Settings > Branching > Assistant Worktrees, Behavior sub-group, deliberately in the `file_manager.*` namespace. Assistant worktree settings are additive, not replacements for existing Branching/File Manager/Source Control panel-state keys. | N | assistant-chat-design.md:3055, :18921; storage-plan.md:924 | — |
| 1.10.6 | Acceptance for the follow behaviour: AC-25 root switches on focus change; AC-26 breadcrumb toggle works; AC-27 toggle resets on switch; AC-28 **editor tabs unaffected**. Related: AC-29 diagnostics reflect worktree state, AC-30 lazy init per worktree, AC-31 idle-collected. | N | assistant-chat-design.md:3381, :3454 | `bound`, `unbound` |
| 1.10.7 | Top of the tree carries a breadcrumb indicator: worktree glyph + branch name + swap toggle icon. Clicking swap toggles the root between `worktree_path` and the main project root as a **binary** toggle; the toggle resets on any thread switch; accessible-label copy is preserved. **No command id assigned.** | O | assistant-chat-design.md:3385, :20879, :20880; Wiring_Matrix.md:519 | states `worktree root shown`, `project root shown` |
| 1.10.8 | A `Worktree unbound/removed` event resets the FM root to `project_root`. **No command id named.** | O | Wiring_Matrix.md:520 | `Binding removed`, `project_root` |
| 1.10.9 | Expose `Open other worktree version`, `Compare with worktree...` and optional dropdown variant selection **only** as explicit compare/open actions; never hide worktree context behind a generic tab that silently changes identity. Default GUI action for one `repo_relative_path` across worktrees is side-by-side compare carrying `project_id`, `repo_id`, `repo_relative_path`, `left_worktree_id`, `right_worktree_id`, optional revision selectors. | N | FileManager.md:159, :161 | — |
| 1.10.10 | Editor header/status shows `current worktree` plus `other variants available`; recent/changed lists, chat cards, search results and review links open the **correct** variant. Normal editor tabs are path- and file-watch-backed to one identity; PM must not implement a content-swapping tab hiding dirty state, undo history, save target, watch identity or diff routing. | N | FileManager.md:159 | `current worktree`, `other variants available` |
| 1.10.11 | Preserved token: **"Changes section always shows main repo"**; worktree-scoped Changes is excluded from MVP. | N | assistant-chat-design.md:21444 | — |
| 1.10.12 | Historical cards, receipts and debug evidence stay pinned to the captured `worktree_id` even after rebinding; merge/compare/PR flows preserve both identities rather than collapsing to one generic path. | N | assistant-chat-design.md:2976 | — |
| 1.10.13 | `worktree` is a first-class route `object_kind` (with `run`, `node`, `attempt`, `lane`, `feature_seam`, `work_package`, `concern`, `terminal_*`, `dev_session`) — revealing or switching a worktree is `object_kind = worktree` + `object_id` under `route_target`, not a panel-local pivot. | N | Contracts_V0.md:1985 | — |
| 1.10.14 | `selected_worktree_id?` is only a selection pointer, never a substitute for the durable worktree record family (record, projection, historical lineage after archive/remove, and `conflict`/`suspect`/`restoring`/`archive`/`remove` lifecycle). | N | Contracts_V0.md:679 | those five states |
| 1.10.15 | `worktree.created` carries `project_id`, `repo_id?`, `worktree_id`, `run_id?`, `package_id?`, `lane_id?`, `branch_name`, `worktree_path`, `ts`; `worktree.deleted` adds `cleanup_reason`, `grace_period_ms`, `file_lock_checked`, `active_lock_refs[]?`, `safe_point_refs[]?` — deletion is lock-checked and grace-period bound. | N | Contracts_V0.md:934 | — |
| 1.10.16 | `cmd.git.worktree.open` opens/focuses the selected worktree root under `git_available && worktree_selected && worktree_path_resolvable`. `cmd.git.worktree.open_files` is a **compatibility alias** for that plus File Manager focus. No command may infer a target from focus, substitute another worktree/safe point/ref, resolve a moving ref, or treat the open as baseline preparation. A worktree row may be openable while still not a valid run target. | N | UI_Command_Catalog.md:713; Commands_System.md:134 | `cmd.git.worktree.open`, `open_files` |
| 1.10.17 | `/worktree` is a reserved slash namespace; a User Command file named `worktree` must be rejected before it can emit a canonical event. | N | Commands_System.md:271, :1428, :1464 | `/worktree` |
| 1.10.18 | Worktree topology panel is the deep-link destination: primary placement `Source Control > Worktrees`, optional graph overlay badge. Panel state includes selected worktree, sort mode, `hide-stale`, ownership display mode and persisted filters. Every active run, lane or package with a binding resolves to a worktree row and deep link. Defaults collapse stale groups and apply ownership filters. | N | WorktreeGitImprovement.md:437 | `cmd.git.worktree.list/select/open/compare/prune/recover` |
| 1.10.19 | Detached-HEAD handling: a missing `branch refs/heads/...` line in `git worktree list` porcelain is "detached", not an empty branch, so detached worktrees are never merged with `git merge ""`. Merge and PR when-clauses require non-detached HEAD; transitions refresh `worktree_projection.v1`. | N | WorktreeGitImprovement.md:168 | `Detached HEAD` |
| 1.10.20 | Dirty, conflicted, contaminated, blocked-preserved and lineage-mismatched worktrees cannot be reused silently; parallel WorkNodes need isolated worktrees or explicit clean allocation. Allocation records preserve `repo_id`, `worktree_id`, `worktree_path`, `baseline_commit_oid`, branch/head state, `head_commit_oid`, `changed_files`, `conflict_refs`, owner lane, lease state, `dirty_state_policy`, `conflict_policy`, `merge_policy`, `github_policy`, `rollback_available`, `rollback_ref`, `restore_command_or_action`. | N | WorktreeGitImprovement.md:4978 | `dirty worktree`, `merge conflict`, `blocked-preserved` |
| 1.10.21 | Worktree strategy labels (`chain-wizard-flexibility`, explicit `no-worktrees`, per-subtask worktrees) cannot override FileSafe's guard-visible isolation contract. | N | FileSafe.md:160 | `no-worktrees` |
| 1.10.22 | Worktree non-goals: no `Bind Existing` in MVP; uninstall does not auto-clean worktrees; no unbind/merge undo; no per-merge command override; no worktree-scoped Changes; no thread export of binding metadata; no orchestrator-to-assistant transfer on handoff; no inline chat history markers; terminal cwd for bound threads follows the worktree path with no special terminal management. Lifecycle, naming, rename, cleanup, soft limits and Doctor orphan checks belong to `WorktreeGitImprovement.md`. | N | assistant-chat-design.md:3469; Section15_MVP_Promoted_Features_Spec.md:159, :1452, :153 | — |
| 1.10.23 | "File manager breadcrumb worktree toggle" is one of seven surface points for thread-bound worktrees, MVP, gated behind a per-project setting. Crosswalk lists the toggle as owned by FileManager.md, consumed by assistant-chat-design.md and storage-plan.md, **with no command id of its own**. No copy, states or affordance detail is given. | O | Section15_MVP_Promoted_Features_Spec.md:144; Crosswalk.md:116 | — |
| 1.10.24 | LSP sessions follow worktree lifecycle: `root_identity` must use the canonical on-host worktree path; a missing session is started (warm-start on creation if feasible); removing a worktree shuts its session down gracefully; each worktree holds its own session per `server_id`; **switching threads does not kill the previous worktree's sessions**. | N | LSPSupport.md:568 | — |

## 1.11 Open contracts and routing

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.11.1 | `OpenFile { path, line?, range?, target_group? }` is the canonical workspace-file open shape and stays a **narrow** filesystem/editor realization. `target_group` selects editor placement only. `OpenFile must not become the owner for every openable object.` | N | FileManager.md:417, :2401; FinalGUISpec.md:9595, :11774; Contracts_V0.md:789, :2095; UI_Command_Catalog.md:227; LSPSupport.md:322; Crosswalk.md:93; storage-plan.md:794 | `OpenFile` |
| 1.11.2 | Path-based open is the entrypoint for repo and workspace files only. Identity-native document, artifact, runtime, governance, generated-draft, checkpoint, search-hit, attempt-evidence, safe-point and remediation opens normalize through `OpenSubject`, `OpenArtifact`, `object_kind` + `object_id` or an owner-surface route **first**, then realize as `OpenFile`. Verification fails if path-only open is still treated as universal. `OpenSubject` and `OpenFile` must live inside the same routing model. | N | Crosswalk.md:251; Contracts_V0.md:2095; Runtime_Artifacts_Panel.md:310, :316, :112; Project_Output_Artifacts.md:1012, :56; GUI_Rebuild_Requirements_Checklist.md:68; assistant-chat-design.md:21996 | `OpenFile`, `OpenSubject`, `OpenArtifact` |
| 1.11.3 | `FileManager.md` is the **recorded stale consumer** for the subject-open seam: it still treats path-open as universal while assistant-chat already behaves as if open-by-identity exists. FM open/preview wiring must be reconciled against the subject-open split rather than against FileManager.md's current text. | N | Document_Packaging_Policy.md:100, :114 | states `path-open`, `/open-by-identity`, `subject-open`, `preview-backed` |
| 1.11.4 | `Plans/FileManager.md` **owns the shared open-file contract**: workspace paths, line/range selection, editor chrome and code-navigation clicks after a canonical path is known. Content-search rows, chat file chips and citations, LSP navigation, Problems rows and Search results all open through that same path with stable path and range/snippet identity. Click-to-open and context-menu actions route through canonical open-file and file-tree action contracts, never panel-local handlers. The File Manager may not mint its own open payload shape. | N | Wiring_Matrix.md:550; Section15_MVP_Promoted_Features_Spec.md:412; LSPSupport.md:311; FinalGUISpec.md:697, :1655; assistant-chat-design.md:960; Architecture_Invariants.md:365; storage-plan.md:104; Crosswalk.md:93 | `cmd.search.open_result`, `OpenFile` |
| 1.11.5 | `OpenSubject` required fields are `subject_id` and `open_intent`; `open_intent` is closed to `open_source`, `open_preview`, `open_review`. This is the contract behind preview-vs-open-vs-review from the panel. | N | Contracts_V0.md:2083 | those three states |
| 1.11.6 | `subject_id` is closed to `doc:<document_id>` and `artifact:<artifact_id>`; everything else routes through `object_kind` + `object_id`. `thread:`, `run:`, `wizard:`, `safe_point:` must not become new prefixes. `tab_id` does not replace destination class, subject identity or object identity. | N | Contracts_V0.md:1966; storage-plan.md:157, :1367; FinalGUISpec.md:9595 | — |
| 1.11.7 | `OpenSubject(doc:...)` resolves to workspace-backed source; `OpenSubject(artifact:...)` resolves to real source when one exists, otherwise a transient `generated://<artifact_id>` buffer or a routed non-editor surface. `generated://` is ephemeral transport; canonical persisted identity stays `artifact:<artifact_id>`. **Non-persisted drafts must work before stable workspace paths exist**, so the FM open path must accept non-path subjects. | N | Contracts_V0.md:747, :749; Crosswalk.md:304; Project_Output_Artifacts.md:55 | those three states |
| 1.11.8 | A second open category exists and is distinct from repository file opens: evidence by `attempt_id`, safe-point manifests/restore logs by `safe_point_id`, remediation lineage by `remediation_root_id`, generated non-repo drafts, runtime artifacts by `artifact_id`. | O | Contracts_V0.md:743 | — |
| 1.11.9 | `route_target` requires `target_kind` and `project_id`. `target_kind` is closed to `primary_view`, `side_panel`, `bottom_panel`, `embedded_surface`, `page_tab` and is destination class only — a side panel such as the file tree is addressed as `side_panel`, never by panel-local routing semantics. | N | Contracts_V0.md:1959 | those five states |
| 1.11.10 | Route activation **overrides remembered shell state** when needed to reveal the requested object, scope and destination surface; it may reuse remembered state only when that state still reveals the object cleanly. Activation restores destination surface plus `project_id`, `focused_run_id`, `thread_id`, selected object and `inspector_target`. Canonical ids resolve first; tab selection, docking and layout restore are `shell-state` layered underneath. | N | Contracts_V0.md:2013; Runtime_Artifacts_Panel.md:102 | — |
| 1.11.11 | `open_disposition?` is closed to `reuse_existing | open_new | split_group | focus_only`. Reuse is **one tab per path per group** for `OpenFile`; opening the same path in another group needs an explicit multi-group disposition. Route producers must not add a generic extra-args bag. | N | Contracts_V0.md:2030, :2022 | those four states |
| 1.11.12 | Open-by-artifact-identity resolves through `artifacts_index.v1:{project_id}:{artifact_id}` then dispatches to FileManager, owner routes or generated previews. An open request carries artifact identity, owner/output family, storage ref, trust/freshness state, permissions boundary, lifecycle/integrity context and desired open mode. Acceptance: "FileManager open actions receive resolved target type and trust/freshness state, not only a path-like string." Negatives: do not pass unresolved artifact identity as a workspace path; do not let FileManager open project/runtime artifacts without identity resolution. | N | Runtime_Artifacts_Panel.md:734, :722; Project_Output_Artifacts.md:3188, :3197, :36, :56; storage-plan.md:692 | `OpenArtifact`; states `workspace file`, `generated object`, `record-backed preview`, `owner-surface route` |
| 1.11.13 | Settings, object/navigation, search/open entry points, chat links, **file-tree selections** and wizard/object links normalize to `route_target` plus `OpenFile` or `OpenSubject`; they must not own bespoke open behaviour. FileManager may consume the normalized result but does not own normalized route identity. | N | Contracts_V0.md:2023; assistant-chat-design.md:21959; Progression_Gates.md:180 | — |
| 1.11.14 | GATE-010 must fail when a routed command bypasses the canonical `route_target` / `OpenSubject` family, and when routing-adjacent owner docs contain unresolved spec-integrity defects making route/open verification ambiguous. Every `route_target` in a run packet must appear in the promotion artifact as a reachability confirmation and every `OpenSubject` as a resolution confirmation or explicit waiver. | N | Progression_Gates.md:358, :106 | — |
| 1.11.15 | The canonical `panel-switch` navigation contract uses a shared **`panel-context` envelope**, not panel-local ad hoc arguments. Every cross-surface deep link carries `project_id`; a Source Control target adds `repo_id`, `worktree_id`, optional `branch`, `commit`, `compare_target`, `conflict_file`. `cmd.panel.switch` remains concrete but is too shallow for focused-run restoration, inspector target, tab-native filters, object identity, trust context or `/historical` mode. | N | Crosswalk.md:435; Runtime_Artifacts_Panel.md:191 | `cmd.panel.switch` |
| 1.11.16 | If a path includes a `route_target` scheme (`github://owner/repo/file.md`) the open resolves through shared route/open semantics, not a raw filesystem read. Opened files bind to the active worktree via `execution_unit_context`. For chat `file-edit` cards the path resolves from `working_directory + relative_path` and opens the real file at the worktree path with no rewrite layer. | N | FileManager.md:403 | — |
| 1.11.17 | Inspection detail refs, report evidence refs, provenance source refs, receipt external-operation refs and navigation deep-link refs stay distinct as inputs to `OpenSubject`/`OpenArtifact`/workspace realization; legacy special-case ids normalize into `subject_id` or `object_kind`/`object_id` first. | O | FileManager.md:2517 | — |
| 1.11.18 | `OpenSubject { subject_id, target_group?, open_mode?, location? }` is compatibility shorthand normalizing through `route_target`, `open_intent` or owner route recipes; `OpenArtifact` and `open_subject` are compatibility aliases. | O | Contracts_V0.md:785 | — |
| 1.11.19 | GUI `Open` and `Inspect` normalize to `OpenSubject` and route through concern/help/artifact resolution; subject types are `file`, `concern`, `help_entry`, `project_state`, `run`, `artifact_storage`. | O | Crosswalk.md:87 | those six states |
| 1.11.20 | `Primitive:DocumentPane` is jointly referenced to `FinalGUISpec.md` and `FileManager.md`; the route-target primitive sits between `Primitive:UICommand`, `Primitive:DocumentPane`, `OpenFile` and lower-level service opens. | O | Crosswalk.md:57 | — |
| 1.11.21 | Open/undo/diff/preview routing uses service-registered/provider-based seams, each resolving through an owner contract **before touching editor state**. | N | Architecture_Invariants.md:365 | — |
| 1.11.22 | `project_id`, not raw path, is the identity a project-rooted tree keys off; `project_id` is stable across path rebinding, moves and worktree-aware flows; `workspace_tab_id` is a distinct first-class identity; exported records carry project identity rather than deriving it from the current path. | N | Section15_MVP_Promoted_Features_Spec.md:397; storage-plan.md:213; Project_Output_Artifacts.md:59 | — |
| 1.11.23 | Each workspace tab has exactly one active project; instant project switch replaces the active project for the active tab; a separate command opens a project in a new workspace tab; the title bar does not own primary project switching. The tree root follows the tab's single active project. | O | Section15_MVP_Promoted_Features_Spec.md:29 | — |
| 1.11.24 | `cmd.project.open { project_id }` produces no persisted domain event (navigation) and affects File Manager, Dashboard and project finish screens. | O | UI_Command_Catalog.md:335 | `cmd.project.open` |

## 1.12 Editor, preview, and open targets

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.12.1 | Selecting a file in the tree opens it in the in-app IDE-style editor. File Editor is the canonical in-app editing surface with shared buffers, tabbed groups, diff view, preview modes, LSP-backed affordances, remote editing disclosure, recoverable buffers and a shared preview pipeline. | N | FinalGUISpec.md:11518; FileManager.md:159 | `runtime_unavailable`, `/indexing-state`, `/offline/stale-state` |
| 1.12.2 | Large files: above the threshold open **read-only, truncated (first N lines)** with a "Load full file" control, then allow editing subject to the hard cap. Default threshold **10,000 lines**; hard cap **5 MB** per buffer — above it show "File too large to edit" and offer "View read-only (truncated)" or "Open in system editor". Both configurable in Settings > Editor and persisted in redb. | N | FileManager.md:358 | those four copy states |
| 1.12.3 | Binary files open read-only with the reason "Binary file -- cannot edit."; hex view is out of MVP scope. OS/Git read-only files show a read-only indicator and reason ("Read-only on disk"), block Save, allow Save As. Whenever a file is read-only the UI must say why: "Binary file", "File too large", "Read-only on disk", "Cannot decode as UTF-8". | N | FileManager.md:352 | those states |
| 1.12.4 | Anything that opens or previews the logical path of a packaged artifact renders the **pointer stub**, not packaged content. Fixed format: HTML comment `<!-- Puppet Master Document Set pointer stub — do not edit -->`, `# <artifact title>` heading, the sentence "This file is a **pointer stub**. Canonical content is packaged as a Document Set.", then `- **Entrypoint:**` (`<filename>.docset/00-index.md`), `- **Source SHA-256:**` (from `manifest.json`), `- **Verify:**` (`puppet-master docset verify <docset_path>`). | N | Document_Packaging_Policy.md:252 | — |
| 1.12.5 | For local HTML: default `Open` is the source editor; explicit "Open in Browser" opens the editor/workspace-tabs browser surface; "Open in Detached Browser" opens a secondary window. Routed through `cmd.browser.open_workspace_preview { project_id, target, workspace_tab_id }` and `cmd.browser.open_detached_preview { project_id, target, source_workspace_tab_id }`, keyed by `browser_session_id`, both emitting `browser.session.created` and `browser.session.state_changed`. "Bottom Panel Browser", generic "Browser tab" and bottom-panel-primary wording are not canonical; `preview_mode` and `browser_panel` are compatibility aliases. | N | FinalGUISpec.md:3352, :20668, :11714, :20297; UI_Command_Catalog.md:829; Wiring_Matrix.md:389 | `workspace_preview`, `detached_preview`, `normal_browsing`, `runtime_unavailable` |
| 1.12.6 | The image viewer opens workspace or artifact images with provenance, zoom, copy path, reveal and open-with; uses `image_viewer` identity, preserves path/artifact provenance, keeps image identity distinct from browser-session identity, stays native and must not inherit browser chrome. | N | FileManager.md:454; FinalGUISpec.md:20297, :3352 | `image_viewer` |
| 1.12.7 | Image viewer and HTML preview are first-class FileManager preview surfaces. HTML preview must disclose runtime-unavailable or degraded browser capability rather than substituting screenshots as a pseudo-browser. Preview subjects preserve source file or artifact identity **before** selecting a renderer; Markdown, Mermaid, HTML, SVG, image and generated-document previews share preview/session identity. | N | FileManager.md:450; FinalGUISpec.md:20009, :11518 | — |
| 1.12.8 | Preview/browser/rendered experiences are **derivative** of source and buffer state; they may cache view mode, scroll and export preferences and never become separate canonical content authorities. The mode switch must not change the canonical buffer model. | N | FinalGUISpec.md:20613; newfeatures.md:45 | — |
| 1.12.9 | Preview fallback and trust warnings are not inferred from extension or path alone; stale or sandboxed previews must not render as trusted live source. | N | FileManager.md:4381 | `preview_trusted`, `preview_untrusted`, `fallback_required` |
| 1.12.10 | File Editor render modes: `Source`, `Preview`, `Split`, `Detached preview`, `Browser/rendered mode for HTML`, with `Split` preserving shared-buffer editing semantics. | O | FinalGUISpec.md:20564 | those five |
| 1.12.11 | The rich viewer reveals newly opened content with a **staggered content reveal**; reduced motion disables the stagger so content renders immediately in final position. Do not block editing, input or save authority while the reveal runs. | N | FileManager.md:4508 | — |
| 1.12.12 | Long documents expose a canvas-style **minimap** with a viewport thumb tracking the visible region; click navigates, drag-scrub scrolls continuously until release. Document scroll position remains the **single scroll authority**. Slint constraints: retained canvas-style element, transform-driven updates, no arbitrary-content backdrop blur, no SVG filters, precomputed colour math. | N | FileManager.md:4515 | — |
| 1.12.13 | Per-file editor view state `editor_state.v1:{project_id}:{file_path_hash}` holds cursor, scroll, selection ranges, undo-stack ref and unsaved flag; on session restore each open editor's state reloads **before** focus is restored. Editor state is wired into the redb `editor` namespace per FileManager.md §2.9. | O | storage-plan.md:1851, :12284, :1601, :13259 | — |
| 1.12.14 | Unsaved editor recovery is required MVP live shared-buffer storage: begins at first dirty buffer state, ends only after save, discard or explicit resolution. Multi-view surfaces share one recovery record, restore target and redo lineage. Covers local and remote buffers; remote banners use the exact copy "Recovered local edits — remote destination not yet synchronized". Save success is claimed only after the effective destination confirms the write. Recover-unsaved must not be downgraded to `/later`. | N | storage-plan.md:12220, :1841 | — |
| 1.12.15 | Event type schemas must be defined for editor lifecycle events per FileManager.md. **The concrete event names are not enumerated anywhere.** | O | storage-plan.md:1593 | — |
| 1.12.16 | Preserved token "Open editor tabs NOT affected": editor tabs are not affected by file manager root switches; tabs retain their own paths. | N | assistant-chat-design.md:3390, :20940 | — |
| 1.12.17 | An FM root change on thread focus triggers `workspace/didChangeWorkspaceFolders` or a lazily initialized new LSP session. Open flow: open file -> load buffer -> resolve path/extension/server id/host+root identity -> spawn if no session for `(host_id, server_id, root_identity)` -> initialize -> `didOpen` with content + version. Registration precedes spawn; sessions idle-collect after 5 minutes with no open files and are destroyed when the worktree is removed. | O | assistant-chat-design.md:3405; LSPSupport.md:682 | — |
| 1.12.18 | The shared document store is the **sole authority** for open-document text; document panes, editor tabs, chat virtual documents, restore/reload and revert all consume the same buffer and pending-sync state. Each document attaches once per session; `didClose` fires when the final attachment for a `(session, uri)` disappears. | N | LSPSupport.md:659 | — |
| 1.12.19 | At open time PM creates **one canonical DocumentUri per document/host** and reuses it. No duplicate identities through case, slash/drive-letter, URI spelling, `(session, uri)` pairing or path/position conversion differences. Remote documents use host-scoped path mapping. UI/editor surfaces stay 1-based; the LSP boundary is 0-based via one position-mapping service backed by DocumentStore. | N | LSPSupport.md:694 | — |
| 1.12.20 | Problems is a table (file, line, message, severity, source); clicking a row opens the file at the line and the gutter shows markers for the same diagnostics. Line numbers are stored and displayed 1-based. Diagnostics, gutter markers and change markers preserve open-file identity from FileManager §4.1. | O | LSPSupport.md:870; FileManager.md:2967 | — |
| 1.12.21 | Chat click-to-open: clicking a file chip or citation opens through the shared open-file contract. The files-touched strip is an aggregate preview — clicking a path under files-touched, `Read:` or `Edited:` opens the canonical **source** file, while diff affordances open the diff/review owner surface. Entries show `+N -M`. The diff card uses collapsed summary `<path> +N -M` with primary action "editor diff open at relevant file/range". Chat must not own hunk-level stage/unstage/discard or conflict-review state. | N | assistant-chat-design.md:960, :981, :1450, :1452; FileManager.md:2795; FinalGUISpec.md:1655 | `Read:`, `Edited:` |
| 1.12.22 | Chat `Open Worktree Files` (header dropdown) targets the File Manager panel and passes `worktree_path` -> open FM panel at path. **The spec names the control and assigns no command id.** | O | Wiring_Matrix.md:521 | — |
| 1.12.23 | After a successful `cmd.chat.revert`, affected editors refresh from the canonical mutation pipeline; the revert routes through the FileSafe file-restore pipeline using **absolute** paths recorded in the turn's mutation log, never reinterpreting relative paths through the current `working_directory`. | N | UI_Command_Catalog.md:987; Wiring_Matrix.md:553 | `cmd.chat.revert` |
| 1.12.24 | `@` mention resolution uses the same file list as the File Manager — the single source of truth for project files. Clicking a file path or code block in chat opens it in the editor. File references are **file-only** in MVP; folder insertion is out of scope, so directory rows have no reference-insertion path. | O | FileManager.md:396; assistant-chat-design.md:959 | — |
| 1.12.25 | `@file`, MCP tools and `/providers` use the bound thread worktree path as `working_directory`; `@file` resolves relative to the thread's active working directory when a binding is active. | O | assistant-chat-design.md:20957, :3392 | — |
| 1.12.26 | FileManager owns file-surface **placement** for editor, terminal, browser tab, image viewing, HTML/browser preview and hot-reload entrypoints. Missing Sections 5-8 and 13-14 and the three-line §9 Tabs stub must recover by consuming live browser/terminal/preview/persistence/command owner PlanUnits. §9 must cover "Tabs: Editor, Terminal, Browser" without re-owning runtime internals. Do not make FileManager the browser behaviour SSOT; do not leave §9 a stub. | N | FileManager.md:4230 | — |
| 1.12.27 | Terminal tabs use `terminal_tab_id`, `terminal_pane_id`, `terminal_session_id`; browser tabs use browser-session identity. Pinning, capability badges and labels keep the two separate. `/cap/browser-tab` is retired as an ambiguous combined concept. | O | FileManager.md:2635 | `pinned`, `capability badge` |
| 1.12.28 | FileManager consumes browser/rendering repairs and must not keep stale inline-visualizer or terminal-action assumptions; media/HTML preview routes to the browser/rendering owner. Mermaid rendering and the inline visualizer stay distinct behaviours and must not be conflated. | N | Architecture_Invariants.md:418; newfeatures.md:77 | — |
| 1.12.29 | Click-to-context: clicking elements in the browser preview navigates to the corresponding source code (`click-to-source`), bridging rendered UI, editable source and assistant context. Agent-driven use must not degrade into external-automation-only or paste-only workflows. | N | newfeatures.md:58 | — |
| 1.12.30 | Durable tabs/splits/workspace recovery is a preserved product requirement — files opened from the panel survive as recoverable tabs/splits/layout across restart. PM also preserves multi-surface orchestration across editor, terminal, browser/preview, docs and review. | N | newfeatures.md:45 | — |
| 1.12.31 | Chat attachments may include project files, logs, documents, archives and generated artifacts addressable through the file-manager/editor contracts, carrying `attachment_id`, `attachment_type`, `display_name`, `source_ref`, `mime_type?`, `size_bytes?`, `preview_state`. | O | assistant-chat-design.md:489 | `preview_state` |
| 1.12.32 | FileManager still owns the underlying **symbol data pipeline**: `documentSymbol` when LSP data is available, heuristic/regex outline as fallback, and a labelled degraded state, exposed to search and navigation consumers. | N | FileManager.md:2742; FinalGUISpec.md:7054; LSPSupport.md:310 | `degraded state`, `LSP available`, `fallback heuristic` |
| 1.12.33 | Editor breadcrumb strip and outline rail chrome are **retired** per Jared's 2026-07-16 decision: no breadcrumb or outline chrome renders in the editor and no breadcrumb strip renders above primary content; group/page orientation is carried by the compacted page header. Retired lineage kept findable (a 20px strip showing Group > Page with clickable items). | N | FileManager.md:2742; FinalGUISpec.md:7054 | — |
| 1.12.34 | `Open Review Mode` from `Source Control > History` and `Worktrees` compares a worktree against a base branch, another worktree, a PR target or a commit range; dense compares may take over the editor area while remaining a Source Control task mode. Required settings: left/right targets, preferred diff mode, ignore-whitespace, file filter, collapse-unchanged, generated-file visibility, review-comment state. On a `stale-target`, open the nearest valid baseline, explain the downgrade and offer alternate pivots. Source Control owns the canonical compare/diff identity contract reused by chat, file surfaces and Source Control. | N | WorktreeGitImprovement.md:450, :452; Commands_System.md:208 | `stale-target` |

## 1.13 Remote, degraded, and non-Git states

| # | Requirement | N/O | Spec refs | States |
|---|---|---|---|---|
| 1.13.1 | For remote-mode projects the File Manager and editor/FileSafe read and write the **remote** filesystem; listing uses SFTP by default with an SSH `find`/`ls` fallback. PM MUST NOT create a silent local checkout mirror as primary authority; remote editing is not download-edit-upload unless an explicit degraded offline cache path is surfaced. | N | assistant-chat-design.md:3413 | — |
| 1.13.2 | Canonical remote working-folder identity is `user@host:remote/path`; `user@host:/path/to/project` and `/path/to/project` describe the same remote project identity, not a local mirror. Remote-mode projects use remote host roots with **no silent local fallback**; unsupported remote/multi-context launches fail deterministically with a visible risk reason. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points and execution happen on the remote host through the authorized adapter. Remote `worktree_path` is a remote path string. On lost connectivity Source Control stays visible in degraded read-only mode with an exact disabled reason; historical remote worktrees that no longer exist open a synthetic `/lineage` review context. | N | LSPSupport.md:599; FileSafe.md:13399; WorktreeGitImprovement.md:289 | `remote host`, `no silent local fallback`, `degraded read-only`, `disabled reason` |
| 1.13.3 | On remote outage Source Control may expose stale status or diff but **must not silently fall back to local Git**; prior Search results may remain as stale snapshots while new remote queries block or show unavailable; Problems/LSP diagnostics stay visible only when marked stale or unavailable; open remote buffers may retain local text and `/offline/pending-sync` state without implying remote write success. | N | LSPSupport.md:606 | — |

## 1.14 Settings, persistence, and command-wiring invariants

| # | Requirement | N/O | Spec refs | Cmd/state |
|---|---|---|---|---|
| 1.14.1 | Expand/collapse state, local filter text and tree scroll position persist per project in redb and restore on reopen, written on change **debounced 300ms**. Named keys across docs: `file_manager/expanded/{project_id}`, `filetree_state:v1:{project_id}`, `file_tree_expanded` (+ `recent_files`). `project_state:v1:{project_id}` is a lightweight shell/UX projection cache (not a canonical store) also listed as holding file-tree expansion alongside editor tabs, chat thread selection, last active side-panel occupant, active view, language badges, LSP selection summary and last-focused refs; startup restore step 6 reads it. | N | FileManager.md:155; FinalGUISpec.md:2308, :2310, :15576; storage-plan.md:2090, :13939 | states `file_tree_expanded`, `recent_files` |
| 1.14.2 | Panel-specific controls live under the Settings tab for the owning surface when they are durable preferences: **`File Manager` for file tree and editor behaviour**. Cross-cutting visibility, shortcut, security and health controls stay under General/Shortcuts/Advanced/Health. `storage-plan.md` owns persistence keys and cadence; `FinalGUISpec.md` owns grouping and placement. | O | Contracts_V0.md:2116 | — |
| 1.14.3 | Live run actions, selected runtime objects, current inspector focus and **transient filter focus** stay in the owning panel or `route_target`/`OpenSubject` payloads; they are not promoted into settings canon. | O | Contracts_V0.md:2118 | — |
| 1.14.4 | FileManager restore and handoff state preserves `repo_id`, `worktree_id`, identity-backed `/history/checkpoint` refs and backend-driven restore pipelines. Per-surface state may persist line, range, `active_subview`, compare target, panel layout, browser tab state, widget layout **only as view state**. "FileManager restore must not treat path opens as the only canonical document identity." | N | FinalGUISpec.md:1866, :12746; Crosswalk.md:61 | — |
| 1.14.5 | Every command declares live-run-only / historical-safe / record-only availability before palette, shortcut or route dispatch. | N | Commands_System.md:86 | — |
| 1.14.6 | Disabled-reason projection is required on gated controls, alongside state selector, receipt/event effect and regression evidence, before production certification. | N | Wiring_Matrix.md:193; Progression_Gates.md:353 | — |
| 1.14.7 | Former "future considerations" are MVP scope routed to owner docs: Search / find in files / replace in files, instant project switch, SSH remote editing, browser/terminal tabs, pinning and preview modes, language/framework auto-detection and LSP-aware navigation, hot reload controls. | O | FinalGUISpec.md:18388 | — |

---

# 2. Contradictions in the spec

34 conflicts. Each states both positions, then a recommendation. Items marked **USER**
cannot be settled from the documents — they are product decisions.

## 2.1 Placement, naming, geometry

**C1 — Which side does the panel dock to? (USER)**
`FinalGUISpec.md:664`, `:828`, `:910` fix the File Manager as an occupant of the single
**right-hand** side-panel slot with `DockSide::Right` as default.
`newfeatures.md:42` calls Files a first-class **left-panel** product surface;
`FileManager.md:175` says "the user can dock left or right".
*Recommendation:* keep `DockSide::Right` as the canonical default and make left docking a
user option, then delete the left-panel framing from `newfeatures.md:42`. But note both
shipped concepts put the panel on the **left**, so the code and the concept work currently
contradict the canonical default. This needs an explicit call.

**C2 — Panel label: `File Manager`, `FILES`, or `Files`?**
`FinalGUISpec.md:677` canonical label `File Manager`, panel id `files`;
`FileManager.md:165` header copy "FILES"; `GUI_Rebuild_Requirements_Checklist.md:128`
occupant name `Files`. This violates the same-vocabulary rule the spec itself sets at
`FinalGUISpec.md:664`.
*Recommendation:* `File Manager` wins as the canonical label (activity bar, palette, wiring
tables). Allow "FILES" **only** as the in-panel header display string and say so explicitly
in `FileManager.md:165`; retire `Files` from the checklist as migration evidence per
`GUI_Rebuild_Requirements_Checklist.md:118`.

**C3 — Default side-panel width (USER)**
`FinalGUISpec.md:551` gives a 240-480px resizable range; `:968` a 240px clamp; `:620` uses
**380px** as "the default side-panel width" for density math. No requirement states 380px as
the shipped default.
*Recommendation:* adopt 380px as the shipped default and write it into `:551` beside the
range, because every layout measurement in the spec was taken at 380px. Confirm with the
user: 380px is 58% wider than the concept harness default and changes every fit result.

**C4 — Responsive collapse threshold**
`FinalGUISpec.md:2074`: the 1080-1359px band keeps the side panel expanded at min 240px and
only 720-1079px collapses it to a 48px icon tab. `FinalGUISpec.md:620`: at 1280x720 the side
panel auto-collapses. 1280 sits inside the band that stays expanded.
*Recommendation:* the breakpoint table at `:2074` wins; `:620` is prose in a space-accounting
paragraph. Rewrite `:620` to say "at 1280x720 the side panel is at its 240px minimum".

**C5 — Is file/editor one primary surface or two?**
`Section15_MVP_Promoted_Features_Spec.md:42` lists `file/editor surface` among primary
in-window persistent shell surfaces. `FinalGUISpec.md:16622` maps
`panels/file_manager_panel.slint` to `Side panel` and only `views/file_editor.slint` to
`Primary content`.
*Recommendation:* `FinalGUISpec.md:16622` wins — the split is structural. Rewrite
Section15's inventory entry as "file tree (side panel) + editor (primary content)".

## 2.2 State keys and persistence

**C6 — Three names for one piece of state, plus duplicate ownership**
Expansion state is called `file_manager/expanded/{project_id}` (`FileManager.md:155`),
`filetree_state:v1:{project_id}` holding expanded set + filter text + scroll position
(`FinalGUISpec.md:2308`, `:15576`), and `file_tree_expanded`
(`storage-plan.md:2090`, `:13939`). Separately `project_state:v1:{project_id}` also claims
to hold file-tree expansion (`FinalGUISpec.md:2310`).
*Recommendation:* `filetree_state:v1:{project_id}` wins — it is the only one that is
versioned, project-scoped and carries all three fields the spec requires (expansion, filter
text, scroll). Retire the other two names to compatibility aliases and delete the
file-tree-expansion claim from `project_state:v1` so ownership is single. `storage-plan.md`
owns the key per `Contracts_V0.md:2116`, so the edit lands there and in `FileManager.md:155`.

## 2.3 Reveal, breadcrumbs, outline

**C7 — Is current-file reveal optional or required?**
`FileManager.md:173` says "optionally highlight and scroll"; `FileManager.md:174` marks
reveal-plus-highlight required when the file exists in-tree; `FinalGUISpec.md:1654` lists it
as Required.
*Recommendation:* required wins (two documents against one clause). Fix the wording at
`FileManager.md:173`.

**C8 — Breadcrumbs retired but still owned**
`FileManager.md:2742` and `FinalGUISpec.md:7054` retire the editor breadcrumb strip and
outline chrome per Jared's 2026-07-16 decision. `LSPSupport.md:310` still assigns FileManager
§10.1 ownership of "the breadcrumb strip and outline" with acceptance "Breadcrumbs reflect
LSP outline".
*Recommendation:* the retirement wins; `LSPSupport.md:310` predates it. Rewrite that line to
assign FileManager the **symbol data pipeline** only (which the retirement explicitly keeps,
`FileManager.md:2742`) and drop the breadcrumb acceptance criterion.

**C9 — A worktree breadcrumb that survives the breadcrumb retirement**
`assistant-chat-design.md:3385`, `:20879` and `Wiring_Matrix.md:519` still specify a
"breadcrumb indicator" at the top of the file tree.
*Recommendation:* the retirement is **editor-scoped**; say so explicitly at
`FinalGUISpec.md:7054`. Rename the tree control to avoid the retired word — "root scope
strip" or "worktree pill" — and update the three references. Do not delete the control; it
carries a required behaviour (C21, 1.10.7).

## 2.4 Command payloads and ids

**C10 — `cmd.file.new_file` / `new_folder` payload**
`storage-plan.md:958` gives `{ project_id, parent_path }`; `UI_Command_Catalog.md:348-349`
gives `{ project_id, parent_path, name }`.
*Recommendation:* the catalog wins (it owns typed payloads per `Contracts_V0.md:2116`). The
name-less form implies an inline-edit-then-commit flow; if that is the desired UX, model it
as create-with-provisional-name plus `cmd.file.rename`, not as an optional field.

**C11 — `cmd.file.rename` `new_name` optional or required?**
`storage-plan.md:958` has `new_name?`; `UI_Command_Catalog.md:350` has it required.
*Recommendation:* required wins, same reasoning. Optional `new_name` would make the command
a UI-state trigger, which `Architecture_Invariants.md:140` forbids for typed commands.

**C12 — `cmd.file.paste_nodes` payload and mode**
`storage-plan.md:958`: `{ project_id, target_dir }`. `UI_Command_Catalog.md:355`:
`{ project_id, destination_path, mode?: "copy"|"move" }`.
*Recommendation:* the catalog wins on both the field name (`destination_path`) and the
explicit `mode`, because Cut must mark a **pending move** (`FileManager.md:504`) and the
storage payload cannot express it.

**C13 — Copy-path payload: `format` or `root_kind`?**
`UI_Command_Catalog.md:352`: `cmd.file.copy_path { format?: absolute|relative }`.
`storage-plan.md:958`: `cmd.file.copy_relative_path { root_kind?: project|worktree }`.
*Recommendation:* these are different axes and both are needed. Canonicalize as
`cmd.file.copy_path { format?: absolute|relative, root_kind?: project|worktree }` — relative
to *what root* is a real question once the tree can be worktree-rooted (1.10.4).

**C14 — `cmd.file.create` versus `cmd.file.new_file` + `cmd.file.new_folder`**
`FileManager.md:4491` (FABLE addendum, 2026-07-08) declares the canonical set includes
`cmd.file.create`. `UI_Command_Catalog.md:348-349` ships the two-command form, and so does
`Wiring_Matrix.production.json`.
*Recommendation:* the two-command form wins — it is wired, gated, and produces distinct
events (`file.created` / `folder.created`). Amend `FileManager.md:4491`. This is a GATE-010
tripwire today (`Progression_Gates.md:358` fails on contradictory routing-adjacent owner
docs) that the deterministic gate subset does not catch.

**C15 — Matrix event contracts contradict the catalog**
Verified directly: `Wiring_Matrix.production.json` declares `expected_event_types: []` for
`catalog.file_paste_nodes` and `catalog.file_save_local_copy`, and only the file-variant for
`catalog.file_delete` (`["file.deleted"]`) and `catalog.file_rename` (`["file.renamed"]`).
`UI_Command_Catalog.md:351/355/357` declares `folder.deleted`, `folder.renamed`,
`file.copied`/`file.moved`/`folder.copied`/`folder.moved`, `file.exported`/`folder.exported`.
*Recommendation:* the catalog wins; the matrix rows are wrong and must be corrected (§5).

**C16 — `cmd.source_control.switch_subview` does not exist**
`Wiring_Matrix.md:555`, `Commands_System.md:60`, `:1031`, `:1060`, `newtools.md:29`, `:1464`,
`:1488` all name it canonical. The shipped id in catalog and matrix is
`cmd.source_control.select_tab` (`UI_Command_Catalog.md:566`).
*Recommendation:* `select_tab` wins (it is wired). Correct the seven prose references.

## 2.5 Operation semantics

**C17 — Two conflict-policy vocabularies**
Drop conflicts are `Always ask | Always overwrite | Always keep both (rename)`
(`FileManager.md:209`). Mutation sessions use `fail_if_changed | auto_merge_if_clean |
require_review | staged_preview_only | force_with_backup` (`FileManager.md:4310`). No mapping
exists, yet clipboard/drop flows are told to reuse the mutation lifecycle
(`FileManager.md:504`).
*Recommendation:* keep both — they are different layers — and **write the mapping**: the
drop-dialog choices are user-facing resolutions of a `require_review` session; "Always
overwrite" preselects `force_with_backup`; "Always ask" is `require_review`; "Keep both" is a
rename-then-`fail_if_changed` retry. This must be stated, not inferred.

**C18 — Is an in-project move a rename syscall or copy+delete?**
`FileManager.md:189` defines move as "copy then delete source on success" with an explicit
half-moved-state prohibition. `UI_Command_Catalog.md:355` has paste mode `move` emitting
`file.moved` as a **single** event.
*Recommendation:* the two are reconcilable and should be stated as such: same-filesystem moves
use a rename syscall and emit one `file.moved`; cross-filesystem and cross-host moves degrade
to copy-then-delete with the half-moved prohibition. Failure modes and events differ, so the
degraded path needs its own error copy.

**C19 — Drop default action: a setting that reverses a rejected decision (USER)**
`FileManager.md:189` fixes copy as the default; `FileManager.md:1308` records "Move as default
on the same filesystem (rejected - copy stays the default for safety)" — and in the same list
proposes a Settings option "Default action for drop: Copy / Move".
*Recommendation:* drop the setting from the deferred list. If the user wants it, it is a
reversal of a recorded safety decision and should be re-decided explicitly, not smuggled in as
an option.

**C20 — Scope of the "reject paths outside the project" check**
`FileManager.md:187` requires drop security checks rejecting paths outside the project, while
the same requirement defines drag-**out** as copying to the desktop or another application —
by definition outside the project.
*Recommendation:* scope the check to **sources and in-workspace destinations only**. Drag-out
destinations are OS-chosen and are governed by `cmd.file.save_local_copy` semantics
(`FileManager.md:520`) instead. State this at `:187`.

## 2.6 Git and worktrees

**C21 — Git badge vocabulary has no owner**
`FinalGUISpec.md:11411` requires read-only "Git status badges" on tree rows.
`FileManager.md` §13 "Git Status Integration" exists only in the TOC and change summary
(`FileManager.md:9`); its body was replaced by "Preview refresh and hot reload controls".
*Recommendation:* not a contradiction to adjudicate but a **hole to fill**: restore §13 with a
closed badge vocabulary (`modified`, `added`, `deleted`, `renamed`, `untracked`, `conflicted`,
`ignored`, `staged`, `unstaged`), the precedence rule from `FileManager.md:3905`
(conflicted overrides staged/unstaged) and the folder rollup rule the tree needs.

**C22 — Who owns `file_manager.worktree_follow_thread`?**
`Crosswalk.md:116` assigns the "File manager worktree toggle" to `FileManager.md` as owner.
The key, its default (`true`), its UI location (Settings > Branching > Assistant Worktrees)
and AC-25..AC-28 live only in `assistant-chat-design.md:3055`, `:3381`, `:3454` and
`storage-plan.md:924`. `FileManager.md` never names the key.
*Recommendation:* FileManager.md owns the **behaviour and the control**;
assistant-chat-design.md owns the **binding semantics**; storage-plan.md owns the **key**.
Write the key and its default into `FileManager.md` so the owner doc names what it owns.

**C23 — Compare targets from the active worktree versus Changes always main repo (USER)**
`FileManager.md:538`/`:3684`: compare targets default from the **active worktree**.
`assistant-chat-design.md:21444`: "Changes section always shows main repo", worktree-scoped
Changes excluded from MVP. A worktree-rooted tree therefore produces compare targets and a
Changes list scoped to different repos.
*Recommendation:* both can stand if the surfaces are named precisely — Changes (Source
Control) is main-repo, compare targets (File Manager pivot) follow the active worktree — but
the user must confirm this is the intended experience, because it will read as inconsistent.

**C24 — Root switching versus the anti-identity-swap rule**
`FileManager.md:159` forbids any content-swapping tab that changes file identity and confines
variant switching to compare surfaces. `assistant-chat-design.md:3381` has the file manager
silently switch **root** on thread focus.
*Recommendation:* the rule is about **editor tabs**, and AC-28 already protects them
("Open editor tabs NOT affected", `assistant-chat-design.md:3390`). What is unaddressed is
tree **selection and reveal** identity across a root switch. State it: on root switch,
selection is cleared and reveal re-resolves against the new root; the previously selected
`{repo_id, worktree_id, relative_path}` is not carried across.

## 2.7 Open, discovery, and ignore ownership

**C25 — Ignore/visibility: FM-local setting or shared policy projection? (USER)**
`FileManager.md:155`/`:168` specify an FM-owned "Hide ignored" toggle (header or Settings,
default off, persisted in redb). `Architecture_Invariants.md:362` (AI-049) requires one shared
ignore/visibility policy layer and states the File Manager must **not** carry its own local
ignore or hidden-file visibility rules.
*Recommendation:* both survive if "Hide ignored" is a **view-only projection** of the shared
policy layer — it changes what the tree renders, never what the policy layer computes, and
never diverges from what Search/LSP/preview see. Say that explicitly in both places. If the
user wants the toggle to actually change traversal, AI-049 has to be amended.

**C26 — FileManager.md is the stale side of the open-contract split**
`Document_Packaging_Policy.md:100`/`:114` record verbatim that "FileManager.md remains the
stale consumer for the subject-open seam", while `Contracts_V0.md:2095`, `Crosswalk.md:251`,
`Runtime_Artifacts_Panel.md:310`/`:316` and `Project_Output_Artifacts.md:56`/`:1012` require
identity-first resolution.
*Recommendation:* not a merge — a **rewrite** of FileManager.md's open section. Path-open is
the last mile, not the entrypoint.

**C27 — Are `OpenFile` and `OpenSubject` one stack or two?**
`Crosswalk.md:282` requires them inside one routing model. `FileManager.md:2401` and
`UI_Command_Catalog.md:227` describe `OpenFile` as an independent filesystem/editor
realization.
*Recommendation:* one stack, stated as an explicit resolution order:
`route_target` -> `OpenSubject`/`OpenArtifact` -> `OpenFile`. Add that sentence to
`FileManager.md:2401`.

**C28 — Two dispatch identities for "Open in Browser"**
`FileManager.md:3397` / `UI_Command_Catalog.md:363` route `workspace_preview` and
`detached_preview` as targets of `cmd.file.open_with` (no persisted event).
`FinalGUISpec.md:11714` / `UI_Command_Catalog.md:829` / `Wiring_Matrix.md:389` route the same
user action through `cmd.browser.open_workspace_preview` / `open_detached_preview`, which emit
`browser.session.created`.
*Recommendation:* the `cmd.browser.*` pair wins as canonical dispatch because it creates the
session identity the browser owner needs. `cmd.file.open_with` with those two targets is a
**wrapper** that must declare normalization to them — which is exactly the missing schema
field in §5.

**C29 — Labels with no command id**
`FinalGUISpec.md:20668` (F3-309) names "Open", "Open in Browser", "Open in Detached Browser"
as labels only and explicitly assigns no command id, while `:11714` binds the same labels to
`cmd.browser.*`.
*Recommendation:* mark F3-309 as a consumer reference and point it at `:11714`.

**C30 — Search hits that are not workspace files have no route**
`Wiring_Matrix.md:550` says `cmd.search.open_result` opens through the FileManager-owned
open-file contract. `Contracts_V0.md:743` defines a second open category (evidence, safe-point,
artifact) that must not be forced through path-based `OpenFile`.
*Recommendation:* `cmd.search.open_result` must carry a subject, not a path: resolve through
`OpenSubject` first and fall through to `OpenFile`. Amend `Wiring_Matrix.md:550`.

**C31 — Pointer stub with no next step**
`Document_Packaging_Policy.md:252` requires anything opening or previewing the logical path to
render the stub rather than the packaged content, and explicitly does **not** define panel
navigation from the stub to `<filename>.docset/00-index.md`.
*Recommendation:* specify it: the stub's Entrypoint line is an activatable link resolving
through `OpenSubject`, and the tree's `.docset/` sibling is expandable in place. Owner is
`FileManager.md` (presentation) referencing DPP (format).

**C32 — Two `target_kind` enums with overlapping members**
`Contracts_V0.md:18259` (discovery: `file`, `directory`, `doc`, `config`, ...) versus
`route_target.target_kind` (`primary_view`, `side_panel`, ...). `Contracts_V0.md:18259`
already requires them to stay separate; the collision risk is that a future merge looks
harmless.
*Recommendation:* rename the discovery one to `discovery_target_kind` at the contract level.
A shared name with divergent members is a silent regression waiting to happen.

**C33 — Go to symbol: §10.2 or §10.9?**
`FileManager.md:2860` declares §10.2 canonical and states §10.9 references are stale and must
be corrected, not resolved by inventing a §10.9. Cross-doc citations of §10.9 persist.
*Recommendation:* mechanical fix — replace all §10.9 owner citations with §10.2.

**C34 — Owner sections that do not exist**
`FileManager.md:4230` (F-067) records Sections 5-8 and 13-14 missing and §9 (Tabs) a
three-line stub, while Crosswalk, storage-plan §2.9 and FinalGUISpec cite FileManager sections
as owners for tabs, editor state and preview placement. `Progression_Gates.md:359` makes
GATE-010 fail on exactly this class of defect.
*Recommendation:* highest-priority documentation work in this whole review. Until those
sections exist, several requirements in §1 are asserted but unowned, and GATE-010's prose
condition is violated even though its deterministic subset passes.

---

# 3. What exists today

## 3.1 PMConcept7 — the shipped concept

`Concepts/PMConcept7.html` contains a **decorative** File Manager. Its structure:

- 24 hardcoded rows in a **flat** indented list (`PMConcept7.html:15054-15079`, using
  `pm6-ind1`/`pm6-ind2` indent classes). Folder rows are non-interactive text with a static
  chevron glyph.
- A `textContent` filter (`parts/29x-pm6-js-panels.part.html:1376-1388`) that matches the row
  text including the git badge letter, and hides **every** folder while filtering.
- A right-click mock menu with 12 items (`PMConcept7.html:15058-15074`) whose handlers are
  inline `onclick="toast(...)"` strings.
- A worktree breadcrumb (`PMConcept7.html:15031-15045`) whose five root items all call
  `demo.toast` (`parts/25-js-terminal-demo.part.html:369-373`) — the root never changes.
- Current-file highlight via `.file-active` on `files.open`
  (`parts/29x-pm6-js-panels.part.html:1367-1372`) — highlight only, no scroll.

Its **only** real behaviour is opening a file into the editor pane: `filesFacade.open`
(`parts/29x-pm6-js-demo-engine-b.part.html:857-935`) pushes to `S.files.openTabs`, emits
`files.open`, rebuilds the tab strip and renders the buffer. It is the only one of the two
implementations that opens anything.

One thing PMConcept7 does **better** than the proposal: "Add to Assistant Chat" inserts a real
`.composer-chip.file-ref` into the composer
(`parts/26-js-prd-annotations.part.html:349-355`), rather than firing a toast.

Against §1: roughly **22 of ~209** requirements are represented and about **8** convincingly
satisfied. Absent: nesting/expand, keyboard model, selection model, ignored dimming, Hide
ignored, reveal disclosure, clipboard, drag/drop, detach, refresh, and any accessibility
attribute on any tree row.

Additional shipped-page problems in the same slot (forbidden native controls): 12 native
`<select>` elements including three in sibling occupants of the side-panel slot
(`PMConcept7.html:15138` search scope, `:15256` branch switch, `:15200` run config), plus two
`window.confirm` (`:19745`, `:20150`) and two `window.prompt` (`:20090`, `:20200`) in the
terminal workspace. The activity bar relies on native `title=` for icon names while collapsed
(`:15001-15020`).

## 3.2 Cozy Shelves file panel — the proposal

`Concepts/rail-concepts/c2-cozy-shelves-files.html` (749 lines) is a large, genuine step up.
It newly satisfies roughly **20** requirements PM7 misses outright:

| Requirement (§1 ref) | Where | Quality |
|---|---|---|
| Nested tree with expand/collapse (1.3.1) | c2:250-469 | Real `fm-node`/`fm-children` nesting, `chrome.js:383` toggles |
| Filter on name **and** repo-relative path (1.4.1) | c2:242-246, JS 663-708 | Matches `data-path` and `data-name`, keeps ancestors, auto-opens matching folders, live match count |
| Hidden-by-filter disclosure (1.3.2, 1.1.8) | c2:247, JS 697-705 | **The single most spec-faithful feature in the file.** Detects that the active-file node was hidden and surfaces an explicit note |
| Ignored dimming + Hide ignored (1.3.6) | c2:85-86, 215, JS 710-718 | Both states, `aria-pressed` maintained, `.DS_Store` / `build.log` fixtures |
| Multi-select with selection bar (1.5.1) | c2:227-236, JS 630-661 | Shift range, meta/ctrl additive, plain click replaces |
| Row cap + Show more (1.3.1) | c2:404-412 | 10,000 cap redirecting to type-ahead — presentational only |
| Binary / read-only row state (1.12.3) | c2:460-462 | One static row with a read-only badge |
| Read-only git badges + ownership footnote (1.3.3) | c2:105-111, rows 270/290/307/342/388/422, footnote c2:488 | M/A/?/D/C vocabulary plus explicit "Source Control owns mutation" |
| 18-item context menu with real command ids (1.6) | c2:528-550 | Adds Copy/Cut/Paste, Detached Preview, Open in Source Control, and a **disabled** Open-in-System-Default carrying its exclusion reason (c2:549) — correct per 1.6.9 |
| Keyboard route to the menu | c2:619-628 | Shift+F10 / ContextMenu |
| Refresh + pop-out header buttons (1.1.7) | c2:214-218 | `cmd.file.refresh`, `cmd.panel.detach` |
| Index/degraded footer chip | c2:150-152, 513, JS 733-743 | Covers indexing-state only |
| Reduced-motion handling (1.12.11) | c2:188-190 | Correct |
| `role="treeitem"` + tabindex on every row (1.5.6) | c2:251, 257, 264, 269... | Incomplete — see below |

Every action carries a real command id in `data-demo-action` rather than a prose toast.

**What it still misses.** The entire mutation and interaction half of §1:

- No create/rename/delete dialog. Name validation, reserved names and conflict policy are
  narrated **inside tooltip argument strings**, never rendered (1.6.1, 1.7.6).
- No cut-pending armed state, no paste preflight, no transfer progress (1.6.5, 1.6.7).
- **No drag-and-drop at all** — zero `draggable`, `dragstart`, `dragover`, `drop` in either
  file. That alone fails eight normative requirements (1.7.1-1.7.7, 1.5.3).
- No arrow-key navigation, no Enter/Space activation. Rows are divs with `tabindex`; the
  shared shim binds click only (`_shared/chrome.js:64-77`).
- `aria-expanded` is authored but never updated (`chrome.js:383-390` toggles a class).
- No `role="tree"` container, no `aria-level`, no `aria-selected`.
- No persistence of expansion/filter/scroll (1.14.1); no docked/floating state behind the
  pop-out button (1.2.1); no large-file vocabulary (1.12.2); no `.docset` pairs (1.3.10); no
  symlink/remote/virtual row kinds (1.3.7); no remote-mode disclosure (1.13.1); no non-Git
  path (1.8.7); no `repo_id`/`worktree_id` identity (1.10.1); no `route_target`/`OpenSubject`
  payloads (1.11.9, 1.11.13); no shortcut registry.

**Two claims in the file are false to its own markup.** The footer text
"virtualized · row 24px" (c2:513) sits over a static DOM, and the header comment claiming
"every icon-only control carries a label and a non-icon status word" (c2:23-25) is
contradicted by 60 icon-only `pm-minibtn` buttons whose only accessible name is a native
`title=` tooltip.

**Worst forbidden-control finding.** The `contextmenu` `preventDefault` is scoped to `.fm-row`
(c2:608-617), so right-clicking tree padding, the shelves, the banner, the selection bar or
the footer still raises the **OS** menu.

**Two verified functional defects.**
1. Folders cannot be selected: the click handler early-returns on `closest('[data-collapse]')`
   and every folder row carries `data-collapse`, so `folderSelectable === false`. Multi-path
   delete/copy_path/drag-out of directories has no input path (1.5.1, 1.6.4).
2. Tree rows dispatch **mutating** git (`cmd.git.stage_hunks`, `cmd.git.discard_hunks`) from
   hover quick-actions and the Changed pane, violating 1.3.3 and 1.9.11.

---

# 4. Can Cozy Shelves hold it

**The grammar holds the action catalog well and the tree not at all.** Two problems are
structural, not cosmetic.

## 4.1 The indent budget goes negative

Measured in a real browser (`.fm-name` `getBoundingClientRect`, mono 10.5px, char width
6.32px). Indent cost is exactly **22px per level** (`.fm-children` padding-left 12 +
margin-left 9 + border 1). Row lefts 70/92/114/136/158 confirm linearity.

Resting row (no badge, no hover actions) — available name px / characters:

| depth | 220px | 240px | 280px | 380px |
|---|---|---|---|---|
| d0 | 161 / 25 | 181 / 28 | 213 / 33 | 313 / 49 |
| d3 | 95 / 15 | 115 / 18 | 147 / 23 | 247 / 39 |
| d5 | 51 / 8 | 71 / 11 | 103 / 16 | 203 / 32 |
| d7 | 7 / 1 | 27 / 4 | 59 / 9 | 159 / 25 |
| d8 | 0 / 0 | 5 / 0 | 37 / 5 | 137 / 21 |
| d9 | 0 | 0 | 15 / 2 | 115 / 18 |

Loaded row (git badge + the two hover quick-actions — the state you are in whenever the
pointer is on the row):

| depth | 220px | 240px | 280px |
|---|---|---|---|
| d0 | 88 / 13 | 108 / 17 | 140 / 22 |
| d2 | 44 / 6 | 64 / 10 | 96 / 15 |
| d3 | 22 / 3 | 42 / 6 | 74 / 11 |
| d4 | 0 | 20 / 3 | 52 / 8 |
| d5 | 0 | 0 | 30 / 4 |
| d6 | 0 | 0 | 8 / 1 |
| d7 | 0 | 0 | 0 |

Note the hover cost by itself: at 220px/d0 the name drops from 161px to 88px — a **45%
reflow triggered by moving the mouse**. The name truncates as you point at it.

**Behaviour past the limit is the worst available option.** `.sh-scroll` is
`overflow-x: hidden` and `.fm-row` is `min-width: 0` flex, so measured
`scrollWidth == clientWidth` (380 == 380): the row **shrinks** rather than overflows. No
horizontal scrollbar, no ellipsis, no tooltip. The name element computes to width 0 and
disappears, leaving an anonymous icon pair. Screenshot proof at 220px on
`puppet-master-rs/crates/orchestrator/src/services/worktree/allocation/strategy_resolver.rs`:
d5 renders "workt…", d6 "al…", d7 a single character "s".

**This repo's own tree is the adversarial case.** `git ls-files` puts 55,016 of ~68,000
tracked files at depth 9, 1,668 at d8, 870 at d10, files at d13, and basenames up to 102
characters. The modal Puppet Master file renders **2 characters** of filename at the harness
default width and **zero** at the minimum.

**A budget that works at 240px** (the spec minimum, `FinalGUISpec.md:968`): 240 - 12 scroll
padding = 228 track; fixed chrome = twisty 16 + gap 4 + kind icon 16 + gap 6 + gap 6 +
constant right reserve 47 (overflow menu 24 + git letter 10 + dirty dot 6 + gaps) = 95px,
**reserved at all times so the name never reflows on hover**. Name(d) = 133 - indent(d). With
indent(d) = `min(d,6) x 10px` the name has a hard **floor of 73px / 11 characters at every
depth** instead of 0.

11 characters still does not hold `strategy_resolver.rs`, so the cap must be paired with three
model-side moves, all expressible in Slint:

1. **Middle-elide preserving the extension** (`stra…er.rs`). Slint's `Text` `overflow: elide`
   is tail-only, so this is a computed display string, not a style.
2. **Compact single-child folder chains** into one row (`crates/orchestrator/src`), removing
   2-4 effective levels from Rust/Java/Plans-shaped trees.
3. **A scope breadcrumb that re-roots and resets depth to 0** — the panel already owns this
   primitive for worktrees (1.10.7), so extend it with "Set as root" / "Up".

Note the harness widths themselves are off-spec: min 220px is below the 240px clamp
(`FinalGUISpec.md:968`) and default 280px is well below the 380px the spec uses for space
accounting (`FinalGUISpec.md:620`). The concept is tuned to widths the spec does not use.

## 4.2 Recursive tree versus flat row: nesting is inexpressible, not merely expensive

**Slint components cannot instantiate themselves.** A recursive `.fm-node`/`.fm-children`
tree has no translation short of hand-unrolling N component types to a fixed maximum depth.
And `for` materialises every element — only `ListView` recycles. The footer string
"virtualized · row 24px" is unbacked by the structure it sits under, and requirement 1.3.1
demands 10k+ rows without freezing.

So a flat model is **the only expressible form**:

```
FlatRow { id, depth, kind, name, elided_name, git, flags,
          guide_mask, has_children, expanded, selected, transient_state }
```

rebuilt in Rust on expand/collapse. This is not an optimisation; it is the port. It happens to
also fix three other things:

- **Indent** becomes an x-offset rather than nested padding, which is what makes the capped
  indent of §4.1 trivial.
- **Guide lines** become drawn `Rectangle`s per level, which matters because Slint has no
  pseudo-elements.
- **Shift-range selection** is already index-based in the demo JS, so it ports directly.

The cost of flattening: `aria-level` (or Slint's `accessible-item-index` / level equivalents)
becomes the **only** channel by which depth reaches assistive technology. The current file has
`role="tree"` false, `role="group"` 0, `aria-level` 0, `aria-selected` 0. Under flattening
that goes from a gap to a blocker.

Also: 26 `color-mix()` uses in this one style block, all needing `Theme.token.with-alpha()`
or precomputed tokens.

## 4.3 Badges, multi-select and drag-drop in a read-only row grammar

**Badges.** `.fm-gitbadge` measures 32x14 to 53x12 and competes head-on with the hover actions
for the same horizontal track — that competition **is** the 45% name reflow. Move status off
the track: a **3px full-height spine** at the row's left edge inside the indent well (0px name
cost) carrying M/A/D/C/?/ignored by colour, plus one mono character in the fixed right reserve
so colour is never the sole carrier. Folder rows need a **subtree rollup** spine, which is a
data requirement on `sc_projection.v1` (1.3.5) — consistent with "never per-row subprocess"
(1.3.4).

**Multi-select.** `.fm-selbar` is the right answer for 240px (there is no room for per-row
multi-actions), but it only appears at >1, has no `aria-selected` / `aria-multiselectable`
anywhere, cannot disclose selections hidden inside collapsed folders, and — the verified
defect — folders can never join a selection at all.

**Drag-drop.** Slint 1.17.1 ships **no** drag-and-drop and **no** OS drag source/target, so
`CF_HDROP` / `NSPasteboard` / `text/uri-list` (1.7.5) needs a real platform adapter feeding
synthetic events. In-panel this is comparatively cheap only because 1.7.3 says non-folder rows
reject drops, which removes the between-rows insertion zone: the drop target is simply the
nearest ancestor folder of the hovered row, plus a drag auto-scroll hook on the `ListView`.

## 4.4 Slint controls available, and the new primitives required

**Available:** `ListView` (mandatory — the only recycling container), `ScrollView`,
`FocusScope`, `TouchArea`, `LineEdit`, `ContextMenuArea` + `MenuItem` (verify at 1.17.1;
the hand-built menu is a defensible fallback for styling control), `PopupWindow`, `Window`,
`Text` with tail-only elide, `Rectangle`, bundled SVG `Image` via stable `icon_id`,
`accessible-role` / `accessible-label` / `accessible-checked` / `accessible-expanded` /
`accessible-item-index`, `Timer` (300ms debounced persistence, 1.14.1), `StandardButton`.

**New primitives the grammar does not have:**

| Primitive | Why |
|---|---|
| `FlatTreeRow` | The only expressible tree form (§4.2) |
| `IndentWell` | Capped indent `min(depth,6) x 10px`, guide `Rectangle`s from `guide_mask`, depth-overflow marker |
| `ElidedPathText` | Rust-side middle-elide preserving the extension; full repo-relative path as accessible label |
| `CompactFolderChain` | Model transform merging single-child chains; removes 2-4 levels |
| `ScopeBreadcrumb` | Extends the worktree pill into a root-scope stack with Set-as-root / Up; the escape hatch past the depth cap and the correct home for the ACD-385 binary swap toggle and its verbatim label (1.10.7) |
| `StatusSpine` | 3px left-edge status carrier costing 0px of name budget, plus one mono character in the right reserve; needs per-directory rollup in `sc_projection.v1` |
| `RowReserve` | Constant-width right action gutter reserved at rest **and** on hover so the name never reflows |
| `RowKindBadge` | The missing second row species: symlink, `remote_entry`, `virtual_cache_entry`, `.docset` stub/canonical pair, `generated://`, artifact-backed, scratch — carries typed resource identity (1.3.8) |
| `DropTargetOverlay` + `DragPlatformAdapter` | Folder-only drop highlight, copy-vs-move readout, `ListView` auto-scroll, OS bridge (1.7.5) |
| `TransientRowState` | Per-row Loading / Decoding / Indexing / Open failed / File not found / Deleted / File too large / Binary chips plus operation lifecycle and transfer progress (1.6.13, 1.12.2, 1.12.3) |
| `RovingFocusTree` | Single-tabindex `FocusScope` with arrows/Home/End/type-ahead/Enter/Space/F2/Del, accessible level/selected/expanded, plus an `InlineRenameField` swap with pre-mutation validation (1.6.1) |
| `DegradedRootBanner` + `ConflictPreflightDialog` | Remote `user@host:/path`, degraded read-only, non-Git, detached HEAD, dirty/blocked worktree; plus multi-file drop preflight (1.7.6, 1.13.2) |

**Also inventing structure with no spec home** (needs an owner decision before it ships):
the Explorer/Changed/Open segmented tab bar (c2:221-225 — §1 gives the File Manager one tree
surface, not subviews, and the Changed tab additionally duplicates Source Control Changes and
is scoped to the FM root, conflicting with C23); the hover-reveal quick-action cluster
(`.fm-quick`, c2:113-117 — actions visible only on hover, against the no-anonymous-affordance
rule and the 24px target rule, measured 20x20); Open Editors and Recent shelves living in the
File Manager rather than the editor surface (c2:493-506); the footer index chip (indexing
status is Search/Tools-owned and needs a projection contract).

## 4.5 Verdict

**Yes for the action catalog and the chrome; no for the tree as drawn.** Keep the shelf
grammar, the context menu, the filter with its disclosure banner, the Hide-ignored toggle, the
selection bar and the aria-disabled reason pattern. Replace the nested DOM with a flat model,
cap the indent, floor the name, move git status off the name track, reserve the right gutter,
and add roving focus. Without those five changes the panel is unbuildable in Slint and
unreadable past depth 4 at the spec's own minimum width.

---

# 5. Command id gaps and the Plans update plan

## 5.1 Measured state of the wiring

I verified this directly against `Plans/Wiring_Matrix.production.json`:

- 556 entries total.
- **Exactly 13** carry a File Manager `ui_location`, and all 13 use the same generic blob
  string **"File Manager and editor surfaces"** — merging two distinct owner surfaces and
  making per-control `ui_element_id -> accessible_name` evidence impossible
  (`Wiring_Matrix.md:193`).
- Those 13 are exactly the `cmd.file.*` set the catalog already declares
  (`UI_Command_Catalog.md:348-365`).
- `catalog.file_paste_nodes` and `catalog.file_save_local_copy` carry
  `expected_event_types: []`; `catalog.file_delete` carries only `["file.deleted"]`;
  `catalog.file_rename` only `["file.renamed"]`.
- `catalog.file_copy_full_path` and `catalog.file_copy_relative_path` are wired as independent
  canonical commands with their own `handlers::file::copy_full_path` bindings and **zero
  normalization metadata**, though `UI_Command_Catalog.md:7988` permits them only "if the
  wiring row declares the normalized copy-path payload".
- `catalog.file_open_with` is a routed open with `effect_kind: receipt` and **no**
  `route_contract` (only 3 of 556 rows carry one).
- `catalog.file_open_in_system_default` is production-wired with certification obligations even
  though `FileManager.md:516` and `UI_Command_Catalog.md:364` both exclude `system_default`
  from the MVP enum.
- `cmd.panel.switch` has a matrix row but **no typed payload row in the catalog at all**; the
  `panel_id` vocabulary including `files` lives only in `FinalGUISpec.md:654`/`:677` and is
  never bound to the command.

`python3 scripts/pm-plans-verify.py validate-wiring-matrix` returns **pass, 0 failures**.
That is a **false green for the File Manager**: GATE-010's deterministic subset
(`scripts/pm-plans-verify.py:3361`) does not implement its own prose failure conditions —
wrapper normalization metadata (`Progression_Gates.md:356`), routed-command `route_contract`
(`:358`), or concrete `ui_location` (`:360`).

## 5.2 Missing command ids

**Specified but unwired** — declared canonical at `FileManager.md:4491`, present in no other
Plans doc, absent from catalog and matrix:

| Command | Behaviour it must cover | Spec |
|---|---|---|
| `cmd.file.open` | Tree row activation / open on click / open on Enter | FileManager.md:4491, :174; FinalGUISpec.md:11518 |
| `cmd.file.refresh` | Header refresh button and refresh-after-operation | FileManager.md:4491, :165; FileSafe.md:40 |
| `cmd.file.reveal` | Current-file reveal and reveal disclosure | FileManager.md:4491, :173; FinalGUISpec.md:11410; FileSafe.md:66 |
| `cmd.file.move` | In-project move, Shift-modifier move, drag-to-folder move | FileManager.md:4491, :189, :224 |
| `cmd.file.create` | Contradicts the shipped `new_file`/`new_folder` pair — see C14 | FileManager.md:4491 |

**Anonymous controls** — behaviour specified, no command id anywhere:

drag-and-drop copy/move in both directions (`FileManager.md:187`, `:190`, `:197`) — the largest
single violation of `Architecture_Invariants.md:140`/`:232` in the repo; the local tree filter
field (`FileManager.md:157`, must **not** be `cmd.search.*`); the Hide-ignored toggle
(`FileManager.md:168`); tree expand/collapse (`FileManager.md:155`); duplicate and bulk
(`FileManager.md:4310`, `FileSafe.md:40`); the worktree breadcrumb swap toggle
(`assistant-chat-design.md:3385`); FM root reset on worktree unbind (`Wiring_Matrix.md:520`);
chat "Open Worktree Files" (`Wiring_Matrix.md:521`); the large-file "Load full file" control
(`FileManager.md:358`); name-conflict responses (`FileManager.md:209`); the command-palette
detach route (`FinalGUISpec.md:7570`); quick-open (`assistant-chat-design.md:20944` — no
`cmd.palette.*` namespace exists at all); the `file_manager.worktree_follow_thread` setting
toggle (`assistant-chat-design.md:18921`).

**Invented by the concepts** (exist in no Plans doc): `cmd.panel.detach` (c2:217),
`cmd.editor.close_tab` (c2:495-497), `cmd.file.expand_capped` (c2:411). Also wrong ids in the
shared kit: `cmd.chat.attach_file` (`_shared/chrome.js:97`) where canonical is
`cmd.chat.add_file_reference`.

**Missing element rows for existing commands.** `cmd.chat.add_file_reference`,
`cmd.terminal.open` and `cmd.terminal.show` all exist but only with chat-surface and
terminal-surface `ui_location`s — the File Manager context-menu items that dispatch them
(`FileManager.md:494`, `:500`; `FinalGUISpec.md:11494`) have no rows. Likewise the File Manager
activity-bar item has no element row (it leans on generic `cmd.panel.switch`) while Testing and
Artifacts each got a dedicated `open_panel` navigation wrapper
(`UI_Command_Catalog.md:8304`), and the FM header Pop Out button / 6-dot grip / first-run hint
have no rows binding them to `cmd.panel.undock` (`FinalGUISpec.md:7721`).

**Event ids that exist only in prose.** `file.copied`, `file.moved`, `folder.copied`,
`folder.moved`, `file.exported`, `folder.exported`, `folder.deleted`, `folder.renamed` appear
only in `UI_Command_Catalog.md` and in no event registry or matrix row.

## 5.3 Which artefacts are canonical and which are derived

Verified against `Plans/sharding_config.json` `artifact_policy`:

| Path | Status |
|---|---|
| `Plans/*.md` | **Canonical**, hand-edited |
| `Plans/Wiring_Matrix.production.json` | **Canonical**, hand-edited (no generator script writes it; `generated_at` is a stamp, not provenance) |
| `Plans/Wiring_Matrix.schema.json` | **Canonical**, hand-edited |
| `Plans/Wiring_Matrix.production.exclusions.json` | **Canonical** (42 excluded tokens; no `cmd.file` token is excluded, so every `cmd.file.*` id is fully gate-bound in both directions) |
| `Plans/_shards/**` | **Derived, regen-only.** Never hand-edit. Regenerate with `python3 scripts/pm-shard-plans.py --generate` |
| `Plans/.evidence/**` | **Derived, regen-only.** Never hand-edit. Regenerated by the gates |
| `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl` | Governance regen-only; do not edit without explicit unlock |
| `Plans/.pipeline/verifier_exit_code.txt` | Derived process output |

## 5.4 Ordered plan

Each step names concrete files. Steps 1-4 are prerequisites for 5-8; step 12 always runs last.

**Step 1 — Settle the command-id canon.**
Edit `Plans/FileManager.md:4491` to replace `cmd.file.create` with `cmd.file.new_file` and
`cmd.file.new_folder` (C14), and add `cmd.file.copy_nodes`, `cmd.file.cut_nodes`,
`cmd.file.paste_nodes`, `cmd.file.save_local_copy`, `cmd.file.open_with` so the addendum lists
the full shipped family rather than a partial one.

**Step 2 — Add the missing commands to `Plans/UI_Command_Catalog.md`** (after :348-365, with
typed payload, result, produced events, affected surfaces and availability class per
`Commands_System.md:86`):
`cmd.file.open`, `cmd.file.refresh`, `cmd.file.reveal`, `cmd.file.move`, `cmd.file.duplicate`,
`cmd.file.drop_nodes` (external drop-in and in-project drag, carrying `mode: copy|move` and
`conflict_policy`), `cmd.file.filter_tree`, `cmd.file.toggle_ignored_visibility`,
`cmd.file.toggle_expand`, `cmd.file.load_full_file`, `cmd.file.set_root`, `cmd.file.reset_root`,
`cmd.file.swap_worktree_root`, `cmd.file.bulk_operation`, `cmd.file.open_panel` (navigation
wrapper over panel-switch with `panel_id: files`), and a `cmd.palette.quick_open` namespace.
Add the folder-variant event ids (`folder.deleted`, `folder.renamed`, `folder.copied`,
`folder.moved`, `folder.exported`) to the event vocabulary.

**Step 3 — Fix the event contracts in `Plans/Wiring_Matrix.production.json`** (C15):
set `expected_event_types` on `catalog.file_paste_nodes` to
`["file.copied","file.moved","folder.copied","folder.moved"]`; on
`catalog.file_save_local_copy` to `["file.exported","folder.exported"]`; add `folder.deleted`
to `catalog.file_delete`; add `folder.renamed` to `catalog.file_rename`. Update each row's
`effect_contract` from the no-persist receipt shape to the event shape.

**Step 4 — Split the blob `ui_location`.** Replace "File Manager and editor surfaces" on all 13
rows with concrete locations following the pattern already used by the GitHub Actions rows
("Source Control > GitHub Actions > Actions > ..."): e.g.
`File Manager > Tree > Context menu > New File`,
`File Manager > Header > Refresh`,
`File Manager > Tree > Row`. Add the missing element rows named in §5.2 (chat-reference,
terminal-open, activity-bar item, pop-out button).

**Step 5 — Extend `Plans/Wiring_Matrix.schema.json`.** It is currently
`additionalProperties: false`, so wrapper normalization has nowhere to live. Add
`normalization { alias_of_command_id, normalizes_to_contract, normalized_payload }` and
populate it on `catalog.file_copy_full_path`, `catalog.file_copy_relative_path` (both ->
`cmd.file.copy_path`) and on `catalog.file_open_with` for its `workspace_preview` /
`detached_preview` targets (-> `cmd.browser.*`, C28).

**Step 6 — Add `route_contract` to the routed open rows**: `catalog.file_open_with`, plus the
new `cmd.file.open` and `cmd.file.reveal` rows, binding them to `route_target` /
`OpenSubject` per `Progression_Gates.md:358` and `Contracts_V0.md:2083`.

**Step 7 — Give `cmd.panel.switch` a typed payload row** in `Plans/UI_Command_Catalog.md` with
the closed `panel_id` enum (`files`, `search`, `chat`, `source_control`, `github_actions`,
`docker_manager`, `artifacts`, `run_debug`) lifted from `FinalGUISpec.md:654`/`:677`.

**Step 8 — Reconcile `cmd.source_control.switch_subview` -> `cmd.source_control.select_tab`**
(C16) in `Plans/Wiring_Matrix.md:555`, `Plans/Commands_System.md:60`, `:1031`, `:1060`,
`Plans/newtools.md:29`, `:1464`, `:1488`.

**Step 9 — Repair the owner-doc structure in `Plans/FileManager.md`** (C34, highest value):
restore §13 with the git badge vocabulary and precedence (C21); write §§5-8 and 13-14 or
convert their citations to explicit source-lineage references; expand §9 Tabs beyond the
three-line stub per `FileManager.md:4230`. While in the file: fix the reveal wording at :173
(C7), scope the path check at :187 (C20), state the move-semantics split at :189 (C18), write
the conflict-policy mapping at :209/:4310 (C17), state the ignore-policy projection rule at
:155/:168 (C25), add the open resolution order at :2401 (C27), and name the
`file_manager.worktree_follow_thread` key it owns (C22).

**Step 10 — Settle the persistence key** (C6) in `Plans/storage-plan.md:2090`/`:13939`,
`Plans/FinalGUISpec.md:2308`/`:2310`/`:15576` and `Plans/FileManager.md:155`:
`filetree_state:v1:{project_id}` canonical, others compatibility aliases, expansion removed
from `project_state:v1`.

**Step 11 — Close the smaller cross-doc corrections:** `LSPSupport.md:310` breadcrumb ownership
(C8); §10.9 -> §10.2 citations (C33); `FinalGUISpec.md:620` collapse threshold (C4);
`FinalGUISpec.md:7054` retirement scope note (C9); `newfeatures.md:42` panel side (C1, after
the user decides); `Wiring_Matrix.md:550` subject-first search open (C30);
`Contracts_V0.md:18259` rename to `discovery_target_kind` (C32);
`Document_Packaging_Policy.md:252` stub-to-entrypoint navigation (C31); retire
`catalog.file_open_in_system_default` from production wiring until the enum admits it
(`UI_Command_Catalog.md:364`).

**Step 12 — Regenerate and verify, in this order:**

```
python3 scripts/pm-shard-plans.py --generate
python3 scripts/pm-shard-plans.py --check
python3 scripts/pm-plans-verify.py run-gates
python3 scripts/pm-plans-verify.py validate-wiring-matrix
```

Do not hand-edit anything under `Plans/_shards/**` or `Plans/.evidence/**` at any point; they
are regenerated by these commands. The healthy gate baseline for this repo is 24/26 with two
pre-existing failures — a drop below that after these edits is a regression introduced here,
not a pre-existing condition.

**Step 13 (separate work item) — Strengthen GATE-010.** The three prose failure conditions at
`Progression_Gates.md:356`, `:358` and `:360` are not implemented in
`scripts/pm-plans-verify.py:3361`. Until they are, every defect in §5.1 passes green. This is
what let 13 blob-located, event-incomplete, normalization-free File Manager rows certify.

---

# 6. Open questions for the user

These block work. Each names the decision and what it changes.

**Q1 — Which side does the File Manager dock to by default?**
`FinalGUISpec.md:664`/`:910` say right (`DockSide::Right`); `newfeatures.md:42` and
`FileManager.md:175` allow or assume left; **both shipped concepts put it on the left**.
Deciding right means the concepts are wrong; deciding left means three FinalGUISpec passages
are. (C1)

**Q2 — Is 380px the shipped default side-panel width?**
`FinalGUISpec.md:620` uses it for all density math but no requirement declares it. The concept
harness runs at 280px default / 220px minimum. This single number decides whether the indent
budget in §4.1 is workable (380px holds 25 characters at d7) or brutal (220px holds 1). (C3)

**Q3 — Is "Hide ignored" a File Manager setting or a projection of the shared policy layer?**
`FileManager.md:168` says the former, `Architecture_Invariants.md:362` forbids it. My
recommendation is "view-only projection", but if you want the toggle to genuinely change
traversal, AI-049 needs amending. (C25)

**Q4 — Does the Changes list stay main-repo-only while compare targets follow the active
worktree?** `assistant-chat-design.md:21444` versus `FileManager.md:538`/`:3684`. Both can be
true; the combination will read as inconsistent to a user working in a worktree. (C23)

**Q5 — Does the File Manager get sub-tabs?**
The Cozy Shelves proposal adds an Explorer / Changed / Open segmented bar (c2:221-225). No
requirement in the 209 gives the panel subviews, and the Changed tab duplicates Source Control
Changes. Keep, drop, or keep-and-specify?

**Q6 — Are Open Editors and Recent lists owned by the File Manager or the editor surface?**
c2:493-506 puts them in the panel. The spec places editor tab state under
`editor_state.v1` / the editor surface (`storage-plan.md:1851`). Needs an owner.

**Q7 — Do you want a "Default action for drop: Copy / Move" setting?**
`FileManager.md:1308` proposes it in the same list where move-as-default is recorded as
**rejected** for safety. Adding it reverses a recorded decision. (C19)

**Q8 — Is delete trash or permanent, and does it confirm?**
No document says. `Architecture_Invariants.md:371` names a platform trash adapter but nothing
binds `cmd.file.delete` to it. This is a data-loss-adjacent default that should not be decided
in code.

**Q9 — Sort order.** Nothing in 209 requirements specifies tree sort (name / type / modified),
folders-first, or whether a sort control exists. `FinalGUISpec.md:26150` only says a local
sort must be *disclosed* if it reorders DiscoveryService ranking. Someone has to pick the
default.

**Q10 — How far do you want to go on depth?**
§4.1 shows this repo's own modal file sits at depth 9 with a 20-character basename. The capped
indent + middle-elide + chain-compaction + re-root package fixes it, but it is real work. The
alternative is accepting that deep trees are navigated by filter and breadcrumb rather than by
scrolling — which is a legitimate product stance, just one that should be chosen deliberately.
