## 4. Navigation Architecture

### 4.1 Activity Bar

Left edge, 48px wide. A vertical strip of icons, each representing a panel or group. **There is no Home icon on the activity bar;** main app navigation (Dashboard, Projects, etc.) stays in the title bar / primary content.

| Icon | Panel / group | Behavior |
|------|----------------|----------|
| Play | Run & Debug | Toggles Run & Debug panel in side panel (DAP-based debugging; see §7.20) |
| Git / branch | Git (GitHub) | Toggles Git panel in side panel (repo/branch/diff/operations; see Plans/GitHub_Integration.md §A) |
| Docker | Docker | Toggles Docker Manage panel in side panel when project is Docker-related (see Plans/Containers_Registry_and_Unraid.md) |
| Source control | Source Control | Toggles Source Control panel in side panel (multi-repo; Git-focused) |
| Unraid | Unraid | Toggles Unraid template panel in side panel when project has Unraid template workflow |
| Box/archive | Artifacts | Toggles Artifacts panel in side panel (runtime artifacts; see Plans/Runtime_Artifacts_Panel.md) |
| Chat | Chat | Toggles Chat tab in side panel |
| Folder | Files | Toggles File Manager panel in side panel |
| Sliders | Settings | Settings (unified) in primary content |
| Chart | Data | Usage, Metrics, Evidence, etc. in primary content; default **Usage** |

**Single side-panel slot, last-click wins:** Only one side panel is visible at a time. Clicking an activity bar icon **replaces** the current panel content with that icon's panel. The most recently clicked icon's panel is shown.

**Behavior:**
- **Single click** on an activity bar icon shows that panel in the side panel slot (replacing whatever was there).
- **Long press or right-click** on a group icon (e.g. Data) opens a popover sub-menu listing pages in that group; Run & Debug / Git / Docker / Source Control / Unraid / Artifacts / Chat / Files each occupy the side panel when clicked.
- **Active indicator:** 3px vertical accent stripe on the left edge of the active icon.
- Icons are 24x24px, outlined, using `Theme.text-primary` with the active icon using `Theme.accent-blue`.

**Activity bar reordering:** Icons can be dragged up/down to reorder. A separator line can be placed between primary and secondary groups. Order is persisted in redb **per project** (see §5.7).

**Activity bar extensibility:** Extensions/plugins may add activity bar items. Drag-to-reorder applies to built-in and extension icons.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Runtime_Artifacts_Panel.md, PolicyRule:Decision_Policy.md§2

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
| `Ctrl+Shift+P` | Open project switcher (project bar) |
| `F5` | Start/Continue debug |
| `F10` | Step Over (debug) |
| `F11` | Step Into (debug) |
| `Shift+F11` | Step Out (debug) |
| `Shift+F5` | Stop debug |
| `Ctrl+Shift+B` | Toggle Browser tab in bottom panel |

**Shortcut registry:** A Rust-side registry maps (modifiers + key) to actions. Platform-specific modifier normalization (Cmd on macOS, Ctrl on Windows/Linux). The "Keyboard shortcuts" help view is auto-generated from this registry.

---

