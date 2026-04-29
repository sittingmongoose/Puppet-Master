## 4. Navigation Architecture

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0255
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `cmd.panel.switch` is the best local starting point for general navigation, but it is still too panel-centric and too shallow for:
  - cmd.panel.switch
  - `resume_url` is currently a stronger navigation primitive than generic `UICommand.args`, which inverts the desired architecture.
  - resume_url
  - UICommand.args
  - but they still frame those as view-specific navigation instructions, not as a canonical target model.
  - `UICommand.args` is too generic to express reusable navigation semantics without a normalized target object.
  - Research Progress - 2026-03-16 - Migration pattern for `route_target` and navigation wrappers
  - route_target
  - Keep `resume_url` portability and persistence, but remove its status as the strongest implicit navigation mechanism.
  - Research Progress - 2026-03-17 - Artifact preview identity versus navigation primitive ownership
  - If reconciliation starts in Stratum 3 or Stratum 4 before Stratum 1 is fixed, the consumer docs will keep restating local navigation semantics and drift will recur.
  - add a primitive for route-target / open-by-identity navigation near `Primitive:UICommand` and `Primitive:DocumentPane`
  - Primitive:UICommand
  - Primitive:DocumentPane
  - `wizard_attention_required` still treats `resume_url` as the primary navigation object
  - wizard_attention_required
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 4.1 Activity Bar

The activity bar is the canonical entry point for persistent right-hand side-panel operational surfaces.

Required side-panel items for this feature set:
- `search`
- `chat`
- `files`
- `source_control`
- `github_actions`
- `docker_manager`
- `artifacts`
- `run_debug`

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

Required shell rules:
- Search, File Manager, Source Control, GitHub Actions, Docker Manager, Artifacts, Chat, and Run & Debug occupy the single right-hand side-panel slot defined by the shell.
- None of those surfaces are described as canonical primary-content pages unless the statement is explicitly about a routed detail page launched from the surface.
- Activity-bar labels, tooltips, shortcuts, and command IDs MUST use the same surface vocabulary across shell chrome, command palette, and wiring tables.
- Detachable side-panel surfaces return to the same right-hand slot when re-docked.
- The bottom runtime zone remains terminal/output/problems/debug/ports territory; normal browsing and HTML preview remain editor/workspace-tab hosted.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

Canonical side-panel descriptions:

| Panel ID | Canonical label | Purpose |
|---|---|---|
| `search` | Search | Project-wide find-in-files and replace-in-files with persistent query/result state |
| `files` | File Manager | Project tree, local tree filter, file actions, and editor handoff |
| `source_control` | Source Control | Git-first repo state, changes, history, graph, branches/stash, and worktrees |
| `github_actions` | GitHub Actions | GitHub-hosted workflows, runs, logs, dispatch, and admin settings |
| `docker_manager` | Docker Manager | Containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes |
| `artifacts` | Artifacts | Runtime/browser/build artifacts and cross-surface evidence navigation |
| `chat` | Assistant Chat | Threaded assistant workflows, context management, and activity transparency |
| `run_debug` | Run & Debug | Runtime diagnostics, problems, debug, output, and ports entry surface |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 4.2 Command Palette

`Ctrl+K` (primary) or `Ctrl+P` (alternative) opens a centered overlay (~500-600px wide, top third of window) with fuzzy search across project navigation targets, commands, recent items, and explicit open targets.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Prefix modes:
- no prefix: pages, commands, recent items, files, and explicit open targets
- `>`: commands only
- `@`: file and symbol mention flow for chat/context entry
- `/`: reserved slash commands

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/LSPSupport.md

Boundary rules:
- The command palette is a transient project-scoped navigation/command surface, not the owner of persistent find-in-files results.
- The Search side panel owns persistent project text search, replace-in-files, scope filters, and query-session result state.
- The command palette may launch or focus Search through `cmd.search.show`, but it does not keep the persistent result list after dismissal.
- File Manager search remains a local tree filter/type-ahead only.
- LSP symbol, reference, and diagnostic surfaces retain semantic ownership even when the command palette hosts a launcher or quick-open affordance.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md

### 4.3 Breadcrumb

At the top of the primary content area, a breadcrumb strip (20px) shows `Group > Page` (e.g., `Data > Ledger`). Breadcrumb items are clickable for quick navigation within the group.

### 4.4 Keyboard Shortcuts

Search, File Manager, Source Control, Chat, Artifacts, and runtime-surface shortcuts MUST be registered in the shortcut registry and appear in Settings > Shortcuts. Activity-bar icon clicks remain primary; shortcuts are additive and must stay consistent with `cmd.search.*`, `cmd.file.*`, `cmd.chat.*`, `cmd.source_control.*`, and shell layout rules.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md

**Tier 1 -- Essential (learn day one):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+L` | Focus chat input |
| `Ctrl+N` | New chat thread |
| `Ctrl+Shift+E` | Toggle File Manager |
| `Ctrl+Shift+F` | Show Search with query focus |
| `Escape` | Close palette / panel / stop agent |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

**Tier 2 -- Productive (learn in first week):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` through `Ctrl+8` | Jump to activity-bar item 1-8 in current order |
| `Ctrl+Enter` | Send message (in chat) |
| `Tab` | Queue message (in chat, steer mode) |
| `Ctrl+Shift+,` | Open settings |
| `Ctrl+\` | Toggle current side-panel occupant |
| `Ctrl+Shift+H` | Show Search with replace focus |
| `Ctrl+Shift+\`` | Toggle bottom runtime panel |
| `Ctrl+W` | Close current tab/panel |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

**Tier 3 -- Power user (discoverable via palette):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle Dashboard |
| `Ctrl+Shift+\` | Detach/re-dock active detachable side-panel or terminal section |
| `Alt+Up/Down` | Cycle through chat threads |
| `Ctrl+Shift+C` | Compact current session |
| `Ctrl+Shift+P` | Open project switcher |
| `F5` | Start/Continue debug |
| `F10` | Step Over (debug) |
| `F11` | Step Into (debug) |
| `Shift+F11` | Step Out (debug) |
| `Shift+F5` | Stop debug |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

Shortcut registry rule: A Rust-side registry maps (modifiers + key) to commands or route/open actions. Platform-specific modifier normalization (Cmd on macOS, Ctrl on Windows/Linux) remains mandatory, and the Keyboard Shortcuts help view is auto-generated from the registry.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

