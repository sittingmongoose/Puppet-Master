## 15. Persistence

### 15.1 redb Schema

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `layout:v1` | Panel dock state per panel (docked side + width, or floating position/size); center splits; bottom panel height; 4-split terminal ratios. Single JSON blob for atomic read/write. | On change (debounced 300ms) |
| `dashboard_layout:v1` | Ordered list of dashboard card IDs + grid column count | On change (debounced 300ms) |
| `activity_bar_order:v1` | Ordered list of activity bar item IDs + separator position | On change (debounced 300ms) |
| `theme:v1` | Current ThemeVariant enum value | On change |
| `editor_state:v1:{project_id}` | Open tabs, active tab, scroll/cursor position per project | On change (debounced 500ms) |
| `onboarding:v1` | Tour completion flag, first-run flags | On change |
| `collapse_state:v1` | Per-view collapse states for collapsible sections | On change (debounced 300ms) |
| `custom_layouts:v1` | Named custom layout definitions (up to 5) | On change |
| `settings:v1` | All app settings and config (replaces YAML file eventually) | On save |
| `chat_state:v1` | Unsent input text, queued messages, active thread selection | On change (debounced 200ms) |
| `wizard_state:v1:{project_id}` | Current wizard step, form data | On change (debounced 300ms) |
| `document_pane_state:v1:{project_id}:{page_context}` | Embedded document pane state: selected document, selected view (`document | plan_graph`), scroll/cursor state, history selection, approval stage | On change (debounced 200ms) |
| `document_checkpoints:v1:{project_id}` | Checkpoint metadata for restorable document states (`before_multi_pass`, `after_user_edit_1`, etc.) | On checkpoint create/restore |
| `review_findings_summary:v1:{project_id}:{run_id}` | Findings summary payload for requirements/interview review runs | On review completion/update |
| `review_approval_gate:v1:{project_id}:{run_id}` | Final approval decision state and precondition flags | On approval state change |
| `slash_commands:v1` | Custom slash commands (application-wide) | On save |
| `slash_commands:v1:{project_id}` | Custom slash commands (project-wide) | On save |
| `filetree_state:v1:{project_id}` | Expanded folder paths set, scroll position | On change (debounced 300ms) |
| `config:v1` | Full app config struct (all Settings tab values including tool_permissions, cleanup, shortcuts overrides, skill_permissions) | On change (debounced 200ms) |
| `projects:v1` | Project registry: list of known projects with paths, detected languages, last-opened timestamps, health status, per-project config overrides | On change |
| `project_state:v1:{project_id}` | Per-project state snapshot: editor tabs, file tree expansion, chat thread selection, panel layout, active view, language badges, LSP server selection | On change (debounced 300ms) |
| `ssh_connections:v1` | SSH connection profiles: name, host, port, username, auth method, last-connected timestamp (passwords stored in system keychain, NOT here) | On save |
| `debug_configs:v1:{project_id}` | Per-project run/debug configurations (launch.json equivalent), breakpoints (file + line + condition + enabled), debug adapter preferences | On save |
| `catalog_index:v1` | Cached catalog index: item list with name, version, category, description, installed flag. Timestamp of last refresh. | On catalog refresh |
| `sync_history:v1` | Last export date, last import date, backup file paths | On export/import |
| `browser_state:v1` | Browser tab URLs, bookmarks, history (last 100 entries), pinned tabs | On change (debounced 500ms) |
| `terminal_state:v1` | Terminal tab list: name, pinned flag, PTY config. Does NOT persist terminal content (only tab metadata). | On change (debounced 300ms) |
| `sound_prefs:v1` | Sound effects master toggle, per-event toggles, volume level | On change |
| `hotreload_state:v1:{project_id}` | Watch mode toggle state, build command, watched paths | On change |

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
1. Read `layout:v1` from redb -> restore panel positions, sizes, dock states
2. Read `theme:v1` from redb -> apply theme
3. Read `dashboard_layout:v1` -> restore card order
4. Read `activity_bar_order:v1` -> restore icon order
5. Read `editor_state:v1:{project}` -> restore open tabs
6. Read `onboarding:v1` -> determine if tour should show
7. If floating window was on disconnected monitor -> fall back to docked

### 15.5 Session Recovery

On crash or unexpected shutdown, restore as much state as possible:
- **Chat state:** Unsent input text, queued messages, and active thread selection are persisted in redb (`chat_state:v1`) on every change (debounced 200ms). On restart, restore the composer content and queue.
- **Wizard state:** Current wizard step and form data persisted in redb (`wizard_state:v1:{project_id}`). On restart, resume from the last completed step.
- **Document pane state:** Restore embedded document pane selection and view (`document` or `plan_graph`) from `document_pane_state:v1:{project_id}:{page_context}`.
- **Document checkpoints:** Restore checkpoint list and selected checkpoint context so user can continue restore/approval workflow.
- **Review findings + approval state:** Restore findings summary and `awaiting_final_approval` state so interrupted review runs return to findings + final approval UI.
- **Active project:** Last active project is restored automatically.
- **Orchestrator state:** If an orchestration was running, show a "Previous run was interrupted" CtA on Dashboard with options: "Resume from last checkpoint" or "Discard and start fresh."

---

