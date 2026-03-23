## 15. Persistence

### 15.1 redb Schema

**Shell, layout, and editor state**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `layout:v1` | Panel dock state per panel (docked side + width, or floating position/size); center splits; bottom runtime-panel height; detached-window geometry; split ratios for terminal sections. Single JSON blob for atomic read/write. | On change (debounced 300ms) |
| `dashboard_layout:v1` | Ordered list of dashboard card IDs + grid column count | On change (debounced 300ms) |
| `activity_bar_order:v1` | Ordered list of activity bar item IDs + separator position | On change (debounced 300ms) |
| `theme:v1` | Current ThemeVariant enum value | On change |
| `editor_state:v1:{project_id}` | Open tabs, active tab, scroll/cursor position per project | On change (debounced 500ms) |
| `filetree_state:v1:{project_id}` | Expanded folder set, local filter text, and tree scroll position | On change (debounced 300ms) |
| `search_panel_state.v1:{project_id}` | Search side-panel UI state: last query, replacement text, toggles, include/exclude globs, expanded groups, selected result ref, and active query session ref | On change (debounced 250ms) |
| `project_state:v1:{project_id}` | Per-project shell snapshot: editor tabs, file-tree expansion, chat thread selection, last active side-panel occupant, active view, language badges, requested/effective LSP selection summary, last-focused Search/Source Control refs, and remote-context summary | On change (debounced 300ms) |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

**Chat, settings, and review state**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `settings:v1` | Durable app settings and preferences | On save |
| `config:v1` | Full app config struct (all Settings values including permissions, shortcuts, LSP registry settings, Search defaults, and file-manager behavior) | On change (debounced 200ms) |
| `chat_state:v1` | Unsent input text, queued messages, active thread selection | On change (debounced 200ms) |
| `wizard_state:v1:{project_id}` | Current wizard step and form data | On change (debounced 300ms) |
| `document_pane_state:v1:{project_id}:{page_context}` | Embedded document-pane state: selected document, selected view, scroll/cursor state, history selection, and approval stage | On change (debounced 200ms) |
| `document_checkpoints:v1:{project_id}` | Checkpoint metadata for restorable document states | On checkpoint create/restore |
| `review_findings_summary:v1:{project_id}:{run_id}` | Findings summary payload for requirements/interview review runs | On review completion/update |
| `review_approval_gate:v1:{project_id}:{run_id}` | Final approval decision state and precondition flags | On approval state change |
| `slash_commands:v1` | Custom slash commands (application-wide) | On save |
| `slash_commands:v1:{project_id}` | Custom slash commands (project-wide) | On save |
| `projects:v1` | Project registry: known projects with paths, detected languages, last-opened timestamps, health status, and per-project overrides | On change |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md

**Preview, browser, recovery, LSP, and remote keys**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `preview_state.v1:{project_id}:{preview_subject_id}` | Preview UI state keyed by document/artifact subject: mode, attached surface, export prefs, scroll sync, and last error | On change (debounced 300ms) |
| `preview_source_artifact.v1:{project_id}:{artifact_id}` | Artifact-backed preview metadata and source linkage | On change |
| `browser_session_state.v1:{project_id}:{browser_session_id}` | Browser session state: session class, workspace tab, preview subject, requested/effective runtime and capabilities, blocked actions, profile scope, restore policy, and last error | On change (debounced 300ms) |
| `browser_profile_state.v1:{project_id}:{profile_scope}` | Browser history/bookmarks and project-scoped profile state | On change (debounced 500ms) |
| `editor_unsaved_buffer.v1:{project_id}:{document_id}` | Recoverable local unsaved buffer snapshot, capture metadata, host/path identity, and write-availability state at capture time | On change (debounced 500ms) |
| `search_query_state.v1:{project_id}:{query_session_id}` | Query-session snapshot: query, replacement, scope, result snapshot ref, freshness, health, and last error | On query update/complete |
| `lsp_session_state.v1:{project_id}:{host_id}:{server_id}:{root_identity}` | Host-aware LSP session projection: state, freshness, health, restart metadata, capability summary, and last error | On lifecycle change |
| `lsp_diagnostics_snapshot.v1:{project_id}:{host_id}:{server_id}:{root_identity}` | Diagnostics snapshot ref(s), counts, capture time, freshness, and health for the owning host-aware LSP session | On diagnostics update |
| `ssh_remotes/{id}` | Saved SSH remote record: nickname, host, port, user, auth method, remote folder, jump host, and last test metadata. No secrets. | On save |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Normative mapping notes:
- `ssh_remotes/{id}` replaces the stale flat `ssh_connections:v1` concept in GUI-facing persistence summaries.
- `preview_state.v1:*`, `preview_source_artifact.v1:*`, `browser_session_state.v1:*`, and `browser_profile_state.v1:*` replace the stale single-blob `browser_state:v1` model.
- Search and LSP rows in this section are GUI-facing projections and MUST resolve back to owner-doc contracts in `Plans/storage-plan.md`, `Plans/FileManager.md`, and `Plans/LSPSupport.md`.
- `editor_unsaved_buffer.v1:*` stores local unsaved buffer state only and MUST NOT imply that a remote write succeeded.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

### 15.2 seglog Projections (for Usage)

- Usage events (tokens, cost, platform, tier, session, thread_id) appended to seglog
- Analytics scan jobs produce rollups in redb (5h/7d counters, tool latency, error rates)
- Usage view and dashboard read from redb rollups, not raw seglog
- Per-thread usage derived from seglog events filtered by thread_id

### 15.3 Tantivy Indices

- Chat history search (human and agent messages) queryable from Chat panel search
- Evidence search
- Ledger search

### 15.4 Startup Restore
On startup:
1. Read `layout:v1` from redb and restore panel positions, sizes, dock states, and detached-terminal geometry.
2. Read `theme:v1` from redb and apply theme.
3. Read `dashboard_layout:v1` and restore card order.
4. Read `activity_bar_order:v1` and restore icon order.
5. Read `editor_state:v1:{project}` and restore open tabs.
6. Read `project_state:v1:{project_id}` and restore the active project-facing shell state.
7. Read `terminal_state:v1` and restore terminal section layout, tabs, pane tree, labels, and selected focus targets.
8. Read `hotreload_state:v1:{project_id}` and rehydrate dev-session UI state as historical or verified-live state.
9. Read `onboarding:v1` and determine whether tour or first-run hints should show.
10. If a floating or detached window was on a disconnected monitor, fall back to docked presentation or to a safe detached coordinate.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Restore rules:
- terminal restore MUST preserve section, tab, and pane identity before attempting any session liveness verification
- restored historical sessions may appear immediately, but live-state badges wait for verification
- startup restore MUST prefer revealing prior selected terminal containers over creating new empty terminals automatically

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md
### 15.5 Session Recovery
On crash or unexpected shutdown, restore as much state as possible:
- **Chat state:** unsent input text, queued messages, and active thread selection are restored from `chat_state:v1`.
- **Wizard state:** current wizard step and form data resume from `wizard_state:v1:{project_id}`.
- **Document pane state:** embedded document-pane selection and view (`document` or `plan_graph`) restore from `document_pane_state:v1:{project_id}:{page_context}`.
- **Document checkpoints:** checkpoint list and selected checkpoint context restore so the user can continue restore or approval workflows.
- **Review findings and approval state:** findings summary and approval state restore so interrupted review runs return to the correct approval surface.
- **Active project:** the last active project is restored automatically.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md

Terminal and dev-session recovery rules:
- terminal sections, tabs, panes, labels, pin state, and selected focus restore from durable terminal workspace state
- terminal sessions restore only as verified-live or historical records; Puppet Master MUST NOT fake live PTY continuity after restart
- canonical recovery outcomes are `restored_live`, `restored_exited`, `restored_disconnected`, and `restored_without_history`
- dev sessions restore as workflow records tied to their last-known output, problems, ports, and linked terminal refs
- restored historical terminals show explicit banners and recovery controls such as restart, replace, or close historical tab

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md

Browser and runtime recovery rules remain aligned:
- browser sessions preserve their own restore policy and never silently become terminal-owned shells
- attention surfaces, command cards, and linked runtime panes must pivot back to the restored canonical identity rather than inventing replacement containers

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md
