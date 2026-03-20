## 15. Persistence

### 15.1 redb Schema
| Key | Content | Write Frequency |
|-----|---------|----------------|
| `layout:v1` | Panel dock state per panel (docked side + width, or floating position/size); center splits; bottom panel height; terminal-section dock state; detached-terminal geometry; split ratios for terminal sections. Single JSON blob for atomic read/write. | On change (debounced 300ms) |
| `dashboard_layout:v1` | Ordered list of dashboard card IDs + grid column count | On change (debounced 300ms) |
| `activity_bar_order:v1` | Ordered list of activity bar item IDs + separator position | On change (debounced 300ms) |
| `theme:v1` | Current ThemeVariant enum value | On change |
| `editor_state:v1:{project_id}` | Open tabs, active tab, scroll/cursor position per project | On change (debounced 500ms) |
| `onboarding:v1` | Tour completion flag, first-run flags | On change |
| `collapse_state:v1` | Per-view collapse states for collapsible sections | On change (debounced 300ms) |
| `custom_layouts:v1` | Named custom layout definitions (up to 5) | On change |
| `settings:v1` | All app settings and config, including terminal appearance defaults and shortcut preferences | On save |
| `chat_state:v1` | Unsent input text, queued messages, active thread selection | On change (debounced 200ms) |
| `wizard_state:v1:{project_id}` | Current wizard step, form data | On change (debounced 300ms) |
| `document_pane_state:v1:{project_id}:{page_context}` | Embedded document pane state: selected document, selected view (`document | plan_graph`), scroll/cursor state, history selection, approval stage | On change (debounced 200ms) |
| `document_checkpoints:v1:{project_id}` | Checkpoint metadata for restorable document states (`before_multi_pass`, `after_user_edit_1`, etc.) | On checkpoint create/restore |
| `review_findings_summary:v1:{project_id}:{run_id}` | Findings summary payload for requirements/interview review runs | On review completion/update |
| `review_approval_gate:v1:{project_id}:{run_id}` | Final approval decision state and precondition flags | On approval state change |
| `slash_commands:v1` | Custom slash commands (application-wide) | On save |
| `slash_commands:v1:{project_id}` | Custom slash commands (project-wide) | On save |
| `filetree_state:v1:{project_id}` | Expanded folder paths set, scroll position | On change (debounced 300ms) |
| `config:v1` | Full app config struct (all Settings tab values including tool permissions, cleanup, shortcuts overrides, skill permissions, and terminal settings) | On change (debounced 200ms) |
| `projects:v1` | Project registry: list of known projects with paths, detected languages, last-opened timestamps, health status, per-project config overrides | On change |
| `project_state:v1:{project_id}` | Per-project state snapshot: editor tabs, file tree expansion, chat thread selection, panel layout, active view, language badges, LSP server selection, and last-focused terminal section or tab refs | On change (debounced 300ms) |
| `ssh_connections:v1` | SSH connection profiles: name, host, port, username, auth method, last-connected timestamp (passwords stored in system keychain, NOT here) | On save |
| `debug_configs:v1:{project_id}` | Per-project run/debug configurations (launch.json equivalent), breakpoints (file + line + condition + enabled), debug adapter preferences | On save |
| `catalog_index:v1` | Cached catalog index: item list with name, version, category, description, installed flag. Timestamp of last refresh. | On catalog refresh |
| `sync_history:v1` | Last export date, last import date, backup file paths | On export/import |
| `browser_state:v1` | Browser tab URLs, bookmarks, history (last 100 entries), pinned tabs | On change (debounced 500ms) |
| `terminal_state:v1` | GUI-facing projection of per-project terminal workspace state: ordered terminal sections, terminal tabs, pane tree, labels, pin state, selected pane refs, dock/detach presentation, linked dev-session refs, recovery banners, bounded transcript snapshot refs, and command-block summary refs. It never implies live PTY continuity and never stores secrets. | On change (debounced 300ms) |
| `sound_prefs:v1` | Sound effects master toggle, per-event toggles, volume level | On change |
| `hotreload_state:v1:{project_id}` | Dev-session reload state, build command, watched paths, linked terminal-session refs, and last-known output or ports linkage | On change |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

Normative mapping notes:
- the canonical durable review/bundle contract is owned by `Plans/storage-plan.md` (`bundle.{bundle_id}`, `doc_registry.{bundle_id}`, `notes_index.{bundle_id}`, `note.{bundle_id}.{note_id}`, `document_pane_state.{bundle_id}`, `final_review_output.{bundle_id}`)
- GUI-facing keys in this table are logical or UI projections and MUST NOT become competing SSOTs with incompatible field shapes
- `terminal_state:v1` remains the GUI projection boundary; canonical terminal record families and transcript rules are owned by `Plans/storage-plan.md`
- findings-summary and final-gate restoration MUST resolve back to the canonical bundle or review records defined in `Plans/storage-plan.md`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md#3.9, ContractName:Plans/Crosswalk.md#3.10
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
