## 4. Navigation Architecture

### 4.1 Activity Bar

Left edge, 48px wide. A vertical strip of 6 icons, each representing a group of related functionality.

| Icon | Group | Pages | Default Page |
|------|-------|-------|-------------|
| Home | Home | Dashboard, Projects | Dashboard |
| Play | Run | Wizard, Interview, Tiers | Wizard |
| Sliders | Settings | Settings (unified: old Config + old Settings + Login + Doctor) | Settings |
| Chart | Data | Usage, Metrics, Evidence, History, Ledger, Memory, Coverage | Usage |
| Chat | Chat | (toggles Chat tab in side panel) | -- |
| Folder | Files | (toggles Files tab in side panel) | -- |

**Behavior:**
- **Single click** on an activity bar icon navigates to the group's default page.
- **Long press or right-click** opens a popover sub-menu listing all pages in that group.
- **Active indicator:** 3px vertical accent stripe on the left edge of the active group's icon.
- Chat and Files icons toggle their respective side panels open/closed (they do not navigate to a page in primary content).
- Icons are 24x24px, outlined, using `Theme.text-primary` with the active icon using `Theme.accent-blue`.

**Activity bar reordering:** Icons can be dragged up/down to reorder. A separator line can be placed between primary and secondary groups. Order is persisted in redb.

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

