## 4. Navigation Architecture

### 4.1 Activity Bar

The activity bar is the canonical entry point for persistent side-panel operational surfaces.

Required side-panel items for this feature set:
- `chat`
- `files`
- `source_control`
- `github_actions`
- `docker_manager`
- `artifacts`
- `run_debug`

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/GitHub_Integration.md

Required shell rules:
- Source Control and GitHub Actions are separate activity-bar destinations.
- The legacy combined `Git (GitHub)` surface is retired as canonical shell behavior.
- Docker Manager is the canonical container/runtime side-panel destination.
- Kubernetes does not get a separate activity-bar item for MVP; it is a Docker Manager subview.
- Unraid does not require a separate top-level activity-bar item; Publish / Unraid lives inside Docker Manager.
- Activity-bar labels, tooltips, keyboard shortcuts, and `cmd.panel.switch` IDs MUST use the same surface vocabulary.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md

Canonical side-panel descriptions:

| Panel ID | Canonical label | Purpose |
|---|---|---|
| `source_control` | Source Control | Git-first repo state, changes, history, graph, branches/stash, and worktrees |
| `github_actions` | GitHub Actions | GitHub-hosted workflows, runs, logs, dispatch, and admin settings |
| `docker_manager` | Docker Manager | Containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md

Unchanged primary-content and bottom-panel surfaces continue to follow the rest of this document.

### 4.2 Command Palette

`Ctrl+K` (primary) or `Ctrl+P` (alternative) opens a centered overlay (~500-600px wide, top third of window) with fuzzy search across all pages, commands, and actions.

**Prefix modes:**
- No prefix: everything (pages, commands, recent items, files)
- `>`: commands only
- `@`: file mentions (same as chat @ mention)
- `/`: slash commands

**Behavior:**
- Recently used items appear first (recency weighting)
- Each entry shows: action name, keyboard shortcut (if any), category badge
- Arrow keys to navigate, Enter to select, Escape to dismiss
- Fuzzy matching: "das" matches "Dashboard", "dsh" matches "Dashboard"

### 4.3 Breadcrumb

At the top of the primary content area, a breadcrumb strip (20px) shows `Group > Page` (e.g., `Data > Ledger`). Breadcrumb items are clickable for quick navigation within the group.

### 4.4 Keyboard Shortcuts

**Artifacts panel and side-panel toggling:** Any shortcuts for "Open Artifacts panel," "Toggle side panel," or switching between side-panel content (Git, Docker, Unraid, Artifacts, Chat, Files) MUST be registered in the shortcut registry and appear in Settings > Shortcuts. Activity bar icon clicks are the primary interaction; keyboard shortcuts are additive and must stay consistent with §4.1 and §5.


**Artifacts panel and side-panel toggling:** Any shortcuts for "Open Artifacts panel," "Toggle side panel," or switching between side-panel content (Git, Docker, Unraid, Artifacts, Chat, Files) MUST be registered in the shortcut registry and appear in Settings > Shortcuts. Activity bar icon clicks are the primary interaction; keyboard shortcuts are additive and must stay consistent with §4.1 and §5.

**Tier 1 -- Essential (learn day one):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+L` | Focus chat input |
| `Ctrl+N` | New chat thread |
| `Ctrl+Shift+E` | Toggle File Manager |
| `Escape` | Close palette / panel / stop agent |

**Tier 2 -- Productive (learn in first week):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` through `Ctrl+5` | Jump to activity bar group 1-5 default page |
| `Ctrl+Enter` | Send message (in chat) |
| `Tab` | Queue message (in chat, steer mode) |
| `Ctrl+Shift+,` | Open settings |
| `Ctrl+\` | Toggle side panel (Chat/Files) |
| `Ctrl+Shift+\`` | Toggle bottom panel (Terminal) |
| `Ctrl+W` | Close current tab/panel |

**Tier 3 -- Power user (discoverable via palette):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle Dashboard |
| `Ctrl+Shift+\` | Detach/re-dock side panel |
| `Alt+Up/Down` | Cycle through chat threads |
| `Ctrl+Shift+C` | Compact current session |
| `Ctrl+Shift+X` | Export thread |
| `Ctrl+Shift+P` | Open project switcher |
| `F5` | Start/Continue debug |
| `F10` | Step Over (debug) |
| `F11` | Step Into (debug) |
| `Shift+F11` | Step Out (debug) |
| `Shift+F5` | Stop debug |
| `Ctrl+Shift+B` | Toggle Browser tab in bottom panel |

**Shortcut registry:** A Rust-side registry maps (modifiers + key) to actions. Platform-specific modifier normalization (Cmd on macOS, Ctrl on Windows/Linux). The "Keyboard shortcuts" help view is auto-generated from this registry.

---

