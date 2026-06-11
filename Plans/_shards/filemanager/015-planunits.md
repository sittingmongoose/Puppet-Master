# Shard 015: PlanUnits

Source: `Plans/FileManager.md`

Source lines: L546-L726

Source SHA256: `ebfdd61a127ee23dc6ad76cc1ee3e1045b8b95c220b5428e2caf3406b521da2a`

---

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

