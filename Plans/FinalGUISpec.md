# Puppet Master GUI Specification -- Slint Rewrite

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


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

This document is the authoritative GUI specification for the Puppet Master desktop application, replacing the current Iced-based GUI with a Slint 1.15.1 implementation. The design follows an IDE-shell layout (Activity Bar + Primary Content + Side Panel + Bottom Panel) with three user-facing theme families (Retro Dark, Retro Light, Basic Modern) backed by deterministic built-in palette variants plus user-created custom themes, detachable panels, and a rearrangeable dashboard.

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
- **Product name:** "Puppet Master" (per Plans/Glossary.md)

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

Deterministic selection order:
1. Explicit valid `SLINT_BACKEND` override wins.
2. Otherwise use the persisted app preference if it maps to a compiled-in backend.
3. Otherwise use compiled default order: `winit + Skia` → `winit + FemtoVG-wgpu` → emergency software renderer.

Failure handling:
- An invalid override or unavailable preferred backend MUST emit a startup diagnostic and fall through deterministically to the next compiled-in backend.
- The selected backend MUST be shown in diagnostics/setup surfaces so fallback behavior is inspectable.

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
| BAR  |   (active page view)                     | Activity-bar  |
|      |                                          | surface slot  |
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
| **Title bar** | `HorizontalLayout` | height: 28px fixed | App name (Orbitron Bold 14px), compact current-project context, theme toggle, settings gear |
| **Activity bar** | `VerticalLayout` | width: 48px fixed | Icon-only vertical nav; always visible |
| **Primary content** | `VerticalLayout` (flex: 1) | fills remaining space | Active page view; scrollable internally per page |
| **Side panel** | `VerticalLayout` | width: 240-480px, resizable | Hosts the currently selected activity-bar side-panel surface; one visible at a time; detachable where supported |
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
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

The title bar no longer owns primary project switching.

Canonical shell rule:
- project switching is a workspace-tab operation surfaced through the Projects view, project/session browser, command palette, and dedicated switch commands
- the active workspace tab changes project by default
- a separate command opens the target project in a new workspace tab
- the title bar may show compact current-project context, but it is not a project bar and does not own the multi-project shell model

Required visible behavior:
- current project name/path summary for the active workspace tab
- badge when the active project has background activity, blocked items, or unsaved shell state that needs attention
- keyboard entrypoint for instant project switch
- responsive collapse without losing the command-palette project switch path

Non-canonical after this section:
- title-bar dropdown/strip as the primary project-switch shell
- shell semantics that assume only one active project context exists in the application at a time
### 3.5 Spacing and Density

**Global spacing tokens** (base design tokens; independent of UI scaling):

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

## 5. Panel System

### 5.1 Detachable Panels
**Side-panel occupancy contract (one at a time; last-click wins):** The side panel is the single activity-bar-driven side-panel slot. Run & Debug, Git (GitHub), Docker Manage, Source Control, Unraid, Artifacts, Chat, and File Manager can occupy it one at a time. See §4.1 Activity Bar for which icon shows which panel. Detach/re-dock support is limited to the panels listed below.

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
**Layout persistence per project:** Panel dock state (docked side and width, or floating position/size), **activity bar icon order**, and **which panel was last visible** are persisted **per project** in redb (e.g. under keys scoped by `project_id`). Restored on startup and when switching projects. If a floating window was on a monitor no longer connected, fall back to docked state.
### 5.8 Panel Edge Cases and Recovery

**Data sync:** Floating and docked instances share the same `Rc<VecModel<T>>` and scalar properties. When the Rust side replaces an entire model (e.g., project switch), it must update the shared `Rc` in-place rather than reassigning the pointer, so both windows stay synchronized.

**Monitor disconnect:** On startup, validate floating window coordinates against available monitors. If coordinates are off-screen or on a disconnected monitor, fall back to docked state. At runtime, listen for display-change events (platform-specific) and re-dock any orphaned floating windows.

**Snap zone conflicts:** If two floating panels are both within 25px of the same edge, the one closer to the edge wins. If equidistant, the most recently moved panel snaps first.

**Focus management:** When a floating panel window closes (user clicks X or presses Escape), focus returns to the main window. Tab key does NOT cross window boundaries -- each window has its own focus chain.

**Zero-width prevention:** Minimum panel width is 240px. If a resize drag would reduce below this, clamp at 240px. Bottom panel minimum height is 80px (collapse to 24px header via collapse button only, not via resize drag).

---

## 6. Theme System

### 6.1 Three Theme Families (Three User-Facing Choices)

| Theme Family | Variants | Retro Effects | Target Audience |
|-------|--------|--------------|----------------|
| **Retro Dark** | 1 | Full: pixel grid, paper texture, scanlines, hard shadows, sharp corners, Orbitron + Rajdhani | Users who love the current aesthetic |
| **Retro Light** | 1 | Full (reduced opacity): pixel grid, paper texture, hard shadows, sharp corners, Orbitron + Rajdhani | Light-mode users who want the aesthetic |
| **Basic Modern** | 2 internal palette variants | None: flat colors, subtle borders, rounded corners, system fonts | Accessibility, readability, reduced visual noise |

User-facing selector contract:
- The GUI MUST expose exactly three built-in theme choices: `Retro Dark`, `Retro Light`, and `Basic`.
- `Basic` may internally resolve to light or dark palette tokens based on explicit sub-setting or system scheme, but that internal palette choice does not create a fourth user-facing built-in theme promise.

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
- **Basic palette note:** Switching Basic between its internal light/dark palette variants MAY be live when fonts do not change, but it remains one built-in theme family in the UI model.

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
ContractRef: ContractName:Plans/FinalGUISpec.md#13, ContractName:Plans/DRY_Rules.md#7

---

## 7. Views Specification

### 7.1 Orchestrator
Orchestrator is the operational surface for rewrite-era execution.

Rules:
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- only `Progress` is widget-composed
- `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Crosswalk.md

### 7.2 Source Control
Source Control is a narrow, compact, worktree-first panel.

Rules:
- rows are concrete worktrees/branches/paths
- package, lane, and run context appear as metadata rather than as the primary grouping axis
- Git-native actions remain in Source Control, not in Orchestrator

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

### 7.3 Shared route and open behavior
Views consume the canonical navigation/source-open primitives.

Rules:
- routed opens resolve through `route_target`
- source opens resolve through `OpenSubject` or `OpenFile` as appropriate
- `resume_url` is serialized transport only and must not outgrow the canonical route contract
- shell realization such as docked/floating state, widths, and local panel layout remains shell state rather than route identity

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/Crosswalk.md

#### Thread context detail realization

Thread context details are a reusable editor-tab surface rather than a chat-side-panel usage view.

Rules:
- `More Details` from the chat context hover module opens or focuses a thread-scoped Context Detail Pane in the editor-tab host
- there is one open Context Detail Pane tab per thread; repeated opens focus the existing tab
- route selection reveals the correct shell destination and focus target
- generated-document or subject realization for the tab follows the canonical route/open split rather than a chat-local special case
- the shell must not treat a detached pop-out or side-panel usage panel as the canonical destination for this surface

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md
### 7.4 Settings and inspectors
Settings and inspectors separate:
- inherited / overridden
- requested
- effective
- honored / skipped / clamped

Rules:
- detailed runtime identity inspectors must show provider, model, persona, account, and worker-policy requested/effective state
- compact surfaces may show only material deltas
- historical views use frozen captured state and do not recompute from current settings
- chat-facing compact rows and popovers are compact surfaces, not the full detailed inspector tier

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

Chat runtime-inspector rules:
- the message-under-row compact summary shows resolved mode label, model, and assistant duration or user timestamp
- the message info popover shows `Mode`, `Provider`, `Model`, `Effort`, `Persona`, `Worker`, `Tokens`, and `Context`
- compact chat-facing surfaces omit version and omit `current` / `frozen` wording
- the fuller requested/effective/runtime disclosure tier lives in the Context Detail Pane and other detailed inspectors

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Context Detail Pane inspector rules:
- default view is curated, with a visible raw toggle
- curated view exposes overview, breakdown, and per-message inspection
- raw view exposes thread-level and message-level serialized payloads suitable for debugging, audits, and provider/runtime inspection
- thread-scoped estimated cost and token/context summaries must stay aligned with the canonical usage pipeline

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
### 7.5 Project and attention surfaces
Project cards and the attention center consume project-summary and project-attention projections.

Rules:
- project cards surface activity, attention, and health separately
- blocked ownership is summarized by the strongest active item when one exists
- attention rows, palette opens, and cross-surface pivots resolve through the same internal route contract

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md
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
| `hotreload_state:v1:{project_id}` | Dev-session reload state, build command, watched paths | On change |

Normative mapping note for review workflows:
- The canonical durable review/bundle contract is owned by `Plans/storage-plan.md` (`bundle.{bundle_id}`, `doc_registry.{bundle_id}`, `notes_index.{bundle_id}`, `note.{bundle_id}.{note_id}`, `document_pane_state.{bundle_id}`, `final_review_output.{bundle_id}`).
- GUI-facing keys in this table are logical/UI projections and MUST NOT become competing SSOTs with incompatible field shapes.
- Findings-summary and final-gate restoration MUST resolve back to the canonical bundle/review records defined in `Plans/storage-plan.md`.

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
- **Dynamic scaling** (UI scale 0.75-1.5): Use Slint's native global/window scale factor as the only scaling path; do not port Iced token-multiplication layers into Slint view code

ContractRef: ContractName:Plans/Contracts_V0.md#8, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

### 16.3 Data Type Preservation

All current data types (AppTheme, Page, CurrentItem, ProgressState, OutputLine, BudgetDisplayInfo, DoctorCheckResult, etc.) remain in Rust. Only their Slint representations (via properties and models) change. The backend event system, orchestrator state, and persistence remain unchanged.

<a id="16.4"></a>
### 16.4 Clipboard Migration Gate

Clipboard migration gate status is **PASS** only when all required criteria below are true.

**Pass/Fail criteria (all REQUIRED):**
- [ ] Native Copy/Paste/Select All behavior works in File Editor input, chat composer input, and terminal command input (if editable).
- [ ] Read-only terminal/log output supports selection/copy and does not accept editable paste behavior.
- [ ] No custom text-widget clipboard handler remains in the migration target.
- [ ] Non-text copy exceptions remain explicitly scoped to `ClipboardHelper` path/value contexts only.
- [ ] Rebuild branch passes type/build verification.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, SchemaID:Spec_Lock.json#locked_decisions.ui

**Verification command (build):**
```bash
cd puppet-master-rs
cargo check
```

**Scenario checklist (manual or automated GUI harness):**

| Scenario | Expected result |
|----------|-----------------|
| Editor clipboard shortcuts + context menu | Ctrl/Cmd+A/C/X/V and context Copy/Paste/Select All behave natively |
| Chat composer clipboard shortcuts + context menu | Same behavior and parity as editor |
| Terminal command input clipboard actions | Native clipboard behavior on editable command input |
| Terminal/log read-only output copy/paste behavior | Selection/copy works; paste is not treated as editable insertion |
| Non-text Copy Path/Copy Value | Clipboard receives exact path/value via `ClipboardHelper` only |

---

## 17. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **`ImageFit.repeat` may not exist in Slint 1.15.1** | Medium | Use `SharedPixelBuffer` to generate tiles at the viewport size; or manually tile via `GridLayout` with repeated `Image` elements. Test at build time; if unavailable, use fallback approach. |
| **Multi-window lifecycle edge cases** | High | State machine in Rust manages window create/destroy. On floating window close -> dock or collapse; update layout state. Test: focus management between main and floating windows; data sync when floating window is open; re-dock after window was on disconnected monitor. |
| **Limited screen reader support** | Medium | Keyboard navigation is comprehensive (§13.3). Set `accessible-role` and `accessible-label` where Slint supports them. Document limitations. Basic theme provides maximum readability. |
| **No built-in context menu** | Low | Custom `ContextMenu` widget using `TouchArea` pointer events. Positioned at mouse coordinates. Styled per theme. Clipboard operations (Copy/Paste/Select All) delegate to Slint's native `TextInput.copy()` / `.paste()` / `.select-all()` — no custom clipboard state management needed. |
| **No built-in docking framework** | High | Custom `PanelRegistry` in Rust handles dock/undock state machine, snap detection, window lifecycle. This is the most complex custom component and should be implemented early. |
| **Font family change requires restart** | Low | Detect font family change in settings. Show restart prompt. Pre-load fonts for all themes on startup so within-family switches (Dark <-> Light) are instant. |
| **4-split terminal performance** | Medium | Virtualize visible lines only. Bounded ring buffers per pane (max 10k lines in memory); VecModel holds only the visible window (~500 lines) plus a small overscan buffer. On scroll, splice the VecModel from the ring buffer. Batch/throttle streaming updates (max 30fps). One PTY per pane. |
| **Platform-specific window manager issues** | Medium | Test: macOS window snapping with floating panels, Linux compositing with overlay effects, Windows DPI scaling. Handle gracefully with fallback behaviors. |
| **Large Settings page complexity** | Medium | 24 tabs across 5 groups. Two-level sidebar navigation (left sidebar for groups, right area for selected tab) is mandatory. Group labels act as collapsible headers. Settings search bar at the top of the sidebar. Test with real data. |
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
| **Settings page tab count (24 tabs)** | Medium | 24 tabs across 5 groups requires careful navigation. Mitigation: Two-level sidebar navigation is mandatory (not optional). Group headers are collapsible. Search/filter across all settings via a search bar at the top of the Settings sidebar. Deep-link support: command palette "Open setting: {name}" jumps directly to the relevant tab and scrolls to the field. |
| **Project switch state reload performance** | Medium | Switching projects triggers full state reload (editor tabs, file tree, chat threads, config, LSP servers). Mitigation: Load in priority order: (1) config (instant, from redb), (2) file tree (async scan, show skeleton), (3) editor tabs (lazy, only load active tab content), (4) LSP (background restart), (5) chat threads (lazy load). Show skeleton placeholders during reload. Target: <500ms to interactive. |
| **File watcher resource consumption** | Low | Hot reload file watcher (§7.20 Ports) monitors project directories for changes. Large projects (>10k files) may consume significant inotify/FSEvents handles. Mitigation: Use `notify` crate with debounced mode. Watch only source directories (exclude node_modules, target, .git, build). Configurable watch paths in Settings. Cap watchers at 5000 paths; if exceeded, show "Watching root directory only" fallback. |

---

## 18. Promoted Features (Formerly Future Considerations)

All items previously listed as "future considerations" have been promoted to MVP scope and are fully specified in their respective sections:

| Feature | MVP Location |
|---------|-------------|
| Built-in browser / click-to-context | Bottom Panel Browser tab (§7.20) |
| Instant project switch | Workspace-tab project switch model (§3.4) |
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
| `Plans/Glossary.md` | Product name "Puppet Master" throughout |
| `Plans/newfeatures.md` | Bottom panel/terminal (§7.20), thinking display, streaming, keyboard shortcuts, stream event visualization, duration timers, background runs, restore points, config migration dialog, rate-limit banner, version update banner, **instant project switch (§3.4)**, **sound effects (§10.13)**, **hot reload controls (§7.20 Ports)**, **instructions editor (§7.18)**, **language auto-detection (§7.3)** |
| `Plans/interview-subagent-integration.md` | Interview config tab (section 7.4), agent activity (section 7.19), embedded document pane (section 7.19.1), findings summary preview, single final approval gate, multi-pass review |
| `Plans/orchestrator-subagent-integration.md` | Dashboard (§7.2), orchestrator controls, tier display |
| `Plans/WorktreeGitImprovement.md` | Branching tab in Settings (§7.4), worktree recovery in Health tab |
| `Plans/FileSafe.md` | Advanced tab in Settings (§7.4), command blocklist, write scope, security filter |
| `Plans/MiscPlan.md` | Health tab "Clean workspace" button (§7.4), cleanup config in Advanced tab, Shortcuts tab (§7.4) |
| `Plans/Skills_System.md` | Skills tab (§7.4.16) |
| `Plans/feature-list.md` | Master feature reference: chat modes (§7.16), thread management, slash commands (§7.16.2), ELI5/YOLO, attachments, Teach, context management (§9.6), editor detach (§7.18), **catalog install UI (§7.4.3)**, **sync bundle manager (§7.4.4)** |
| `Plans/newtools.md` | MCP configuration in Advanced tab (§7.4), tool discovery during interview, cited web search contract |
| `Plans/Tools.md` | Tool permissions in Permissions tab (§7.4.10), permission model (allow/deny/ask), presets, central tool registry; tool usage widget on Usage page (§7.8); tool approval dialog in Chat (§7.16) |
| `Plans/LSPSupport.md` | LSP tab in Settings (§7.4.2), editor LSP features (§7.18: diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, go-to-definition), **Chat Window LSP (§7.16: diagnostics in context, @ symbol with LSP, code-block hover/go-to-definition, Problems link)**, Problems tab (§7.20), status bar LSP indicator |
| `Plans/rewrite-tie-in-memo.md` | Rewrite scope alignment; ensures GUI migration ties into broader rewrite plan |
| `Plans/FinalGUISpec.md` (internal clipboard contract) | Clipboard migration requirements and verification map: SelectableText contract (§8.1), context-menu clipboard contract (§10.9, §10.9.1-§10.9.3), migration gate (§16.4) |

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
11. **All 12 former "future considerations" are MVP** -- browser, instant project switch, sound effects, hot reload, instructions editor, custom themes, language detection, catalog, sync, SSH, debug, terminal tab management
12. **Bottom panel has 6 tabs** -- Terminal, Problems, Output, Ports, Browser, Debug
13. **Webview via `wry`** -- used for Browser tab and HTML preview
14. **Debug via DAP** -- Debug Adapter Protocol for integrated debugging
15. **SSH via system keychain** -- credentials stored in OS keychain, never in config files

---

<a id="appendix-c-widget-grid"></a>
## Appendix C: Dashboard Widget Grid and Widget Catalog Integration (Addendum -- 2026-02-23)

This appendix extends the Dashboard (section 7.2) from a rearrangeable card grid to a full widget grid with grid-based resizing, and introduces the add-widget flow for the Dashboard.

### C.1 Dashboard Upgrade: Card Grid to Widget Grid

The Dashboard (section 7.2) is upgraded from a simple rearrangeable card grid (drag-to-swap, fixed card sizes) to a full **widget grid** with grid-based resizing:

**What changes from section 7.2:**
- Cards become **widgets** from the widget catalog (Plans/Widget_System.md section 2). Each widget has configurable `col_span` and `row_span`.
- Drag-to-swap is upgraded to **drag-to-reorder** within the grid. Widgets can also be **resized** by dragging their edges (grid-snapping, per Plans/Widget_System.md section 3).
- Grid system follows Plans/Widget_System.md section 3: responsive column counts (2 at <1200px, 3 at 1200-1600px, 4 at >1600px per section 12.3).
- Widget gutters: 8px (MD spacing token) between widgets.

**What stays the same from section 7.2:**
- All existing Dashboard card types remain as default widgets.
- The card visual style is preserved: paper texture on retro themes, drag handle (4px crosshatch pattern in top-left corner), elevated surface for CtA cards with accent-left-border.
- CtA (Calls to Action) behavior: HITL approval, run interrupted, rate limit, warning, and `wizard_attention_required` cards function identically (see §7.2 for full specs).
- Persistence location changes from `dashboard_layout:v1` to `widget_layout:v1:dashboard` (see section C.5 for migration).

ContractRef: ContractName:Plans/Widget_System.md#3

### C.2 Default Dashboard Widget Layout

The default layout preserves the current section 7.2 card set, mapped to Widget Catalog IDs:

| Col | Row | Old Card Name (section 7.2) | Widget Catalog ID | Default Size |
|-----|-----|---------------------------|-------------------|-------------|
| 0 | 0 | Orchestrator Status | `widget.orchestrator_status` | 2x1 |
| 2 | 0 | Current Task | `widget.current_task` | 2x1 |
| 0 | 1 | Progress | `widget.progress_bars` | 4x1 |
| 0 | 2 | Calls to Action | `widget.cta_stack` | 2x2 |
| 2 | 2 | Terminal Output | `widget.terminal_output` | 2x2 |
| 0 | 4 | Interview Panel | `widget.interview_panel` | 1x2 |
| 1 | 4 | Error Display | `widget.error_display` | 1x2 |
| 2 | 4 | Platform Quota | `widget.budget_donuts` | 2x2 |

This matches the current Iced Dashboard layout. On first load, this default is applied. Users can then customize.

ContractRef: ContractName:Plans/Widget_System.md#6.3

### C.3 Add-Widget Flow on Dashboard

The Dashboard has an explicit **"Add Widget"** control:
- **Location**: floating action button in the bottom-right corner of the Dashboard grid area, or in a Dashboard toolbar.
- **Behavior**: opens the Widget Catalog overlay (Plans/Widget_System.md section 4.2) filtered to Dashboard-compatible widgets.
- **Available widgets**: all widgets from the catalog whose "Hostable Pages" includes "Dashboard" -- this includes Usage widgets (`widget.quota_summary`, `widget.budget_donuts`, `widget.analytics_chart`, `widget.tool_usage`, `widget.multi_account`, etc.), Orchestrator Progress widgets (`widget.orchestrator_status`, `widget.current_task`, `widget.progress_bars`, etc.), and others.
- **On add**: widget placed at next available grid position with its default size. Layout persisted immediately.

This enables users to build a customized Dashboard that includes usage information, orchestrator progress, and other data -- all from a single surface.

ContractRef: ContractName:Plans/Widget_System.md#4

### C.4 Widget Catalog vs. Core Widget Catalog

Two distinct catalogs now exist. To avoid confusion:

- **Section 8 of this document** (FinalGUISpec Widget Catalog) = **atomic UI components**: StyledButton, StyledInput, StyledBadge, TreeView, CodeBlock, and other building-block primitives. These are reusable across all views and are NOT page widgets.
- **Plans/Widget_System.md section 2** = **composed page widgets**: OrchestratorStatus, BudgetDonuts, TierTree, LedgerTable, and other content panels built FROM atomic components. These are the widgets users can add/remove/move/resize on the Dashboard, Usage page, and Orchestrator tabs.

The relationship: page widgets (Widget_System.md) are composed of atomic components (FinalGUISpec section 8).

### C.5 redb Key Migration

The existing `dashboard_layout:v1` redb key (section 15.1) stores a simple card-order list. The new widget layout system uses a richer schema. Migration strategy:

1. **On first load** after the widget system upgrade:
   - Check if `dashboard_layout:v1` exists and `widget_layout:v1:dashboard` does NOT exist.
   - If so: read the card ID list from `dashboard_layout:v1`, map each card ID to its corresponding Widget Catalog ID (per the table in C.2), assign default grid positions and sizes, and write the result as `widget_layout:v1:dashboard`.
   - Treat `dashboard_layout:v1` as deprecated migration input only; it does not remain canonical after migration completes.
2. **Future reads** use `widget_layout:v1:dashboard` only.
3. If both keys exist, `widget_layout:v1:dashboard` takes precedence.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Widget_System.md#7

### C.6 References (Appendix C)

- Plans/Widget_System.md -- widget catalog, grid system, add-widget flow, layout persistence
- Section 7.2 of this document -- Dashboard (original card grid specification)
- Section 8 of this document -- Core Widget Catalog (atomic UI components)
- Section 12.3 of this document -- Dashboard grid responsive breakpoints
- Section 15.1 of this document -- redb persistence for dashboard layout
- Plans/storage-plan.md -- redb namespaces
## 17. Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls (2026-03-06)

This addendum expands the GUI contract for Persona authoring and runtime visibility.

### 17.1 Persona editor compatibility matrix (required)

The Persona editor MUST show provider support state for Persona controls.

Support states:
- `supported`
- `partially supported`
- `unsupported`

For each control (platform/model/variant/temperature/top_p/reasoning_effort/talkativeness/tool-permission coupling/subagents), the editor must:
- show normal editing when supported,
- show warning styling and explanatory tooltip when partially supported,
- show disabled control plus explanation when unsupported.

`talkativeness` is a Persona instruction-layer control rather than a transport/runtime sampling knob. Its support state follows Persona prompt-body support: if a provider can apply Persona prompt instructions, it can apply `talkativeness`.

Minimum provider rows to display:
- Claude Code
- Cursor CLI
- OpenCode
- Direct/API providers

### 17.2 Persona editor fields (expanded)

In addition to existing Persona fields, the editor must support:
- `default_platform`
- `default_model`
- `default_variant`
- `temperature`
- `top_p`
- `reasoning_effort`
- `talkativeness`
- `preferred_tools`
- `discouraged_tools`
- `tool_usage_guidance`
- `aliases`

`talkativeness` must be rendered as a fixed single-select with these labels and stored enum values:
- `Talk a lot more` -> `talk_a_lot_more`
- `Talk more` -> `talk_more`
- `Talk a little more` -> `talk_a_little_more`
- `Model default` -> `model_default`
- `Talk a little less` -> `talk_a_little_less`
- `Talk less` -> `talk_less`

### 17.3 Compatibility panel copy examples

The editor should be able to communicate states like:
- `Claude Code: supports model preference and effort; temperature/top_p not exposed in official CLI settings.`
- `Cursor CLI: supports prompt/rules steering and some model selection; low-level runtime controls are limited or undocumented.`
- `Direct/API providers: strongest support for exact runtime controls.`

### 17.4 Surface-level Persona controls

Persona controls are required on the following surfaces:
- Chat
- Interview
- Requirements Builder
- Orchestrator
- Multi-Pass Review

Each surface should expose, at minimum:
- Persona mode (`Auto` / `Manual` / `Hybrid`)
- current effective Persona display
- platform/model display
- selection reason
- manual override control or lock/unlock affordance
- skipped unsupported Persona controls when relevant

Interview/Builder visibility rule:
- The Interview chat surface, Interview activity pane, and Builder activity pane MUST display the same effective-runtime fields for the active run block, even if one surface uses a more compact layout than another.

#### 17.4.1 Persona mode semantics

- **Auto:** Resolver selects the Persona from surface defaults, mappings, and runtime context. User sees the chosen Persona and reason string but does not pin a manual choice.
- **Manual:** User explicitly selects a Persona for the next eligible run/turn on that surface. Manual selection overrides Auto resolution until cleared or replaced.
- **Hybrid:** Resolver proposes a Persona, but the user may override it before execution while still seeing the automatic recommendation and reason text.
- Mode changes apply only to the next eligible run/turn or queued execution on that surface; they do not retroactively change an active run already in progress.

#### 17.4.2 Selection reason and override behavior

- The **effective Persona display** must show the resolved Persona name plus a one-line reason string such as `User requested`, `Stage default`, `Provider fallback`, or `Mapped from Interview phase`.
- Every surface needs a compact **Override Persona** affordance (dropdown, popover, or button+menu) with `Set override`, `Clear override`, and `Return to Auto` actions.
- When overrides are unavailable for the current provider or run state, the control remains visible but locked/disabled with a tooltip explaining why.

#### 17.4.3 Platform/model display scope

- The `platform/model display` requirement may reuse the existing status-bar/footer platform and model controls where those already exist; the surface must not introduce conflicting duplicate controls.
- If a user overrides model/platform independently from the Persona, the UI must show both the requested Persona and the effective platform/model outcome.

### 17.5 Runtime display requirements

When a run is active, the UI must display:
- requested Persona when explicitly set,
- effective Persona,
- selection source/reason,
- effective platform,
- effective model,
- effective variant/effort when present,
- skipped Persona controls when applicable.

This display requirement applies to:
- chat status strip or header,
- interview activity card,
- requirements builder progress/status UI,
- orchestrator activity and run inspection surfaces,
- subagent inline blocks,
- multi-pass reviewer status rows.

### 17.6 Natural-language invocation feedback

If the user summons a Persona via natural language, the UI must reflect it explicitly, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Explorer (User requested, session lock)`

If the override is turn-scoped, the UI should clear back to the previous/auto state on the next eligible turn.

### 17.7 Provider-gap disclosure rule

The GUI must never imply that a provider honored a Persona control when it did not.

If a control is skipped, the UI must disclose it in at least one of:
- inline status text,
- tooltip,
- activity detail popover,
- run detail/history panel.

#### 17.7.1 Disclosure mechanics

- **Honored** = requested control applied as requested. **Skipped** = ignored entirely. **Clamped** = partially honored but changed to a supported value/range.
- Every disclosure must include: control name, requested value, effective value (if any), and human-readable reason.
- When a limitation is known before execution, render the control disabled or warning-badged in place; do not let the user believe it is actionable.
- When a limitation is only discovered at runtime, surface the disclosure inline on the active surface **and** persist the same information in run detail/history so it is auditable later.
- Disclosures must name the provider explicitly (for example: `Claude Code ignored reasoning_effort=high; provider does not support that control on this model`).

### 17.8 Interview/Builder/Orchestrator mapping editors

Settings or surface-specific configuration must support mapping Persona defaults to:
- Interview stages/phases,
- Requirements Builder steps/passes,
- Orchestrator phase/task/subtask/iteration tiers,
- Multi-Pass review passes.

These editors should also allow platform/model selection per mapping and show compatibility warnings.

### 17.9 Acceptance criteria addendum

- Persona editor must disclose unsupported and partially supported controls per provider.
- All interactive run surfaces must show effective Persona/model/platform and selection reason.
- Natural-language Persona requests must be visibly reflected in the UI when active.
- Provider-gap disclosure must be explicit; no silent implied support.

**§7.4.8A Docker Manage + Unraid publishing addendum:**

- **Template repo status row:** bind directly to canonical `TemplateRepoStatus` (`unconfigured`, `config_invalid`, `clean`, `dirty_uncommitted`, `committed_local_only`, `push_in_progress`, `push_failed`, `diverged_remote`, `needs_review`). Presentation copy may translate those values, but the GUI must not invent a second status model.
- **Unraid controls:** when shared-profile scope is active, expose `Apply shared profile to this repo` as an explicit action in addition to generate/update and push controls.
- **`ca_profile.xml` editor:** default to shared cross-project maintainer profile with per-project override option, and provide two editing layers: (1) structured controls for known fields and (2) advanced raw XML editing for unknown / passthrough content. Saving from either layer MUST preserve unmodified passthrough XML verbatim. Support picture upload or external URL; uploaded pictures default to repo-managed assets.

Add a contextual **Docker Manage** GUI surface for Docker-related projects. This surface may be implemented as a page or dockable panel, but it MUST behave as a first-class management surface and not merely as a hidden advanced-only dialog.

- **Visibility rule:** show the Docker Manage surface when a Docker-related project is active. Add a setting named **Hide Docker Manage when not used in Project.** Default: enabled.
- **Auth controls:** place a browser-login button near DockerHub settings, retain PAT entry, show helper text that PAT is recommended, and explain/link how to obtain a PAT.
- **Auth state presentation:** show requested auth mode separately from effective capability, along with validated account identity, namespace access, and degraded reason when capability is partial.
- **Repository management controls:** namespace selector, repository selector, refresh action, create-repository action, and create-repository confirmation dialog that displays namespace, repository name, and privacy. Privacy defaults to private and must be visibly labeled as the default.
- **Runtime controls:** build, run/preview, stop, open running container/web UI, open logs, and health/access state.
- **Publish controls:** push image, show digest/tag results, and expose target DockerHub repo summary.
- **Unraid controls:** toggle to auto-generate/update Unraid XML after successful publish (default enabled), toggle to manage template repo (default enabled), template-repo status row, one-click push action, and shortcut into `ca_profile.xml` editing.
- **Template repo setup flow:** allow both create-new and select-existing when no template repo is configured.
- **`ca_profile.xml` editor:** default to shared cross-project maintainer profile with per-project override option; all fields editable; support picture upload or external URL; uploaded pictures default to repo-managed assets.
- **Auto-generated metadata warning:** when `ca_profile.xml` is created automatically, show a visible notice that the user still needs to configure/review the profile.
- **Safety copy:** make it explicit that repository creation cannot be auto-approved by YOLO or autonomy modes.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md#147-docker-runtime--dockerhub-contract, ContractName:Plans/Permissions_System.md

## Rendering Surface Addendum (2026-03-07)

This addendum locks how Markdown, Mermaid, HTML, SVG, and image rendering appear in the Slint GUI.

### Surface inventory impact

The rewrite must treat rendering as a shared capability across these existing surfaces:

- **Chat Panel**: rendered Markdown text, native Mermaid cards, source toggle/open actions.
- **File Editor**: source mode, split preview mode, detached preview mode, HTML browser mode.
- **Embedded Document Pane**: preview-capable document review surface using the same PreviewSession contract.
- **Bottom Panel Browser tab**: browser-like HTML/workspace preview and click-to-context surface.
- **Detached windows**: first-class preview/browser windows for platforms where embedding is not the correct guarantee.

### GUI behavior rules

- Detached preview/browser windows are part of the intended UX, not a degraded workaround.
- Embedded browser/preview panes may exist where supported, but GUI flows must remain valid when the preview opens in a separate window.
- Markdown and Mermaid previews should visually match app theming while remaining clearly distinct from editable source.
- HTML/browser mode must visually read as a browser-capable surface rather than as a static Markdown preview.
- Image viewing remains native and should not inherit unnecessary browser chrome.

### Chat panel behavior

Chat messages that contain renderable Markdown/Mermaid content must support:

- readable Markdown formatting
- native Mermaid diagram cards where Mermaid syntax is detected
- actions for copy source, open in editor, open detached preview, and export diagram where relevant
- visible error states for malformed Mermaid instead of silent raw-block disappearance

Chat must not execute arbitrary HTML from message content.

### File editor behavior

The File Editor view must expose clear mode controls for render-capable files:

- Source
- Preview
- Split
- Detached preview
- Browser/rendered mode for HTML

The mode switch must not change the canonical buffer model. Split mode should preserve shared-buffer editing semantics with the existing document/editor contract.

### Embedded document pane behavior

The Embedded Document Pane must reuse the same rendering pipeline and PreviewSession abstraction as the file editor and chat. It is a review/inspection surface, not a separate rendering system.

Required actions:

- open source
- open detached preview
- request re-render/reload
- perform allowed structured edits when the underlying document kind supports them

### Bottom panel browser behavior

The Browser tab is the primary in-shell host for full HTML/browser previews and click-to-context workflows.

Required behavior:

- use the browser/runtime transport contract rather than Markdown preview transport
- preserve navigation/reload state within the tab
- support detached-open without changing the underlying PreviewSession identity
- keep trust-tier boundaries distinct from generated Markdown/Mermaid previews

### Windowing and platform behavior

- GUI copy must not imply that every preview is embedded inline on every platform.
- Linux Wayland behavior must remain correct when the product opens a detached preview/browser window rather than embedding.
- The UI must not rely on hidden pre-created browser panes to feel responsive on platforms where hidden-window behavior is constrained.

### Performance and accessibility

- Use lazy rendering and virtualization for long message streams and large documents.
- Preserve scroll positions where feasible when re-rendering preview content.
- Preview controls must be keyboard reachable.
- Diagram export/open/source actions must have explicit labels and accessible tooltips/text.

### Acceptance criteria addendum

- The same document can move between chat card, editor preview, embedded doc pane, bottom browser tab, and detached preview without inventing separate rendering contracts.
- Mermaid diagrams render consistently across chat, editor, and planning/doc surfaces.
- HTML rendered mode behaves like a browser/workspace preview, not a static screenshot.
- Platform limitations may change whether a preview is embedded or detached, but they must not remove the feature.

## Assistant Planning UX Addendum (2026-03-08)

### 1. Assistant Chat planning controls

Assistant Chat planning controls must expose both **Plan** and **Deep Plan** as chat workflow choices.

Required controls:
- planning-mode selector entry for `Plan`
- planning-mode selector entry for `Deep Plan`
- `Plan Thoroughness (PT)` control visible when either planning overlay is active

PT control contract:
- control type: segmented control, dropdown, or equivalent compact selector
- canonical labels: `Light`, `Balanced`, `Comprehensive`
- default selection: `Balanced`
- Deep Plan and Plan share the same PT labels
- tooltip/help copy must explain that Deep Plan is more intensive than Plan at the same PT

### 2. Plan vs Deep Plan visible behavior

**Plan** UI expectations:
- lightweight plan artifact in thread
- sticky plan panel remains visible in chat
- normalized TODO list is visible before approval
- users may revise TODO structure before approval
- execution begins only after explicit approval

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Deep Plan** UI expectations:
- richer planning artifact opens in a preview-capable document/editor surface
- the same normalized TODO contract remains visible in the thread plan panel
- document review, annotations, and targeted revision remain available
- Deep Plan remains more intensive than Plan at the same PT

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Crosswalk.md

**Shared TODO tracker rules:**
- the sticky plan panel is the authoritative TODO tracker
- inline chat updates are milestone-style, not a competing tracker
- TODO statuses support at least `pending`, `in_progress`, `completed`, `blocked`, and `skipped`
- the same TODO identity must survive single-agent, subagent, and crew execution
- plan state transitions (`draft`, `approved`, `executing`, `completed`, `blocked`, `superseded`) must remain visible and restorable

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### 3. Deep Plan review in editor / Embedded Document Pane

Deep Plan documents reuse the Embedded Document Pane annotation/revision contract.

Required behavior:
- highlight text -> annotation action palette
- annotation markers in margin + annotation list/drawer
- `Resubmit with Annotations` launches targeted revision for the plan document
- deterministic annotation re-anchoring after edits
- no silent annotation loss
- no automatic Multi-Pass Review requirement before plan approval/execution

The plan document may contain:
- headings
- lists / tables
- fenced code blocks
- Mermaid diagrams
- file paths / references
- validation and rollout notes

### 4. Assistant recommendation card for Chain Wizard

When Assistant Chat or Deep Plan recommends the Chain Wizard, show a visible recommendation card rather than silently switching surfaces.

Required card content:
- reason summary (for example: `This looks like a substantial feature/enhancement that would benefit from the interview + orchestrator flow.`)
- primary CTA: `Add a new Feature or Enhancement`
- secondary action: `Stay in Chat` / `Not now`

Optional supporting copy may mention:
- that the interview can prune irrelevant phases automatically
- that imported plan/chat context will be carried into the wizard

### 5. Post-acceptance wizard handoff surface

If the user accepts the recommendation:
- switch to the Chain Wizard / Interview flow
- show a visible imported-context banner (`Imported from Assistant Chat` or `Imported from Deep Plan`)
- show whether a plan artifact was included
- show the imported goal/scope summary

Recommended imported-context panel contents:
- user goal
- scope summary
- included plan yes/no
- open questions count
- `has_gui` hint when known

If a project is already active, the wizard should open on the preloaded feature/enhancement path rather than on a blank intent picker.

### 6. Non-goals

- Do not copy external GUI layout from OpenCode, Cursor, VSCode, or other tools.
- Do not auto-create repo files for planning artifacts without explicit user action.
- Do not silently redirect the user from chat into the wizard.

### 7. Acceptance criteria

- Assistant Chat visibly exposes both Plan and Deep Plan.
- PT is shown for both planning overlays using the canonical labels `Light`, `Balanced`, and `Comprehensive`.
- Deep Plan documents open in a preview-capable editor/document surface and support durable annotations plus targeted revision.
- When the wizard is recommended, the user sees an explicit CTA and can decline without leaving chat.
- Accepting the CTA opens the Chain Wizard / Interview flow with visible imported context.
- Planning documents continue to use the shared markdown/mermaid rendering and source-canonical rules already defined elsewhere in the spec.

## Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)

### 1. Dashboard cards

The Dashboard must distinguish:
- `wizard_attention_required`
- `wizard_blocked`
- HITL blocked actions
- remote-side-effect blocked actions

`wizard_blocked` card requirements:
- more severe copy than `wizard_attention_required`
- primary CTA: `Resume Wizard`
- secondary CTA: `View report`
- auto-dismiss only when the wizard leaves `blocked`

### 2. Assistant thread selector / badges
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Thread and session navigation uses persistent shell surfaces.

Rules:
- the active thread list is visible in a persistent sidebar or equivalent persistent region, not only in a floating overlay
- the selector must expose running, queued, blocked, and attention-required badges per thread
- branch lineage is visible in the selector/history model using stable branch labels and source lineage metadata
- badge aggregation must preserve highest-severity state while still showing blocked counts when present
- the project/session browser may complement thread navigation but does not replace the active-thread list inside chat

The floating thread-list overlay pattern is not canonical after this section.
### 3. Run Graph and Orchestrator views

Required visible scheduler/remediation data:
- wake reason
- ready/blocked/backoff/remediation counts
- selected-node score breakdown
- ready-but-unselected reasons
- safe-point ID
- remediation lineage identifiers

### 4. blocked outcome copy

When a remote side effect or guard prevents execution, the GUI MUST present the outcome as `blocked`, not `failed`, and must preserve any completed local work.

### 5. Event-driven correctness

All scheduler/remediation/blocked UI updates must follow the existing `invoke_from_event_loop` event-driven rule. No timer polling for correctness.

### 6. Acceptance criteria

- Dashboard has a first-class `wizard_blocked` card.
- Thread badges distinguish `blocked` from `attention_required`.
- Scheduler/remediation state is inspectable in run surfaces.
- blocked outcomes are not mislabeled as failures.
- new runtime widgets obey the event-driven rewrite rule.
## Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

The GUI must expose the packet's runtime state without relying on hidden behavior.

### Required visible elements
- queue-analysis summary with last wake reason
- blocked-state badges and grouped blocked lists
- safe-point state and restore status where applicable
- remediation lineage navigation
- disabled-action explanations tied to canonical reason codes
- clear distinction between `attention_required`, `blocked`, `retrying`, and terminal failure

### Event-driven update rule
All scheduler, blocked, and remediation widgets MUST update from runtime events/projections rather than periodic timers.

### UX safety rule
If the GUI cannot perform a required action in the current mode, it must state why and point to the canonical recovery path. The GUI must not present controls that imply hidden fallback, hidden retry, or hidden re-auth behavior.
## Runtime Blocked, Queue, and Recovery GUI Reconciliation Addendum (2026-03-09)

### `wizard_blocked` CtA card
Add a first-class `wizard_blocked` card alongside `wizard_attention_required`.

Required fields:
- `card_type = wizard_blocked`
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `report_ref`
- `resume_url`
- `thread_id?`

Required UI behavior:
- more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`

### Runtime state presentation
Scheduler surfaces MUST visually distinguish:
- blocked waiting for prerequisite or approval
- retrying/backoff
- remediation in progress
- terminal failure

### Thread/status surfaces
Thread and run status surfaces MUST include distinct presentations for:
- `attention_required`
- `blocked`
- `retrying/backoff`
- `remediation`

### Recovery UX rules
- safe points are runtime recovery anchors and MUST NOT be presented as user-facing restore points
- retry controls MUST distinguish `Retry from safe point` from `Start fresh attempt`
- if no valid safe point exists, `Retry from safe point` is disabled with an explanation
## Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

This addendum retains GUI-specific recovery rules that supplement the canonical blocked/recovery section below.

### FileSafe rendering
A FileSafe block is a persistent blocked episode until the underlying runtime block resolves. It MUST NOT auto-dismiss while still active.

### Degraded draft warning
Decomposition degradation is a pre-lock planning state only. GUI copy MUST NOT imply silent degraded canonical execution after graph lock.

### All-nodes-blocked gating
Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical.
## Blocked / Recovery GUI Reconciliation
This section is the canonical GUI summary for blocked and recovery surfaces.

### Dashboard Action Required
Blocked and recovery UI binds to canonical blocked projections and HITL records.
- blocked payloads use ordered `allowed_action_ids[]`
- blocked episodes remain distinct when more than one is active
- GUI labels may vary by surface, but command binding always resolves through the shared runtime command catalog

### Thread and run status taxonomy
`waiting_approval` and other blocked reasons are runtime overlays, not replacement run-graph lifecycle states.
- lifecycle remains the graph-progress contract
- blocked, backoff, retry, remediation, and approval-pending are rendered from runtime projections
- requested vs effective persona/platform/model remains visible where runtime substitution occurred

### Scope rule
The GUI does not synthesize alternate blocked schemas, alternate action arrays, or alternate retry classes for specific surfaces.

### Visual distinction
- blocked episodes are visually distinct from ordinary paused/idle states
- multiple simultaneous blocked episodes show per-episode controls and a count summary where appropriate
- remediation-ceiling-exceeded and validation-blocked use the same blocked-payload contract as other blocked episodes rather than bespoke one-off UI treatment

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md
## Blocked-State Visual Distinction and Recovery UX Addendum

### Blocked-state visual distinction

| State | Badge Color | Icon | Label Text | Tooltip |
|-------|-------------|------|------------|---------|  
| `attention_required` | Amber | Warning triangle | "Needs input" | "This step needs your input to continue. The system can still make progress on other steps." |
| `blocked` | Red | Stop circle | "Blocked" | "This step is blocked and cannot continue until you take action. All automatic retries are exhausted." |
| `waiting_approval` | Blue | User badge | "Awaiting approval" | "This step is waiting for your approval before proceeding with a sensitive operation." |

- `attention_required` and `blocked` MUST be visually distinct -- they represent different escalation levels.
- `attention_required` allows continued background work; `blocked` does not.
- Dashboard cards, thread badges, and Run Graph View node badges all use this canonical visual mapping.

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Concurrent blocked episodes

When multiple nodes are blocked simultaneously:

1. The dashboard MUST show a count badge (e.g., "3 blocked") on the run card.
2. Clicking the badge opens a filtered list of all currently blocked nodes, sorted by `blocked_sequence` descending (most recently blocked first).
3. Each list item shows: node name, `blocked_reason_code` label, time since blocked, and the primary `allowed_action_ids[]` as action buttons.
4. The user can expand any item to see full blocked detail (explanation, `detail_ref` contents, remediation lineage if applicable).
5. Multiple concurrent blocked episodes MUST NOT be collapsed into a single notification -- each blocked node is a distinct actionable item.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Graph_View.md

### Remediation ceiling exceeded UX

When the remediation generation count reaches the ceiling (default: 3 per Plans/Decision_Policy.md):

1. The node transitions to `blocked` with `blocked_reason_code: remediation_ceiling_exceeded`.
2. The Run Graph View displays a red "Remediation limit reached" banner on the node detail panel.
3. Available actions presented to the user:
   - **Replan** (`cmd.orchestrator.replan_node`): Trigger a graph replan that may restructure the node's dependencies.
   - **Manual fix** (`cmd.orchestrator.open_for_edit`): Open the relevant files for manual editing, then resume.
   - **Abort node** (`cmd.orchestrator.abort_node`): Mark the node as permanently failed and continue the run without it (if the graph allows).
4. The remediation lineage tree remains visible for diagnostic purposes.
5. No automatic retry is permitted after ceiling is reached.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Graph_View.md

### Degradation warning

When draft decomposition degrades from graph to flat sequencing (before canonical graph lock):

1. The UI displays an amber warning banner: "Plan simplified to sequential steps due to structural issues in the decomposition. Performance may be reduced."
2. The banner includes a "View details" link that shows the specific `graph_integrity` issues detected.
3. No user action is required -- the run continues with flat sequencing automatically.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/chain-wizard-flexibility.md

### All-nodes-blocked circuit breaker

If all runnable nodes in a run are simultaneously in blocked state:

1. After 10 minutes with no state change, the run emits `run.all_nodes_blocked_warning` and the UI shows a persistent amber banner: "All steps are blocked. Review blocked items to continue."
2. After 30 minutes with no state change, the run auto-pauses and emits `run.auto_paused` with reason `all_nodes_blocked_timeout`.
3. The user can resume at any time after resolving blocks.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md
