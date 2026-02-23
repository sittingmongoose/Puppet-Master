# Puppet Master GUI Specification -- Slint Rewrite

**Date:** 2026-02-22
**Status:** Authoritative specification for AI agent implementation
**Tech Stack:** Rust + Slint 1.15.1 (.slint markup compiled via slint_build)
**Renderer:** Default winit + Skia; fallback winit + FemtoVG-wgpu; emergency software renderer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack and Renderer](#2-tech-stack-and-renderer)
3. [Master Layout](#3-master-layout)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Panel System](#5-panel-system)
6. [Theme System](#6-theme-system)
7. [Views Specification](#7-views-specification)
8. [Widget Catalog](#8-widget-catalog)
9. [State Management](#9-state-management)
10. [UX Patterns](#10-ux-patterns)
11. [Anti-Flickering and Scroll Preservation](#11-anti-flickering-and-scroll-preservation)
12. [Responsive Design](#12-responsive-design)
13. [Accessibility](#13-accessibility)
14. [Slint File Organization](#14-slint-file-organization)
15. [Persistence](#15-persistence)
16. [Migration Mapping](#16-migration-mapping)
17. [Risks and Mitigations](#17-risks-and-mitigations)
18. [Promoted Features](#18-promoted-features-formerly-future-considerations)
19. [Appendix A: Cross-References](#appendix-a-cross-references)
20. [Appendix B: Locked Decisions Summary](#appendix-b-locked-decisions-summary)

---

## 1. Executive Summary

This document is the authoritative GUI specification for the Puppet Master desktop application, replacing the current Iced-based GUI with a Slint 1.15.1 implementation. The design follows an IDE-shell layout (Activity Bar + Primary Content + Side Panel + Bottom Panel) with three theme families (Retro Dark, Retro Light, Basic Modern -- four built-in variants plus user-created custom themes), detachable panels, and a rearrangeable dashboard.

The current GUI uses a two-row header with 16 flat navigation buttons above a single full-width content area. This wastes screen real estate and forces constant page-switching. The new layout follows a three-column IDE shell inspired by VS Code / JetBrains, dressed in the existing retro-futuristic aesthetic.

Key changes from the current Iced GUI:
- **Layout:** Single-page-at-a-time replaced with persistent IDE shell (Activity Bar, Primary Content, Side Panel, Bottom Panel)
- **Navigation:** 16 flat buttons replaced with 5-group Activity Bar + Command Palette
- **Settings restructure:** Old "Settings" becomes "App Settings"; old "Config" becomes "Settings"; Login and Doctor merged into unified Settings page (20 tabs in 5 groups with two-level sidebar navigation)
- **New views:** Usage page, File Manager panel, File Editor panel (with instructions editor and SSH remote editing), Chat panel, Agent Activity pane
- **Bottom panel:** Terminal (with tab management and pin semantics), Problems, Output, Ports (with hot reload controls), Browser (embedded webview with click-to-context), Debug (DAP-based integrated debugger)
- **Themes:** Three theme families with full extensibility -- custom themes loadable from TOML files, custom font support, theme preview on hover
- **Real-time:** Event-driven updates via Rust channels and `invoke_from_event_loop`, not polling
- **Panels:** Chat and File Manager are detachable (dock/float/snap)
- **Project bar:** Instant project switching from title bar with full state preservation and reload
- **Language detection:** Auto-detect project languages, display badges, suggest LSP and tool presets
- **Sound effects:** Optional audio feedback for key events (run complete, HITL needed, errors) via `rodio`
- **Catalog and sync:** Community content catalog with one-click install; config export/import bundles for cross-machine sync
- **SSH remote editing:** Edit files on remote hosts via SSH/SFTP with connection management and offline resilience
- **Run/debug:** Integrated debugging with DAP protocol, breakpoint management, run configurations
- **Product name:** "Puppet Master" (per Plans/rebrand.md)

---

## 2. Tech Stack and Renderer

### 2.1 Core Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Language | Rust | All logic, state management, and Slint bridge code |
| UI Framework | Slint 1.15.1 | `.slint` markup files compiled via `slint_build` in `build.rs` |
| Default Renderer | winit + Skia | Best quality and performance |
| Fallback Renderer | winit + FemtoVG-wgpu | When Skia is unavailable |
| Emergency Renderer | Software renderer | Headless/CI environments |
| Persistence (layout) | redb | Durable KV store for layout state, preferences, editor state |
| Persistence (events) | seglog | Canonical event ledger for usage, chat, orchestrator events |
| Search | Tantivy | Full-text search index over seglog projections |

### 2.2 What Is NOT Used

No React, JavaScript, TypeScript, HTML, or CSS. The entire GUI is Rust + Slint `.slint` markup.

### 2.3 Build Integration

```rust
// build.rs
fn main() {
    let config = slint_build::CompilerConfiguration::new()
        .with_style("cosmic".into());
    slint_build::compile_with_config("ui/app.slint", config).unwrap();
}
```

The `cosmic` base style is used because it supports `ColorScheme` toggling and has a neutral appearance that does not conflict with custom theming. All visual differences are driven by a `Theme` global in `.slint` rather than the base style.

### 2.4 Backend Selection

Backend is chosen at startup; all windows use the same backend. Selection uses `slint::BackendSelector::new().select()` with `SLINT_BACKEND` environment variable override. Cargo features control which renderers are compiled in (e.g., `default = ["renderer-skia"]`, optional `renderer-femtovg`).

```rust
// main.rs entry point
fn main() -> Result<(), Box<dyn std::error::Error>> {
    slint::BackendSelector::new().select()?;
    let ui = AppWindow::new()?;
    // ... state init, bridge wiring, effects generation
    ui.run()?;
    Ok(())
}
```

---

## 3. Master Layout

### 3.1 IDE Shell Structure

```
+-----------------------------------------------------------------+
|  TITLE BAR: Puppet Master  [project v] [theme] [gear]           |  28px
+------+------------------------------------------+---------------+
|      |                                          |               |
| ACT  |   PRIMARY CONTENT AREA                   | SIDE PANEL    |
| BAR  |   (active page view)                     | [Chat] [Files]|
|      |                                          | Detachable    |
| 48px |                                          | 240-480px     |
|      |                                          |               |
|      +------------------------------------------+               |
|      |  BOTTOM PANEL (collapsible)              |               |
|      |  Terminal / Problems / Output             |               |
|      |  120-300px                                |               |
+------+------------------------------------------+---------------+
|  STATUS BAR: [mode] [platform v] [model v] [ctx: 42k/128k]     |  24px
+-----------------------------------------------------------------+
```

### 3.2 Structural Zones

| Zone | Slint Container | Size | Behavior |
|------|----------------|------|----------|
| **Title bar** | `HorizontalLayout` | height: 28px fixed | App name (Orbitron Bold 14px), **project bar** (dropdown + recent list), theme toggle, settings gear |
| **Activity bar** | `VerticalLayout` | width: 48px fixed | Icon-only vertical nav; always visible |
| **Primary content** | `VerticalLayout` (flex: 1) | fills remaining space | Active page view; scrollable internally per page |
| **Side panel** | `VerticalLayout` | width: 240-480px, resizable | Chat or File Manager tabs; detachable |
| **Bottom panel** | `VerticalLayout` | height: 120-300px, collapsible | Terminal, Problems, Output tabs |
| **Status bar** | `HorizontalLayout` | height: 24px fixed | Chat mode, platform/model dropdowns, context usage, orchestrator status |

### 3.3 System Tray

When "minimize to tray" is enabled in Settings/General:
- **Close button** minimizes to tray instead of quitting (Quit via tray menu or File > Quit)
- **Tray icon:** Puppet Master icon; changes to accent color when orchestrator is running
- **Left-click tray icon:** Restore/focus the main window
- **Right-click tray menu:** Show/Hide | Pause/Resume Orchestrator | Quit
- **Tray notifications:** HITL approval required, run complete, rate limit hit (respects system notification settings)

### 3.4 Project Bar (Title Bar)

The title bar contains a **project bar** -- a dropdown/strip showing all known projects with instant switching.

**Layout:** `Puppet Master` label (Orbitron Bold 14px) | project dropdown (Rajdhani Medium 13px) | spacer | theme toggle icon | settings gear icon.

**Project dropdown behavior:**
- Shows current project name with a chevron-down icon
- Click opens a dropdown listing all known projects, sorted by last-opened (most recent first)
- Each row: project name, path (truncated), last-opened timestamp, status dot (green=healthy, amber=stale config, red=missing/broken)
- Fuzzy search filter at top of dropdown (auto-focused on open)
- "Open folder..." action at bottom opens native directory picker
- "New project" action creates a new project entry
- **Instant switch:** Selecting a project triggers a full state reload: editor tabs close and reopen for the new project, file tree refreshes, chat threads switch to the new project's threads, config reloads per-project overrides, LSP servers restart for new project languages, dashboard resets to new project's orchestrator state
- **State preservation:** Per-project state (editor tabs, scroll positions, panel layout, active view, chat thread selection) is saved to redb on switch-away and restored on switch-back
- **Animation:** Project name cross-fades (150ms ease-in-out) on switch. Content area shows skeleton placeholder during reload (typically <500ms)
- **Keyboard shortcut:** Ctrl+Shift+P opens the project dropdown (registered in shortcut registry)

### 3.5 Spacing and Density

**Global spacing scale** (retained from existing `ScaledTokens`):

| Token | Base (px) | Use |
|-------|-----------|-----|
| `XS` | 2 | Between icon and label in the same control |
| `SM` | 4 | Between controls in the same toolbar row |
| `MD` | 8 | Panel internal padding; gap between stacked cards |
| `LG` | 12 | Section separator within a page |
| `XL` | 16 | Gap between major layout zones (panel to panel) |

**Border widths:**
- Primary panel borders: 2px (reduced from current 3px for density)
- Active/selected indicator: 3px left-edge accent stripe
- Dividers within panels: 1px

**Hard shadow:** Offset `(2, 2)` on major containers; `(4, 4)` on floating/detached windows. No blur (retro aesthetic).

**Density metric:** At 1920x1080, the primary content area is at minimum 900px wide when both side panel and bottom panel are open. At 1280x720, the side panel auto-collapses to an icon tab, and the bottom panel collapses to its header row.

### 3.6 Space Accounting (1920x1080 reference)

```
Title bar:      28px
Status bar:     24px
Activity bar:   48px wide
Side panel:     380px wide (default)
Bottom panel:   160px tall (default)
Primary content: 1920 - 48 - 380 = 1492px wide
                 1080 - 28 - 24 - 160 = 868px tall
```

At 1280x720 with collapsed panels:
```
Side panel:     48px (icon tab)
Bottom panel:   24px (header only)
Primary content: 1280 - 48 - 48 = 1184px wide
                  720 - 28 - 24 - 24 = 644px tall
```

---

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

## 5. Panel System

### 5.1 Detachable Panels

The following panels support detach/re-dock:
- **Chat panel**
- **File Manager panel**
- **Bottom panel** (Terminal/Output)

Other views (Dashboard, Settings, etc.) remain in the primary content area and are not detachable.

### 5.2 Panel State Machine

Per panel: **DOCKED** <-> **FLOATING**. Same Slint component is used inline when docked or as the root of a separate Slint `Window` when floating.

```
DOCKED --[undock]--> FLOATING --[snap to edge]--> DOCKED
  |                       |
  +--[drag to edge]-------+
                          +--[close floating window]--> DOCKED (collapsed)
```

**State per panel:**

```rust
enum PanelDock {
    Docked { side: DockSide, width_px: i32 },
    Floating { window_id: WindowId, x: i32, y: i32, width: i32, height: i32 },
}

enum DockSide {
    Right,   // default for Chat and File Manager
    Left,    // alternative
    Bottom,  // for terminal-type panels
}
```

### 5.3 Undock Triggers

- **Double-click** the panel's title bar tab
- **Drag** the panel's title bar tab away from the edge
- **Pop-out button** in panel header (window-with-arrow icon)
- **Right-click** panel tab -> "Pop out to window"
- **Keyboard shortcut** (e.g., `Ctrl+Shift+\`)
- **Command palette:** "pop out chat" or "detach file manager"

### 5.4 Snap Zones

When a floating panel window is dragged near the main window edge:
- Proximity threshold: 25px from the main window edge
- Visual cue: 2px accent strip (`Theme.accent-blue`) on the target edge
- On drop: panel docks to that side; floating window closes
- Snap animation: instant (no easing -- retro hard-edge aesthetic)

### 5.5 Slint Multi-Window Implementation

- Each panel is a reusable Slint component that renders identically whether inline (docked) or in a separate `Window` (floating)
- When docked: component placed inside main window layout hierarchy
- When floating: new Slint `Window` created; panel component placed inside it
- **Shared data:** All panel data (chat messages, file tree) lives in Rust (e.g., `Arc<RwLock<...>>`). Exposed to Slint via properties/Models (e.g., `VecModel`). Both docked and floating instances bind to the same Rust-backed properties via `Rc<VecModel<T>>` and Slint's `ModelNotify` for automatic propagation
- **Scalar properties** (orchestrator status, current phase, theme mode): Sync via `invoke_from_event_loop` from background threads -- NOT via polling timers

### 5.6 Discoverability

Three-signal system for panel detach discovery:
1. **Drag handle + tooltip:** Subtle grip icon (6 dots) in panel header. Hover tooltip: "Drag to detach, or double-click to pop out."
2. **Explicit "Pop Out" button:** Small window-with-arrow icon button in panel header (right side)
3. **First-run hint (one-time):** On first use of Chat or File Manager, inline banner: "This panel can be popped out into its own window. [Try it] [Dismiss]." Dismissed permanently after first interaction.

### 5.7 Panel Persistence

Panel dock state (docked side and width, or floating position/size) persisted in redb under `layout:v1` key. Restored on startup and after theme restart. If a floating window was on a monitor no longer connected, fall back to docked state.

### 5.8 Panel Edge Cases and Recovery

**Data sync:** Floating and docked instances share the same `Rc<VecModel<T>>` and scalar properties. When the Rust side replaces an entire model (e.g., project switch), it must update the shared `Rc` in-place rather than reassigning the pointer, so both windows stay synchronized.

**Monitor disconnect:** On startup, validate floating window coordinates against available monitors. If coordinates are off-screen or on a disconnected monitor, fall back to docked state. At runtime, listen for display-change events (platform-specific) and re-dock any orphaned floating windows.

**Snap zone conflicts:** If two floating panels are both within 25px of the same edge, the one closer to the edge wins. If equidistant, the most recently moved panel snaps first.

**Focus management:** When a floating panel window closes (user clicks X or presses Escape), focus returns to the main window. Tab key does NOT cross window boundaries -- each window has its own focus chain.

**Zero-width prevention:** Minimum panel width is 240px. If a resize drag would reduce below this, clamp at 240px. Bottom panel minimum height is 80px (collapse to 24px header via collapse button only, not via resize drag).

---

## 6. Theme System

### 6.1 Three Theme Families (Four Variants)

| Theme Family | Variants | Retro Effects | Target Audience |
|-------|--------|--------------|----------------|
| **Retro Dark** | 1 | Full: pixel grid, paper texture, scanlines, hard shadows, sharp corners, Orbitron + Rajdhani | Users who love the current aesthetic |
| **Retro Light** | 1 | Full (reduced opacity): pixel grid, paper texture, hard shadows, sharp corners, Orbitron + Rajdhani | Light-mode users who want the aesthetic |
| **Basic Modern** | 2 (Light + Dark) | None: flat colors, subtle borders, rounded corners, system fonts | Accessibility, readability, reduced visual noise |

### 6.2 Theme Token Table

| Token | Retro Dark | Retro Light | Basic Light | Basic Dark |
|-------|-----------|-------------|-------------|------------|
| **background** | #0a0a1a | #FAF6F1 | #FAFAFA | #121212 |
| **surface** | #1a1a2e | #f0ece5 | #FFFFFF | #1E1E1E |
| **surface-elevated** | #252540 | #e8e4dc | #FFFFFF | #2D2D2D |
| **text-primary** | #e8e0d0 | #1A1A1A | #1A1A1A | #E8E8E8 |
| **text-secondary** | #a0a0a0 | #666666 | #616161 | #A0A0A0 |
| **text-muted** | #666666 | #999999 | #9CA3AF | #6B7280 |
| **border** | #e8e0d0 (low opacity) | #1A1A1A | #E0E0E0 | #424242 |
| **border-light** | #333333 | #E5E7EB | #F0F0F0 | #333333 |
| **accent-blue** | #00d4ff | #0047AB | #1565C0 | #64B5F6 |
| **accent-magenta** | #ff2d9b | #FF1493 | #C41170 | #FF69B4 |
| **accent-lime** | #b4ff39 | #00FF41 | #0D7A3C | #3DD68C |
| **accent-orange** | #ff8c00 | #FF7F27 | #C45D00 | #FFA347 |
| **shadow-type** | Hard offset (2,2) | Hard offset (2,2) | None | None |
| **border-width** | 2px | 2px | 1px | 1px |
| **border-radius** | 0px | 0px | 4px | 4px |
| **display-font** | Orbitron Bold | Orbitron Bold | Inter / system-ui | Inter / system-ui |
| **body-font** | Rajdhani | Rajdhani | Inter / system-ui | Inter / system-ui |
| **mono-font** | System monospace | System monospace | System monospace | System monospace |
| **base-font-size** | 14px | 14px | 15px | 15px |
| **line-height** | 1.4 | 1.4 | 1.6 | 1.6 |
| **letter-spacing** | default | default | 0.02em | 0.02em |
| **pixel-grid-enabled** | true | true | false | false |
| **pixel-grid-opacity** | 0.09 | 0.045 | 0.0 | 0.0 |
| **paper-texture-enabled** | true | true | false | false |
| **scanline-enabled** | true | optional | false | false |
| **scanline-opacity** | 0.06 | 0.03 | 0.0 | 0.0 |
| **padding-scale** | 1.0 | 1.0 | 1.25 | 1.25 |
| **scrollbar-width** | 12px (styled) | 12px (styled) | 8px (system-like) | 8px (system-like) |

### 6.3 Retro Effects Implementation

**Pixel grid and paper texture:** Generated as tiled images from Rust at startup using `SharedPixelBuffer`. Applied via `Image` elements with appropriate tiling. Do NOT use `RenderingNotifier` -- use `SharedPixelBuffer` as it is backend-agnostic and simpler.

**Important:** `ImageFit.repeat` may not exist in Slint 1.15.1. If unavailable, tile the image manually using a `GridLayout` or `Flickable` with repeated `Image` elements, or generate a single large tile that covers the viewport.

**Conditional overlays:** Paper texture and pixel grid are optional overlay components at the root, bound to `Theme.retro-effects-enabled`. Implementations must not branch component logic on theme; only the presence/absence of these overlay nodes changes.

```slint
if Theme.retro-effects-enabled: PixelGridOverlay {
    opacity: Theme.pixel-grid-opacity;
}
if Theme.retro-effects-enabled && Theme.paper-texture-enabled: PaperTextureOverlay { }
```

### 6.4 Theme Switching

- **Live switch** for colors, spacing, borders, overlays: Slint's reactive property system propagates changes instantly
- **Restart required** for font family change: Switching between Retro (Orbitron/Rajdhani) and Basic (system fonts) requires app restart because Slint loads fonts at initialization
- **Within same family is live:** Switching between Retro Dark and Retro Light is instant (same fonts)

### 6.5 Slint Implementation

```slint
export enum ThemeMode { retro-dark, retro-light, basic-light, basic-dark }

export global Theme {
    in property <ThemeMode> mode: retro-dark;
    in property <color> background: #0a0a1a;
    in property <color> surface: #1a1a2e;
    in property <color> surface-elevated: #252540;
    in property <color> text-primary: #e8e0d0;
    in property <color> text-secondary: #a0a0a0;
    in property <color> text-muted: #666666;
    in property <color> border: #e8e0d050;
    in property <color> border-light: #333333;
    in property <color> accent-blue: #00d4ff;
    in property <color> accent-magenta: #ff2d9b;
    in property <color> accent-lime: #b4ff39;
    in property <color> accent-orange: #ff8c00;
    in property <bool> retro-effects-enabled: true;
    in property <float> pixel-grid-opacity: 0.09;
    in property <float> scanline-opacity: 0.06;
    in property <bool> paper-texture-enabled: true;
    in property <length> border-width: 2px;
    in property <length> border-radius: 0px;
    in property <float> padding-scale: 1.0;
    in property <length> scrollbar-width: 12px;
    in property <float> line-height-scale: 1.4;
    in property <length> base-font-size: 14px;
}
```

A Rust-side `ThemeVariant` enum applies all tokens to the global at runtime:

```rust
pub enum ThemeVariant { RetroDark, RetroLight, BasicLight, BasicDark }

impl ThemeVariant {
    pub fn apply_to(&self, ui: &AppWindow) {
        match self {
            ThemeVariant::RetroDark => { /* set all dark retro tokens */ }
            ThemeVariant::RetroLight => { /* set all light retro tokens */ }
            ThemeVariant::BasicLight => { /* set all basic light tokens, disable effects */ }
            ThemeVariant::BasicDark => { /* set all basic dark tokens, disable effects */ }
        }
    }
}
```

### 6.6 Theme Extensibility Architecture (MVP)

The architecture supports unlimited user-created themes beyond the four built-in variants.

**Built-in themes (ship with app):**
- Retro Dark, Retro Light, Basic Light, Basic Dark (the four variants in §6.1-6.2)

**Custom theme file format:** Custom themes are defined as TOML files in `~/.puppet-master/themes/<name>.toml`. Each file specifies token overrides; any token not specified inherits from the base theme (Basic Dark or Basic Light, chosen by a `base` field).

```toml
[meta]
name = "Solarized Dark"
author = "User"
base = "basic-dark"          # inherit unset tokens from this variant
version = "1.0"

[colors]
background = "#002b36"
surface = "#073642"
surface-elevated = "#0a4050"
text-primary = "#839496"
text-secondary = "#657b83"
accent-blue = "#268bd2"
accent-magenta = "#d33682"
accent-lime = "#859900"
accent-orange = "#cb4b16"

[effects]
retro-effects-enabled = false
pixel-grid-opacity = 0.0
border-width = 1
border-radius = 4

[fonts]
# omitted = inherit from base
# display-font = "CustomFont"  # requires font file in ~/.puppet-master/fonts/
```

**Theme loading and validation:**
- On startup, scan `~/.puppet-master/themes/` for `.toml` files
- Parse and validate each file against the token schema (§6.2). Invalid files log a warning and are skipped (not loaded); user sees a toast on Settings open: "Theme '{name}' has errors -- see log for details"
- Valid custom themes appear in the theme selector (Settings > General and title bar toggle) alongside built-in themes
- **Hot reload:** Editing a theme TOML file while the app is running triggers a re-scan (via file watcher on the themes directory). If the currently active theme is modified, changes apply immediately (same as live theme switch within a family). If font changes are detected, prompt for restart.

**Theme selector UI:**
- Title bar theme toggle becomes a dropdown when >4 themes are available (built-in + custom)
- Each entry shows: theme name, color swatch preview (4 circles: background, surface, accent-blue, accent-lime), author (for custom), "[built-in]" or "[custom]" badge
- "Manage themes" link at bottom opens Settings > General > Themes section
- Settings > General includes: theme dropdown, "Open themes folder" button (opens `~/.puppet-master/themes/` in system file manager), "Create new theme" button (copies a template TOML to the themes folder and opens it in File Editor), "Import theme" button (file picker for .toml), "Export theme" button (saves current token values as .toml)

**Custom font support:** Custom themes can reference font files placed in `~/.puppet-master/fonts/`. Font files (.ttf, .otf, .woff2) are loaded at startup. A theme TOML referencing a missing font falls back to the base theme's font and shows a warning toast.

**Theme preview:** When hovering over a theme in the selector dropdown, show a live preview of the theme applied to a small widget card (button, text, border sample). On click, apply the theme. This allows users to preview without committing.

### 6.7 WCAG Compliance

- **Retro themes:** Prioritize aesthetic over strict WCAG AA compliance for accent colors (e.g., ACID_LIME on dark backgrounds may not meet 4.5:1)
- **Basic theme:** MUST meet WCAG 2.1 AA for all text and interactive elements (4.5:1 minimum contrast for normal text, 3:1 for large text). Basic accent colors are muted specifically to meet this requirement

---

## 7. Views Specification

### 7.1 View Inventory (21 views/panels + 6 bottom panel tabs)

| # | View | Group | Type | Status |
|---|------|-------|------|--------|
| 1 | Dashboard | Home | Primary content | Existing (redesigned) |
| 2 | Projects | Home | Primary content | Existing (expanded: language detection, health) |
| 3 | Wizard | Run | Primary content | Existing (step 0-9) |
| 4 | Interview | Run | Primary content | Existing |
| 5 | Tiers | Run | Primary content | Existing |
| 6 | Settings | Settings | Primary content | **NEW** (merged: old Config + old Settings + Login + Doctor; 20 tabs in 5 groups) |
| 7 | Usage | Data | Primary content | **NEW** |
| 8 | Metrics | Data | Primary content | Existing |
| 9 | Evidence | Data | Primary content | Existing |
| 10 | EvidenceDetail | Data | Primary content | Existing |
| 11 | History | Data | Primary content | Existing |
| 12 | Ledger | Data | Primary content | Existing |
| 13 | Memory | Data | Primary content | Existing |
| 14 | Coverage | Data | Primary content | Existing |
| 15 | Setup | Run | Primary content | Existing |
| 16 | Chat | -- | Side panel | **NEW** |
| 17 | FileManager | -- | Side panel | **NEW** |
| 18 | FileEditor | -- | Primary content | **NEW** (+ instructions editor, SSH remote) |
| 19 | AgentActivity | -- | Embedded pane | **NEW** |
| 20 | BottomPanel | -- | Bottom panel | **NEW** (Terminal/Problems/Output/Ports/Browser/Debug) |
| 21 | NotFound | -- | Primary content | Existing |

### 7.2 Dashboard

**Group:** Home | **Location:** Primary content

The Dashboard is the operational hub. It uses a rearrangeable card grid.

**Widget cards:**
- **Orchestrator Status:** Status badge (Running/Paused/Idle/Error) + controls (Start, Pause, Resume, Stop, Reset)
- **Current Task:** Current tier, item name, platform, model
- **Progress:** Phase/task/subtask progress bars (3 bars)
- **Budgets:** Per-platform budget donut charts (used/total tokens, color-coded by usage %)
- **Calls to Action (CtAs):** HITL approval prompts, warnings, "Continue in Chat" buttons
- **Terminal Output:** Embedded scrollable terminal (last N lines; stdout=lime, stderr=magenta, info=orange)
- **Interview Panel:** Compact interview progress (visible when interview is active)
- **Error Display:** Red error box with message (visible when error exists)

**Card grid:**
- 2 columns at <1200px, 3 at 1200-1600px, 4 at >1600px
- Each card has a 4px drag handle (crosshatch pattern) in top-left corner
- Drag a card to swap positions with another
- Card order persisted in redb under `dashboard_layout:v1`

**Controls:** START, PAUSE, RESUME, STOP, RESET buttons with visual state feedback (see §10.1 Button Feedback). Retry/Replan/Reopen per-item buttons. Kill process button (if running).

**Calls to Action (CtA) cards:** CtA cards have accent-left-border (4px), elevated surface background, and a prominent action button. Types:
- **HITL approval:** "Phase X complete -- approval required" with evidence summary, "Approve & Continue" (primary) and "Reject" (secondary) buttons. Badge on activity bar when active.
- **Run interrupted:** "Previous run was interrupted" with "Resume from checkpoint" and "Start fresh" buttons.
- **Rate limit:** "Platform X rate limited -- resets in 2h 15m" with "Switch platform" button.
- **Warning:** Orange-border card for non-blocking issues (stale data, missing config).
Multiple CtAs stack vertically in priority order (HITL > interrupted > rate limit > warnings).

**HITL-to-Chat handoff:** When an HITL approval CtA is shown, clicking "Approve & Continue" or "Reject" can optionally spawn a new Chat thread named after the approval prompt (e.g., "Phase 2 Approval"). This allows the user to discuss the approval decision with the assistant before confirming. The "Continue in Assistant" button on any orchestrator CtA injects the current run context into a new Chat thread for interactive follow-up.

**Orchestrator subagent indicator:** When subagents are active during tier execution, the Current Task card shows "> 2 subagents active" with platform/model badges per subagent. Crew execution shows crew member list with per-member status dots (green=active, gray=waiting, red=error).

**Platform quota display:** Dashboard card showing per-platform quota status. Format: "Codex: 2/5 crews active, 45/100 quota remaining" (numbers are illustrative). Color-coded: green (plenty remaining), amber (>70% used), red (>90% used or rate-limited). Links to Usage page for details.

**Stream event visualization:** During active runs, a compact icon strip shows live events as they occur (e.g., file read icon, bash icon, search icon, edit icon). Each icon has a tooltip showing the event detail (e.g., "Read: src/app.rs"). Icons fade in with 100ms ease-out. Strip is below the Current Task card.

**Duration timers:** When the orchestrator or a subagent is running, show per-segment elapsed time in the Current Task card: "Thinking: 0:12", "Bash: 0:45", "Total: 1:23". Updates every second via `invoke_from_event_loop`. Paused segments show accumulated time without incrementing.

**Background runs panel:** When runs are executing in background threads, a collapsible "Background Runs" card lists active runs: thread name, status (running/paused/queued), elapsed time, and actions: "Cancel" (confirmation modal) and "View diff" (opens File Editor diff view showing all changes from this run). Completed runs show "View diff" and "Restore point" buttons.

**Restore point preview:** Before confirming a rollback to a restore point, show a diff preview: list of files that will change, with +/- line counts. "Confirm rollback" and "Cancel" buttons. Rollback uses Git restore point.

**Rate-limit alert banner:** Non-intrusive warning banner at the top of primary content area when any platform is approaching its usage limit (configurable threshold, default 80%). Format: "[!] Codex usage at 85% -- resets in 2h 15m [Switch platform] [Dismiss]". Banner uses amber background. Dismissing hides for 1 hour (or until next threshold crossing).

**Config migration dialog:** On version upgrade, if new config fields are introduced, show a one-time modal: "Settings updated for v{version}" with a summary of new options. "View new settings" opens Settings page filtered to new fields. "OK" dismisses. Non-blocking (app is usable behind the modal).

**Version update banner:** When a new app version is available, show a dismissible banner: "Puppet Master v{new_version} available [Update now] [Later]". "Update now" opens the relevant update mechanism. "Later" dismisses until next launch.

**FileSafe status:** Optional compact card showing guard count ("FileSafe: 3/3 guards active") with link to Settings > Advanced > FileSafe.

### 7.3 Projects

**Group:** Home | **Location:** Primary content

Project management and switching. Shows project list with status indicators, current project info. Controls for creating, opening, and switching projects.

**Project list layout:**
- Table/card list: project name, path, language badge(s), last opened, orchestrator status (idle/running/paused), health indicator
- Sort by: name, last opened, status
- Filter by: language, status
- Actions per row: Open, Edit settings, Remove (does not delete files, just un-registers), Archive
- "Add project" button: opens native folder picker; validates the selected directory (checks for git init, detects language)

**Language/framework auto-detection (MVP):** On project open or add, Puppet Master scans the project root (max depth 3) for language markers and displays detected languages as badges in the project header and project list.

**Detection rules (evaluated in order, all matches shown):**

| Marker File(s) | Detected Language/Framework | Badge Text |
|---------------|-----------------------------|------------|
| `Cargo.toml` | Rust | `Rust` |
| `package.json` | JavaScript/TypeScript | `JS/TS` |
| `tsconfig.json` | TypeScript | `TypeScript` |
| `pyproject.toml`, `setup.py`, `requirements.txt` | Python | `Python` |
| `go.mod` | Go | `Go` |
| `pom.xml`, `build.gradle`, `build.gradle.kts` | Java/Kotlin | `Java` or `Kotlin` |
| `*.csproj`, `*.sln` | C# / .NET | `C#` |
| `Gemfile` | Ruby | `Ruby` |
| `Package.swift` | Swift | `Swift` |
| `mix.exs` | Elixir | `Elixir` |
| `composer.json` | PHP | `PHP` |
| `CMakeLists.txt`, `Makefile` | C/C++ | `C/C++` |
| `Dockerfile` | Docker | `Docker` |
| `.slint` files | Slint | `Slint` |

**Detection behavior:**
- Runs on project open (async, non-blocking). Results cached in redb per project; re-scanned on explicit refresh or when file watcher detects marker file changes.
- **Badge display:** Language badges appear in the project header bar (below the breadcrumb, next to the project name). Each badge is a small pill: language icon + name, using `Theme.accent-blue` background. Multiple badges for polyglot projects (e.g., a Rust project with Docker and TypeScript tooling shows all three).
- **Auto-suggested tool presets:** On detection, Puppet Master pre-selects relevant LSP servers (e.g., detect Rust -> enable rust-analyzer in Settings > LSP). Also suggests relevant skills if any match the detected language. Suggestions appear as a one-time dismissible banner: "Detected Rust project -- rust-analyzer enabled [View LSP settings] [Dismiss]".
- **Interview integration:** Detected languages are passed to the Interview system so that questions about tech stack can be pre-populated. The Interview "Technology" phase shows detected languages as pre-filled chips that the user can confirm or edit.
- **Manual override:** User can manually add or remove language tags in the project settings (accessible from the project dropdown or Projects page). Manual tags are stored alongside auto-detected ones; manual removals suppress auto-detection for that language until the user re-enables.

**Project health indicators:**
- Green dot: project directory exists, git repo intact, config valid
- Amber dot: stale config (schema version mismatch), missing optional files
- Red dot: project directory missing, git repo corrupt, critical config errors
- Tooltip on hover shows specific health details

### 7.4 Settings (Unified)

**Group:** Settings | **Location:** Primary content

This is a **heavily redesigned** unified settings page that merges four previously separate views. It uses a tabbed interface.

**Tabs:**

| Tab | Content | Source |
|-----|---------|--------|
| **General** | Log level, auto-scroll, show timestamps, minimize to tray, start on boot, retention days, intensive logging, interaction mode (expert/eli5), UI scale (0.75-1.5), app-level ELI5 toggle (longer/simpler tooltips), max editor tabs (LRU cap, default 20), run-complete notification toggle, max concurrent runs per thread (default 10), **sound effects** toggle (default off; see §10.13), max terminal instances (default 12, range 4-20), max browser tabs (default 8, range 2-12), hot-reload debounce (default 500ms, range 100-5000ms), **theme management** section (theme selector dropdown, "Open themes folder", "Create new theme", "Import theme", "Export theme" -- see §6.6) | Old "Settings" view + newfeatures.md |
| **Tiers** | Phase/task/subtask tier configuration; per-tier: platform (**dropdown**), model (**dropdown**), reasoning_effort, plan_mode, ask_mode, output_format | Old "Config" Tiers tab |
| **Branching** | **Enable Git** toggle (bound to `orchestrator.enable_git`; tooltip: "Enable git branch creation, commits, and PR creation during runs"); **Auto PR** toggle (bound to `branching.auto_pr`); **Branch strategy** dropdown: MainOnly / Feature / Release (bound to `branching.strategy`); **Use worktrees** toggle; **Parallel execution** toggle (note: "Parallel subtasks use separate git worktrees"); **Granularity** dropdown or label mapped to BranchStrategy (per_phase / per_task / per_subtask); Git info display (user, email, remote, branch -- resolved for active project, not CWD) | Old "Config" Branching tab |
| **Verification** | Verification checks, screenshot toggles | Old "Config" Verification tab |
| **Memory** | Multi-level memory with progress/agents/PRD file paths | Old "Config" Memory tab |
| **Budgets** | Per-platform token budgets | Old "Config" Budgets tab |
| **Advanced** | **FileSafe Guards** (collapsible card): three independent toggles -- "Block destructive commands" (on/off), "Restrict writes to plan" (on/off), "Block sensitive files" (on/off); approved commands list (scrollable, per-row remove, optional manual add); override toggle with warning styling. **MCP Configuration** (collapsible card): per-platform MCP toggles for **all five platforms** (Cursor, Codex, Claude Code, Gemini, Copilot), MCP server list (add/edit/remove servers with name/command/args/env fields), "Test connection" button per server, Context7 API key input (password-style), web search provider selection and API key. **Tool permissions** (collapsible card, see §7.4.1): per-tool or wildcard allow/deny/ask; optional presets (Read-only, Plan mode, Full); list built-in + MCP-discovered tools with permission dropdown per row; bound to central tool registry per Plans/Tools.md. **Other:** Experimental features, sub-agent toggles, cleanup config (clean untracked before run, clean ignored files, clear agent-output dir, evidence retention days) | Old "Config" Advanced tab + newtools.md + FileSafe.md + Tools.md + MiscPlan.md |
| **LSP** | **Language Server Protocol (MVP)** (see §7.4.2): LSP is required for desktop release. Global "Disable automatic LSP server downloads" toggle; built-in servers list with per-server enable/disable (all on by default); per-server env vars and initialization options; custom LSP servers (add/edit/remove: command, extensions, env, initialization). Stored in app config (redb); project overrides optional. | Plans/LSPSupport.md |
| **Interview** | Interview-specific config; enable_phase_subagents, enable_research_subagents, enable_validation_subagents, enable_document_subagents; **Multi-Pass Review:** toggle on/off (default off), number of review passes (1-5 dropdown, default 2), max review subagents (1-10, default 3), show warning label when enabled ("Increases cost and time"); min/max questions (spinners), architecture confirmation toggle, vision provider dropdown | Old "Config" Interview tab + interview-subagent-integration.md |
| **Authentication** | Per-platform auth status (6 platforms: Cursor, Codex, Claude, Gemini, Copilot, GitHub); login/logout buttons; auth method indicators; auth URLs (selectable/copyable); Git info (user, email, remote, branch); CLI setup; GitHub auth | Old "Login" view |
| **Health** | System health checks with platform filtering; check categories (CLI Tools, Git, Runtimes, Browser Tools, Capabilities, Project Setup); check status (PASS/FAIL/WARN/SKIP); fix suggestions with dry-run; auto-install buttons; platform version display (CLI version per detected platform); **Worktree management:** worktree list (path, branch, status, age columns), "Recover orphaned worktrees" button, worktree status indicators (active/stale/orphaned); **Storage & Cleanup:** DB size, cache size, evidence log count; evidence retention days input; "Clean workspace now" button (confirm modal with preview of files to delete per MiscPlan.md); storage maintenance actions | Old "Doctor" view + WorktreeGitImprovement.md + MiscPlan.md |
| **Rules & Commands** | Application rules (list or text area, editable); project rules (when project selected, reads/writes `.puppet-master/project-rules.md`); custom slash commands editor (application-wide and project-wide, name/description/action) | From agent-rules-context.md + feature-list.md |
| **Shortcuts** | Full keyboard shortcut table (action name, current binding, default binding); search/filter by action name or key; per-row "Change" button (captures next key combination) and "Reset" button; "Reset all" button; export/import shortcuts (JSON). Data sourced from shortcut registry (single source of truth, DRY:DATA). | MiscPlan.md |
| **Skills** | Discover and manage SKILL.md files (project-level from `.puppet-master/skills/` and global from `~/.puppet-master/skills/`). Table: skill name, description, source (project/global), permission (Allow/Deny/Ask dropdown per row). Actions: Add, Edit (opens in File Editor), Remove, "Refresh" (re-scan disk). Bulk permission by pattern (e.g., "Allow all doc-*"). Preview skill body on row expand. | MiscPlan.md |
| **Catalog** | Browse and install community content: commands, agents, hooks, skills, themes, and MCP server configs from a curated catalog. See §7.4.3. | feature-list.md |
| **Sync** | Export, import, and sync app configuration across machines. See §7.4.4. | feature-list.md |
| **SSH** | Manage SSH connections for remote editing. See §7.4.5. | FileManager.md |
| **Debug** | Debug adapter configuration and run/debug profiles. See §7.4.6. | FileManager.md |
| **HITL** | Three independent toggles: pause at phase/task/subtask completion; explanation of each level; all off by default | From human-in-the-loop.md |
| **YAML** | Raw YAML editor for full config | Old "Config" YAML tab |

**Tab sub-grouping:** With 20 tabs, use a two-level navigation: left sidebar within Settings for groups, right area for the selected tab's content. Group labels act as collapsible section headers in the sidebar. Groups: **Core** (General, Tiers, Branching) | **Features** (Verification, Memory, Budgets, Advanced, Interview, LSP) | **System** (Authentication, Health, Rules & Commands, Shortcuts, Skills, HITL) | **Extensions** (Catalog, Sync, SSH, Debug) | **Raw** (YAML). Each group header shows item count badge. Clicking a group header expands/collapses that group in the sidebar. Active tab highlighted with accent-left-border (3px).

**§7.4.2 LSP (LSP tab):** LSP support is **MVP** (required for desktop release), not optional. Per Plans/LSPSupport.md, the GUI must expose full LSP configuration so users can control automatic downloads, enable/disable servers, set env and initialization options, and add custom servers. Provide **Settings > LSP** with:

- **Disable automatic LSP server downloads** -- Global toggle (default: off). When on, the app does not auto-download or auto-install any LSP server (equivalent to `OPENCODE_DISABLE_LSP_DOWNLOAD=true`). Servers already on PATH or already installed are still used.
- **Built-in LSP servers** -- A list of all built-in servers (see Plans/LSPSupport.md §3.2: astro, bash, clangd, csharp, clojure-lsp, dart, deno, elixir-ls, eslint, fsharp, gleam, gopls, hls, jdtls, julials, kotlin-ls, lua-ls, nixd, ocaml-lsp, oxlint, php intelephense, prisma, pyright, ruby-lsp, rust, slint-lsp, sourcekit-lsp, svelte, terraform, tinymist, typescript, vue, yaml-ls, zls). Each row shows: **server name** (and extensions hint), **Enable** toggle (default: **on** for all). User can turn any server off individually. Expanding a row (or opening "Configure") shows:
  - **Environment variables** -- Key-value list (e.g. `RUST_LOG` = `debug`). Optional; sent when starting that server.
  - **Initialization options** -- Key-value or JSON object; server-specific options sent in the LSP `initialize` request (e.g. TypeScript preferences). Optional.
- **Custom LSP servers** -- Section "Custom LSP servers" with **Add** button. Each custom entry has: **Name** (id), **Command** (array of strings, e.g. `["npx", "godot-lsp-stdio-bridge"]` or `["custom-lsp-server", "--stdio"]`), **Extensions** (comma-separated or list, e.g. `.gd`, `.gdshader`), and optionally **Environment variables** and **Initialization options** (same as built-in). Edit and Remove per row. Custom servers are in addition to built-in; same config schema (command, extensions, env, initialization) as OpenCode.

**Custom LSP server validation:** When adding or editing a custom server, enforce: (1) **Command** must be non-empty (at least one string; trim whitespace). If empty, show inline error "Command is required" and disable Save/Apply. (2) **Extensions** must be non-empty (at least one extension, e.g. `.gd`). If empty, show inline error "At least one file extension is required" and disable Save/Apply. (3) **Name** (id) must be unique among custom servers; if duplicate, show "Name already used" and disable Save/Apply. Saving or applying with invalid fields is not allowed; user must correct before persisting.

**Initialization options (JSON):** When the user edits **Initialization options** as JSON (e.g. raw text area or "Edit as JSON" for built-in/custom servers), validate on blur or on Save. If the value is **invalid JSON** (parse error): show an inline error message (e.g. "Invalid JSON: unexpected token at line N") and do **not** persist the invalid value. Optionally preserve the user's text in the editor so they can fix it; on next valid parse, clear the error and allow Save. If the user leaves the field with invalid JSON and clicks Save, block save and focus the field with the error message. Do not send invalid JSON to the LSP server at startup (use last known valid value or empty object).

All LSP settings are persisted in app config (redb or equivalent). Optional: project-level overrides (e.g. `.puppet-master/lsp.json` or project key in redb) so a project can disable a server or add a custom server for that project only; document merge rules (project overrides app) in implementation.

**§7.4.1 Tool permissions (Advanced tab):** Per Plans/Tools.md, the GUI must expose the tool permission model (allow / deny / ask) so users can control which tools the agent may use without approval, require approval for, or disable. Provide a **Tool permissions** collapsible card under Settings > Advanced with: (1) **Presets** (optional): dropdown or buttons for "Read-only" (deny edit, bash, webfetch, websearch), "Plan mode" (allow read/grep/glob/list only), "Full" (allow all with ask for bash/edit); (2) **Per-tool list**: table or list of tools (built-in canonical names + discovered MCP/custom tools when available), each with a permission dropdown (Allow | Deny | Ask); (3) **Wildcard rules** (optional): add rule e.g. `mymcp_*: Ask` for all tools from a server. Stored in same config as other Settings; run config reads it for the central tool registry. Tool list may be populated from registry at load time; MCP tools appear when MCP servers are enabled. If the registry is not yet available (pre-rewrite), a minimal UI can show built-in tools only (bash, edit, read, grep, glob, list, webfetch, websearch, question, etc.) with Allow/Deny/Ask per row.

**Critical form control requirements:**
- **Model selection MUST use dropdowns** populated from dynamic model discovery, NOT text entry boxes
- **Platform selection MUST use dropdowns** listing available platforms
- All configuration that accepts one of N choices must use `ComboBox` or equivalent dropdown, not free-text `TextInput`
- Save/discard controls per tab or global

**§7.4.3 Catalog (Catalog tab):** Browse and install community content from a curated catalog. The catalog provides one-click installation for commands, agents, hooks, skills, themes, and MCP server configurations.

**Catalog UI layout:**
- **Search bar** at top with real-time filtering (debounced 200ms). Search across name, description, tags.
- **Category tabs** below search: All | Commands | Agents | Hooks | Skills | Themes | MCP Servers
- **Content grid:** Card-based layout (3 columns at >1200px, 2 at 800-1200px, 1 at <800px). Each card shows:
  - Item name (bold), author, version, short description (2 lines max, truncated with ellipsis)
  - Category badge (color-coded per category)
  - Star rating or download count (if available from catalog service)
  - Install/Installed status: "Install" button (primary) or "Installed v1.2" label with "Update" button (if newer version available) and "Remove" button
  - Click card to expand: full description, changelog, compatibility info, file list, "View source" link
- **Catalog source:** Reads from a bundled index file (`~/.puppet-master/catalog/index.json`) that is refreshed periodically (default: daily, configurable). "Refresh catalog" button forces re-download. If no network: show last cached index with "Catalog may be outdated" banner.
- **Install flow:** Click "Install" -> confirmation modal showing what will be installed (files, permissions needed) -> progress bar -> success toast "Installed {name} v{version}" or error toast with details. Installed items appear in their respective Settings tabs (e.g., installed skills show in Skills tab, installed themes show in theme selector).
- **Conflict handling:** If an installed item conflicts with an existing local item (same name), show conflict resolution: "A skill named '{name}' already exists locally. [Replace] [Keep both (rename)] [Cancel]".
- **Empty state:** "Catalog is empty -- check your network connection or refresh" with "Refresh" button.

**§7.4.4 Sync (Sync tab):** Export, import, and sync app configuration, custom commands, shortcuts, themes, and skills across machines.

**Sync UI:**
- **Export section:**
  - "Export configuration bundle" button. Opens a checklist modal where the user selects what to include: General settings, Tier configuration, Keyboard shortcuts, Custom commands, Skills, Themes, MCP server configs, LSP settings, Tool permissions, Rules. Each item shows a size estimate.
  - Export format: `.pm-bundle` file (ZIP archive containing TOML/JSON config files + asset files). Filename auto-generated: `puppet-master-config-{date}.pm-bundle`.
  - "Export" button generates the bundle and opens a native Save dialog.
- **Import section:**
  - "Import configuration bundle" button. Opens native file picker filtered to `.pm-bundle` files.
  - On import: parse bundle, show contents preview (list of config sections with current vs imported values summary). Per-section toggles: include/exclude each section from import.
  - **Conflict resolution:** For each conflicting item (e.g., a shortcut that differs from current), show side-by-side comparison: "Current: Ctrl+K -> Command palette" vs "Imported: Ctrl+K -> Search files". Options per conflict: [Keep current] [Use imported] [Keep both]. "Apply to all similar" checkbox.
  - "Apply" button merges selected sections. Progress indicator. Success toast with summary: "Imported: 3 shortcuts, 5 skills, 1 theme. Skipped: 2 conflicts (kept current)."
  - **Backup:** Before import, auto-create a backup of current config in `~/.puppet-master/backups/pre-import-{timestamp}.pm-bundle`. Show "Undo import" button in success toast (restores from backup).
- **Sync status:** Shows last export date, last import date, and bundle file path (if saved locally). No cloud sync in MVP -- file-based only.

**§7.4.5 SSH (SSH tab):** Manage SSH connections for remote file editing. When an SSH connection is active, the File Manager and File Editor can browse and edit files on the remote host.

**SSH UI:**
- **Connection list:** Table of saved SSH connections. Columns: name (user-assigned), host, port, username, auth method (key/password), status (connected/disconnected/error). Actions per row: Connect, Disconnect, Edit, Remove.
- **Add connection form:** Name (text input), Host (text input, required), Port (number input, default 22), Username (text input, required), Authentication method (radio: SSH key file / Password / SSH agent):
  - SSH key file: file picker for private key path, optional passphrase (password input)
  - Password: password input (stored securely in system keychain, not in plain text config)
  - SSH agent: auto-detect available keys from running SSH agent
- **Connection testing:** "Test connection" button (shows spinner -> "Connected successfully" or error message with details). Test must pass before saving.
- **Remote file browsing:** When connected, the File Manager (§7.17) gains a "Remote" toggle or dropdown at the top showing available connections. Selecting a remote connection switches the file tree to browse the remote host's filesystem. Path navigation shows `[remote-name]:/path/to/dir` prefix. File operations (open, save, create, delete, rename) are proxied over SSH/SFTP.
- **Editor integration:** Files opened from a remote connection show a `[SSH: remote-name]` badge in the editor tab. Save operations write back via SFTP. Unsaved changes are buffered locally; if connection drops, show warning banner: "Connection lost -- changes saved locally. Reconnect to sync." with "Reconnect" button.
- **Latency indicator:** Status bar shows SSH connection latency (e.g., "SSH: dev-server 45ms"). High latency (>500ms) shows amber indicator; connection errors show red.
- **Security:** Private keys never leave the local machine. Passwords stored in OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service). SSH host key verification with known_hosts management. First-connection fingerprint prompt: "Unknown host {host}. Fingerprint: {fingerprint}. [Trust and connect] [Cancel]".
- **Persistence:** Connection profiles saved in redb (minus passwords, which go to system keychain). Last-connected state restored on app launch (auto-reconnect configurable, default off).

**§7.4.6 Debug (Debug tab in Settings):** Configure debug adapters and default run/debug settings.

**Debug settings UI:**
- **Debug adapters:** Table of available debug adapters. Columns: adapter name, type, supported languages, path, status (installed/not found). Built-in adapters: codelldb (Rust, C, C++), debugpy (Python), node-debug (JavaScript, TypeScript). Per-row actions: Configure (set path, env vars), Remove (custom only). "Add custom adapter" button: name, type, command (path to adapter executable), supported language extensions, environment variables.
- **Default configurations:** Template run/debug configurations that are copied to new projects. Each template: name, type (launch/attach), default program/command pattern, default arguments, default environment variables, default working directory, pre-launch task.
- **Breakpoint settings:** Global preferences: break on uncaught exceptions (toggle, default on), break on caught exceptions (toggle, default off), max breakpoints per file (default 50).
- **Auto-detect adapters:** "Scan for adapters" button checks PATH and common install locations for known debug adapter binaries. Found adapters are auto-configured. Scan results shown in a modal: "[checkmark] codelldb found at /usr/local/bin/codelldb" / "[x] debugpy not found -- install with pip install debugpy".
- **Integration:** Debug adapter settings feed into the Bottom Panel Debug tab (§7.20). Project-level `.puppet-master/launch.json` overrides these defaults per Plans/FileManager.md.

### 7.5 Wizard

**Group:** Run | **Location:** Primary content

Multi-step requirements wizard (10 steps: 0-9):
- Step 0: Project Setup (new/existing, GitHub repo creation, intent selection: New project / Fork & evolve / Enhance / Contribute PR)
- Step 1: Dependency Install (Node, GH CLI, platforms) -- NEW
- Step 2: Quick Interview Config (reasoning level, agents.md)
- Steps 3-8: PRD generation, tier configuration, tier planning
- Step 9: Final review and initialization

**Intent selection UI:** Four cards, each showing: intent name, one-line description, and themed icon. Selected card has accent border and filled background. Changing intent mid-flow triggers a confirmation modal: "Changing intent will clear requirements and interview progress. Continue?" with [Continue] and [Cancel] buttons.

**Project setup fields (intent-specific):**
- **New project:** Project path input; optional "Create GitHub repo" checkbox with sub-fields: repo name (pre-filled from project name), visibility (Public/Private radio), description (text input), .gitignore template (dropdown), license (dropdown: MIT, Apache 2.0, GPL-3.0, etc.), default branch (text input, default "main").
- **Fork & evolve / Contribute PR:** Upstream repo input (URL or owner/repo); "Create fork for me" or "I'll create the fork myself" radio; fork URL/path input when manual.
- **Contribute PR:** Feature branch name input (text input with auto-suggest from requirements slug; sanitized per git ref rules).

**Requirements step:** Upload files (max 10 files, max 5 MiB per file; drag-and-drop or file picker; list display with remove and reorder; reject oversized files with inline error). Requirements Doc Builder button opens Builder chat mode. First Builder Assistant message is exactly `What are you trying to do?`. Multiple uploads are concatenated in display order with separators. Builder output is appended after uploads.

**Builder conversation flow (required):**
- Turn definition: one Assistant message plus one user response.
- Suggest generation when enough context exists or after 6 completed turns. Suggestion does not auto-generate.
- User can continue conversation indefinitely until explicit generation confirmation.
- On generation confirmation, ask qualifying questions only for missing or thin checklist sections, then generate requirements doc + contract seed pack.
- Before Multi-Pass or handoff, ask: `Do you want to make any more changes or talk about it more?`

**Builder checklist status UI (derived from side structure):**
- Optional compact status row in requirements step or preview section:
  - `Scope`, `Goals`, `Out of scope`, `Acceptance criteria`, `Non-goals`
  - contract-seed sections when present: `Assumptions`, `Constraints`, `Glossary`, `Non-functional budgets`
- Status values: `filled`, `thin`, `empty`.

**Agent activity view:** Embedded read-only pane (monospace font, min 120px height, max ~500 visible lines virtualized) showing streaming agent output during doc generation and Multi-Pass Review. Shows prompts, model responses, subagent reports in real-time.

**Progress status strip:** Single line above or below the agent activity pane. Left side: current step text (e.g., "Review pass 2 of 3 -- 2 subagents active"). Right side: determinate progress bar when total is known (e.g., 5/8 documents). Stale detection: after 30 seconds with no update, show "Progress stalled -- last update 30s ago" in amber.

**Run states:** idle, generating, reviewing (with pass/round and subagents active count), paused, cancelling, cancelled, interrupted, complete, error.

**Pause/Cancel/Resume controls:** Single toolbar row below the agent activity pane.
- **Pause:** Takes effect at next handoff boundary; in-flight subagents complete; no new subagents spawned. Button disabled when not running.
- **Cancel:** Confirmation modal: "Stop this run? No changes will be applied." [Stop run] [Keep running]. Transitions to cancelling then cancelled. Toast: "Run cancelled -- no changes applied."
- **Resume:** Continues from persisted checkpoint. Toast: "Resuming..." then "Run resumed."

**Multi-Pass Review approval UI:** When review completes, show findings summary first (gaps, consistency issues, missing information, applied changes, unresolved items) in the preview section and in chat. Then show one final approval gate:
- **Accept:** Set revised bundle as canonical and continue.
- **Reject:** Discard revised bundle and keep original bundle as canonical.
- **Edit:** Open revised bundle in File Editor or embedded document pane; on save, return to same final gate.
No per-document approval and no extra approval modes.

**Document review locations (required):**
- Chat summary includes three pointers after generation/revision:
  1. `Opened in editor`
  2. Clickable canonical file path
  3. Embedded document pane entry
- Full document bodies are not rendered in chat.

**Wizard layout with separate regions (required):**
- Primary content split includes:
  - workflow/step content,
  - embedded document pane (review/edit human-readable docs),
  - embedded agent activity pane (streaming progress only).
- Side-panel chat remains independent from both embedded panes.

**Step transitions:** Animated slide-left/slide-right (200ms ease-in-out) between steps. Back button returns to previous step without data loss.

**Recovery:** Wizard state is persisted per-project in redb (`wizard_state:v1:{project_id}`) including intent, current step, form data, and run checkpoint (run_type, run_id, phase, step_index, document_index, total_documents, subagent_tasks_done, checkpoint_version). On app restart with incomplete wizard, show a CtA card on Dashboard: "Resume wizard for {project}?" with "Resume" and "Start over" buttons. If checkpoint is missing or invalid version, show "Start over" only. "Resume" restores to the last completed step with all form data intact.

**Error handling:** Subagent crash/timeout: collect partial reports; if <50% complete, fail run and surface "Multi-Pass Review failed (too few reviews completed)"; otherwise continue with completed reports. Review agent fails: surface "Could not produce revised doc" with "Use original document" and "Retry" buttons. All subagent spawns fail: surface error with auth/model check suggestion.

### 7.6 Interview

**Group:** Run | **Location:** Primary content

Interactive requirements gathering with phase tracking, Q&A flow, reference materials. Also available as a Chat mode (Interview tab in Chat panel).

**Phase progress:** Horizontal stepper showing interview phases (Gather, Research, Validate, Document, Review). Each step shows completion percentage and elapsed time. Active phase pulses with accent color. Completed phases show green checkmark icon; errored phases show red X icon with "Retry phase" button.

**Adaptive phase selection:** Phases are selected based on intent and requirements (via AI phase selector or rule-based fallback). GUI shows a phase checklist (all phases listed with checkboxes; unchecked = skip). "Run all phases" toggle (default off) overrides and runs all phases at Full depth. Phase depth indicators: Full (all questions + research), Short (max 2 questions, no research), Skip (omitted).

**Question UI:** Each interview question shows: question text, suggested answer options as clickable chips/buttons, and a "Something else" text input bar for freeform answers. Thought stream toggle (show/hide the model's reasoning). Message strip showing conversation flow.

**Subagent activity:** When interview subagents are enabled (see Settings > Interview), show an "Agent Activity" card beneath the Q&A area listing active subagents (name, provider, model, current action, elapsed time). Progress spinner per active subagent. When Multi-Pass Review is active, show review round counter and per-reviewer status.

**Interview preview section (required):**
- Preview section shows Multi-Pass findings summary and one final approval gate.
- Final gate actions: `Accept | Reject | Edit`.
- Findings summary appears before final gate and is also posted in chat.

**Multi-Pass Review approval (Interview):**
- Single approval model only:
  - **Accept:** apply revised bundle and complete handoff.
  - **Reject:** discard revised bundle and complete handoff with original bundle.
  - **Edit:** open revised docs in File Editor or embedded document pane, then return to same final gate.

**Interview embedded document pane (required):**
- Interview page includes embedded document pane for interview artifacts (phase docs, PRD, AGENTS.md, and other human-readable project docs).
- Pane includes `Plan graph` as a read-only rendered view.
- Plan graph view shows notice: `Talk to Assistant to edit plan graph.`

**Remediation flow:** If validation fails, show a remediation panel: list of failed checks with severity, remediation suggestions, and "Fix & Re-validate" button. User can also skip individual checks with "Accept risk" (logged).

### 7.7 Tiers

**Group:** Run | **Location:** Primary content

Hierarchical tier tree (phase/task/subtask) with expandable nodes. Shows tier type, status, platform, model, and details per node.

### 7.8 Usage (NEW)

**Group:** Data | **Location:** Primary content

Dedicated usage view providing persistent visibility into platform quota and consumption.

**Sections:**

1. **Quota summary:** Per-platform 5h/7d usage vs limit (e.g., "5h: X / Y", "7d: X / Y"). Plan type shown where available. Per-platform labels (e.g., "Codex 5h", "Claude 7d", "Gemini quota") because semantics differ by platform.

2. **Alert thresholds:** Configurable warning threshold (70%, 80%, 90%). Warning when usage nears limit. Option to dismiss or quiet for N hours. Toast notification when approaching limit with option to switch platform/model.

3. **Ledger tab:** Event-level log (platform, operation, tokens in/out, cost, tier/session). Filtering by type, tier, session, date range. Export as JSON/CSV.

4. **Analytics tab (optional):** Aggregate usage by time window, platform, project, model. Cost tracking where available. Export current view.

5. **Reset countdown:** "Resets in 2h 15m" shown when reset time is available (from error parsing or API).

6. **Tool usage widget:** Card or section showing tool-level metrics from seglog rollups (per Plans/Tools.md and storage-plan analytics scan). Columns or list: **Tool name** (built-in + MCP/custom), **Invocation count** (in selected window), **Latency** (e.g. p50 / p95 ms or median), **Error rate** (failures / total, %). Optional: sort by count or error rate; filter by time window (5h / 7d / custom); expand row for breakdown by platform or session. Data from redb projections produced by analytics scan over tool events in seglog. Helps identify noisy or failing tools (e.g. repeated grep, MCP timeouts).

**Data sources:** Primary: seglog/redb rollups from analytics scan jobs. Fallback: aggregate from `usage.jsonl`. Platform APIs augment when env vars are set. Tool usage: same analytics scan rollups (tool latency, error counts per tool).

**Always-visible usage:** Status bar shows compact usage (e.g., "5h: 80% | 7d: 45%") for the selected platform. Dashboard budget widgets show donut charts.

### 7.9 Metrics

**Group:** Data | **Location:** Primary content

Aggregated session metrics: iterations, success rate, avg latency, token usage. Per-platform stats: models used, requests made, tokens consumed. Per-subtask breakdowns. Refresh button.

### 7.10 Evidence

**Group:** Data | **Location:** Primary content

Evidence browser with type filtering. List view with click-to-expand or hover-to-preview for details. EvidenceDetail shows full evidence item.

### 7.10.1 EvidenceDetail

**Group:** Data | **Location:** Primary content (drilldown from Evidence)

Full-screen view of a single evidence item. Shows:
- **Header:** Evidence type badge, timestamp, session/tier identifiers
- **Metadata table:** Platform, model, tokens used, duration, pass/fail status
- **Content:** Full evidence body (verification output, test results, build logs) in a scrollable monospace block
- **Attached files:** List of related files (screenshots, diffs) with click-to-open in File Editor
- **Actions:** Copy evidence ID, export as JSON, navigate to related tier/session in History view
- **Back navigation:** Breadcrumb (`Data > Evidence > [item name]`) plus Escape key returns to Evidence list preserving scroll position

### 7.11 History

**Group:** Data | **Location:** Primary content

Execution history with status filters and pagination. Shows session info, status, timestamps.

### 7.12 Ledger

**Group:** Data | **Location:** Primary content

Event ledger browser color-coded by event type. Filtering by type, tier, session. Export capability.

### 7.13 Memory

**Group:** Data | **Location:** Primary content

Memory/context state display. Shows memory sections (problem statement, tier plan, checkpoint data). Can load from external files (agents.md, PRD file, memory progress).

### 7.14 Coverage

**Group:** Data | **Location:** Primary content

Requirement coverage metrics by phase and category.

### 7.15 Setup

**Group:** Run | **Location:** Primary content

Platform installation status checks. Shows detected platforms and versions. Auto-install buttons for missing tools.

### 7.16 Chat Panel (NEW)

**Location:** Side panel (right by default, 240-480px, detachable)

**Structure:**

```
+------------------------------------------+
| [Chat] [Files]              [_] [pop] [x] |  Tab bar + panel controls
+------------------------------------------+
| [Ask] [Plan] [Int] [BS] [Crew]            |  Mode tabs (28px)
+------------------------------------------+
| v Thread: "Project X Plan"     [+]        |  Thread selector (24px)
+------------------------------------------+
|                                           |
|   MESSAGE STREAM                          |  Flex: fills available
|   (scrollable, virtualized)               |
|                                           |
|   +- Assistant -------------------------+ |
|   | [thinking >] collapsed              | |
|   | Response text here...               | |
|   | [Read: 3 files] [Changed: 1]        | |  Activity badges
|   +-------------------------------------+ |
|                                           |
+------------------------------------------+
| [Queued: "follow up msg"  edit send del]  |  Queue area (0-2 items)
+------------------------------------------+
| +------------------------------------+-+ |
| | Message input...              @  | S | |  Input (48-120px, auto-grow)
| |                               pin|   | |
| +------------------------------------+-+ |
+------------------------------------------+
| claude v | sonnet-4.5 v | 42k/128k [o]   |  Footer (20px)
+------------------------------------------+
```

**Mode tabs:** Ask | Plan | Interview | BrainStorm | Crew. Active tab has accent background + 2px bottom border.

**Mode details:**
- **Ask:** Read-only analysis mode. No file edits, no execution. Good for questions, explanations, code review.
- **Plan:** Creates a plan before execution. Three depth levels selectable via dropdown in plan panel header:
  - *Shallow:* Brief plan, minimal clarifying questions
  - *Regular:* Standard plan with clarifying questions and research
  - *Deep:* Comprehensive plan with extensive research and detailed clarifying questions
  Plan flow: Clarifying questions → Research → Plan + Todo → User approval → "Execute" button triggers execution via fresh processes. Plan panel updates progress in real-time. After execution, chat returns to normal Ask mode. "Add to queue" option available when invoked from Interview mode.
- **Interview:** Switches to interview flow with phase-based Q&A. Reduced phases when invoked from Chat (vs standalone Interview view). Questions show suggested answer chips (clickable buttons) and a "Something else" freeform text bar, matching the standalone Interview UI (§7.6). Thought stream toggle available. At end: "Do now" or "Add to queue" options. "Continue in Assistant" button from orchestrator context opens a new Chat thread with interview context pre-loaded.
- **BrainStorm:** Multi-model collaborative mode. Multiple subagents with shared context discuss and research before producing a unified plan. Subagents can communicate with each other before merging results. On "Execute," chat switches to Agent mode (single agent or crew executes the plan).
- **Crew:** Invokes a crew (multiple coordinated agents) with a Plan. Crew members work together on the plan. "Execute with crew" button after plan approval. Crew can work from existing or new plan; plan format is consumable by both single agents and crews.

**Teach capability:** The assistant can explain how Puppet Master works using built-in documentation (REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, platform CLI sections). Invoked via chat (e.g., "How does [X] work?") or `/teach` command. No separate UI -- runs within any chat mode.

**Thread selector:** Dropdown with current thread name and status dot (green=idle, blue=running, orange=queued). Click opens floating thread list overlay (max 300px wide) over message area with search, archive toggle, and [+] new thread. No permanent thread sidebar (panel too narrow).

**Thread management:**
- **New thread:** [+] button creates a new thread; inherits current platform/model/mode or defaults
- **Rename:** Double-click thread name in list; or right-click → Rename
- **Archive:** Right-click → Archive; archived threads hidden by default (toggle "Show archived" in thread list)
- **Delete:** Right-click → Delete; confirmation modal required ("This cannot be undone")
- **Resume:** Resume a previous thread, restoring its full conversation context
- **Rewind:** Restore thread to a specific message (right-click message → "Rewind to here"); all messages after that point are soft-deleted (recoverable via "Show removed")
- **Share/Export:** Right-click thread → Export; bundles thread as JSON (messages, plan, metadata); secrets are stripped automatically
- **Run-complete notification:** When a run completes in a background thread, that thread's tab shows an accent dot badge; optional toast notification ("Thread 'Project X' completed"). Notification behavior configurable in Settings/General (on/off)
- **Max concurrent runs:** Default 10 per thread; configurable in Settings/General. When limit reached, new runs are queued with a message "Run queued -- N runs active"

**Chat history search:** Search icon in thread list header opens a search bar that queries across all threads (human and assistant messages) via Tantivy index. Results show thread name, matching message preview, and timestamp. Click navigates to that message in its thread.

**Message stream:** Virtualized scrolling via `ListView`. User messages right-aligned with accent tint. Assistant messages left-aligned with surface background. 8px gap between messages. Thinking/reasoning: collapsible block with 2px left accent border, default collapsed; toggle to show/hide thinking for the entire thread. Activity transparency sections per assistant message (collapsible, default collapsed):
- **Bash/commands:** Collapsed: "Ran: `cargo test`" (one-line summary). Expanded: full command text + output. Each command is an audit trail entry.
- **Web search:** Collapsed: "Web search: 3 sources". Expanded: search query + list of URLs with titles.
- **Files explored:** Collapsed: "[Read: 3 files]". Expanded: list of file paths, each clickable to open in File Editor.
- **Files changed:** Collapsed: "[Changed: 1 file]". Expanded: list of changed files with +N -M line counts, clickable to open diff in File Editor.
- **Code diffs:** Inline code diffs with filename header showing +N -M. Expanded: line-by-line diff with -/+ prefixes. Clickable to open file at that location.
**Revert action:** Each assistant message with file changes shows a small "Revert" link; click undoes the last agent edit via Git restore point. Confirmation modal before reverting.

**Files-touched strip:** Below each assistant message that modified files, a compact horizontal strip shows affected files with diff counts (e.g., `app.rs +42 -8 | main.rs +3 -1`). File names are clickable (opens in File Editor at first changed line). Strip collapses to `"3 files changed"` when >5 files; click expands.

**Document rendering policy (required):**
- Chat does not render full document bodies for requirements, phase docs, PRD, contract seeds, or similar long artifacts.
- Chat shows concise summaries, findings, gaps, and change notes.

**Post-generation/revision message contract (required):**
- For document workflows, chat posts:
  1. `Opened in editor` indicator,
  2. Clickable canonical file path,
  3. Pointer to embedded document pane entry.

**Multi-Pass findings placement (required):**
- Requirements and Interview Multi-Pass runs post findings summary in chat and indicate that the same summary is shown in the page preview section.

**Plan panel:** When in Plan mode, a persistent sticky card at top shows plan outline and todo checkboxes. Collapsible.

**Steer vs Queue submission modes:** The input area supports two submission modes, toggled via a small indicator next to the SEND button (or Tab key):
- **Steer (default):** Enter sends immediately, interrupting the current generation if the assistant is actively generating. The new message is injected as a "steer" mid-stream.
- **Queue:** Enter queues the message. The queued message is sent automatically when the current generation completes. Useful for chaining requests without interrupting the assistant.
The active mode shows as a subtle label next to the SEND button ("Steer" or "Queue"). Tab toggles between modes. When in Queue mode and a message is queued, the queue area (below) becomes visible.

**Queue area:** Max 2 queued messages (FIFO). Each: truncated text (60 chars), [edit] [send now] [remove]. Faint accent tint background. Appears only when messages are queued.

**Subagent inline blocks:** When the assistant spawns subagents during execution, each subagent's work is displayed as a collapsible block in the message stream. Each block shows: persona/agent name (e.g., "Architect Reviewer"), task label (e.g., "Reviewing module structure"), platform + model badge, elapsed time, and a collapsed summary of output. Blocks persist in thread history. Click to expand and see full subagent output. Status indicator: spinner (running), checkmark (complete), X (failed).

**Active subagent indicator:** When subagents are running, a small line below the composer shows "> 3 subagents working" with a subtle pulse animation. Updates in real-time via `invoke_from_event_loop`.

**Input area:** Multi-line, auto-grows from 1 line (48px) to max 5 lines (120px). SEND button (accent background). Below-input row: `@` mention (opens file picker overlay with fuzzy search, showing files, symbols, and headings as you type), attach button (opens file dialog for files and images; paste and drag-drop also supported). Slash command detection: `/` shows autocomplete popup (see §7.16.2). **ELI5 toggle:** Small toggle in input toolbar; when on, assistant uses simpler explanations in this thread only (does not affect generated documents). **YOLO/Regular toggle:** Permission mode selector; YOLO auto-approves all tool calls, Regular prompts for approval once or per-session. Per-session; does not persist across restarts. **YOLO + FileSafe interaction:** When YOLO is enabled and FileSafe guards are active, show a persistent warning chip in the input toolbar: "[!] YOLO active -- FileSafe guards still apply." When FileSafe blocks a command during YOLO mode, show inline approval card in the chat stream (see below).

**FileSafe in-chat approval UI:** When a command is blocked by FileSafe, display an inline card in the chat stream: orange left border, command text in monospace, guard name that triggered, and two buttons: "Approve once" (runs the command this time only) and "Approve & add to list" (adds to approved commands in Settings > Advanced). The card auto-dismisses after 60 seconds with a "Timed out -- command skipped" message. Blocked commands are also logged to the FileSafe event log accessible from Settings > Advanced.

**Footer strip (20px):** Contains the following controls left-to-right:

**Platform selector:** Compact dropdown (icon + short name). Lists all 5 platforms (Cursor, Codex, Claude Code, Gemini, GitHub Copilot). Data sourced from `platform_specs`. Per-thread setting -- changing platform applies to the next message sent, not any in-flight generation. When changed, the model dropdown repopulates for the new platform and the reasoning/effort control shows or hides accordingly.

**Model selector:** Compact dropdown listing models for the currently selected platform. Models are discovered dynamically from platform CLIs (e.g., `agent models`, `claude models`) and cached. When discovery fails or returns empty, falls back to `platform_specs::fallback_model_ids(platform)`. User can customize the model list via a "Manage models" entry at the bottom of the dropdown (opens a small modal with: add custom model ID, reorder via drag, mark favorites which appear at the top, remove). Per-thread setting. The `/model` slash command also opens this selector for keyboard-friendly access.

**Reasoning/effort selector:** Shown only when `platform_specs::supports_effort(platform)` returns true. For Claude Code: dropdown with Low / Medium / High (maps to `CLAUDE_CODE_EFFORT_LEVEL` env var). For Codex and Copilot: dropdown with Low / Medium / High / Extra High. For Cursor: hidden (reasoning is encoded in model names like `sonnet-4.5-thinking`). For Gemini: hidden (no effort support). Per-thread setting.

**Context usage:** Text label (e.g., "42k / 128k") plus a context circle (progress gauge, ~16px) showing context usage percentage. Color transitions: blue (0-75%), amber (75-90%), red (90-100%). Hover shows tokens/cost/percentage tooltip. Click opens Usage tab for that thread.

**Per-thread usage:** Small context indicator (circular progress, ~16px) in chat header. Hover tooltip: total tokens, usage %, cost (USD). Click opens thread Usage tab with: summary (total tokens, context %, total cost), breakdown (input/output/reasoning/cache), optional per-turn table, link to app-wide Usage page.

**LSP in Chat (MVP):** The Chat Window fully uses LSP (Plans/LSPSupport.md §5.1). **Diagnostics in Assistant context:** When building context for the next Assistant (or Interview) turn, include a summary of current LSP diagnostics for the project or @'d files (errors/warnings with file, line, message, severity, source) so the agent can suggest fixes. **@ symbol with LSP:** When LSP is available, the **@** menu includes **symbols** (from LSP workspace/symbol and optionally documentSymbol) so the user can add a function/class/symbol to context by name; results show path, line, kind. **Code blocks in messages:** Code blocks in assistant or user messages support **LSP hover** (tooltip with type/docs) and **click-to-definition** (e.g. Ctrl+Click) when the block has a known language and the project has an LSP server; definition opens in the File Editor. **Problems link from Chat:** Chat footer or message area offers a link or badge (e.g. "N problems") that opens the Problems panel (LSP diagnostics) for the current project or context. Optional: compact hint for @'d files (e.g. "2 errors in @'d files") with click-through to Problems. Fallback when LSP unavailable: @ symbol uses text-based symbol search; code blocks have no hover/definition; diagnostics in context omitted.

**Chat LSP control placement and behavior:**
- **Footer strip (left-to-right order):** Platform selector → Model selector → Reasoning/effort selector (when supported) → Context usage → **Problems link**. The Problems link is the rightmost LSP-related control in the footer.
- **Problems link:** Label text: **"N problems"** when count > 0 (e.g. "3 problems"), or **"Problems"** when count is 0. Placement: immediately to the right of the context usage indicator (context circle / "42k/128k"). Click target: opens the **Problems** tab of the Bottom Panel (§7.20), filtered to the **current project** (or to files in current chat context if project is set). When no project is set, the link opens Problems with no filter (or shows "Select a project to see problems" in the panel).
- **@ symbol:** Lives in the input area (below-input row: @ mention button). When opened, the overlay shows files and (when LSP available) symbols. No separate header control for LSP in Chat.
- **Code-block LSP:** Hover and go-to-definition apply in the **message area** (message stream); no dedicated control -- interaction is on the code block content itself.

**Chat LSP empty and zero states:**
- **Diagnostics empty:** When LSP is active but there are zero diagnostics, the Problems link shows **"Problems"** (no number); clicking opens Problems panel with empty state **"No problems detected"** (§7.20).
- **@ symbol -- no symbols:** When the user opens @ and selects "symbols" (or the symbol category) and LSP returns no results, show **"No symbols"** (or "No symbols in project") in the symbol list. Do not show an error; treat as empty result.
- **Code block -- unknown or unsupported language:** When a code block in a message has an unknown language tag or no LSP server for that language, do **not** show hover or go-to-definition; do **not** show an error. Render the block as plain code only.

**Chat LSP error states:**
- **LSP server error:** If the LSP server for the project reports an error or crashes, do not block Chat. @ symbol falls back to text-based symbol search (FileManager §12.1.4). Code-block hover/definition in chat is unavailable for that language; no modal error -- optional toast or status: "Language server unavailable for symbols."
- **Timeout resolving symbol (e.g. workspace/symbol):** If the LSP request times out while resolving symbols for @ or for a code block, show a brief inline message (e.g. "Symbol search timed out") and fall back to text-based symbol search for @; for code blocks, show no hover/definition for that request. Do not block the UI.
- **Project not set:** When no project is selected, **disable** LSP-dependent behavior for Chat: @ symbol shows **files only** (no symbol category, or symbol category disabled with tooltip **"Select a project to use symbol search"**). Code-block hover and go-to-definition in chat are disabled (no error; hover/click do nothing or show tooltip **"Open a project for language features"**). Problems link remains clickable; opens Problems panel with empty state **"Select a project to see diagnostics"** or equivalent.

**Chat LSP accessibility:**
- **Platform / model / effort:** Keyboard path and focus order for these dropdowns are already specified (footer strip; Tab order). No change.
- **"N problems" link:** Must be **focusable** (in tab order after context usage). **Screen reader:** Announce as "N problems" or "Problems, N items" (e.g. `aria-label="3 problems"` or live region when count updates). **Activation:** Enter or Space opens the Problems panel (same as click).
- **Code-block hover and go-to-definition:** When focus is on a code block that supports LSP, keyboard users need a way to trigger go-to-definition (e.g. focus the block and use the same shortcut as in the editor: **F12** or **Ctrl+Click** equivalent). Expose **"Go to definition"** in a context menu for the code block (right-click or menu key). Screen reader: announce code blocks that support LSP as "Code, [language], go to definition available" so users know the action exists.

**Tool approval dialog (in-chat):** When a tool has "ask" permission (per Tools.md), an inline approval card appears in the chat stream before execution. Shows: tool name, brief invocation summary (e.g., "bash: git status"), and three buttons: "Once" (approve this invocation only), "For Session" (approve all invocations of this tool for the current session), "Deny" (block this invocation). "For Session" approvals persist only until app restart. When YOLO mode is active, all tool approvals are skipped (but FileSafe guards still apply).

#### 7.16.1 Web Search

The chat supports web search with citations. When the assistant performs web search, results are displayed with inline citations (numbered superscripts linking to sources) and a "Sources" list at the bottom of the message showing URL, title, and snippet for each cited source.

#### 7.16.2 Slash Commands

Typing `/` in the chat input shows an autocomplete popup listing available commands.

**Built-in commands (reserved):**

| Command | Action |
|---------|--------|
| `/new` | Create a new thread |
| `/model` | Switch model for current thread |
| `/export` | Export current thread (JSON bundle, secrets stripped) |
| `/compact` | Compact current session (trim context, preserve key info) |
| `/stop` | Stop current run |
| `/resume` | Resume a paused run |
| `/rewind` | Rewind to a specific message |
| `/revert` | Revert last agent file edit |
| `/share` | Share thread bundle |

**Custom commands:** Users can define application-wide and project-wide custom slash commands. Custom commands are editable in Settings > Slash Commands tab. Custom command names must not conflict with built-in commands. Format: name, description, action (prompt template or callback).

### 7.17 File Manager Panel (NEW)

**Location:** Side panel (tabbed with Chat by default, detachable independently)

**Structure:**

```
+------------------------------------------+
| [Chat] [Files]              [_] [pop] [x] |  Tab bar
+------------------------------------------+
| [magnifier] Search files...               |  Search (28px)
+------------------------------------------+
|                                           |
|  v src/                                   |
|    > app.rs                          M    |  File tree (virtualized)
|    > main.rs                              |
|    v views/                               |
|      > dashboard.rs                       |
|      > config.rs                     A    |
|    v widgets/                             |
|      ...                                  |
|  v tests/                                 |
|  > Cargo.toml                             |
|  > README.md                              |
|                                           |
+------------------------------------------+
| 42 files | 3 modified | main up2          |  Git status strip (20px)
+------------------------------------------+
```

**Features:**
- Fuzzy file search with real-time tree filtering
- Virtualized tree view (only visible nodes instantiated)
- Git status indicators: M (modified), A (added), D (deleted), U (untracked) -- colored per theme
- `.gitignore` respected, optional toggle to show ignored files
- Context menu (right-click): Copy path, Copy relative path, Open in external editor, Add to chat context, **New file**, **New folder**, **Rename** (inline edit), **Delete** (confirm modal), Reveal in system file manager, Collapse all, Expand all
- Drag files to chat input to attach them
- `@` mention in Chat input opens File Manager search as overlay popup
- **Keyboard navigation:** Up/Down to move selection, Left to collapse folder, Right to expand folder, Enter to open file, Delete to delete (with confirm), F2 to rename, Ctrl+N to create new file in selected folder
- **Current file highlighting:** The file currently open in the editor is highlighted with accent background in the tree (even if the tree is scrolled; on click-to-open from editor, auto-scroll tree to show the file)
- **Expand/collapse persistence:** Tree expansion state is persisted per-project in redb. Restored on project open. "Collapse All" and "Expand All" buttons in the search bar area.

**External drag-and-drop:** Drag files from the system file manager into the File Manager tree to copy or move them into the project. Uses platform-specific APIs: Windows (IDropTarget / OLE drag-drop), macOS (NSDraggingDestination / NSPasteboard), Linux (Xdnd protocol / wl_data_device for Wayland). On drop: show confirmation dialog listing files to import ("Copy N files into {folder}?" with [Copy] [Cancel]). If a file already exists at the destination, show conflict resolution: "File already exists" with [Replace] [Skip] [Rename (auto-suffix)] per file, plus [Apply to all]. Progress indicator for multi-file copies. Dropped directories are copied recursively.

**File preview:** When a file is selected, read-only preview in primary content area (or in-panel split when panel >400px). Monospace font with basic syntax highlighting using accent palette.

### 7.18 File Editor (NEW)

**Location:** Primary content (between File Manager and Dashboard)

IDE-style editor with:
- Open files as tabs (tab bar, closable, reorderable)
- Editable buffers with Save (`Ctrl+S`); unsaved indicator (dot on tab); **undo/redo** (Ctrl+Z / Ctrl+Shift+Z)
- Line numbers
- Basic syntax highlighting (keywords, strings, comments using accent palette); language detected from file extension; coverage: Rust, Python, JavaScript/TypeScript, JSON, YAML, Markdown, TOML, HTML, CSS, Shell
- **Breadcrumbs bar:** Below tab bar, showing file path segments (each segment is a link that opens folder in File Manager)
- **Minimap:** Optional (toggle in Settings > General), 60px-wide reduced-scale view of the file on the right edge; click/drag to navigate
- **Code folding:** Fold/unfold regions via gutter icons (collapsed/expanded triangle); fold all/unfold all via command palette
- Go-to-line (Ctrl+G): overlay input field at top of editor, accepts line number, validates range
- Find/replace (Ctrl+F / Ctrl+H)
- Split panes (multiple editor groups, drag tabs to split); target split direction via drop zone indicators
- **Multi-cursor:** Ctrl+Click to add cursors; Ctrl+D to select next occurrence; Escape to reduce to single cursor
- Large file handling: read-only truncated view for >10k lines with "Load full file" option; hard cap at 5MB
- Image viewer for PNG, JPEG, GIF, WebP, SVG
- Click-to-open from chat: clicking file paths in chat, files-touched strip, or code blocks opens file at specified line/range
- Tab persistence: per-project open tabs, active tab, scroll/cursor position; max tabs setting in Settings/General (LRU eviction, default 20)
- Collapsible/hideable when not needed
- **Detachable:** File Editor can be dragged out to a separate floating window and snapped back, using the same panel system as Chat and File Manager (§5). Only one floating editor window at a time.
- **Read-only mode:** When a file is opened from evidence or during a run, show read-only indicator in tab ("[locked]") and disable editing. Reason displayed in status bar ("File locked: evidence artifact" or "File locked: run in progress").
- **Transient states:** Loading (spinner replacing content), Decoding error (banner: "Cannot display binary file"), File-not-found (banner with "File was deleted or moved" and close button)

**LSP-powered editor features (when LSP server available):** Per Plans/LSPSupport.md, when a language server is running for the current file's language, the editor gains the following. Each feature has a **trigger**, **UI location**, and **fallback** when the server does not support it or LSP is unavailable.

| Feature | Trigger | UI location | Fallback (server unsupported or unavailable) |
|---------|---------|-------------|-----------------------------------------------|
| **Inline diagnostics** | Server sends `publishDiagnostics` | Underlines on affected ranges (red=error, amber=warning, blue=info); left gutter severity icon per line. Click gutter icon to see full message. | No underlines or gutter markers; no error. |
| **Hover** | Mouse hover (300ms delay) or focus + shortcut | Themed tooltip at cursor (or slightly offset). Max-width to prevent overflow. Dismiss on mouse move or Escape. | No tooltip; no error. |
| **Code completion** | Typing or **Ctrl+Space** | Inline dropdown below (or above if near bottom) cursor. Items: label, detail, kind icon. Arrow keys + Enter to select. | No dropdown; typing inserts characters only. |
| **Signature help** | Cursor inside function call (e.g. after `(`) | Popup near cursor (e.g. below line). Current signature + parameter highlight; previous/next overload. Dismiss on cursor move or Escape. | No popup; no error. |
| **Inlay hints** | Document open/change (after debounce) | Inline decorations in editor (muted, smaller font). Read-only; do not affect buffer. | No inlay hints; syntax highlighting only. |
| **Code actions** | **Ctrl+.** or click lightbulb in gutter | Lightbulb in gutter when actions available. Click or Ctrl+. opens quick fix / refactor list. Apply via FileSafe. | No lightbulb; no error. |
| **Code lens** | Server sends code lens for document | Inline links above symbols (e.g. "Run test", "3 references"). Click to invoke. Toggle in Settings > LSP. | No code lens; no error. |
| **Semantic highlighting** | Server supports `semanticTokens` | Token-based coloring (e.g. local vs parameter). | Fall back to regex-based syntax highlighting. |
| **Go to definition** | **Ctrl+Click** or **F12** on symbol | Opens definition in same or new editor tab; scrolls to location. | No navigation; no error. Use heuristic (e.g. grep) if implemented. |
| **Find references** | **Shift+F12** on symbol | Opens References view (inline list or panel); click row opens file at location. | No references list; no error. |
| **Rename symbol** | **F2** on symbol | Inline rename or dialog; apply via workspace/applyEdit (FileSafe). | No rename; no error. |
| **LSP status** | Server lifecycle | Status bar: server name + state (e.g. "rust-analyzer: Ready", "Initializing...", "Error: ..."). | When no server: show nothing (no "no LSP" indicator). |
| **LSP unavailable** | Open file, no server for language | Dismissible banner: "Install {server} for full language support" with link to Settings > LSP. | N/A (this is the fallback UX). |

**Editor LSP context menu:** When the user right-clicks (or menu key) in the editor, include LSP actions when available: **Go to Definition** (F12), **Find References** (Shift+F12), **Rename** (F2), **Quick Fix** / **Refactor** (Ctrl+.), **Copy type/signature** (when hover has content). Disable or hide entries when the server does not support the capability or when LSP is unavailable.

**Editor LSP shortcuts (summary):** F12 = Go to definition; Shift+F12 = Find references; F2 = Rename symbol; Ctrl+Space = Trigger completion; Ctrl+. = Code actions (quick fix). Go to Symbol (outline): Ctrl+Shift+O. All shortcuts are discoverable in Settings > Shortcuts.

**Open-file contract:** All file-open actions across the app (File Manager click, chat file path click, Ctrl+P, @ mention, code action navigation) use a single unified contract: `OpenFile { path, line?, range?, target_group? }`. `target_group` defaults to the active (focused) editor group; optionally "Open in other group" or "Open in new group" via context menu. When line/range is specified, editor scrolls to that location with a brief highlight fade (configurable duration, default 5 seconds).

**Embedded document pane integration (required):**
- Embedded document pane is another view on the same file artifacts used by File Editor.
- File Editor and document pane share one buffer model, one dirty state, and one save source per file path.
- Restore/checkpoint actions triggered in document pane use the same open-file and buffer-refresh pipeline as File Editor.

**Split panes and editor groups:** Multiple editor groups (side-by-side or top/bottom). Each group has its own tab list and active tab. **Shared buffer model:** One buffer per file path across all groups; any edit in one group updates all views immediately. Only cursor position and scroll offset are per-view. Tab drag between groups to move files. Drop zone indicators show split direction targets.

**Additional editor features:**
- **Format on save:** When LSP server supports `textDocument/formatting`, format before persist. Timeout 5 seconds; if exceeded, save unformatted. Toggle in Settings > General ("Format on save", default off). Also: `textDocument/rangeFormatting` for format-selection.
- **Comment toggle:** Ctrl+/ toggles line comment for the current selection or cursor line. Language-aware (// for Rust/JS, # for Python/Shell, etc.).
- **Indent/outdent:** Tab / Shift+Tab on selection.
- **Duplicate line:** Ctrl+Shift+D duplicates the current line or selection.
- **Move line up/down:** Alt+Up / Alt+Down moves the current line.
- **Trim trailing whitespace:** Optional on-save behavior (toggle in Settings > General, default off).
- **Render whitespace:** Optional toggle to show spaces/tabs as dots/arrows (toggle in Settings > General, default off).
- **Sticky scroll:** When scrolling, keep the current scope header (function/class/block signature) pinned at the top of the editor. Toggle in Settings > General (default on for code files).
- **Line wrap:** Toggle (Ctrl+Alt+W) between soft-wrap and horizontal scroll.
- **Zoom:** Ctrl+= / Ctrl+- to zoom editor text size (independent of app UI scale).

**Image viewer:** Supports PNG, JPEG, GIF, WebP, SVG (optionally BMP, ICO). Controls: zoom in/out, fit-to-pane, fit-to-width. View-only (no pixel editing). Optional: copy to clipboard, open in system viewer via context menu.

**HTML preview with hot reload:** When an HTML file is open, a split preview pane shows the rendered HTML (via embedded webview or lightweight renderer). Hot reload: on save, preview refreshes with a 400ms debounce (configurable 100-2000ms in Settings > General). Watches linked files (script/link refs) for changes. Multiple HTML files can each have their own preview. Preview toolbar: refresh button, open in external browser button, device-width selector (phone/tablet/desktop).

**Click-to-context (HTML preview):** When viewing HTML, user can click an element in the preview to capture its context (tag, id, class, text content, bounding rect, parent path, HTML snippet). Captured context is sent to the Chat input with a toast notification: "Element context captured." Rate-limited to prevent spam. DOM size cap to prevent oversized captures.

**Optional Vim-like modal editing:** Toggle in Settings > General ("Vim mode", default off). When on, editor enters normal/insert/visual modes. Focus trap: Ctrl+Shift+Z exits Vim mode and returns to normal editor behavior. Mode indicator in status bar ("NORMAL" / "INSERT" / "VISUAL").

**Editor diff view:** Side-by-side diff between buffer and disk version, or between branches. Accessible via right-click tab > "Compare with saved" or command palette.

**In-app instructions editor (MVP):** The File Editor provides enhanced support for editing project instruction files (AGENTS.md, .puppet-master/project-rules.md, SKILL.md files, and similar Markdown-based configuration files).

- **Detection:** When a file matching known instruction patterns is opened (AGENTS.md, *.md in `.puppet-master/` or `.cursor/` directories, SKILL.md, CLAUDE.md, .cursorrules, etc.), the editor activates "Instructions mode" -- indicated by a badge in the tab: "[instructions]".
- **Split preview:** Instructions mode opens a side-by-side layout by default: editor on the left, rendered Markdown preview on the right. Preview updates live as the user types (debounced 200ms). Preview supports: headings, bold/italic, code blocks (with syntax highlighting), tables, lists, blockquotes, horizontal rules, links (clickable, open in Browser tab), images (rendered inline).
- **Template insertion:** A toolbar above the editor in Instructions mode shows quick-insert buttons: "Add rule", "Add convention", "Add file pattern", "Add command". Each inserts a pre-formatted template block at the cursor position (e.g., "Add rule" inserts `## Rule: [name]\n\n**When:** [condition]\n**Then:** [action]\n`).
- **Validation:** Basic structural validation for AGENTS.md-style files: warns on missing required sections (if a schema is defined for the file type), warns on duplicate headings, warns on overly long files (>500 lines -- "Consider splitting into linked documents"). Warnings shown as amber markers in the gutter and in the Problems tab.
- **Preview toolbar:** Toggle between "Preview" (rendered Markdown), "Raw" (plain text editor), and "Split" (side-by-side) views. Preview-only mode locks the editor for read-only viewing.

**SSH remote file integration:** When an SSH connection is active (see §7.4.5), the File Editor can open and edit files on remote hosts.

- **Remote file indicator:** Remote files show a `[SSH: connection-name]` badge in the editor tab, styled with a distinct background color (Theme.accent-orange at 10% opacity) to clearly distinguish from local files.
- **Save behavior:** On Ctrl+S, the file is written back to the remote host via SFTP. A brief "Saving to remote..." indicator appears in the status bar. If the save fails (connection timeout, permission denied), show an error toast with the option to "Save locally" (creates a local copy in a temp directory).
- **Connection resilience:** If the SSH connection drops while a remote file is open, the editor retains the buffer contents. A persistent banner appears above the editor: "Connection to {host} lost -- editing offline. Changes will sync on reconnect." with "Reconnect" and "Save locally" buttons. On reconnect, if the remote file has changed since the local edit, show a merge conflict dialog: "Remote file has changed. [Keep yours] [Keep remote] [Show diff]".
- **Performance:** Remote files are cached locally in `~/.puppet-master/cache/ssh/{host}/{path}`. Subsequent opens of the same file check remote modification time (via SFTP stat) before re-downloading. Cache expires after 1 hour or on explicit refresh.

### 7.19 Agent Activity Pane (NEW)

**Location:** Embedded in Wizard and Interview views

Read-only, chat-like pane showing streaming agent output during document generation and Multi-Pass Review. Shows which persona/subagent is working on which task. Non-interactive. Progress indicators for documents in progress. Monospace font. Min height 120px, max ~500 visible lines (virtualized via `ListView`).

**Responsibility boundary (required):**
- Agent Activity Pane is for streaming/progress only.
- It must not host document navigation, document editing, or approval controls.
- Findings summary and approval controls are shown in chat + preview section; document editing happens in File Editor or embedded document pane.

**Event wiring (required):**
- Pane consumes normalized Provider event stream used by chat.
- UI updates are dispatched through the Slint event loop (`invoke_from_event_loop`) for immediate state refresh.

**Accessibility:** The pane uses `accessible-role: text` (or equivalent for read-only log output). Screen readers should announce new output as it arrives via a live region equivalent (Slint: set `accessible-label` to include latest line summary). Focus can be placed on the pane for keyboard scrolling (Up/Down/Page Up/Page Down). Keyboard shortcut to toggle auto-scroll.

### 7.19.1 Embedded Document Pane (NEW)

**Location:** Embedded in Wizard and Interview primary content, separate from Agent Activity Pane and separate from side-panel Chat.

**Purpose:** Newbie-friendly surface to review and lightly edit human-readable project artifacts without leaving the flow.

**Content scope:**
- Include: requirements docs, plan docs, interview-generated docs (phase docs, PRD, AGENTS.md), and related human-readable artifacts.
- Exclude: raw JSON/non-human-readable files from editable list.
- Special entry: `Plan graph` rendered view (read-only tree/graph). Do not expose raw plan graph JSON for editing in this pane.

**Navigation and editing:**
- Left tree/hierarchical sidebar with button-like document entries.
- Selecting an entry shows document content in main editor area.
- Editing is basic text edit + save. Advanced IDE features remain in File Editor.
- Saves write to the same artifact and shared buffer/history contract as File Editor.

**Plan graph entry requirements:**
- Rendered read-only plan graph view.
- Notice near graph view: `Talk to Assistant to edit plan graph.`

**Checkpoint history UI:**
- Show checkpoint restore options (for example `before_multi_pass`, `after_user_edit_1`).
- Restore actions route through shared file open/refresh pipeline and maintain single source of truth history.

### 7.20 Bottom Panel (NEW)

**Location:** Below primary content, collapsible

**Tab bar (24px):** Terminal | Problems | Output | Ports | Browser | Debug. Optionally **References** (when Find references / Shift+F12 is implemented, results appear in a **References** tab; click row opens file at location; see §7.18 LSP features). Collapse/expand button. Pop-out button.

**Terminal:** Agent stdout/stderr, bash command output. Uses terminal styling (monospace, dark background even in light theme). Color-coded: stdout=ACID_LIME, stderr=HOT_MAGENTA, system/info=SAFETY_ORANGE, FileSafe-blocked=RED with "[BLOCKED] Blocked by FileSafe" prefix. Max 500 visible lines. Auto-scroll with scroll-lock toggle.

**Terminal tab management:** Each terminal instance is a tab within the Terminal section. Tab naming: tabs show agent/task name; user can pin or rename terminal tabs. **Pin semantics:** Pinned tabs are narrower (icon-only), persist across sessions, and cannot be closed without unpinning first. Unpinned tabs close normally. **Instance caps:** Maximum 12 terminal instances (configurable in Settings > General, range 4-20). When the cap is reached, attempting to open a new terminal shows a toast: "Terminal limit reached -- close an existing terminal first." LRU eviction is NOT automatic; user must explicitly close tabs. **New terminal:** "+" button on terminal tab bar creates a new shell instance. Right-click terminal tab: Rename, Split horizontally, Split vertically, Pin/Unpin, Close (disabled if pinned), Close others, Close all unpinned.

**Problems:** Shows LSP diagnostics for the target project: errors, warnings, info. Columns: file (path), line, message, severity, source (e.g., rust-analyzer). Click row to open file in File Editor at that location. Filter by severity via toggle buttons (Errors / Warnings / Info). Badge on tab label shows count (e.g., "Problems (3)"). **Empty states:** "No problems detected" when LSP is active with zero diagnostics; "Open a file to see diagnostics" when no LSP server is running; "Select a project to see diagnostics" (or equivalent) when no project is selected (e.g. when opened from Chat with no project set).

**Output:** Puppet Master's own log output (debug/info/warn/error, filtered by settings log level).

**Ports (includes Hot Reload):** Shows detected local servers (port, process name, status) when target project runs dev servers. **Hot reload controls:** A "Watch mode" toggle button at the top of the Ports tab. When enabled, Puppet Master starts a file watcher (using `notify` crate) on the target project directory. On detected changes (debounced 500ms), triggers the project's configured build command (from Settings > General or project config). Status line: "Watching: src/ (12 files changed, last rebuild 3s ago)" or "Watch mode: off". Build output streams to a dedicated terminal tab named "[hot-reload]". Errors in build output are parsed and surfaced in the Problems tab (if possible). Toggle persists per-project in redb. **Port list:** For each detected port: port number, process name, PID, status (listening/closed), uptime. Click row to open `http://localhost:{port}` in the Browser tab. "Kill" button per row (with confirmation). Auto-refresh every 5s or on file-watcher event. Empty state: "No active ports -- start a dev server to see it here."

**Browser (MVP):** Embedded webview tab for viewing web content without leaving the IDE. Uses `wry` crate for cross-platform webview embedding (WebView2 on Windows, WebKit on macOS/Linux). The Browser tab hosts a webview as a native child window within the bottom panel area.

**Browser UI:**
- **URL bar:** Text input at top of browser tab with navigation buttons (Back, Forward, Refresh, Home). URL auto-completes from history. Enter key navigates. Shows loading indicator (progress bar below URL bar) during page load.
- **Tab management within Browser:** Multiple browser tabs within the Browser section (similar to terminal tabs). Pin semantics apply (same as terminal: pinned tabs are icon-only, cannot be closed without unpinning). Instance cap: maximum 8 browser tabs (configurable in Settings > General, range 2-12). "+" button opens new tab with blank page or configured home URL.
- **Click-to-context:** When viewing a page, user can activate "Inspect mode" via a crosshair button in the browser toolbar. In inspect mode, hovering over elements highlights them with an overlay border. Clicking an element captures its context: tag name, id, class list, text content (truncated to 500 chars), bounding rect, parent path (up to 5 ancestors), and an HTML snippet of the element and immediate children. Captured context is injected into the Chat input with a toast: "Element context captured." Rate limit: 1 capture per 2 seconds. DOM size cap: elements with >100 children are summarized.
- **DevTools:** Optional "Open DevTools" button (opens the webview's built-in dev tools in a separate window). Useful for CSS debugging.
- **Bookmarks:** Simple bookmark list (URL + title). Add current page via star icon in URL bar. Bookmark list accessible from dropdown. Persisted in redb.
- **Empty state:** "No page loaded -- enter a URL or click a link from the chat" with a list of bookmarks (if any).
- **Security:** Sandboxed webview. No access to local filesystem unless explicitly granted. JavaScript enabled by default with toggle. Cookies/storage scoped per-project.

**Debug (MVP):** Integrated debugging via the Debug Adapter Protocol (DAP). The Debug tab provides a debugging interface for the target project.

**Debug UI:**
- **Run configurations:** A dropdown at the top of the Debug tab listing saved run/debug configurations for the current project. Each configuration specifies: name, type (launch/attach), program/command, arguments, environment variables, working directory, pre-launch task (optional), and DAP adapter path. Configurations are stored per-project in `.puppet-master/launch.json` (compatible with VS Code launch.json format where possible). "Edit configurations" button opens the configuration file in the File Editor.
- **Debug toolbar:** Play (start/continue), Pause, Step Over, Step Into, Step Out, Restart, Stop buttons. All buttons have clear iconography and tooltips. Disabled when not applicable (e.g., Step Over disabled when not paused at breakpoint).
- **Variables panel:** Tree view of local variables, arguments, and watch expressions. Expandable for compound types. Editable values (double-click to modify, with type validation).
- **Call stack:** List of stack frames. Click to navigate to source location in File Editor. Current frame highlighted.
- **Breakpoints:** List of all breakpoints across files. Columns: file, line, condition (if conditional), hit count, enabled toggle. Click to navigate. Right-click: Edit condition, Remove, Disable.
- **Debug console:** REPL-style input for evaluating expressions in the current debug context. Output shows evaluation results. History (up-arrow for previous commands).
- **Breakpoint gutter integration:** In the File Editor (§7.18), clicking the left gutter (to the left of line numbers) toggles a breakpoint (red dot). Conditional breakpoints via right-click gutter > "Add conditional breakpoint" (shows input for condition expression). Breakpoints are persisted per-project in redb.
- **DAP adapter management:** Settings > Debug (new subsection in Advanced or dedicated tab) lists available debug adapters. Built-in support for common adapters (codelldb for Rust/C++, debugpy for Python, node-debug for JavaScript). Custom adapters can be added (adapter path, type, supported languages). Adapter auto-detection from project language (see §7.3 language auto-detection).
- **Empty state:** "No debug configuration found -- create one to start debugging" with "Create configuration" button that generates a template based on detected project language.
- **Keyboard shortcuts:** F5 (Start/Continue), F10 (Step Over), F11 (Step Into), Shift+F11 (Step Out), Shift+F5 (Stop). Registered in shortcut registry.

**4-split terminal (Dashboard):** The Dashboard also contains a 4-split terminal area (2x2 default layout). One PTY per pane. Bounded line buffers per pane (ring buffer or fixed-size deque). Virtualized rendering. Resizable splits; ratios persisted in redb.

**Collapse behavior:** Double-click tab bar or click collapse button to minimize to just the tab bar (24px). Height stored and restored.

### 7.21 NotFound

Fallback 404/error page shown when navigation target is invalid.

---

## 8. Widget Catalog

All widgets read from `Theme.*` globals rather than hardcoded colors. Each widget must support all four theme variants.

### 8.1 Core Widgets

| Widget | Purpose | Key Properties |
|--------|---------|---------------|
| **StyledButton** | Primary/Secondary/Danger/Warning/Info/Ghost buttons | variant, label, icon, enabled, loading (spinner), onClick callback |
| **StyledInput** | Themed text inputs | placeholder, value, variant (text/password/number), onChanged callback |
| **ComboBox** | Dropdown selection | items (model), selected-index, onSelected callback. **Used for platform and model selection** |
| **SelectableText** | Read-only selectable text | text, copyable, wrap mode |
| **StatusBadge** | Status dots and colored badges | status (running/paused/error/complete/idle), label, size |
| **ProgressBar** | Animated progress bars | value (0.0-1.0), variant (phase/task/subtask), animated |
| **Terminal** | Terminal output display | lines (VecModel), auto-scroll, max-lines, color-coding by line type |
| **Modal** | Modal dialogs | title, content, variant (confirm/error/info), onConfirm/onCancel |
| **Toast** | Toast notifications | message, variant (success/error/warning/info), duration, dismissible |
| **PanelCard** | Paper-texture panels | title, collapsible, collapsed, drag-handle, content slot |
| **HelpTooltip** | "?" icon with contextual help | text, position (top/bottom/left/right) |
| **PageHeader** | Page title + action buttons | title, subtitle, actions slot |
| **ContextMenu** | Copy/paste/select-all context menu | items (VecModel), position, onSelect |
| **BudgetDonut** | Donut chart for usage | used, total, label, color |
| **UsageChart** | Bar chart for usage data | data points (VecModel), labels |
| **ActivityBar** | Vertical icon nav | items (VecModel), active-index, onSelect, reorderable |
| **StatusBar** | Bottom status strip | mode, platform, model, context-usage, status. When LSP is active (Plans/LSPSupport.md), **status** includes LSP server name and state (e.g. "rust-analyzer: Ready" or "Initializing..." / "Error: ...") for the current editor context. |
| **Breadcrumb** | Navigation breadcrumb | items (VecModel), onNavigate |
| **CommandPalette** | Fuzzy search overlay | commands (VecModel), filter, onSelect |
| **PixelGridOverlay** | Pixel grid effect | opacity, spacing, color |
| **PaperTextureOverlay** | Paper grain texture | opacity |
| **StepCircle** | Step indicator circles | step-number, status (active/complete/pending) |
| **Icon** | SVG icon system | icon-type (~50 types), size, color |
| **InterviewPanel** | Interview progress side panel | phase, progress, current-question |

### 8.2 Button State Feedback

Every `StyledButton` must support the following visual states:

| State | Visual | Behavior |
|-------|--------|----------|
| **Default** | Normal styling per variant | Clickable |
| **Hover** | Lightened background (`btn-hover`) | Cursor: pointer |
| **Active/Pressed** | Darkened, inset shadow | During click |
| **Loading** | Spinner icon replaces or joins label; button disabled | During async operation |
| **Disabled** | Muted colors, no shadow | Not clickable; cursor: not-allowed |
| **Success** | Brief green flash or checkmark icon (500ms) | After successful operation completes |
| **Error** | Brief red flash (500ms) | After operation fails |

**Implementation:** `StyledButton` has `in property <bool> loading` and `in property <ButtonState> state` that controls visual presentation. The Rust backend sets `loading: true` when an async action starts and `loading: false` + brief `state: success` when it completes.

### 8.3 Toggle State Synchronization

All toggles that reflect server/backend state (e.g., Login/Logout buttons) must:
1. Update immediately when the backend state changes (via `invoke_from_event_loop`)
2. Show a loading state during the transition (e.g., "Logging in..." spinner)
3. Never show stale state -- if an auth check is in progress, show a spinner, not the old state
4. Use Slint's reactive property system: backend writes to a shared property, UI automatically reflects

---

## 9. State Management

### 9.1 Architecture

```
Backend (Rust)                              UI (Slint)
+------------------+                        +------------------+
| AppState         |                        | Theme globals    |
| - orchestrator   |  -- properties -->     | Root component   |
| - projects       |  -- VecModel -->       | - views          |
| - chat threads   |  -- callbacks <--      | - panels         |
| - file tree      |                        | - overlays       |
| - usage data     |                        +------------------+
+------------------+
```

### 9.2 Rust-to-Slint Data Flow

- **Scalar properties** (orchestrator status, current phase, theme mode): Set directly on Slint component properties from Rust
- **List data** (chat messages, file tree, output lines, evidence items): Use `Rc<VecModel<T>>` shared between Rust and Slint. Slint's `ModelNotify` automatically triggers re-render when data changes
- **Cross-window sharing:** Same `Rc<VecModel<T>>` bound to both main window and floating panel windows for automatic synchronization

### 9.3 Slint-to-Rust Data Flow

- **Callbacks:** Slint components define callbacks (e.g., `callback send-message(string)`, `callback navigate(int)`). Rust registers handlers via `.on_<callback_name>()`
- Callbacks are thin -- Rust performs logic, updates state, then updates Slint properties

### 9.4 Thread-Safe Updates

Background threads (orchestrator events, usage refresh, auth checks) update the UI via `slint::invoke_from_event_loop`:

```rust
let ui_handle = ui.as_weak();
tokio::spawn(async move {
    let event = receive_event().await;
    let _ = ui_handle.upgrade_in_event_loop(move |ui| {
        ui.set_orchestrator_status(event.status.into());
    });
});
```

**Critical:** Do NOT use timer-based polling (e.g., 50ms or 100ms timers) to sync state. Use event-driven updates via channels + `invoke_from_event_loop`. The current Iced implementation uses 50ms polling via crossbeam channels -- this must NOT be replicated.

### 9.5 Event Channel Architecture

```
Backend Event --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
Tray Action  --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
Auth Change  --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
Usage Update --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
```

All events flow through typed Rust channels. The receiving end calls `invoke_from_event_loop` to update Slint properties on the main thread.

### 9.6 Context Management

**Context compilation:** Each prompt sent to a platform assembles context from multiple sources: conversation history (last N turns + summary of older turns), system instructions (AGENTS.md, project rules), file context (@ mentioned files, recently edited files), and plan state. Context is compiled on the Rust side before invoking the platform CLI.

**Context window tracking:** Token count for each thread is tracked and displayed in the chat footer's context circle (§7.16). When a platform supports streaming token counts, the display updates in real-time during generation.

**Compact session:** User-triggered via `/compact` command or `Ctrl+Shift+C`. Trims the conversation context while preserving key information (system instructions, plan state, last N turns, summary of compacted turns). The compacted portion is replaced with a "Session compacted" marker in the message stream; original messages are preserved in seglog but removed from active context.

**Re-pack on model switch:** When the user changes the model mid-thread (especially to one with a smaller context window), context is automatically re-packed: last N turns retained in full, older turns summarized, and the total is trimmed to fit within the new model's context limit (sourced from `platform_specs`).

**Truncation handling:** When context approaches the model's limit, a warning appears in the chat footer ("Context 95% -- consider compacting"). If context exceeds the limit, automatic truncation removes the oldest non-essential turns (preserving system instructions and plan state) and shows a toast: "Context truncated -- oldest messages removed."

### 9.7 Config Wiring Architecture

The GUI Settings page is the editing surface; the orchestrator reads configuration at run-time. The wiring works as follows:

1. **Edit in GUI:** User changes a value (e.g., Branching > Auto PR toggle). The Slint property updates immediately.
2. **Auto-save to redb:** A debounced callback (200ms) serializes the current config struct and writes to redb `config:v1`. No explicit "Save" button -- settings auto-save. A small "Saved" indicator flashes in the Settings header on write.
3. **Run reads config:** When a run starts, the orchestrator reads `config:v1` from redb, producing an immutable `RunConfig` snapshot. Mid-run config changes do NOT affect the active run.
4. **Reset/defaults:** Each Settings tab has a "Reset to defaults" button (confirm modal). Individual settings have a hover reset icon that resets that single field.

**Config migration:** When the app version introduces new config fields, the loader applies defaults for missing fields and logs a toast: "Settings updated for v{version} -- N new options available."

---

## 10. UX Patterns

### 10.1 Button Feedback

See §8.2 for full button state specification. Summary:
- Every button that triggers an async operation must show a loading spinner
- Button is disabled during loading to prevent double-clicks
- Brief success/error visual feedback on completion (500ms)
- Never leave a button in loading state indefinitely -- implement timeouts (default 30s)

**Specific button feedback requirements:**

| Button/Action | Loading State | Success Feedback | Error Feedback |
|---------------|--------------|-----------------|----------------|
| Login/Logout | Spinner replaces icon, "Authenticating..." | Badge flips to new auth state, green flash | Red flash, error toast with message |
| Settings save | "Saving..." in header, checkmark on complete | "Saved" fades in header (2s) | Error toast |
| File upload/attach | Progress bar in attachment area | Thumbnail/filename appears | Error toast with "Retry" |
| Run start | Button transitions: "Start" → spinner → "Running" (disabled) | Status badge updates | Error card on dashboard |
| Doctor check | Per-row spinner during check | PASS/FAIL/WARN badge per row | Error badge with message |
| Import/export | Modal with progress bar | Success toast with file path | Error toast with details |
| Clean workspace | Confirm modal → progress bar → "Cleaned X files" toast | Toast with count | Error toast |

**Toggle sync guarantee:** When a toggle is flipped (e.g., auth login/logout, git enable/disable, filter on/off), the toggle must reflect the actual backend state, not just the UI click. Pattern: flip optimistically → call backend → on failure, flip back with error toast. Never leave a toggle in a state that disagrees with the backend.

### 10.2 Loading States

| Context | Loading Indicator |
|---------|------------------|
| Page navigation | Skeleton placeholder or spinner in content area |
| Data fetch (projects, evidence, history) | Skeleton rows or spinner overlay |
| Auth check | Spinner on auth status badge; "Checking..." text |
| Settings save | Button loading state + success toast |
| Orchestrator start | Button loading state; status badge transitions to "Starting..." then "Running" |

### 10.3 Toast Notifications

- 4 variants: success (lime), error (magenta), warning (orange), info (blue)
- Auto-dismiss after configurable duration (default: 4s for info/success, 8s for warning/error)
- Manual dismiss via close button
- Stack in top-right corner; max 3 visible (older ones dismissed)
- Each toast has a unique ID for deduplication

### 10.4 Modal Dialogs

- Variants: confirm (with confirm/cancel), error (with dismiss), info (with OK)
- Dark overlay behind modal (50% opacity)
- Focus trapped within modal when open
- Escape key closes modal
- Used sparingly -- prefer inline feedback over modals

### 10.5 Empty States

Every view must have a meaningful empty state:
- Brief explanation of what the view shows
- Action to populate it (e.g., "Run your first orchestration to see evidence here" with a button)
- Relevant icon consistent with active theme
- No blank pages -- always communicate what the user can do

**Specific empty states:**

| View/Area | Empty State Message | Action |
|-----------|-------------------|--------|
| Dashboard (no project) | "Select or create a project to get started" | "New Project" button |
| Chat (empty thread) | "Start a conversation -- ask questions, plan tasks, or run commands" | Focus composer input |
| Chat (no threads) | "No chat threads yet" | "New Thread" button |
| File Manager (no project) | "Open a project to browse files" | "Select Project" button |
| File Editor (no files open) | "Open a file from the File Manager or click a file path in chat" | None (informational) |
| Usage (no data) | "Usage data will appear after your first run" | None (informational) |
| Evidence (no evidence) | "Evidence logs will appear after orchestration runs" | "Start a run" link |
| Queue (empty) | "No messages queued -- the assistant will process messages as they arrive" | None |
| Terminal (no output) | Blinking cursor on empty dark background | None |
| Agent Activity (idle) | "No active agents -- start a run to see agent activity here" | None |
| Browser (no page) | "No page loaded -- enter a URL or click a link from the chat" | Show bookmarks if any |
| Debug (no config) | "No debug configuration found -- create one to start debugging" | "Create configuration" button |
| Ports (no servers) | "No active ports -- start a dev server to see it here" | None |
| Catalog (empty) | "Catalog is empty -- check your network connection or refresh" | "Refresh" button |
| SSH (no connections) | "No SSH connections configured" | "Add connection" button |

### 10.6 Error States

- Inline error messages for form validation (below the field, accent-magenta text)
- Error toasts for transient failures (network, auth)
- Error cards on Dashboard for orchestrator errors (red border, clear message, retry button)
- Error pages for unrecoverable states (with "Return to Dashboard" button)
- **Auth token expiry:** When a platform auth token expires mid-run, show inline error in chat/terminal ("[!] Claude Code auth expired -- please re-authenticate") with a "Re-authenticate" button that opens the Authentication tab. Do not silently fail.
- **Network disconnection:** If the app detects network loss during a chat or run, show a persistent banner at the top of the primary content area: "Network disconnected -- reconnecting..." with a spinner. Auto-dismiss on reconnection with brief "Reconnected" toast.
- **File operation failures:** When a file save, rename, or delete fails, show a toast with the specific error ("Permission denied: /path/to/file") and a "Retry" button.
- **Large file timeout:** If a file takes >5 seconds to load, show a progress spinner with "Loading large file..." and a "Cancel" button. If it exceeds 15 seconds, show a timeout error with "File too large -- opened in read-only truncated mode."

### 10.7 Onboarding and First-Run Experience

**First launch default layout:**
- Activity Bar (left)
- Dashboard (primary content, center)
- Chat panel (right, collapsed or 30% width)
- No bottom panel

**Three-step interactive tour (non-blocking, one-time):**
1. "This is your Dashboard" -- highlights primary content
2. "This is the Chat" -- highlights side panel
3. "Use the sidebar to navigate" -- highlights activity bar, mentions Ctrl+K

Each step has "Next" and "Skip tour." Completion persisted; tour never repeats.

**Progressive customization:** Layout customization features surface only after user has completed at least one interaction. Subtle gear icon with tooltip "Customize your layout."

**Layout presets before freeform:** Named presets (Focus, Orchestrator, Editor, Monitor) shown first. Custom layouts available after using presets. Up to 5 custom layouts.

### 10.8 HITL Approval UI

When the orchestrator pauses for HITL approval:
- Dashboard shows a CtA card: "Phase X complete -- approval required"
- Card shows completion status, evidence summary
- "Approve & Continue" button (primary/accent)
- "Reject" or "Cancel" button (secondary)
- Can also be addressed via Chat: user types "approve and continue"
- Toast notification when HITL pause occurs
- Status bar shows "Awaiting approval" indicator

### 10.9 Context Menus

Slint does not have a built-in context menu component. Custom implementation required:
- Triggered on right-click via `TouchArea` with `pointer-event` callback
- Positioned at mouse coordinates, adjusted to stay within window bounds
- Items: Copy, Paste, Select All (for text contexts); Copy Path, Open in Editor, Add to Context (for file contexts)
- Dismissed on click outside or Escape
- Styled per theme (retro: hard shadow + sharp corners; basic: subtle border + 4px radius)

### 10.10 Truncation with Expand

Long text (file paths, error messages, thinking streams) truncates with "..." and expands on click. All text remains selectable.

### 10.11 Animation and Transition Specifications

All animations use Slint's built-in `animate` directive with consistent timing:

| Category | Duration | Easing | Examples |
|----------|----------|--------|----------|
| **Micro feedback** | 100ms | ease-out | Button press, toggle flip, checkbox tick |
| **Panel transitions** | 200ms | ease-in-out | Panel collapse/expand, sidebar show/hide, tab switch |
| **Overlays** | 150ms (in), 100ms (out) | ease-out / ease-in | Modal appear/dismiss, toast slide-in, context menu popup |
| **Layout shifts** | 250ms | ease-in-out | Dashboard card reorder, panel dock/undock, split resize |
| **Progress** | continuous | linear | Spinner rotation, indeterminate progress bar, streaming indicator |
| **State transitions** | 150ms | ease-out | Status dot color change, auth status update, orchestrator state change |

**Reduced motion:** When system prefers-reduced-motion is active (detected via platform API on startup), replace all animations with instant transitions (0ms duration). Store override in Settings > General as a toggle ("Reduce animations").

**Scroll animations:** Scroll-to-target (e.g., click-to-open from chat) uses 200ms ease-out. Auto-scroll for new content is instant (no animation) to avoid visual delay.

### 10.12 Progress Bars and Indicators

**Determinate progress bar:** Filled bar showing percentage. Height 4px (inline) or 8px (standalone). Color follows status: `Theme.accent-blue` (normal), `Theme.success-green` (complete), `Theme.warning-amber` (paused).

**Indeterminate progress bar:** Sliding highlight animation (1.5s loop, linear). Used when total is unknown (e.g., agent thinking, web search). Same height as determinate.

**Stalled state:** If a progress bar hasn't updated in 30 seconds, change color to `Theme.warning-amber` and show a subtle pulse animation. Tooltip: "Progress stalled -- last update 45s ago."

**Context gauge (chat):** Circular progress (16px diameter) showing context window usage. Color transitions: blue (0-75%), amber (75-90%), red (90-100%). Hover tooltip shows exact token count and percentage.

**Phase/tier progress:** Stepped progress indicator (circles connected by lines). Each circle shows phase/tier state: empty (pending), half-filled (in-progress with spinning edge), filled (complete), X (failed). Connected line fills left-to-right as phases complete.

### 10.13 Sound Effects (MVP)

Audio feedback for key application events. Uses the `rodio` crate for cross-platform audio playback. All sounds are optional and disabled by default.

**Settings > General toggle:** "Sound effects" (default: off). When off, no audio is played. When on, sub-toggles allow per-event control.

**Event-to-sound mapping:**

| Event | Sound | Duration | Notes |
|-------|-------|----------|-------|
| Run complete (success) | Short ascending chime (3 notes) | ~600ms | Plays when any orchestrator run or chat agent run finishes successfully |
| Run complete (failure) | Low descending tone (2 notes) | ~400ms | Plays when a run fails or is cancelled by error |
| HITL approval needed | Gentle bell / notification ping | ~300ms | Plays when an approval prompt appears; does not repeat until dismissed |
| Rate limit hit | Soft warning tone | ~200ms | Plays once per rate-limit event (not on every retry) |
| Error (critical) | Sharp alert tone | ~250ms | Plays on unrecoverable errors (auth failure, crash recovery prompt) |
| Message received | Subtle click / pop | ~100ms | Plays when a new assistant message arrives in an inactive thread (configurable) |
| Timer milestone | Single soft tick | ~100ms | Plays at configurable intervals during long runs (e.g., every 5 minutes). Off by default. |

**Sound file format:** WAV or OGG files bundled with the application in `assets/sounds/`. File size budget: <50KB per sound, <500KB total. Users can replace sound files by placing custom files in `~/.puppet-master/sounds/` with matching filenames (e.g., `run-complete-success.wav` overrides the built-in sound).

**Volume control:** Master volume slider in Settings > General (0-100%, default 50%). Volume respects system volume. No per-event volume controls in MVP.

**Mute behavior:** When the app is minimized to tray, sounds still play (so the user hears run-complete notifications). When system "Do Not Disturb" or equivalent is active, sounds are suppressed.

**Implementation notes:** Sounds play on a dedicated audio thread (never block the UI thread). `rodio::OutputStream` is created once at startup and reused. If audio device is unavailable (e.g., headless server), skip silently (no error toast).

---

## 11. Anti-Flickering and Scroll Preservation

### 11.1 Core Principle

The GUI must never visually "jump" or "flicker" when background data updates arrive. Users must not lose their scroll position or see layout shifts during normal operation.

### 11.2 Strategies

**Scroll position preservation:**
- When new items are added to a `VecModel` (e.g., chat messages, terminal lines), preserve the current scroll position unless the user is scrolled to the bottom
- If scrolled to bottom: auto-scroll to show new content
- If scrolled up (reviewing history): hold position; show a "New messages below" indicator
- Implementation: Track `viewport-y` property on `ListView`; only update if at bottom threshold

**Batch UI updates:**
- When multiple properties change simultaneously (e.g., orchestrator status + progress + terminal lines), batch them into a single `invoke_from_event_loop` call to prevent partial renders
- Example: Do NOT call `invoke_from_event_loop` three times for three properties; collect changes, then apply all in one call

**Stable list keys:**
- Each item in a `VecModel` has a stable ID (not just an index) so that Slint can reconcile updates without destroying and recreating all items
- When updating a list item, modify the existing model entry rather than clearing and rebuilding the entire model

**Avoid full-model replacement:**
- Never call `VecModel::clear()` + re-add all items when only one item changed
- Use `VecModel::set_row_data()` for individual item updates
- Use `VecModel::push()` / `VecModel::remove()` for additions/removals

**Layout stability:**
- Fixed-size containers for status badges, progress bars, and other indicators so they do not cause layout shifts when values change
- Reserve space for optional elements (error messages, loading indicators) even when not visible, or use animation to smoothly reveal them

**Debounce layout persistence:**
- When the user resizes panels or rearranges cards, debounce the redb write (300-500ms) to avoid disk thrashing and potential UI stutter

### 11.3 Terminal-Specific Anti-Flickering

- Bounded line buffer (max 500 visible lines; older lines evicted from VecModel)
- When streaming output arrives rapidly, throttle UI updates to max 30fps (batch lines arriving within 33ms into a single VecModel update)
- Ring buffer in Rust; only the visible window is in the VecModel

---

## 12. Responsive Design

### 12.1 Breakpoints

| Window Width | Layout Adaptation |
|-------------|-------------------|
| >= 1360px | **Full layout:** All panels visible at comfortable widths |
| 1080-1359px | **Compact:** Side panel at minimum (240px); bottom panel compact |
| 720-1079px | **Collapsed:** Side panel auto-collapses to 48px icon tab; bottom panel collapses to header row (24px) |
| < 720px | **Single-column:** Activity bar only; panels accessible as overlays/drawers from activity bar icons |

### 12.2 Side Panel Responsive Widths

| Panel Width | Adaptation |
|------------|------------|
| 480px+ | Full layout with all controls |
| 360-479px | Mode tabs use abbreviated text; footer collapses platform/model to icons |
| 280-359px | Mode tabs show icons only (tooltip on hover); footer shows only context % |
| 240px (minimum) | Mode icons, messages, input only; all extras behind overflow menu |

### 12.3 Dashboard Grid Responsive

| Window Width | Grid Columns |
|-------------|-------------|
| < 1200px | 2 columns |
| 1200-1600px | 3 columns |
| > 1600px | 4 columns |

### 12.4 Activity Bar Responsive

Activity bar remains at 48px at all breakpoints. At < 720px, it becomes the primary navigation mechanism, with panels opening as overlay drawers.

---

## 13. Accessibility

### 13.1 Basic Theme as Accessibility Option

The Basic theme is the primary accessibility-friendly option:
- No decorative effects (pixel grid, paper texture, scanlines)
- WCAG AA compliant color palette (4.5:1 minimum contrast for all text)
- System fonts designed for screen readability
- Minimum 14px body text, 1.6 line height, 0.02em letter spacing
- 4px border radius (less visually harsh)
- No hard shadows
- Respects `prefers-reduced-motion` (no animations or transitions)

### 13.2 Focus Indicators

All themes must show visible focus indicators:
- **Retro Dark/Light:** ACID_LIME 2px border on focus
- **Basic:** High-contrast 2px ring with 2px offset in accent-blue

### 13.3 Keyboard Navigation

- All interactive elements reachable via Tab navigation
- Focus order follows visual layout: Activity bar -> primary content -> side panel -> bottom panel -> status bar
- Every list, table, and tree supports: Up/Down arrow navigation, Enter to select/activate, Escape to deselect/go back, Home/End to jump to first/last item
- Type-ahead filtering where appropriate (thread list, project list, file tree)

### 13.4 Screen Reader Support

Slint's screen reader support is limited. Mitigations:
- Set `accessible-role` and `accessible-label` properties on all interactive components where available in Slint 1.15.1
- Panel state (docked/floating) announced via accessible labels
- Theme name available to assistive technology
- Keyboard shortcuts prominently documented and discoverable via command palette

### 13.5 Minimum Touch/Click Targets

All clickable/draggable controls must be at least 24px in height/width for reliable interaction.

---

## 14. Slint File Organization

### 14.1 Directory Structure

```
puppet-master-rs/
+-- build.rs                          # slint_build::compile("ui/app.slint")
+-- ui/                               # All .slint files
|   +-- app.slint                     # Root component, imports all views
|   +-- theme.slint                   # Theme global + token definitions
|   +-- widgets/                      # Reusable .slint widgets
|   |   +-- panel_card.slint
|   |   +-- status_badge.slint
|   |   +-- styled_button.slint
|   |   +-- styled_input.slint
|   |   +-- combo_box.slint
|   |   +-- progress_bar.slint
|   |   +-- terminal_output.slint
|   |   +-- toast.slint
|   |   +-- modal.slint
|   |   +-- pixel_grid_overlay.slint
|   |   +-- paper_texture.slint
|   |   +-- context_menu.slint
|   |   +-- selectable_text.slint
|   |   +-- activity_bar.slint
|   |   +-- status_bar.slint
|   |   +-- breadcrumb.slint
|   |   +-- command_palette.slint
|   |   +-- budget_donut.slint
|   |   +-- usage_chart.slint
|   |   +-- step_circle.slint
|   |   +-- icon.slint
|   |   +-- help_tooltip.slint
|   |   +-- interview_panel.slint
|   +-- views/                        # Page-level views
|   |   +-- dashboard.slint
|   |   +-- settings.slint            # Unified (old config + settings + login + doctor)
|   |   +-- wizard.slint
|   |   +-- interview.slint
|   |   +-- tiers.slint
|   |   +-- evidence.slint
|   |   +-- evidence_detail.slint
|   |   +-- metrics.slint
|   |   +-- history.slint
|   |   +-- memory.slint
|   |   +-- ledger.slint
|   |   +-- coverage.slint
|   |   +-- projects.slint
|   |   +-- setup.slint
|   |   +-- usage.slint               # NEW
|   |   +-- file_editor.slint         # NEW
|   |   +-- agent_activity.slint      # NEW
|   |   +-- not_found.slint
|   +-- panels/                       # Detachable panel content
|   |   +-- chat_panel.slint
|   |   +-- file_manager_panel.slint
|   |   +-- bottom_panel.slint          # Terminal/Problems/Output/Ports/Browser/Debug tabs
|   |   +-- browser_panel.slint         # NEW - Webview host + URL bar + bookmarks
|   |   +-- debug_panel.slint           # NEW - DAP debug UI (variables, call stack, breakpoints)
|   +-- windows/                      # Secondary windows
|       +-- floating_panel.slint
|       +-- about.slint
+-- src/
    +-- main.rs                       # Entry point, BackendSelector
    +-- app.rs                        # AppState, message routing
    +-- bridge/                       # Slint <-> Rust binding layer
    |   +-- mod.rs
    |   +-- theme_bridge.rs           # ThemeVariant -> Theme global sync
    |   +-- model_bridge.rs           # VecModel setup, model factories
    |   +-- callback_bridge.rs        # Slint callback -> Rust handler wiring
    |   +-- window_bridge.rs          # Multi-window lifecycle
    +-- panels/                       # Detachable panel system
    |   +-- mod.rs
    |   +-- registry.rs               # PanelRegistry, dock/undock logic
    |   +-- layout.rs                 # LayoutConfig, persistence, presets
    |   +-- snap.rs                   # Snap zone detection
    +-- effects/                      # Custom rendering effects
    |   +-- mod.rs
    |   +-- grid_texture.rs           # Pixel grid tile generation (SharedPixelBuffer)
    |   +-- paper_texture.rs          # Paper grain tile generation (SharedPixelBuffer)
    +-- theme/                        # Theme definitions (Rust side)
    |   +-- mod.rs
    |   +-- palette.rs                # Color palettes (ported from current)
    |   +-- tokens.rs                 # Design tokens (spacing, borders, fonts, sizes)
    |   +-- variants.rs               # ThemeVariant enum + apply_to
    |   +-- custom_loader.rs          # NEW - Load custom themes from TOML files
    +-- browser/                      # NEW - Browser tab webview integration
    |   +-- mod.rs
    |   +-- webview.rs                # wry webview lifecycle, URL navigation
    |   +-- bookmarks.rs              # Bookmark persistence
    |   +-- context_capture.rs        # Click-to-context element capture
    +-- debug/                        # NEW - Debug Adapter Protocol integration
    |   +-- mod.rs
    |   +-- dap_client.rs             # DAP protocol client
    |   +-- breakpoints.rs            # Breakpoint management
    |   +-- launch_config.rs          # Run/debug configuration parsing
    +-- ssh/                          # NEW - SSH remote editing
    |   +-- mod.rs
    |   +-- connection.rs             # SSH/SFTP connection management
    |   +-- remote_fs.rs              # Remote filesystem abstraction
    |   +-- keychain.rs               # System keychain credential storage
    +-- audio/                        # NEW - Sound effects
    |   +-- mod.rs
    |   +-- player.rs                 # rodio-based audio playback
    |   +-- events.rs                 # Event-to-sound mapping
    +-- catalog/                      # NEW - Community catalog
    |   +-- mod.rs
    |   +-- index.rs                  # Catalog index fetch/cache
    |   +-- installer.rs              # One-click install logic
    +-- sync/                         # NEW - Config sync bundles
    |   +-- mod.rs
    |   +-- exporter.rs               # Bundle export
    |   +-- importer.rs               # Bundle import + conflict resolution
    +-- detect/                       # NEW - Language/framework detection
    |   +-- mod.rs
    |   +-- scanner.rs                # Project root scanning for marker files
    +-- hotreload/                    # NEW - Hot reload file watcher
    |   +-- mod.rs
    |   +-- watcher.rs                # notify-based file watcher
    |   +-- builder.rs                # Build command execution
    +-- ... (remaining app modules unchanged)
```

### 14.2 View Switching in Slint

Use conditional `if` blocks for lazy view rendering:

```slint
if root.current-page == 0 : DashboardView { /* ... */ }
if root.current-page == 1 : ProjectsView { /* ... */ }
if root.current-page == 2 : SettingsView { /* ... */ }
// ... etc
```

Hidden views have zero runtime cost. Widget trees are destroyed when the condition becomes false and recreated when true.

### 14.3 Virtualized Lists

Chat messages, file trees, log outputs, evidence lists, and other long lists use Slint's `ListView` with `VecModel`. For extremely large datasets (100k+ log lines), implement a custom `Model` trait backed by a ring buffer to keep memory bounded.

---

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

## 16. Migration Mapping

### 16.1 Iced View to Slint Location

| Current Iced View | New Slint Location | Notes |
|-------------------|-------------------|-------|
| `dashboard.rs` | `views/dashboard.slint` (Home group) | Add rearrangeable card grid, 4-split terminal |
| `projects.rs` | `views/projects.slint` (Home group) | Minimal changes |
| `wizard.rs` | `views/wizard.slint` (Run group) | Add agent activity pane, intent selection |
| `interview.rs` | `views/interview.slint` (Run group) | Also available as Chat mode |
| `tiers.rs` | `views/tiers.slint` (Run group) | Minimal changes |
| `config.rs` | **Merged into** `views/settings.slint` (Settings group) | Tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML |
| `settings.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: General |
| `login.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Authentication |
| `doctor.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Health |
| `setup.rs` | `views/setup.slint` (Run group) | Minimal changes |
| `metrics.rs` | `views/metrics.slint` (Data group) | Minimal changes |
| `evidence.rs` | `views/evidence.slint` (Data group) | Minimal changes |
| `evidence_detail.rs` | `views/evidence_detail.slint` (Data group) | Minimal changes |
| `history.rs` | `views/history.slint` (Data group) | Minimal changes |
| `ledger.rs` | `views/ledger.slint` (Data group) | Minimal changes |
| `memory.rs` | `views/memory.slint` (Data group) | Minimal changes |
| `coverage.rs` | `views/coverage.slint` (Data group) | Minimal changes |
| `not_found.rs` | `views/not_found.slint` | Minimal changes |
| (new) | `views/usage.slint` (Data group) | New page |
| (new) | `views/file_editor.slint` (Primary content) | New page |
| (new) | `views/agent_activity.slint` (Embedded) | New component |
| (new) | `panels/chat_panel.slint` (Side panel) | New panel |
| (new) | `panels/file_manager_panel.slint` (Side panel) | New panel |

### 16.2 Widget Migration

All 25 current Iced widgets map to Slint equivalents. Key differences:
- **Canvas-based widgets** (pixel_grid, paper_texture, step_circle, budget_donut, usage_chart): Use `SharedPixelBuffer` + `Image` instead of Iced's `canvas::Program`
- **text_editor::Content** (for read-only terminal/log display): Use Slint's `TextEdit` (read-only mode) or custom `ListView` with styled text lines
- **Subscriptions** (50ms polling): Replace with event-driven `invoke_from_event_loop`
- **Context menu:** Custom implementation (Slint has no built-in)
- **Animations** (page transitions, pulsing status dots): Use Slint's property transitions and `animate` keyword
- **Dynamic scaling** (UI scale 0.75-1.5): Use Slint's global scale factor or multiply all token values by scale

### 16.3 Data Type Preservation

All current data types (AppTheme, Page, CurrentItem, ProgressState, OutputLine, BudgetDisplayInfo, DoctorCheckResult, etc.) remain in Rust. Only their Slint representations (via properties and models) change. The backend event system, orchestrator state, and persistence remain unchanged.

---

## 17. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **`ImageFit.repeat` may not exist in Slint 1.15.1** | Medium | Use `SharedPixelBuffer` to generate tiles at the viewport size; or manually tile via `GridLayout` with repeated `Image` elements. Test at build time; if unavailable, use fallback approach. |
| **Multi-window lifecycle edge cases** | High | State machine in Rust manages window create/destroy. On floating window close -> dock or collapse; update layout state. Test: focus management between main and floating windows; data sync when floating window is open; re-dock after window was on disconnected monitor. |
| **Limited screen reader support** | Medium | Keyboard navigation is comprehensive (§13.3). Set `accessible-role` and `accessible-label` where Slint supports them. Document limitations. Basic theme provides maximum readability. |
| **No built-in context menu** | Low | Custom `ContextMenu` widget using `TouchArea` pointer events. Positioned at mouse coordinates. Styled per theme. |
| **No built-in docking framework** | High | Custom `PanelRegistry` in Rust handles dock/undock state machine, snap detection, window lifecycle. This is the most complex custom component and should be implemented early. |
| **Font family change requires restart** | Low | Detect font family change in settings. Show restart prompt. Pre-load fonts for all themes on startup so within-family switches (Dark <-> Light) are instant. |
| **4-split terminal performance** | Medium | Virtualize visible lines only. Bounded ring buffers per pane (max 10k lines in memory); VecModel holds only the visible window (~500 lines) plus a small overscan buffer. On scroll, splice the VecModel from the ring buffer. Batch/throttle streaming updates (max 30fps). One PTY per pane. |
| **Platform-specific window manager issues** | Medium | Test: macOS window snapping with floating panels, Linux compositing with overlay effects, Windows DPI scaling. Handle gracefully with fallback behaviors. |
| **Large Settings page complexity** | Medium | 20 tabs across 5 groups. Two-level sidebar navigation (left sidebar for groups, right area for selected tab) is mandatory. Group labels act as collapsible headers. Settings search bar at the top of the sidebar. Test with real data. |
| **Migration scope** | High | 18 existing views + 5 new = 23 total. Prioritize: (1) Theme system + shell layout, (2) Dashboard + Settings, (3) Chat + File Manager, (4) remaining views. Each view can be migrated independently. |
| **invoke_from_event_loop saturation** | High | High-frequency terminal output (1000+ lines/sec) can saturate the event loop. Mitigation: Batch terminal updates with a 33ms (30fps) throttle timer; collect lines in a buffer and push them as a single VecModel update per frame. |
| **Chat message memory bounds** | Medium | No cap on messages per thread could cause memory issues with very long sessions. Mitigation: Implement a soft cap (e.g., 5000 messages per thread); on exceeding, archive oldest messages to disk and show "Load earlier messages" button. |
| **Theme global property update batching** | Low | Switching 20+ theme properties could cause intermediate re-renders. Mitigation: Slint batches property changes within a single `invoke_from_event_loop` call; always set all theme properties in one callback. |
| **Dashboard card drag-and-drop** | Medium | Drag-reorder logic for dashboard cards is custom and complex. Mitigation: Use a simple ordered-list model with drag-handle + click-to-swap as MVP; full drag-and-drop is enhancement. Test with varying card counts (2-12). |
| **Floating window data sync race conditions** | High | Multiple windows reading/writing the same VecModel can race. Mitigation: All model mutations go through `invoke_from_event_loop` on the main event loop (single writer). Floating windows receive updates via the same shared `Rc<VecModel>`. Never clone+replace the model; always mutate in-place. |
| **LSP server lifecycle management** | Medium | Multiple LSP servers (one per language) running simultaneously. Mitigation: Launch servers lazily (on file open for that language). Kill servers on project close. Cap concurrent servers (e.g., max 5). Handle server crashes gracefully (auto-restart once, then show error in status bar). |
| **External drag-and-drop platform APIs** | Medium | Requires platform-specific integration (Windows IDropTarget, macOS NSDraggingDestination, Linux Xdnd/Wayland). Mitigation: Abstract behind a trait; implement per-platform. If Slint exposes native drop events, use those instead. Test on all three platforms. |
| **HTML preview webview** | Medium | Embedding a webview for HTML hot-reload preview may conflict with the Skia renderer pipeline. Mitigation: Use `wry` or similar embeddable webview; ensure it sits in a separate native child window within the editor area. Fallback: render static HTML snapshots as images. |
| **Steer submission mid-stream injection** | Medium | Injecting a new user message while the assistant is actively generating requires careful stream handling. Mitigation: Buffer the steer message; on next token boundary, prepend the steer to the ongoing context. Test that partial generation + steer produces coherent output. |
| **Webview embedding (`wry`) conflicts** | High | Both the Browser tab (§7.20) and HTML preview (§7.18) embed webviews that may conflict with the Skia renderer pipeline. Mitigation: Use `wry` native child windows positioned within Slint layout areas. Each webview runs in its own OS-level child window overlaid on the Slint surface. Test: resize behavior, z-ordering when panels overlap, theme-aware chrome. Fallback: render static screenshots of web pages as images if webview embedding proves unstable. |
| **DAP debugger reliability** | Medium | Debug adapter communication is asynchronous and adapters may crash, hang, or produce unexpected output. Mitigation: Implement timeouts per DAP request (default 10s for evaluate, 30s for launch). Auto-restart crashed adapters once. Show clear error state in Debug tab when adapter is unresponsive. Cap concurrent debug sessions to 1 per project. |
| **SSH connection stability** | Medium | SSH connections may drop unexpectedly (network change, host reboot, timeout). Mitigation: Keep-alive packets every 30s. On disconnect, retain local buffer contents and show reconnect banner. Auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s, max 5 attempts). After max attempts, show manual "Reconnect" button. Store credentials in system keychain, never in config files. |
| **Catalog service availability** | Low | Catalog index may be unavailable (network down, server offline). Mitigation: Bundle a fallback index with the app binary. Cache last-fetched index locally. Show "Catalog may be outdated" banner when using cached data. All catalog operations work offline with cached index. |
| **Sound effects cross-platform audio** | Low | `rodio` audio playback may fail on some Linux configurations (missing PulseAudio/ALSA). Mitigation: Detect audio device availability at startup. If unavailable, disable sound effects silently and hide the toggle in Settings (or show "(audio unavailable)" label). No error toasts for missing audio. |
| **Custom theme validation** | Low | User-created theme TOML files may have invalid colors, missing tokens, or malformed syntax. Mitigation: Validate all custom themes on load. Skip invalid themes with a warning toast on Settings open. Never crash on invalid theme files. Use base theme values for any missing or invalid tokens. |
| **Settings page tab count (20 tabs)** | Medium | 20 tabs across 5 groups requires careful navigation. Mitigation: Two-level sidebar navigation is mandatory (not optional). Group headers are collapsible. Search/filter across all settings via a search bar at the top of the Settings sidebar. Deep-link support: command palette "Open setting: {name}" jumps directly to the relevant tab and scrolls to the field. |
| **Project switch state reload performance** | Medium | Switching projects triggers full state reload (editor tabs, file tree, chat threads, config, LSP servers). Mitigation: Load in priority order: (1) config (instant, from redb), (2) file tree (async scan, show skeleton), (3) editor tabs (lazy, only load active tab content), (4) LSP (background restart), (5) chat threads (lazy load). Show skeleton placeholders during reload. Target: <500ms to interactive. |
| **File watcher resource consumption** | Low | Hot reload file watcher (§7.20 Ports) monitors project directories for changes. Large projects (>10k files) may consume significant inotify/FSEvents handles. Mitigation: Use `notify` crate with debounced mode. Watch only source directories (exclude node_modules, target, .git, build). Configurable watch paths in Settings. Cap watchers at 5000 paths; if exceeded, show "Watching root directory only" fallback. |

---

## 18. Promoted Features (Formerly Future Considerations)

All items previously listed as "future considerations" have been promoted to MVP scope and are fully specified in their respective sections:

| Feature | MVP Location |
|---------|-------------|
| Built-in browser / click-to-context | Bottom Panel Browser tab (§7.20) |
| Project bar / instant project switch | Title bar project bar (§3.4) |
| Sound effects | UX Patterns §10.13 + Settings > General |
| Hot reload controls | Bottom Panel Ports tab (§7.20) |
| In-app instructions editor | File Editor instructions mode (§7.18) |
| Additional themes / custom themes | Theme extensibility (§6.6) |
| Language/framework auto-detection | Projects (§7.3) |
| Catalog / one-click install | Settings > Catalog tab (§7.4.3) |
| Sync bundle manager | Settings > Sync tab (§7.4.4) |
| SSH remote editing | Settings > SSH tab (§7.4.5) + File Editor SSH integration (§7.18) |
| Run/debug configurations | Bottom Panel Debug tab (§7.20) + Settings > Debug (§7.4.6) |
| Terminal/browser tabs (pin + caps) | Bottom Panel terminal tab management (§7.20) |

No features are deferred. All items in this specification are MVP scope.

---

## Appendix A: Cross-References

| Plan Document | Sections Incorporated |
|--------------|----------------------|
| `Plans/assistant-chat-design.md` | Chat panel (§7.16), modes, threads, steer/queue submission, subagent inline blocks, commands, activity transparency, plan panel, context usage, HITL-to-chat handoff |
| `Plans/FileManager.md` | File Manager (section 7.17), File Editor (section 7.18), embedded document pane shared-buffer contract (section 7.19.1), click-to-open, @ mention, preview, external drag-and-drop, HTML preview/hot reload, click-to-context, open-file contract, shared buffer model, editor diff view, **SSH remote editing (section 7.4.5 and section 7.18)**, **run/debug configurations (section 7.4.6 and section 7.20 Debug)**, **terminal/browser tab management (section 7.20)** |
| `Plans/usage-feature.md` | Usage page (§7.8), per-thread usage, ledger, analytics, 5h/7d visibility, alerts |
| `Plans/human-in-the-loop.md` | HITL settings (§7.4 Settings/HITL tab), HITL approval UI (§10.8) |
| `Plans/chain-wizard-flexibility.md` | Wizard redesign (section 7.5), intent selection, intent-specific fields, file upload limits, Builder opener + turn semantics, checklist status UI, findings preview, single final approval gate, tri-location chat pointers, embedded document pane + agent activity separation, pause/cancel/resume controls, recovery state, adaptive interview phases |
| `Plans/storage-plan.md` | Persistence (§15), seglog projections, redb schema, Tantivy |
| `Plans/agent-rules-context.md` | Settings/Rules tab (§7.4), application + project rules |
| `Plans/rebrand.md` | Product name "Puppet Master" throughout |
| `Plans/newfeatures.md` | Bottom panel/terminal (§7.20), thinking display, streaming, keyboard shortcuts, stream event visualization, duration timers, background runs, restore points, config migration dialog, rate-limit banner, version update banner, **project bar (§3.4)**, **sound effects (§10.13)**, **hot reload controls (§7.20 Ports)**, **instructions editor (§7.18)**, **language auto-detection (§7.3)** |
| `Plans/interview-subagent-integration.md` | Interview config tab (section 7.4), agent activity (section 7.19), embedded document pane (section 7.19.1), findings summary preview, single final approval gate, multi-pass review |
| `Plans/orchestrator-subagent-integration.md` | Dashboard (§7.2), orchestrator controls, tier display |
| `Plans/WorktreeGitImprovement.md` | Branching tab in Settings (§7.4), worktree recovery in Health tab |
| `Plans/FileSafe.md` | Advanced tab in Settings (§7.4), command blocklist, write scope, security filter |
| `Plans/MiscPlan.md` | Health tab "Clean workspace" button (§7.4), cleanup config in Advanced tab, Shortcuts tab (§7.4), Skills tab (§7.4) |
| `Plans/feature-list.md` | Master feature reference: chat modes (§7.16), thread management, slash commands (§7.16.2), ELI5/YOLO, attachments, Teach, context management (§9.6), editor detach (§7.18), **catalog install UI (§7.4.3)**, **sync bundle manager (§7.4.4)** |
| `Plans/newtools.md` | MCP configuration in Advanced tab (§7.4), tool discovery during interview |
| `Plans/Tools.md` | Tool permissions in Advanced tab (§7.4.1), permission model (allow/deny/ask), presets, central tool registry; tool usage widget on Usage page (§7.8); tool approval dialog in Chat (§7.16) |
| `Plans/LSPSupport.md` | LSP tab in Settings (§7.4.2), editor LSP features (§7.18: diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, go-to-definition), **Chat Window LSP (§7.16: diagnostics in context, @ symbol with LSP, code-block hover/go-to-definition, Problems link)**, Problems tab (§7.20), status bar LSP indicator |
| `Plans/rewrite-tie-in-memo.md` | Rewrite scope alignment; ensures GUI migration ties into broader rewrite plan |

## Appendix B: Locked Decisions Summary

These decisions are final and must not be revisited during implementation:

1. **Slint 1.15.1** -- no other UI framework
2. **winit + Skia** default, **winit + FemtoVG-wgpu** fallback
3. **No React/JS/TS/HTML/CSS** -- pure Rust + Slint
4. **IDE shell layout** -- Activity Bar + Primary Content + Side Panel + Bottom Panel
5. **Three theme families** -- Retro Dark, Retro Light, Basic Modern (4 built-in variants + custom themes via TOML)
6. **Settings restructure** -- unified page merging old Config + Settings + Login + Doctor (20 tabs in 5 groups, two-level sidebar navigation)
7. **Event-driven updates** via `invoke_from_event_loop`, not polling
8. **redb for layout persistence**, seglog for events, Tantivy for search
9. **Model/platform selection via dropdowns**, not text entry
10. **Product name: "Puppet Master"**
11. **All 12 former "future considerations" are MVP** -- browser, project bar, sound effects, hot reload, instructions editor, custom themes, language detection, catalog, sync, SSH, debug, terminal tab management
12. **Bottom panel has 6 tabs** -- Terminal, Problems, Output, Ports, Browser, Debug
13. **Webview via `wry`** -- used for Browser tab and HTML preview
14. **Debug via DAP** -- Debug Adapter Protocol for integrated debugging
15. **SSH via system keychain** -- credentials stored in OS keychain, never in config files
