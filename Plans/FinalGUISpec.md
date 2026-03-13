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

### 7.1 View Inventory (21 views/panels + 6 bottom panel tabs)
| 21 | Artifacts | -- | Side panel | **NEW** (runtime artifacts: diffs, plans, evidence, browser recordings, cost_usage, etc.; see Plans/Runtime_Artifacts_Panel.md) |

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
- **Orchestrator Status:** Status badge (Running/Paused/Idle/Error) + controls (Start, Pause, Resume, Stop, Reset, Preview, Build) + latest preview/build summary
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

**Controls:** START, PAUSE, RESUME, STOP, RESET, PREVIEW, BUILD buttons with visual state feedback (see §10.1 Button Feedback). Retry/Replan/Reopen per-item buttons. Kill process button (if running).

**Preview/Build status strip:** The Orchestrator Status card includes a compact strip showing:
- latest preview session (`running`/`stopped`/`degraded`) with "Open preview artifact" action
- latest build result (`success`/`failed`) with artifact path summary and open/copy action

ContractRef: ContractName:Plans/newtools.md#146-preview-build-docker-and-actions-contracts, ContractName:Plans/Orchestrator_Page.md#45-preview-build-actions

**Calls to Action (CtA) cards:** CtA cards have accent-left-border (4px), elevated surface background, and a prominent action button. Types:
- **HITL approval:** "Phase X complete -- approval required" with evidence summary, "Approve & Continue" (primary) and "Reject" (secondary) buttons. Badge on activity bar when active.
- **Run interrupted:** "Previous run was interrupted" with "Resume from checkpoint" and "Start fresh" buttons.
- **Rate limit:** "Platform X rate limited -- resets in 2h 15m" with "Switch platform" button.
- **Warning:** Orange-border card for non-blocking issues (stale data, missing config).
- **Wizard attention required (`wizard_attention_required`):** Amber-border card when a Chain Wizard is blocked in `attention_required` state; see detailed spec below.
Multiple CtAs stack vertically in priority order (HITL > wizard_attention_required > interrupted > rate limit > warnings).

**`wizard_attention_required` CtA card spec:**

*Card data model:*
```json
{
  "card_type": "wizard_attention_required",
  "card_id": "<string>",
  "title": "Requirements Need Your Input",
  "reason": "<human-readable summary, e.g., '3 questions about authentication scope'>",
  "wizard_id": "<string>",
  "wizard_step": "<string>",
  "question_count": "<integer ≥ 1>",
  "resume_url": "<deep-link: puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify>",
  "thread_id": "<string>",
  "created_at_utc": "<ISO-8601 date-time>",
  "dismissed": false
}
```

*Visual spec:*
- Card background: amber/warning tint (matches system attention color)
- Left border accent: amber (4px solid)
- Header row: ⚠ icon + "Requirements Need Your Input" in bold
- Body text: `reason` field (e.g., "3 questions need answers before this wizard can proceed")
- Action buttons:
  1. **"Resume Wizard"** (primary, filled) -- navigates to the exact wizard step via `resume_url`
  2. **"View in Thread"** (secondary, outlined) -- opens the associated chat thread via `thread_id`
- Dismiss: NOT manually dismissable by the user; auto-dismisses only when the wizard transitions out of `attention_required`

*Placement:*
- Dashboard renders an **"Action Required"** section at the **top of the card grid**, above all other sections (Recent Activity, widget rows, etc.), when one or more `wizard_attention_required` cards exist.
- Section header: "Action Required" with an amber ⚠ badge showing the total count of cards in this section.
- Multiple wizards in `attention_required` state each produce their own card; all shown in this section, stacked vertically.
- When no `wizard_attention_required` cards exist, the "Action Required" section is **hidden entirely** (not rendered as an empty section).

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics, ContractName:Plans/assistant-chat-design.md

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

#### 7.4.B Source Control, GitHub Actions, and Docker Manager settings normalization

The unified Settings surface MUST expose configuration and persistence controls for the three operational side panels without redefining their runtime contracts.

Required Settings coverage:
- Source Control: auto-fetch interval, default diff mode, history/graph filters, default compare target, worktree visibility preferences, merge/conflict presentation defaults
- GitHub Actions: default subview, refresh interval, pinned workflows, current-branch focus behavior, log display preferences, admin-scope visibility
- Docker Manager: runtime defaults, hidden-subview policy, default subview, requested auth mode, registry defaults, build/bake defaults, compose defaults, Kubernetes visibility and namespace/context focus, Publish / Unraid defaults

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/storage-plan.md

State ownership rules:
- shared defaults live in Settings
- panel navigation and selection state restore per project
- secrets remain outside redb and are never stored in panel-state records
- requested vs effective capability differences MUST be visible when they alter the enabled/disabled state of panel actions

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

### 7.4A LSP settings and override semantics

The unified Settings surface exposes the canonical LSP configuration without redefining backend policy.

Required GUI behavior:
- show app-level LSP settings backed by `config.lsp`
- show when a project-level override from `.puppet-master/lsp.json` is active
- display the locked defaults from Plans/LSPSupport.md
- make clear that project overrides replace app-level values according to the canonical merge rule rather than creating a third settings plane

Required visible defaults:
- `didChangeDebounceMs=100`
- `hoverTimeoutMs=5000`
- `completionTimeoutMs=5000`
- `workspaceSymbolTimeoutMs=10000`
- `hoverDelayMs=300`
- `workspaceFolders` cap = 10 active roots

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

#### 7.4.R Retrieval & Search (Memory tab; project-scoped; complements Context Injection)

In addition to the three required Context Injection toggles (**Parent Summary**, **Scoped `AGENTS.md`**, **Attempt Journal**) defined by `Plans/Contracts_V0.md#ContextInjectionToggles`, the Memory tab MUST include a **Retrieval & Search** configuration card that governs **project-scoped auto-retrieval (RAG)** and **agent-callable search** across:

- **Project chat history** (Tantivy chat index; `chatsearch`)
- **Project workspace code** (Tantivy code index + LSP + ripgrep; `codesearch`)
- **Project logs** (Tantivy logs index; `logsearch`/`logread`)

**Source allowlist toggles (per project):**
- `retrieval.allow_chat_history` (default **ON**)
- `retrieval.allow_code` (default **ON**)
- `retrieval.allow_logs` (default **ON**)

**Auto-retrieval mode per source (per project):**
- Enum: `off | auto | always`
- Keys: `retrieval.mode.chat_history`, `retrieval.mode.code`, `retrieval.mode.logs`
- Default: **auto** for all three sources.
- Note: “auto” uses deterministic trigger heuristics and budgets (see Plans/assistant-chat-design.md §10.1).

**Budgets / caps (per project):**
- `retrieval.max_queries_per_turn.<source>` (default: `2`)
- `retrieval.max_hits_per_query.<source>` (default: `5`)
- `retrieval.max_injected_bytes_per_turn.<source>` (default: `24_000`)
- `retrieval.max_injected_bytes_per_turn.total` (default: `48_000`)
- `retrieval.logs.max_lookback_days` (default: `7`)

**Secrets policy (mandatory; non-configurable):**
- Puppet Master MUST enforce PolicyRule:no_secrets_in_storage / INV-002: secrets (tokens/credentials/private keys) are stripped/redacted before any content is persisted to seglog/redb/Tantivy/blob files.
- This mandatory scrub applies regardless of Retrieval settings and cannot be disabled.

**Additional heuristic redaction (optional; default OFF):**
- Toggle: `retrieval.redaction.secretish_enabled` (default **OFF**)
- When enabled, apply an additional aggressive “secret-ish” redaction pass (on top of the mandatory scrub) to:
  - log index summaries/snippets
  - retrieved-context injection snippets (logs)
  - (optional) code snippets displayed in retrieval blocks
- UI copy must warn: “Heuristic redaction is best-effort and may hide useful details; it does not replace the mandatory secrets policy.”

**Thread-local override (UI):**
- The chat header/footer includes an **Auto Retrieval** On/Off chip per thread (Plans/assistant-chat-design.md §12.1). This override is stored per thread and does not change project defaults.
- The chip animates while retrieval is in-flight and links to the latest retrieval audit entry (§13).

**Permissions interplay (required):**
- Retrieval settings do not bypass Permissions: tool permissions still apply (`chatsearch`, `codesearch`, `logsearch`, `logread`, `webfetch`, `websearch`, `repo.import`).
- If a source is allowed in Retrieval settings but the corresponding tool is denied by Permissions, that source is effectively disabled for the run and the UI must show the disabled reason (consistent with other capability/permission UI).

ContractRef: ContractName:Plans/assistant-chat-design.md#10-chat-history-search, ContractName:Plans/assistant-chat-design.md#17-context-truncation, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002
**Group:** Settings | **Location:** Primary content

This is a **heavily redesigned** unified settings page that merges four previously separate views. It uses a tabbed interface.

**Tabs:**

| Tab | Content | Source |
|-----|---------|--------|
| **General** | Log level, auto-scroll, show timestamps, minimize to tray, start on boot, retention days, intensive logging, **Interaction Mode (Expert/ELI5)** (app-level copy selector; default ELI5/ON), UI scale (0.75-1.5; Slint native scale factor, no per-token manual scaling), max editor tabs (LRU cap, default 20), run-complete notification toggle, max concurrent runs per thread (default 10), **sound effects** toggle (default off; see §10.13), max terminal instances (default 12, range 4-20), max browser tabs (default 8, range 2-12), hot-reload debounce (default 500ms, range 100-5000ms), **theme management** section (theme selector dropdown, "Open themes folder", "Create new theme", "Import theme", "Export theme" -- see §6.6), **Per-platform concurrency limits** (see §7.4.7) | Old "Settings" view + newfeatures.md |
| **Tiers** | Phase/task/subtask tier configuration; per-tier: platform (**dropdown**), model (**dropdown**), reasoning_effort, plan_mode, ask_mode, output_format | Old "Config" Tiers tab |
| **Branching** | **Enable Git** toggle (bound to `orchestrator.enable_git`; tooltip: "Enable git branch creation, commits, and PR creation during runs"); **Auto PR** toggle (bound to `branching.auto_pr`); **Branch strategy** dropdown: MainOnly / Feature / Release (bound to `branching.strategy`); **Use worktrees** toggle; **Parallel execution** toggle (note: "Parallel subtasks use separate git worktrees"); **Granularity** dropdown or label mapped to BranchStrategy (per_phase / per_task / per_subtask); Git info display (user, email, remote, branch -- resolved for active project, not CWD); **Orchestrator concurrency overrides** (collapsible, per-platform, see §7.4.7) | Old "Config" Branching tab |
| **Verification** | Verification checks, screenshot toggles | Old "Config" Verification tab |
| **Memory** | Multi-level memory with progress/agents/PRD file paths; **Context Injection** toggles and injected-context breakdown | Old "Config" Memory tab |
| **Budgets** | Per-platform token budgets | Old "Config" Budgets tab |
| **Advanced** | **FileSafe Guards** (collapsible card): three independent toggles -- "Block destructive commands" (on/off), "Restrict writes to plan" (on/off), "Block sensitive files" (on/off); approved commands list (scrollable, per-row remove, optional manual add); override toggle with warning styling. **MCP Configuration** (collapsible card): per-platform MCP toggles for **all supported providers** (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini), MCP server list (add/edit/remove servers with name/command/args/env fields), "Test connection" button per server, Context7 API key input (password-style), web search provider selection and API key. **Personas** (collapsible card): list, create, edit, delete Personas (project-local vs global); schema validation on save; permission profile and skill reference editing; see `Plans/Personas.md` §4 (canonical SSOT). **Containers & Registry** (collapsible card, see §7.4.8): Docker runtime/compose defaults, DockerHub namespace/repo/tag defaults, auth mode and push policy. **CI / GitHub Actions** (collapsible card, see §7.4.9): workflow template selection, trigger/matrix controls, required-secrets checklist, generate/preview/apply actions. **Other:** Sub-agent toggles and cleanup config (clean untracked before run, clean ignored files, clear agent-output dir, evidence retention days); the legacy Iced-era "Experimental features" subsection with per-platform "Enable Codex/Gemini/Copilot Experimental" toggles is removed in the Slint rewrite and MUST NOT be implemented. | Old "Config" Advanced tab + newtools.md + FileSafe.md + MiscPlan.md + GitHub_API_Auth_and_Flows.md + Personas.md |
| **Permissions** | Dedicated permissions management screen (see §7.4.10): scope selector (Global/Project), global wildcard default, per-tool override table (Allow/Ask/Deny per row with expand for granular rules), presets (Read-only, Plan mode, Full), external directory allowlist manager, doom_loop policy config, per-Persona permission profile editor. Canonical SSOT: `Plans/Permissions_System.md` §10. | Plans/Permissions_System.md + Plans/Tools.md |
| **LSP** | **Language Server Protocol (MVP)** (see §7.4.2): LSP is required for desktop release. Global "Disable automatic LSP server downloads" toggle; built-in servers list with per-server enable/disable (all on by default); per-server env vars and initialization options; custom LSP servers (add/edit/remove: command, extensions, env, initialization). Stored in app config (redb); project overrides optional. | Plans/LSPSupport.md |
| **Interview** | Interview-specific config; enable_phase_subagents, enable_research_subagents, enable_validation_subagents, enable_document_subagents; **Multi-Pass Review:** toggle on/off (default off), number of review passes (1-5 dropdown, default 2), max review subagents (1-10, default 3), show warning label when enabled ("Increases cost and time"); min/max questions (spinners), architecture confirmation toggle, vision provider dropdown; **Interview concurrency overrides** (collapsible, per-platform, see §7.4.7) | Old "Config" Interview tab + interview-subagent-integration.md |
| **Media** | Media generation configuration (see §7.4.15). Four capability toggles (Image Gen, Video Gen, TTS, Music Gen) each with model dropdown and description panel. Disabled-state rule: toggles greyed out when the required API key is missing — except Image Gen in Cursor chats, which remains enabled without a key. Canonical contract details (tool IDs, disabled reasons, request/response shapes) live in `Plans/Media_Generation_and_Capabilities.md` (SSOT); this tab provides the settings surface only. | Plans/Media_Generation_and_Capabilities.md |
| **Authentication** | Per-provider auth status (Cursor, Codex, Claude, Gemini, Copilot, OpenCode, GitHub) with **real-time auth state** chips (`LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`); login/logout/re-auth buttons; auth method indicators; auth URLs (selectable/copyable); Git info (user, email, remote, branch); **auth realm split:** show separate entries for `github_api` and `copilot_github` (SSOT: `Plans/Contracts_V0.md` `AuthRealm`); **multi-account visibility:** active account, account count, cooldown/rate-limit badge, and quick switch/manage entry. **Gemini Provider section:** Google Gemini API key field (password-style text input with show/hide toggle); clickable **[Get API key](https://aistudio.google.com/app/api-keys)** link next to the field; note near model dropdown: *"Usage limits vary by model/tier."*; informational sentence: *"Linking an API enables Image Generation as well."* See `Plans/Media_Generation_and_Capabilities.md` §2.4 for backend routing rules. | Old "Login" view |
| **Health** | System health checks with platform filtering; check categories (CLI Tools, Git, Runtimes, Browser Tools, Capabilities, Project Setup); check status (PASS/FAIL/WARN/SKIP); fix suggestions with dry-run; **explicit Install/Uninstall actions** (no automatic install behavior) with **real-time install state** for Cursor CLI, Claude CLI, and Playwright browser runtime (`Not Installed`, `Installing`, `Installed`, `Uninstalling`, `Failed`); Codex/Copilot/Gemini rows show direct-provider auth/connectivity status (no install buttons); platform version display (CLI version per detected platform); **Cursor/Claude manual path override:** `Use manual path` checkbox + native file picker + validate action (Cursor/Claude only); **multi-account health visibility:** per-provider active account + account count + cooldown/auth freshness; **Worktree management:** worktree list (path, branch, status, age columns), "Recover orphaned worktrees" button, worktree status indicators (active/stale/orphaned); **Storage & Cleanup:** DB size, cache size, evidence log count; evidence retention days input; "Clean workspace now" button (confirm modal with preview of files to delete per MiscPlan.md); storage maintenance actions | Old "Doctor" view + WorktreeGitImprovement.md + MiscPlan.md |
| **Rules & Commands** | Application rules (list or text area, editable); project rules (when project selected, reads/writes `.puppet-master/project-rules.md`); **User Commands management** (see §7.4.11): scope selector (Global/Project), command list with name/scope/description/Persona/mode/model columns, create/edit/delete commands, dry-run preview, shortcut binding, schema validation on save. Canonical SSOT: `Plans/Commands_System.md` §6. | From agent-rules-context.md + feature-list.md + Commands_System.md |
| **Shortcuts** | Full keyboard shortcut table (action name, current binding, default binding); search/filter by action name or key; per-row "Change" button (captures next key combination) and "Reset" button; "Reset all" button; export/import shortcuts (JSON). Data sourced from shortcut registry (single source of truth, DRY:DATA). | MiscPlan.md |
| **Skills** | Discover and manage SKILL.md files (project-level from `.puppet-master/skills/` and global from `~/.config/puppet-master/skills/`). Table: skill name, description, source (project/global), permission (Allow/Deny/Ask dropdown per row). Actions: Add, Edit (opens in File Editor), Remove, "Refresh" (re-scan disk). Bulk permission by pattern (e.g., "Allow all doc-*"). Preview skill body on row expand. | Plans/Skills_System.md |
| **Plugins** | Manage installed plugins (see §7.4.12): list discovered plugins with id, name, version, source (internal/project/global/config), enabled/disabled toggle. Per-plugin component counts (commands, hooks, skills). Enable/disable per plugin or per-hook. "Reload plugins" button. Plugin log viewer. Canonical SSOT: `Plans/Plugins_System.md`. | Plans/Plugins_System.md |
| **Formatters** | Manage code formatters (see §7.4.13): global "Enable formatters" toggle, per-formatter table (name, extensions, command, enabled/disabled toggle). Custom formatter add/edit/remove. Format-on-save indicator. Evidence log link for `format.applied` events. Canonical SSOT: `Plans/Formatters_System.md`. | Plans/Formatters_System.md |
| **Models** | Model configuration (see §7.4.14): model picker (provider + model dropdowns), variant selector (default/fast/powerful/custom), per-Persona model override editor, custom variant definitions, provider priority list editor. Canonical SSOT: `Plans/Models_System.md`. | Plans/Models_System.md |
| **Catalog** | Browse and install community content: commands, agents, hooks, skills, themes, and MCP server configs from a curated catalog. See §7.4.3. | feature-list.md |
| **Sync** | Export, import, and sync app configuration across machines. See §7.4.4. | feature-list.md |
| **SSH** | Manage SSH connections for remote editing. See §7.4.5. | FileManager.md |
| **Debug** | Debug adapter configuration and run/debug profiles. See §7.4.6. | FileManager.md |
| **HITL** | Three independent toggles: pause at phase/task/subtask completion; explanation of each level; all off by default | From human-in-the-loop.md |
| **YAML** | Raw YAML editor for full config | Old "Config" YAML tab |

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/CLI_Bridged_Providers.md

**§7.4.X Context Injection (Memory tab; per-project; optional per-run override)**

Rule: Puppet Master MUST expose three per-project Context Injection toggles (default ON): Parent Summary, Scoped `AGENTS.md` beyond top-level, and Attempt Journal. The toggles MUST affect Instruction/Memory bundle assembly deterministically, and the UI MUST display an “Injected Context” breakdown per run/turn (paths + byte counts; truncation reason).

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

Rule: When users edit `AGENTS.md` in Puppet Master (via File Editor or any in-app editing surface), Puppet Master MUST apply lightness lint + budget enforcement, and strict mode MUST be able to block runs when budgets are exceeded.

ContractRef: ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

**§7.4.0 Interaction Mode and Dual-Copy Contract (SSOT):**

Puppet Master uses two independent Expert/ELI5 controls:

- **App-level control (Settings > General):** Label is **Interaction Mode (Expert/ELI5)**. Canonical setting: `app_eli5_enabled` (or equivalent), default **ON** (ELI5). This controls authored tooltip/help strings and interviewer Q&A display copy.
- **Chat-level control (Chat input toolbar):** Label is **Chat ELI5**. Canonical setting: `chat_eli5_enabled` (or equivalent), default **OFF** (Expert/default LLM behavior). This control only modifies assistant instruction style for that chat thread/session.
- **Independence rule:** The controls must remain independent. Example supported combination: app ELI5 ON (simple tooltips/interviewer copy) while chat ELI5 OFF (technical chat responses).
- **Storage rule:** Persist app-level and chat-level toggles separately; never derive one from the other.
- **Migration alias:** Legacy `interaction_mode` values map to app-level behavior only (`eli5` => app ELI5 ON, `expert` => app ELI5 OFF).

**Dual-copy requirement (in-scope authored copy):**

- Every in-scope authored copy item must have both variants: `expert` and `eli5`.
- In-scope for this contract: tooltip/help copy, interviewer Q&A copy shown to users, and chat response-style prompt instructions.
- Out of scope: externally generated dynamic content (for example LSP hover payloads, web snippets, model-produced message bodies beyond style instruction).

**Single auditable checklist (authoritative table):**

| copy_id | Surface | Inventory source | Expert variant | ELI5 variant | Status |
|---|---|---|---|---|---|
| `tooltip.interview.*` | Settings/Interview tooltips | `src/widgets/tooltips.rs` keys with `interview.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.wizard.*` | Wizard tooltips | `src/widgets/tooltips.rs` keys with `wizard.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.tier.*` | Tier/config tooltips | `src/widgets/tooltips.rs` keys with `tier.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.branching.*` | Branching/worktree tooltips | `src/widgets/tooltips.rs` keys with `branching.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.memory.*` | Memory tooltips | `src/widgets/tooltips.rs` keys with `memory.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.orchestrator.*` | Orchestrator tooltips | `src/widgets/tooltips.rs` keys with `orchestrator.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.verification.*` | Verification tooltips | `src/widgets/tooltips.rs` keys with `verification.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.budget.*` | Budget tooltips | `src/widgets/tooltips.rs` keys with `budget.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.cli_paths.*` | CLI path tooltips | `src/widgets/tooltips.rs` keys with `cli_paths.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.network.*` | Network/API tooltips | `src/widgets/tooltips.rs` keys with `network.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.loop_guard.*` | Loop guard tooltips | `src/widgets/tooltips.rs` keys with `loop_guard.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.checkpointing.*` | Checkpointing tooltips | `src/widgets/tooltips.rs` keys with `checkpointing.` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.subagent_*` | Subagent platform tooltips | `src/widgets/tooltips.rs` keys with `subagent_` prefix | Required | Required | Complete in current Iced code; preserve in Slint rewrite |
| `tooltip.experimental_*` | Experimental feature tooltips | `src/widgets/tooltips.rs` keys with `experimental_` prefix | Legacy-only | Legacy-only | Legacy Iced implementation only; MUST NOT be implemented in the Slint rewrite. See Plans/rewrite-tie-in-memo.md. |
| `chat.style.prompt_instruction` | Chat assistant system instruction | `Plans/assistant-chat-design.md` §2.1 | Required | Required | Required |
| `interview.copy.question` | Interview question text shown to user | Interview prompt/copy pipeline | Required | Required | Required in rewrite |
| `interview.copy.explanation` | Interview "what this means/why it matters" text | Interview prompt/copy pipeline | Required | Required | Required in rewrite |
| `interview.copy.feedback` | Interview feedback/correction text shown to user | Interview prompt/copy pipeline | Required | Required | Required in rewrite |

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md

**Audit rule:** Any row above marked "Required" must not ship with a missing variant. No in-scope row may remain single-variant.

**Tab sub-grouping:** With 25 tabs, use a two-level navigation: left sidebar within Settings for groups, right area for the selected tab's content. Group labels act as collapsible section headers in the sidebar. Groups: **Core** (General, Tiers, Branching) | **Features** (Verification, Memory, Budgets, Permissions, Advanced, Interview, LSP, Models, Media) | **System** (Authentication, Health, Rules & Commands, Shortcuts, Skills, HITL) | **Extensions** (Plugins, Formatters, Catalog, Sync, SSH, Debug) | **Raw** (YAML). Each group header shows item count badge. Clicking a group header expands/collapses that group in the sidebar. Active tab highlighted with accent-left-border (3px).

**§7.4.2 LSP (LSP tab):** LSP support is **MVP** (required for desktop release), not optional. Per Plans/LSPSupport.md, the GUI must expose full LSP configuration so users can control automatic downloads, enable/disable servers, set env and initialization options, and add custom servers. Provide **Settings > LSP** with:

- **Disable automatic LSP server downloads** -- Global toggle (default: off). When on, the app does not download or install any LSP server automatically (equivalent to `OPENCODE_DISABLE_LSP_DOWNLOAD=true`). Servers already on PATH or already installed are still used.
- **Built-in LSP servers** -- A list of all built-in servers (see Plans/LSPSupport.md §3.2: astro, bash, clangd, csharp, clojure-lsp, dart, deno, elixir-ls, eslint, fsharp, gleam, gopls, hls, jdtls, julials, kotlin-ls, lua-ls, nixd, ocaml-lsp, oxlint, php intelephense, prisma, pyright, ruby-lsp, rust, slint-lsp, sourcekit-lsp, svelte, terraform, tinymist, typescript, vue, yaml-ls, zls). Each row shows: **server name** (and extensions hint), **Enable** toggle (default: **on** for all). User can turn any server off individually. Expanding a row (or opening "Configure") shows:
  - **Environment variables** -- Key-value list (e.g. `RUST_LOG` = `debug`). Optional; sent when starting that server.
  - **Initialization options** -- Key-value or JSON object; server-specific options sent in the LSP `initialize` request (e.g. TypeScript preferences). Optional.
- **Custom LSP servers** -- Section "Custom LSP servers" with **Add** button. Each custom entry has: **Name** (id), **Command** (array of strings, e.g. `["npx", "godot-lsp-stdio-bridge"]` or `["custom-lsp-server", "--stdio"]`), **Extensions** (comma-separated or list, e.g. `.gd`, `.gdshader`), and optionally **Environment variables** and **Initialization options** (same as built-in). Edit and Remove per row. Custom servers are in addition to built-in; same config schema (command, extensions, env, initialization) as OpenCode.

**Custom LSP server validation:** When adding or editing a custom server, enforce: (1) **Command** must be non-empty (at least one string; trim whitespace). If empty, show inline error "Command is required" and disable Save/Apply. (2) **Extensions** must be non-empty (at least one extension, e.g. `.gd`). If empty, show inline error "At least one file extension is required" and disable Save/Apply. (3) **Name** (id) must be unique among custom servers; if duplicate, show "Name already used" and disable Save/Apply. Saving or applying with invalid fields is not allowed; user must correct before persisting.

**Initialization options (JSON):** When the user edits **Initialization options** as JSON (e.g. raw text area or "Edit as JSON" for built-in/custom servers), validate on blur or on Save. If the value is **invalid JSON** (parse error): show an inline error message (e.g. "Invalid JSON: unexpected token at line N") and do **not** persist the invalid value. Optionally preserve the user's text in the editor so they can fix it; on next valid parse, clear the error and allow Save. If the user leaves the field with invalid JSON and clicks Save, block save and focus the field with the error message. Do not send invalid JSON to the LSP server at startup (use last known valid value or empty object).

All LSP settings are persisted in app config (redb or equivalent). Optional: project-level overrides (e.g. `.puppet-master/lsp.json` or project key in redb) so a project can disable a server or add a custom server for that project only; document merge rules (project overrides app) in implementation.

**§7.4.1 Tool permissions:** Tool permissions have been promoted from a collapsible card in Advanced to a dedicated **Permissions** tab (see §7.4.10). The canonical SSOT for permission actions, precedence, granular rules, defaults, and GUI requirements is `Plans/Permissions_System.md`. The tool registry (`Plans/Tools.md`) supplies the list of known tool names to populate the Permissions tab.

**Critical form control requirements:**
- **Model selection MUST use dropdowns** populated from dynamic model discovery, NOT text entry boxes
- **Platform selection MUST use dropdowns** listing available platforms
- All configuration that accepts one of N choices must use `ComboBox` (dropdown), not free-text `TextInput`.
- Save/discard controls per tab or global
ContractRef: ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/DRY_Rules.md#7

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

**§7.4.7 Per-Platform Concurrency Limits (Global + Per-Context Overrides):**

Per-platform concurrency limits control the maximum number of concurrent agent/subagent processes spawned per platform (provider). These limits exist for two reasons:

1. **Provider rate limits:** Each provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) enforces rate limits on concurrent requests. Exceeding them causes throttling, errors, or temporary bans.
2. **Dev-machine load:** Agent processes consume CPU, disk I/O, and memory on the machine hosting the project. Too many concurrent processes degrade the user's development environment.

**Global defaults (Settings > General > Per-platform concurrency limits):**

A collapsible card titled "Per-Platform Concurrency Limits" with a per-platform row for each of the 6 providers. Each row: platform name + icon, spinner (range 1-10). Defaults: Cursor: 3, Claude Code: 3, OpenCode: 2, Codex: 2, GitHub Copilot: 2, Gemini: 2. These defaults apply to all execution contexts unless overridden.

Tooltip (Expert): "Maximum concurrent agent processes per platform. Limits apply across all execution contexts (Chat, Interview, Orchestrator) unless overridden per context. Prevents provider rate-limit errors and reduces local machine load (CPU, disk I/O)."

Tooltip (ELI5): "How many tasks can run at the same time on each AI platform. Lower numbers are safer — they prevent rate-limit errors and keep your computer responsive."

**Per-context overrides:**

Three execution contexts can override the global per-platform caps: **Chat**, **Interview** (includes Multi-Pass Review), and **Orchestrator**. Overrides are placed in each context's settings tab:

- **Chat:** Settings > General, below "max concurrent runs per thread." Collapsible "Chat concurrency overrides" card (collapsed by default). Same per-platform row layout. When not overridden, each row shows "Using global: N" in muted text. When overridden, shows the override value and an "(override)" badge. Clear button per row resets to global.
- **Interview:** Settings > Interview, below the Multi-Pass Review section. Collapsible "Interview concurrency overrides" card (collapsed by default). Same layout. Note: "max review subagents" (existing, 1-10) is a separate concern — it limits how many reviewer subagents participate in a single Multi-Pass Review run, not per-platform concurrency.
- **Orchestrator:** Settings > Branching, below "Parallel execution" toggle. Collapsible "Orchestrator concurrency overrides" card (collapsed by default). Same layout.

**Effective cap:** For a given context and platform, the effective cap = that context's override if set, else the global default. All execution managers (Chat runner, Interview phase manager, Orchestrator scheduler) must respect the effective cap when spawning agents/subagents.

**Interaction with "max concurrent runs per thread":** The per-thread cap (Settings > General, default 10) limits total concurrent runs in a single chat thread regardless of platform. The per-platform cap limits how many of those runs can use a specific platform. Both limits apply simultaneously; the more restrictive limit wins for any given spawn decision.

**Persistence:** Stored in the same config store as other settings (redb in rewrite, gui_config/YAML pre-rewrite). Option B run config (per WorktreeGitImprovement.md §5.2) must include the effective per-platform caps for the run.

**Config shape:**

```yaml
concurrency:
  global:
    per_provider:
      cursor: 3
      codex: 2
      claude: 3
      gemini: 2
      copilot: 2
  overrides:
    chat:
      per_provider: {}       # empty = use global for all
    interview:
      per_provider: {}
    orchestrator:
      per_provider: {}
```

When an override is set (e.g. `overrides.orchestrator.per_provider.claude: 5`), that value is used for that context+platform. When absent, the global value applies.

**Plan graph independence:** Max concurrent limits are NOT part of the user-project plan graph (`.puppet-master/project/plan_graph/`). The plan graph defines only dependency structure (`depends_on`, `blockers`/`unblocks`). Concurrency limits are an execution/config concern: the scheduler loads the plan graph, respects its dependency-derived parallelism structure, and applies the effective per-platform caps from config.

| copy_id | Surface | Expert variant | ELI5 variant | Status |
|---|---|---|---|---|
| `tooltip.concurrency.global` | Settings/General concurrency card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.chat_override` | Settings/General chat override card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.interview_override` | Settings/Interview override card | Required | Required | Required in Slint rewrite |
| `tooltip.concurrency.orchestrator_override` | Settings/Branching override card | Required | Required | Required in Slint rewrite |

**§7.4.8 Containers & Registry (Advanced tab):**

Add a collapsible **Containers & Registry** card in Settings > Advanced for local container runtime, DockerHub publishing, and managed Unraid template defaults.

- **Runtime controls:** runtime selector (`docker` default), Docker binary path override, compose file path input with Browse/Auto-detect actions, compose project-name strategy (`auto`, `fixed`, `hash-based`), build context path, Dockerfile path, target stage, and target platforms / Buildx readiness.
- **DockerHub auth controls:** browser/device login action, PAT entry, helper text stating PAT is recommended, link/explainer for obtaining a PAT, stored-auth status, validated account/namespace summary, validate action, clear/remove credentials action, and requested-auth-mode vs effective-capability presentation.
- **Repository controls:** namespace selector, repository selector, refresh action, create-repository action, tag-template defaults (`{commit}`, `{version}`, `{timestamp}`), and push policy (`manual` default; optional `after_build`).
- **Create-repository safety:** the create-repository confirmation dialog MUST show namespace, repository name, and privacy; privacy defaults to private and MUST be visibly labeled as the default. This confirmation is non-bypassable.
- **Unraid controls:** `Generate/Update Unraid XML after successful publish` toggle (default enabled), `Manage Unraid template repository` toggle (default enabled), template repo path/remote/branch settings, setup flow (create-new vs select-existing), auto-push toggle (default disabled), one-click push action, and template-repo status row.
- **Docker Manage visibility:** include a setting named exactly `Hide Docker Manage when not used in Project.` Default: enabled.
- **`ca_profile.xml` controls:** scope selector (shared cross-project default vs per-project override), full edit surface, icon/image mode (repo-managed upload vs external URL), and warning state when the profile was auto-generated and still needs review.

**Validation behavior:** `Validate Docker configuration` MUST run inline preflight for Docker reachability, compose validity, Buildx readiness, requested-auth to effective-capability validation, selected repository access, managed template-repo validity (when enabled), and `ca_profile.xml` readiness.

Normative blocking matrix:
- Failures in Docker reachability / compose validity / Buildx readiness block Docker Build, Run/Preview, and Push entry points.
- Failures in DockerHub auth/repository-access block image-push entry points, but do not invalidate an already completed local build result.
- Managed template-repo validation failure (`unconfigured`, `config_invalid`, `diverged_remote`) does **not** block Docker image push; it blocks managed template update / auto-commit / template push actions and shows explicit remediation inline.
- `ca_profile.xml` review-required state does **not** block Docker image push; it blocks template auto-push and shows explicit review messaging inline.
- When a remote side effect is blocked by policy or confirmation requirements, the surface MUST present that outcome as **blocked** rather than **failed**, preserving any local build/publish result that already exists.

**Persistence behavior:** shared container defaults persist globally; project-specific Docker state persists per project.

Canonical scope split:
- Global app state:
  - runtime defaults
  - compose defaults
  - default push policy
  - `Hide Docker Manage when not used in Project.`
  - shared `ca_profile` source model
- Project state:
  - requested auth mode
  - selected namespace/repository/tag policy
  - last validation snapshot (non-secret)
  - template repo config/status
  - Docker Manage dock/tab/expanded-panel state
  - per-project `ca_profile` override state when override is enabled

Secrets persist only in OS credential storage or Docker credential-helper storage, never in redb.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md#147a-dockerhub-browser-auth-repository-management-and-unraid-publishing-addendum, ContractName:Plans/Permissions_System.md
**§7.4.9 CI / GitHub Actions (Advanced tab):**

Add a collapsible **CI / GitHub Actions** card in Settings > Advanced for workflow generation and management.

- **Template selector:** `docker-build-push`, `native-build-matrix`, `web-preview-and-test`, `mobile-ios-android`.
- **Template options:** trigger controls, matrix/build profile fields, optional publish/scanning toggles.
- **Secrets checklist:** deterministic list of required secrets for selected template and publish options.
- **Workflow actions:** `Generate workflow`, `Preview YAML`, `Apply to .github/workflows`.
- **Post-apply visibility:** generated workflows appear in a Settings list with edit/open actions.

ContractRef: ContractName:Plans/newtools.md#148-github-actions-settings--generation-contract, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

**§7.4.10 Permissions (Permissions tab):**

> **SSOT:** The canonical specification for the Permissions GUI is `Plans/Permissions_System.md` §10. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Permissions_System.md#GUI-PERMISSIONS, ContractName:Plans/Tools.md

The **Permissions** tab in Settings provides a dedicated screen for managing tool permissions across all scopes. Layout:

1. **Scope selector** (top bar): Toggle between **Global** and **Project** (project visible only when a project is active). Indicates which config file is being edited (`~/.config/puppet-master/permissions.toml` or `<project>/.puppet-master/permissions.toml`). When in Global scope with a project active, show effective (merged) permissions with layer-of-origin badges.

2. **Presets bar**: Three buttons — "Read-only", "Plan mode", "Full" — each applying a batch of permission rules per `Plans/Permissions_System.md` §10.4. Clicking triggers a confirmation dialog: "This will replace your current permissions. Continue?"

3. **Global wildcard default**: Single dropdown (`Allow` | `Ask` | `Deny`) setting the fallback action for any tool without an explicit rule. Default: `Ask`.

4. **Per-tool override table**: Table of all known tools (built-in canonical names from `Plans/Permissions_System.md` §5 + MCP-discovered tools). Columns: Tool name, Category badge, Permission dropdown (`Allow` | `Ask` | `Deny`), expand chevron. Tool list populated from registry at load time.

5. **Granular rule editor** (per-tool expand): When a tool row is expanded, an ordered list of `{pattern, action}` entries with: "Add rule" button, drag handles for reorder (last-match-wins), delete button per row, pattern input with wildcard help tooltip (`*` and `?`).

6. **External directory allowlist** (collapsible card): Scrollable list of allowlisted paths; "Add path" button (text input + optional native directory picker); per-row delete; home expansion display.

7. **doom_loop policy** (collapsible card): Action dropdown (`Allow` | `Ask` | `Deny`), repeat threshold spinner (default 3, range 2–10), explanation text.

8. **Per-Persona permission profiles** (collapsible card): List of named profiles from `~/.config/puppet-master/permission-profiles/`. "Create profile" button opens a permission editor scoped to the new profile. Profile rows: name, override count, edit/delete. The `default_permissions_profile` dropdown in the Personas editor (`Plans/Personas.md` §4) is populated from this list.

9. **ELI5/Expert**: In ELI5 mode, only per-tool dropdowns and presets are visible. Granular rules, profile editor, allowlist, and doom_loop config are hidden. Tooltip prefix: `tooltip.permissions.*`.

**Tab sub-grouping update**: The Permissions tab belongs to the **Features** group in the Settings sidebar (alongside Verification, Memory, Budgets, Advanced, Interview, LSP).

**§7.4.11 Commands (Rules & Commands tab):**

> **SSOT:** The canonical specification for the Commands GUI is `Plans/Commands_System.md` §6. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Commands_System.md#GUI-COMMANDS, ContractName:Plans/DRY_Rules.md

The **Rules & Commands** tab in Settings includes a **Commands** section for managing User Command presets. Layout:

1. **Scope selector** (top of Commands section): Toggle between **Global** (`~/.config/puppet-master/commands/`) and **Project** (`<project_root>/.puppet-master/commands/`; visible only when a project is active).

2. **Command list**: Table of all resolved commands (project + global). Columns: Name (with `/x-` prefix), Scope badge, Description (truncated), Persona (or "—"), Mode (or "inherit"), Model (or "inherit"), Subtask indicator. Project-local entries sort before global when names match.

3. **Create / Edit / Delete**: "New Command" button opens an editor with name, description, Persona dropdown, mode dropdown, model dropdown, subtask toggle, permissions profile override dropdown, and Markdown template editor. Edit pre-populates; delete confirms. Global commands offer "Save as project override" when a project is active.

4. **Dry-run preview**: "Preview" button resolves the template with sample arguments and displays the rendered prompt in a read-only Markdown view without submitting a run. Highlights placeholder substitutions, file includes, and shell injection results (or permission-blocked placeholders).

5. **Shortcut binding**: Per-command "Bind shortcut" action opens the shortcut capture UI. Bindings appear in Settings > Shortcuts as "Run command: \<name\>".

6. **Schema validation**: On save, validates name format, reserved-name collision, required description, mode/model format. Blocks save on errors.

7. **ELI5/Expert**: In ELI5 mode, only name, description, and a "Run" button are shown. Template editor, Persona/mode/model overrides, permissions profile, and dry-run are hidden in ELI5. Tooltip prefix: `tooltip.commands.*`.

**Tab sub-grouping update**: The Rules & Commands tab belongs to the **System** group in the Settings sidebar.

**§7.4.12 Plugins (Plugins tab):**

> **SSOT:** The canonical specification for the Plugins system is `Plans/Plugins_System.md`. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Plugins_System.md#GUI-PLUGINS, ContractName:Plans/DRY_Rules.md

The **Plugins** tab in Settings provides visibility and control over discovered plugins. Layout:

1. **Plugin list**: Table of all discovered plugins (internal + project + global + config). Columns: ID, Name, Version, Source badge (Internal/Project/Global/Config), Enabled toggle, Component counts (commands, hooks, skills). Sorted by load order (internal first, then project, global, config; lexicographic within each source).

2. **Enable/Disable**: Per-plugin toggle. Disabling a plugin removes its hooks and tools from the active set without deleting the plugin from disk. Per-hook disable: expand a plugin row to see its registered hooks; each hook has an independent enable/disable toggle.

3. **Plugin details**: Expand a plugin row to see: registered hook events, registered custom tools (with collision status), and the plugin's log output (filtered from structured log).

4. **Reload plugins**: "Reload" button re-scans discovery paths and reloads all plugin manifests. Toast confirms reload with count.

5. **Per-Persona disabling**: A note linking to Settings > Advanced > Personas where `disabled_plugins` can be set per Persona.

6. **ELI5/Expert**: In ELI5 mode, show only plugin name, description, and enabled toggle. Component counts, log viewer, and hook-level toggles are hidden. Tooltip prefix: `tooltip.plugins.*`.

**Tab sub-grouping update**: The Plugins tab belongs to the **Extensions** group in the Settings sidebar.

**§7.4.13 Formatters (Formatters tab):**

> **SSOT:** The canonical specification for the Formatters system is `Plans/Formatters_System.md`. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Formatters_System.md#GUI-FORMATTERS, ContractName:Plans/DRY_Rules.md

The **Formatters** tab in Settings provides formatter configuration. Layout:

1. **Global toggle**: "Enable formatters" (bound to `config.formatters.enabled`; default: true). When off, no formatters run.

2. **Formatter table**: Table of all known formatters (built-in + custom). Columns: Name, File Extensions, Command, Enabled toggle. Built-in formatters are pre-populated from the canonical table (`Plans/Formatters_System.md` §2). Custom formatters appear below with a "Custom" badge.

3. **Add custom formatter**: "Add formatter" button opens a form: name (unique), command (with `$FILE` placeholder), extensions (comma-separated), optional environment variables. Validate command on save.

4. **Edit / Remove**: Edit button for custom formatters (built-in formatters only allow enable/disable and command override). Remove button for custom formatters only.

5. **Evidence link**: "View format events" link opens the Evidence ledger filtered to `format.applied` events.

6. **ELI5/Expert**: In ELI5 mode, show only formatter name, extensions, and enabled toggle. Command, environment, and evidence link are hidden. Tooltip prefix: `tooltip.formatters.*`.

**Tab sub-grouping update**: The Formatters tab belongs to the **Extensions** group in the Settings sidebar.

**§7.4.14 Models (Models tab):**

> **SSOT:** The canonical specification for the Models system is `Plans/Models_System.md`. This section provides the FinalGUISpec integration points; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Models_System.md#GUI-MODELS, ContractName:Plans/DRY_Rules.md

The **Models** tab in Settings provides model and variant configuration. Layout:

1. **Default model selector**: Provider dropdown + Model dropdown. Displays the canonical model ID (`provider_id/model_id`). Sets `config.model`.

2. **Variant selector**: Dropdown with built-in variants (default, fast, powerful) plus any custom variants. "Edit variants" button opens the variant editor. Variant cycling shortcut binding note.

3. **Variant editor** (collapsible card): List of custom variants with name, model ID, and description. Add/edit/remove custom variants. Built-in variants (default/fast/powerful) can be customized (model ID override) but not deleted. Disable a variant: toggle to exclude it from the cycling order.

4. **Per-Persona model overrides** (collapsible card): Table of Personas with `default_model` and `default_variant` columns. Edit button per row opens a model/variant picker. Clearing a field falls back to global config. Links to Settings > Advanced > Personas for full Persona editing.

5. **Provider priority list** (collapsible card): Ordered list of provider IDs. Drag-to-reorder or up/down buttons. Determines the internal priority list for fallback when no model is explicitly set.

6. **Model options** (collapsible card): Per-provider-model option editor. Select provider + model, then edit options (temperature, max_tokens, top_p, reasoning_effort, etc.) as key-value fields.

7. **ELI5/Expert**: In ELI5 mode, show only default model selector and variant selector. Provider priority, model options, and per-Persona overrides are hidden. Tooltip prefix: `tooltip.models.*`.

**Tab sub-grouping update**: The Models tab belongs to the **Features** group in the Settings sidebar.

**§7.4.15 Media (Media tab):**

> **SSOT:** The canonical specification for media generation capabilities, capability gating, disabled reasons, request/response contracts, and UI copy is `Plans/Media_Generation_and_Capabilities.md`. This section provides the FinalGUISpec Settings integration points only; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM, ContractName:Plans/DRY_Rules.md

The **Media** tab in Settings provides enable/disable toggles and model selection for each media capability. Layout:

1. **Image Generation** (collapsible row):
   - **Enable** toggle (default: follows backend — ON when Cursor backend or valid Google key present; OFF otherwise).
   - **Model dropdown**: lists available image-generation models for the configured provider. Selection sets the default image model. Description panel below the dropdown changes dynamically with each model selection (short model description, supported features, max resolution).
   - Disabled-state rule: greyed out when no Google Gemini API key is configured **except** in Cursor chats where Image Gen remains enabled without a key (routes via Cursor-native generation per `Plans/Media_Generation_and_Capabilities.md` §2.4).

2. **Video Generation** (collapsible row):
   - **Enable** toggle (default OFF; requires Google Gemini API key).
   - **Model dropdown** + dynamic description panel (same pattern as Image Gen).
   - Disabled-state rule: greyed out when no Google key is configured.

3. **Text-to-Speech (TTS)** (collapsible row):
   - **Enable** toggle (default OFF; requires Google Gemini API key).
   - **Model dropdown** + dynamic description panel.
   - Disabled-state rule: greyed out when no Google key is configured.

4. **Music Generation** (collapsible row):
   - **Enable** toggle (default OFF; requires Google Gemini API key).
   - **Model dropdown** + dynamic description panel.
   - Disabled-state rule: greyed out when no Google key is configured.

**Disabled-state presentation:** When the required API key is missing, the toggle and dropdown are rendered **greyed out** (non-interactive). A footnote below the disabled row displays: *"Requires a Google API Key. [Get API key](https://aistudio.google.com/app/api-keys)"* (clickable link). When a capability is admin-disabled (toggle OFF), the model dropdown is hidden.

**DRY note:** Capability IDs, disabled-reason values, backend routing rules, and UI copy strings are defined in `Plans/Media_Generation_and_Capabilities.md` §1–§5 and MUST NOT be restated here.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM, ToolID:capabilities.get, ToolID:media.generate

**Tab sub-grouping update**: The Media tab belongs to the **Features** group in the Settings sidebar.

<a id="SKILLS-TAB"></a>

**§7.4.16 Skills (Skills tab):**

> **SSOT:** The canonical specification for skill identity, on-disk format, discovery roots, search order, shadowing, validation, and permission semantics is `Plans/Skills_System.md`. This section provides the FinalGUISpec GUI integration points only; normative behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Skills_System.md#GUI-SKILLS, ContractName:Plans/DRY_Rules.md

The **Skills** tab in Settings provides discovery, inspection, and permission management for SKILL.md files. Skills are discovered from project-local roots (e.g., `.puppet-master/skills/`) and global roots (`~/.config/puppet-master/skills/`); the full set of discovery roots and their priority order is defined in `Plans/Skills_System.md` §3.

**Layout:**

1. **Skill list table**: Table of all discovered skills. Columns:
   - **Name**: Skill ID (from YAML frontmatter `name` field).
   - **Description**: Skill description (truncated with expand; see §10.10).
   - **Source**: Badge indicating Project or Global, with sub-label showing root origin (`.puppet-master`, `.claude`, `.agents`). Source column requirements per `Plans/Skills_System.md` §6.
   - **Permission**: Dropdown per row (`Allow` | `Deny` | `Ask`). Persisted per Skill ID in the permission store. Semantics defined in `Plans/Skills_System.md` §5.
   - **Status**: Validation indicator — green check for valid, red warning icon for invalid (hover shows error message). Invalid skills are listed but not loadable. Validation rules per `Plans/Skills_System.md` §3.3.
   - **Shadowed**: When a skill is shadowed by a higher-priority root, show amber badge "Shadowed" with tooltip listing the overriding skill's path. Shadowing rules per `Plans/Skills_System.md` §3.2.

2. **Actions toolbar** (above table):
   - **Add**: Opens a native directory picker to select a skill directory containing `SKILL.md`. Validates on selection; on success, copies to the active scope's skill root and re-scans.
   - **Edit**: Opens the selected skill's `SKILL.md` in the File Editor (§7.18). Disabled when no row is selected.
   - **Remove**: Deletes the selected skill directory from disk (confirmation modal: "Remove skill '{name}'? This cannot be undone." with [Remove] and [Cancel]). Disabled for shadowed-only entries or when no row is selected.
   - **Refresh**: Re-scans all discovery roots and rebuilds the skill list. Toast: "Skills refreshed — {N} skills found."
   - **Validate all**: Runs validation (per `Plans/Skills_System.md` §3.3) across all discovered skills and updates the Status column. Toast summary: "{N} valid, {M} invalid."

3. **Bulk permission** (below toolbar): Pattern input with "Apply" button. Example: entering `doc-*` and selecting `Allow` sets permission to Allow for all skills whose ID matches the glob pattern. Pattern matching uses the same `*` and `?` wildcards as the Permissions tab (§7.4.10).

4. **Skill preview** (row expand): Expanding a skill row reveals a read-only Markdown preview of the skill body (content after YAML frontmatter). For invalid skills, the expand area shows the validation error details instead.

5. **Scope indicator** (top bar): Shows whether the current project provides project-local skills. When no project is active, only global skills are listed with a note: "Open a project to see project-level skills."

**Error handling:**

- Discovery errors (e.g., unreadable directory, permission denied on a root): per-root warning banner at the top of the skill list: "Could not scan {root}: {error}". Other roots continue scanning.
- YAML parse failures: skill appears in the table with Status = invalid; expand shows the parse error. Skill is not loadable.
- Directory-name mismatch (folder name ≠ Skill ID): shown as a validation error in the Status column per `Plans/Skills_System.md` §3.3.

**ELI5/Expert**: In ELI5 mode, show only skill name, description, source, and permission dropdown. Status column, shadowed badge, bulk permission, and validate-all button are hidden. Tooltip prefix: `tooltip.skills.*`.

**Tab sub-grouping update**: The Skills tab belongs to the **System** group in the Settings sidebar.

### 7.5 Wizard

**Group:** Run | **Location:** Primary content

Multi-step requirements wizard (10 steps: 0-9):
- Step 0: Project Setup (new/existing, GitHub repo creation, intent selection: New project / Fork & evolve / Enhance / Contribute PR)
- Step 1: Dependency Install (platform CLIs and runtimes) -- NEW
- Step 2: Quick Interview Config (reasoning level, agents.md)
- Steps 3-8: PRD generation, tier configuration, tier planning
- Step 9: Final review and initialization

**Intent selection UI:** Four cards, each showing: intent name, one-line description, and themed icon. Selected card has accent border and filled background. Changing intent mid-flow triggers a confirmation modal: "Changing intent will clear requirements and interview progress. Continue?" with [Continue] and [Cancel] buttons.

**Project setup fields (intent-specific):**
- **New project:** Project path input; optional "Create GitHub repo" checkbox with sub-fields: repo name (pre-filled from project name), visibility (Public/Private radio), description (text input), .gitignore template (dropdown), license (dropdown: MIT, Apache 2.0, GPL-3.0, etc.), default branch (text input, default "main").
- **Fork & evolve / Contribute PR:** Upstream repo input (URL or owner/repo); "Create fork for me" or "I'll create the fork myself" radio; fork URL/path input when manual.
- **Contribute PR:** Feature branch name input (text input with auto-suggest from requirements slug; sanitized per git ref rules).

**Requirements step:** Upload files (max 10 files, max 5 MiB per file; drag-and-drop or file picker; list display with remove and reorder; reject oversized files with inline error). Requirements Doc Builder button opens Builder chat mode. First Builder Assistant message is context-sensitive: `What are you building?` (new project), `What are you adding or changing?` (existing project), or `What are you adding or changing in this fork?` (fork / contribute). Multiple uploads are concatenated in display order after deterministic text normalization; Builder output is appended after uploads.

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

The findings summary shown here MUST be the canonical workflow artifact for that review run. At minimum the rendered payload must resolve back to review-run identity, per-document findings counts, unresolved items, and any revised-artifact reference needed by the final approval gate.

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

**Wizard state `attention_required` -- recovery flow:**

When a user navigates away from the Chain Wizard while it is in `attention_required` state:

1. The wizard state is written to redb as `attention_required` and persists across app restarts.
2. The Dashboard shows a `wizard_attention_required` CtA card in the "Action Required" section at the top of the card grid (see §7.2 `wizard_attention_required` CtA card spec).
3. The relevant chat thread shows a badge and a `clarification_request` system message with an inline question form.
4. **Resuming from Dashboard card or thread:** Clicking "Resume Wizard" (on the Dashboard CtA card or on the thread) opens the wizard directly at the step identified in `wizard_step`, with the `clarification_request` message and its inline question form shown prominently.
5. **After submission:** The wizard automatically re-runs Pass 1 + Pass 2.
   - If the new quality report returns `verdict == "PASS"`: wizard transitions back to `active`; the CtA card is dismissed; the thread badge is cleared.
   - If `verdict == "FAIL"` again: a new `clarification_request` is posted (the previous one is archived); the CtA card `reason` text is updated to reflect the new question count/summary.

*Deep-link URL format:*
`puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify`

This URL is stored as `resume_url` on the `wizard_attention_required` CtA card and on the `clarification_request` thread message. The app registers this URL scheme and navigates to the correct view on activation.

ContractRef: ContractName:Plans/assistant-chat-design.md#thread-attention-needed-state, ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics

**Error handling:** Subagent crash/timeout: collect partial reports; if <50% complete, fail run and surface "Multi-Pass Review failed (too few reviews completed)"; otherwise continue with completed reports. Review agent fails: surface "Could not produce revised doc" with "Use original document" and "Retry" buttons. All subagent spawns fail: surface error with auth/model check suggestion.

### 7.6 Interview

**Group:** Run | **Location:** Primary content

Interactive requirements gathering with phase tracking, Q&A flow, reference materials. Also available as a Chat mode (Interview tab in Chat panel).

**Phase progress:** Horizontal stepper showing interview phases (Gather, Research, Validate, Document, Review). Each step shows completion percentage and elapsed time. Active phase pulses with accent color. Completed phases show green checkmark icon; errored phases show red X icon with "Retry phase" button.

**Adaptive phase selection:** Phases are selected based on intent and requirements (via AI phase selector or rule-based fallback). GUI shows a phase checklist (all phases listed with checkboxes; unchecked = skip). "Run all phases" toggle (default off) overrides and runs all phases at Full depth. Phase depth indicators: Full (all questions + research), Short (max 2 questions, no research), Skip (omitted).

**Question UI:** Each interview question shows: question text, suggested answer options as clickable chips/buttons, and a "Something else" text input bar for freeform answers. Thought stream toggle (show/hide the model's reasoning). Message strip showing conversation flow.

**Subagent activity:** When interview subagents are enabled (see Settings > Interview), reuse the shared **Agent Activity Pane** (`§7.19`) as an embedded Interview surface rather than a one-off card. The Interview layout is: Q&A/chat region + shared activity pane + embedded document pane. Active Interview stage/subagent rows show Persona, selection reason, effective platform/model, current action, elapsed time, and skipped-control disclosure when relevant. When Multi-Pass Review is active, show review round counter and per-reviewer status in the same pane.

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

6. **Tool usage widget:** Card or section showing tool-level metrics from seglog rollups (per Plans/Tools.md and storage-plan analytics scan). Columns or list: **Tool name** (built-in + MCP/custom), **Invocation count** (in selected window), **Latency** (e.g. p50 / p95 ms or median), **Error rate** (failures / total executed calls, %). Optional: sort by count or error rate; filter by time window (**5h / 24h / 7d**; custom is optional later); expand row for breakdown by platform or session. Data from redb projections produced by analytics scan over tool events in seglog. The card shows a **Last updated** timestamp sourced from rollup metadata; while a refresh is in progress, keep the previous values visible and show a lightweight "Refreshing…" state. Empty state copy: **"No tool activity recorded for this window yet."** Helps identify noisy or failing tools (e.g. repeated grep, MCP timeouts).

**Data sources:** Primary: seglog/redb rollups from analytics scan jobs. Fallback: aggregate from `usage.jsonl`. Platform APIs augment when env vars are set. Tool usage: same analytics scan rollups (tool latency, error counts per tool).

7. **Media usage display (local counters):** Per-capability usage counters sourced from local generation logs (redb projections), **not** authoritative provider quotas. Displays: current count vs configured cap (e.g., *"3 / 20 images today"*), estimated per-call cost (based on model pricing metadata when available), and approximate remaining budget. Puppet Master MUST NOT claim authoritative provider quota values unless a provider API explicitly returns them. When no provider quota API exists, show only local counters and an **"Open Usage & Limits"** external link (e.g., to [Google AI Studio](https://aistudio.google.com/) or the relevant provider dashboard) so the user can check their actual quota externally. Caps are user-configurable per capability in Settings > Media (§7.4.15); defaults: no cap (unlimited local counter, display only).

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM, ToolID:media.generate

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

Platform readiness view for Setup and first-run troubleshooting. Shows detected versions, resolved paths, and live transition states.

- **Install/Uninstall state rows:** Cursor CLI, Claude CLI, and Playwright browser runtime use real-time states: `Not Installed` → `Installing` → `Installed` and `Installed` → `Uninstalling` → `Not Installed` (or `Failed` with error details).
- **Explicit actions:** Each row has explicit install/uninstall actions (no automatic install behavior).
  - **Windows (Cursor only):** show two install actions: `Install Native` and `Install WSL`.
- **Manual path override (Cursor/Claude only):** `Use manual path` checkbox reveals a native file picker and path field; Save triggers immediate validation and state update (`Valid` / `Invalid` + reason).
- **Binary validation error rendering:** When validation fails, Setup renders the stable `BinaryErrorCode` from `Plans/BinaryLocator_Spec.md` and maps it to deterministic copy/actions: `OverrideMissing`/`NotFound` → explain that no usable binary was found and keep install actions visible; `NotExecutable` → explain permission issue and suggest fixing file mode; `BlockedByOSSecurity` → show OS-specific unblock guidance; `MissingRuntime` → explain missing launcher runtime (for example Node.js) and link to install guidance; `WrongBinary` → explain that a different CLI was found; `Timeout`/`OverrideInvalid` → show validation failure details with a `Retry` action. The trace/details expander MUST use the same mapping in Setup and Health/Doctor.
- **Provider auth + multi-account snapshot:** Compact per-provider auth state (`LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`), active account label, and account count, with links to Settings > Authentication and Settings > Health.
- **Command contract (normative):**
  - Cursor install (Linux/macOS/WSL):
    ```bash
    curl https://cursor.com/install -fsS | bash
    ```
  - Cursor PATH setup (bash; Linux/macOS/WSL):
    ```bash
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    ```
  - Cursor PATH setup (zsh; Linux/macOS/WSL):
    ```bash
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
    ```
  - Cursor install (Windows Native; PowerShell):
    ```powershell
    irm 'https://cursor.com/install?win32=true' | iex
    ```
  - Cursor verify:
    ```bash
    agent --version
    ```
  - Cursor uninstall (Linux/macOS/WSL):
    ```bash
    rm -f ~/.local/bin/agent ~/.local/bin/cursor-agent
    rm -rf ~/.local/share/cursor-agent
    ```
  - Cursor PATH cleanup (bash/zsh; Linux/macOS/WSL):
    ```bash
    sed -i '/export PATH="$HOME\/.local\/bin:$PATH"/d' ~/.bashrc
    sed -i '/export PATH="$HOME\/.local\/bin:$PATH"/d' ~/.zshrc
    ```
  - Cursor uninstall (Windows Native; PowerShell):
    ```powershell
    $agentPath = "$env:LOCALAPPDATA\cursor-agent"
    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $userPath = ($userPath -split ';' | Where-Object { $_ -and ($_ -ne $agentPath) }) -join ';'
    [Environment]::SetEnvironmentVariable("PATH", $userPath, "User")
    $env:PATH = ($env:PATH -split ';' | Where-Object { $_ -and ($_ -ne $agentPath) }) -join ';'
    if (Test-Path $agentPath) { Remove-Item -Recurse -Force $agentPath }
    ```
  - Cursor Windows policy: prefer Windows Native install/detect; also offer an explicit WSL path. Setup MUST show two actions: `Install Native` and `Install WSL`. If the user chooses `Install WSL` and WSL is not installed, surface actionable guidance.
  - Claude install (Linux/macOS/WSL):
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```
  - Claude install (Windows):
    ```cmd
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```
  - Claude uninstall (Linux/macOS/WSL):
    ```bash
    rm -f ~/.local/bin/claude
    rm -rf ~/.local/share/claude
    ```
  - Claude uninstall (Windows):
    ```cmd
    del "%USERPROFILE%\.local\bin\claude.exe"
    rmdir /s /q "%USERPROFILE%\.local\share\claude"
    ```
  - Claude verify:
    ```bash
    claude --version
    ```
  - Playwright policy: install/uninstall remains app-local only.

### 7.16 Chat Panel (NEW)

#### 7.16.R Auto Retrieval chip (thread-local) + live animation

Add an **Auto Retrieval** chip to the Chat Panel header/footer (placement may be near the context usage indicator):

- **Function:** Thread-local On/Off override for smart auto-retrieval (RAG) across project chat/code/log sources.
- **Visual states:** Off (neutral), On (lit/accent), Searching (animated spinner/pulse while any retrieval query is running).
- **Popover:** On click, show current override state and last retrieval summary with a “View details” action that scrolls to the most recent retrieval audit block in the thread.
- **Accessibility:** Keyboard focusable; state announced via aria-label.

#### 7.16.S Context Lens (Mute / Focus / Subcompact) — chat header button + per-message styling

Add a **Context Lens** button to the Chat Panel header (next to other thread-level controls):

- **Button state:** Lit/colored when active; clicking shows submenu with **Mute / Focus / Subcompact** and highlights the current mode.
- **Selection mode:** When active, clicking messages toggles them in the current mode selection set; exiting Context Lens clears selection (no “keep selection” behavior).
- **Per-message visuals (required):**
  - **Muted:** dimmed + “Muted” badge; tooltip “Excluded from context.”
  - **Focused:** highlighted/pinned styling + “Focus” badge.
  - **Subcompacted:** show compact “Subcompacted” summary block with expand/collapse and “Revert subcompact” action.
- **Subcompact warning:** Applying Subcompact must show a warning modal before committing.
- **Audit affordance:** Context Lens actions must create/update an audit entry block (see assistant-chat-design.md §13), and the UI should offer a “Review selection” link from the Context Lens submenu when any messages are selected.

ContractRef: ContractName:Plans/assistant-chat-design.md#17-context-truncation, ContractName:Plans/UI_Command_Catalog.md#2-6-chat-context-usage-commands
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

Normalization rule: `Interview`, `BrainStorm`, and `Crew` are workflow overlays/surfaces. The canonical runtime mode sent to execution remains `ask`, `plan`, `regular`, or `yolo` per `Plans/Run_Modes.md`; overlay selection is persisted separately for UX only.

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

**Thread selector:** Dropdown with current thread name and status dot (green=idle, blue=running, orange=queued, red=attention_required). Click opens floating thread list overlay (max 300px wide) over message area with search, archive toggle, and [+] new thread. No permanent thread sidebar (panel too narrow).

**Thread management:**
- **New thread:** [+] button creates a new thread; inherits current platform/model/mode or defaults
- **Rename:** Double-click thread name in list; or right-click → Rename
- **Archive:** Right-click → Archive; archived threads hidden by default (toggle "Show archived" in thread list)
- **Delete:** Right-click → Delete; confirmation modal required ("This cannot be undone")
- **Resume:** Resume a previous thread, restoring its full conversation context
- **Rewind:** Restore thread to a specific message (right-click message → "Rewind to here"); all messages after that point are soft-deleted (recoverable via "Show removed")
- **Share/Export:** Right-click thread → Export; bundles thread as JSON (messages, plan, metadata); secrets are stripped automatically
- **Run-complete notification:** When a run completes in a background thread, that thread's tab shows an accent dot badge; optional toast notification ("Thread 'Project X' completed"). Notification behavior configurable in Settings/General (on/off)
- **Max concurrent runs:** Default 10 per thread; configurable in Settings/General. When limit reached, new runs are queued with a message "Run queued -- N runs active". Note: per-platform concurrency limits (§7.4.7) also apply — the more restrictive limit wins for any given spawn decision

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

**Input area:** Multi-line, auto-grows from 1 line (48px) to max 5 lines (120px). SEND button (accent background). Below-input row: `@` mention (opens file picker overlay with fuzzy search, showing files, symbols, and headings as you type), attach button (opens file dialog for files and images; paste and drag-drop also supported). Slash command detection: `/` shows autocomplete popup (see §7.16.2). **Chat ELI5 toggle:** Small toggle in input toolbar; default **OFF** (Expert/default LLM behavior). When on, assistant uses simpler explanations in this thread only (does not affect generated documents, tooltips, or interviewer text). This toggle is independent from app-level **Interaction Mode (Expert/ELI5)** in Settings. **YOLO/Regular toggle:** Permission mode selector; YOLO auto-approves all tool calls, Regular prompts for approval once or per-session. Per-session; does not persist across restarts. **YOLO + FileSafe interaction:** When YOLO is enabled and FileSafe guards are active, show a persistent warning chip in the input toolbar: "[!] YOLO active -- FileSafe guards still apply." When FileSafe blocks a command during YOLO mode, show inline approval card in the chat stream (see below).

**FileSafe in-chat approval UI:** When a command is blocked by FileSafe, display an inline card in the chat stream: orange left border, command text in monospace, guard name that triggered, and two buttons: "Approve once" (runs the command this time only) and "Approve & add to list" (adds to approved commands in Settings > Advanced). The card auto-dismisses after 60 seconds with a "Timed out -- command skipped" message. Blocked commands are also logged to the FileSafe event log accessible from Settings > Advanced.

**Footer strip (20px):** Contains the following controls left-to-right:

**Platform selector:** Compact dropdown (icon + short name). Lists all 6 providers (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). Data sourced from `platform_specs`. Per-thread setting -- changing platform applies to the next message sent, not any in-flight generation. When changed, the model dropdown repopulates for the new platform and the reasoning/effort control shows or hides accordingly.

**Model selector:** Compact dropdown listing models for the currently selected platform. Models are discovered dynamically from platform CLIs (e.g., `agent models`, `claude models`) and cached. When discovery fails or returns empty, falls back to `platform_specs::fallback_model_ids(platform)`. User can customize the model list via a "Manage models" entry at the bottom of the dropdown (opens a small modal with: add custom model ID, reorder via drag, mark favorites which appear at the top, remove). Per-thread setting. The `/model` slash command also opens this selector for keyboard-friendly access.

**Reasoning/effort selector:** Shown only when `platform_specs::supports_effort(platform)` returns true. For Claude Code: dropdown with Low / Medium / High (maps to `CLAUDE_CODE_EFFORT_LEVEL` env var). For Codex and Copilot: dropdown with Low / Medium / High / Extra High. For Cursor: hidden (reasoning is encoded in model names like `sonnet-4.5-thinking`). For Gemini: hidden (no effort support). Per-thread setting.

**Capability picker (media):** Compact dropdown (icon: sparkle or media icon) near the composer, listing the four media capabilities: **Image**, **Video**, **TTS**, **Music**. Each item maps to a capability ID from `Plans/Media_Generation_and_Capabilities.md` §4.1. **Enabled items** are clickable and insert the corresponding capability prompt into the composer (verbatim prompts per SSOT §5.1). **Disabled items** are visible but **greyed out** with a tooltip showing the disabled-reason message (per SSOT §5.2). Disabled rows remain keyboard-focusable so the same reason text is available on hover and focus. When any capability requires a missing Google API key, the dropdown footer shows a banner: *"Please provide a free or paid Google API Key."* **[Get API key](https://aistudio.google.com/app/api-keys)** (clickable link). Cursor backend behavior: Image enabled without key; Video/TTS/Music disabled with `BACKEND_UNSUPPORTED`. The dropdown refreshes after Settings changes that affect capability state and keeps the footer banner pinned while any visible item is blocked for the same missing-key reason. **Helper only:** the capability picker is a convenience shortcut — media generation is primarily invoked by natural language in the chat (see `Plans/Media_Generation_and_Capabilities.md` §3 for slot extraction). Per-thread; no persistence.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER, ToolID:capabilities.get, Invariant:INV-003

**Context usage:** Text label (e.g., "42k / 128k") plus a context circle (progress gauge, ~16px) showing context usage percentage. Color transitions: blue (0-75%), amber (75-90%), red (90-100%). Hover shows tokens/cost/percentage tooltip. Click opens Usage tab for that thread.

**Per-thread usage:** Small context indicator (circular progress, ~16px) in chat header. Hover tooltip: total tokens, usage %, cost (USD). Click opens thread Usage tab with: summary (total tokens, context %, total cost), breakdown (input/output/reasoning/cache), optional per-turn table, link to app-wide Usage page.

**LSP in Chat (MVP):** The Chat Window fully uses LSP (Plans/LSPSupport.md §5.1). **Diagnostics in Assistant context:** When building context for the next Assistant (or Interview) turn, include a summary of current LSP diagnostics for the project or @'d files (errors/warnings with file, line, message, severity, source) so the agent can suggest fixes. **@ symbol with LSP:** When LSP is available, the **@** menu includes **symbols** (from LSP workspace/symbol and optionally documentSymbol) so the user can add a function/class/symbol to context by name; results show path, line, kind. **Code blocks in messages:** Code blocks in assistant or user messages support **LSP hover** (tooltip with type/docs) and **click-to-definition** (e.g. Ctrl+Click) when the block has a known language and the project has an LSP server; definition opens in the File Editor. **Problems link from Chat:** Chat footer or message area offers a link or badge (e.g. "N problems") that opens the Problems panel (LSP diagnostics) for the current project or context. Optional: compact hint for @'d files (e.g. "2 errors in @'d files") with click-through to Problems. Fallback when LSP unavailable: @ symbol uses text-based symbol search; code blocks have no hover/definition; diagnostics in context omitted.

**Chat LSP control placement and behavior:**
- **Footer strip (left-to-right order):** Platform selector → Model selector → Reasoning/effort selector (when supported) → **Capability picker** (media) → Context usage → **Problems link**. The Problems link is the rightmost LSP-related control in the footer. The Capability picker lives between the effort selector and the context usage indicator.
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

The chat supports web search with inline citations and a structured sources block. When the assistant performs web search:

- The message body uses numbered citations (`[1]`, `[2]`, …) at the claim site. Activating a citation scrolls to and highlights the corresponding source row.
- The message shows a query label such as `Web search: {query}` in the activity detail or sources header.
- A **Sources** section appears below the message with clickable URL, title, and 1-2 sentence snippet per source. Clicking a source opens it in the Bottom Panel Browser tab (§7.20).
- When more than 5 sources are present, the Sources section may collapse to a summary row (`Web search: N sources`) and expand on demand.
- If the search fails or returns no usable sources, the chat shows an inline error or empty-result message and does not render a misleading citations block.
- Accessibility: citation controls must be keyboard focusable and expose descriptive labels (for example `Citation 1 of 3`).

#### 7.16.2 Slash Commands

Typing `/` in the chat input shows an autocomplete popup listing available commands. The popup includes both **reserved slash commands** (built-in actions) and **User Commands** (user-authored presets from `Plans/Commands_System.md`). Reserved commands appear first; User Commands appear below, prefixed with `/x-`.

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

**User Commands (presets):** Users can define project-level and global command presets as `.md` files with YAML frontmatter + template body. Each preset may override Persona, mode, and model for its run. Custom command names MUST NOT conflict with reserved commands. Full schema, template syntax, and management GUI: `Plans/Commands_System.md` (canonical SSOT). Management UI: Settings > Rules & Commands (§7.4.11).

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

**External drag-and-drop:** Drag files from the system file manager into the File Manager tree to copy or move them into the project. Uses platform-specific APIs: Windows (IDropTarget / OLE drag-drop), macOS (NSDraggingDestination / NSPasteboard), Linux (Xdnd protocol / wl_data_device for Wayland). On drop: multi-file and directory drops show a preflight confirmation dialog ("Copy N files into {folder}?" with [Copy] [Cancel]); single-file drops without conflicts may proceed immediately. If a file already exists at the destination, show conflict resolution per Plans/FileManager.md §1.1 (`Overwrite` / `Keep both` / `Cancel`, with optional "apply to all" behavior from Settings). Hold **Shift** during drag to move instead of copy; cursor/drag-image feedback must show the current mode. Progress indicator for multi-file copies. Dropped directories are copied recursively.

**File preview:** When a file is selected, read-only preview in primary content area (or in-panel split when panel >400px). Monospace font with basic syntax highlighting using accent palette.

### 7.18 File Editor (NEW)

#### Rendering preview/export and detached-window UX contract (2026-03-08)

**Mermaid export UI**
- Mermaid-capable preview surfaces expose `Export` actions for `SVG`, `PNG`, `Copy SVG`, and `Copy image`.
- `Export` opens a dialog or popover that includes:
  - destination path
  - format
  - theme (`current app theme` default, explicit override allowed)
  - background mode
  - overwrite behavior summary
- The export confirmation UI MUST show the final filename before write.
- Export failures and clipboard failures MUST surface a visible inline or toast error.

**Detached preview/browser windows**
- Detached windows are modeless and owned by the app session.
- Closing the main app closes detached preview/browser windows after preview intent has been persisted.
- Closing a detached preview window updates the owning surface state but does not delete the underlying preview subject.
- `Detach` followed by `Reattach` keeps the same `preview_session_id` unless platform fallback forced a transport restart.
- When the product falls back from embedded to detached mode automatically, the UI MUST show that this is a platform/runtime fallback, not a content error.

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

**Location:** Embedded in Wizard, Interview, and Requirements Builder views

Read-only, chat-like pane showing streaming agent output during document generation and Multi-Pass Review. Shows which persona/subagent is working on which task. Output lines are non-interactive; progress controls live in the pane footer. Monospace font. Min height 120px, max ~500 visible lines (virtualized via `ListView`).

**Responsibility boundary (required):**
- Agent Activity Pane is for streaming/progress only.
- It must not host document navigation, document editing, or approval controls.
- Findings summary and approval controls are shown in chat + preview section; document editing happens in File Editor or embedded document pane.

**Virtual buffer and auto-scroll:**
- Backed by a bounded FIFO buffer of 500 visible lines; oldest lines are evicted first.
- Auto-scroll is on by default. If the user scrolls upward, auto-scroll pauses and a `New output` affordance re-enables it.
- Auto-scroll preference is persisted per project under `project.{project_id}.ui.agent_activity_auto_scroll` (default `true`).

**Progress display and controls:**
- Header shows current state badge (`idle`, `generating`, `reviewing`, `paused`, `cancelling`, `cancelled`, `complete`, `error`).
- Status text uses deterministic progress wording such as `Writing document 3 of 15` or `Reviewing pass 2 of 4`.
- Footer buttons are `Pause`, `Resume`, and `Cancel`. These control the run state but never make the log stream itself editable or clickable.

**Embedding and persistence:**
- In Interview and Requirements Builder, the pane sits in a vertical split below the primary surface. Default split ratio: 65/35 for Interview, 60/40 for Requirements Builder.
- Collapsed state and split ratio are persisted per project: `project.{project_id}.ui.agent_activity_pane_visible` and `project.{project_id}.ui.agent_activity_pane_ratio`.

**Event wiring (required):**
- Pane consumes normalized Provider event stream used by chat.
- UI updates are dispatched through the Slint event loop (`invoke_from_event_loop`) for immediate state refresh.

**Error handling:**
- On stream disconnect, keep existing output visible and show a persistent inline warning with reconnect/retry affordance.
- On cancellation, append a final `[cancelled]` line instead of clearing the pane.
- On provider/runtime error, append the error line, set the header badge to `error`, and keep prior output available for review.

**Accessibility:** The pane uses `accessible-role: text` (or equivalent for read-only log output). Screen readers should announce new output as it arrives via a live region equivalent (Slint: set `accessible-label` to include latest line summary). Focus can be placed on the pane for keyboard scrolling (Up/Down/Page Up/Page Down). Keyboard shortcut to toggle auto-scroll.

### 7.19.1 Embedded Document Pane (NEW)

#### Rendering-subject scope for embedded documents (2026-03-08)

The Embedded Document Pane may host either document-backed or artifact-backed renderable content.

Rules:
- Workspace-backed documents use `doc:<document_id>` as the preview subject.
- Planning drafts, assistant-created unsaved documents, and other non-file artifacts use `artifact:<artifact_id>` until first persist.
- Artifact-backed content may open source in a transient `generated://<artifact_id>` buffer.
- The pane may issue v1 structured preview edits only when the underlying subject is backed by a mutable shared buffer or a validated transient source buffer using the same preview-action pipeline.
- Review/inspection surfaces that are not yet wired to the validated preview-action path remain non-destructive even when they render Markdown/Mermaid richly.

**Purpose:** The Embedded Document Pane supports live, multi-document preview during doc generation (Requirements Doc Builder + Interviewer) and provides durable annotations, send-selection-to-chat handoff, and targeted resubmits for cheap iteration.

**Non-goal (explicit):** No direct patch-apply mode. Structured annotations remain requests/review cues; the agent/runtime performs document changes through targeted revision or later explicit edit flows.

---

#### A) Live Multi-Document Preview (during generation + targeted resubmits)

**Doc list requirements**
- Shows ALL generation artifacts for the current bundle/run, including staged artifacts (examples: `requirements-builder.md`, `contract-seeds.md`, and interview artifacts like phase docs, PRD, `AGENTS.md`).
- Updates as new docs appear mid-run.
- Click to switch between docs at any time.

**Doc entry status badges (canonical set)**
- `writing…` (live updating; read-only)
- `draft` (editable)
- `needs-review`
- `changes-requested`
- `approved` (Approved/Done for final review gating)

**Live update behavior**
- If viewing the actively-written doc: show streaming updates.
- If viewing another doc: that doc stays stable; the active doc continues writing in background (badge + updated_at continue to update).

**Follow active doc toggle (default ON)**
- ON: auto-switch selection to the doc being written.
- OFF: user selection is sticky; writing never steals focus.

**Editing guardrails**
- If a doc is `writing…`, it is read-only in this pane (prevents dueling writes).
- Once it leaves `writing…`, it becomes editable with basic edit+save.

---

#### B) Annotation Mode (Highlight + Actions)

The Embedded Document Pane uses a selection-driven **Annotations** review model rather than an `Add note`-only flow.

**Selection palette**
- Select text to open a reusable action palette with: `Comment / Ask`, `Replace with...`, `Insert after...`, `Remove / Strike this`, and `Send selection to chat`.
- `Comment / Ask`, `Replace`, `Insert after`, and `Remove` create durable annotations.
- `Send selection to chat` creates a removable `document_selection_context` chip in the page-owned chat composer prep strip.
- Actions that require stable source anchoring are disabled with explicit explanation on no-source-map renders.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md

**Annotation drawer**
- Title: `Annotations`.
- Placement: right-side rail / drawer in binder-style review surfaces; the left rail remains dedicated to document switching and status.
- On the first durable annotation in a page/bundle context, auto-open the drawer once for discoverability; after that, drawer open/closed state is sticky.
- Each row shows operation badge, selected excerpt, payload preview, anchor status, lifecycle state, and replies.
- Filters include `Open`, `Addressed`, `Resolved`, plus operation-type filters/badges.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

**Lifecycle and anchoring**
- Annotation lifecycle is `open -> addressed -> resolved`.
- The agent/runtime may set `addressed`; the user controls final `resolved`.
- Store both `anchor.text_position` and `anchor.text_quote`.
- Default prefix/suffix length is 32 chars (clamped).
- Re-anchoring is deterministic: 1) position selector, 2) quote selector with prefix/suffix preference, 3) keep annotation open and show `Anchor not found — reselect to re-anchor`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

**Cross-pane chat handoff**
- Hidden chat does not auto-open on `Send selection to chat`; instead pulse/badge the owning chat launcher and show a lightweight toast.
- Use one unified composer prep strip above the textarea for pending context chips; document-selection chips live beside other context sources, not in a bespoke one-off tray.
- Read-only / no-source-map renders are `Send selection to chat` only in v1 unless the renderer later gains stable semantic anchors.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

---

#### C) Bundle Controls: Resubmit with Annotations + Final Review

**Resubmit with Annotations (targeted revision pass)**
- Runs a targeted revision pass on docs with open durable annotations, or a user-selected subset.
- Input records are deterministic and ordered by `doc_id`, source start offset, and `annotation_id`.
- Each record carries `operation`, `intent_kind`, `operation_payload`, `selected_text`, anchor data, and bounded provenance.
- The pass may update document text and/or answer question/comment annotations without changing the document.
- For each processed annotation, record `addressed_explanation` and an updated anchor when re-anchoring succeeds.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

**Structured-output and conflict rules**
- Conflicting or stale mutating annotations are excluded from automatic revision and surfaced for user resolution.
- Allow one automatic retry on schema/order/shape validation failure; after that, degrade or fail explicitly rather than silently coercing output.
- Hard rule: targeted revision MUST NOT trigger Multi-Pass Review.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Crosswalk.md

**Final Multi-Pass Review (runs once, final-only)**
- Multi-Pass Review is disabled until all bundle docs are Approved/Done and there are no open annotations.
- User explicitly clicks `Run Final Review`; do not auto-run.
- Runs once by default; rerun explicit only.
- Outputs findings and optional revised bundle.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

**Single final gate**
- After final review completes, show `Accept | Reject | Edit`.
- `Accept` applies the revised bundle.
- `Reject` discards review output and preserves the pre-review bundle.
- `Edit` opens the revised docs without rerunning review.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

---

#### D) Acceptance Criteria (UI-level, testable)

- During generation, ≥2 docs appear in the doc list; user can switch between them and watch live updates.
- Annotations are anchored to selections; after edits, they re-attach via quote+context or remain open with a clear anchor-not-found warning (never silently lost).
- Resubmit with Annotations applies/answers durable annotations and does not run Multi-Pass Review.
- Multi-Pass Review cannot start until all docs are Approved/Done and annotations are resolved; it runs once by default and ends in a single Accept/Reject/Edit gate.

### 7.20 Bottom Panel (NEW)

#### Browser normalization against unified rendering contract (2026-03-08)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

The browser model is split into explicit surface classes.

### Surface classes
- `workspace_preview`: in-shell browser tab for project-linked preview and trusted browser tasks
- `detached_preview`: detached browser or preview window linked to a workspace tab and project
- `automation_session`: ephemeral automation browser session that does not become a persistent shell tab automatically
- `auth_session`: ephemeral auth/device/login browser session that is never restored as a shell browser tab automatically

### Required shell behavior
- browser tab caps apply only to in-shell browser tabs
- detached preview windows are outside the in-shell browser-tab cap
- automation and auth sessions are never silently converted into workspace browser tabs
- browser state is restored per project and workspace tab when the surface class allows restoration
- user-triggered share-to-agent state is visible on the originating browser/preview surface and revocable from the browser chrome and attention surfaces

### Cross-platform rule
- Windows uses WebView2, macOS uses WKWebView, Linux uses WebKitGTK/Wry
- when embedding support differs by platform, the surface class remains the same and only the hosting mode changes
- Wayland limitations may require detached-window fallback for some embedded-browser cases, but a static screenshot fallback is not acceptable as the steady-state browser model

### Dev-loop interaction
- Ports and browser surfaces reflect the active dev session
- opening a detected local server from Ports creates or focuses the correct browser surface without bypassing the tab/window restore rules above
#### 10.9.1 Native Clipboard Contract (Normative)

Text-entry widgets (`TextInput`, `TextEdit`) MUST use Slint-native clipboard and selection behavior for keyboard shortcuts and context-menu actions.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, SchemaID:Spec_Lock.json#locked_decisions.ui, PolicyRule:Decision_Policy.md§2

Implementations MUST NOT route text-widget copy/paste/select-all behavior through custom Rust clipboard read/write handlers.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

Implementations MUST NOT add custom key interception for Ctrl/Cmd+A/C/X/V on text widgets.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

Non-text copy contexts (for example Copy Path / Copy Value) MAY use `ClipboardHelper`, but this exception MUST remain scoped to non-text widgets only.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/FileManager.md, PolicyRule:Decision_Policy.md§2

<a id="10.9.2"></a>
#### 10.9.2 Clipboard Surface Coverage Matrix

| Surface | Allowed implementation path | Disallowed glue | Required verification |
|---------|-----------------------------|-----------------|-----------------------|
| File Editor input | Slint `TextInput` / `TextEdit` native keyboard + context-menu clipboard actions | Manual clipboard read/write for text widgets; custom Ctrl/Cmd+A/C/X/V interceptors | Verify Ctrl/Cmd+A/C/X/V + Copy/Paste/Select All context actions behave natively |
| Chat composer input | Slint text widget native clipboard behavior | Message-level clipboard rerouting for text input | Verify parity with File Editor shortcuts and context actions |
| Terminal command input (if editable) | Slint editable text widget native clipboard behavior | Custom clipboard manager for text entry | Verify Ctrl/Cmd+A/C/X/V + context actions on terminal command input |
| Terminal/log read-only output | Read-only Slint text widget selection/copy behavior (or equivalent read-only selectable surface) | Paste routed into read-only output; manual text-widget clipboard read/write | Verify selection and copy work; verify paste is not treated as editable insertion in read-only output |
| Non-text copy contexts (path/value) | `ClipboardHelper` callback only for non-text targets | Reusing non-text helper as a general text-widget clipboard path | Verify copied value equals selected path/value source text |

<a id="10.9.3"></a>
#### 10.9.3 Legacy Glue Removal Checklist

Migration readiness checklist for clipboard behavior:
- [ ] Remove manual clipboard read/write handlers used for text widgets.
- [ ] Remove custom Ctrl/Cmd clipboard key interceptors for text widgets.
- [ ] Remove read-only text workaround glue where native Slint read-only text widgets cover the behavior.
- [ ] Remove manual selection-state plumbing implemented only to support text-widget clipboard actions.
- [ ] Keep `ClipboardHelper` usage scoped to non-text copy contexts (path/value).

This checklist MUST be completed before closing clipboard migration tasks in the rebuild queue.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

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
   - Keep `dashboard_layout:v1` as backup (do NOT delete it).
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
- plan panel remains visible in chat
- panel shows written plan summary + TODO list
- `Open in Editor` is available but not mandatory as the default landing surface

**Deep Plan** UI expectations:
- the resulting plan document opens automatically in an editor / preview-capable document surface
- the document is rendered using the shared markdown/mermaid pipeline
- the source remains canonical markdown / Mermaid text
- if the document is still a non-persisted draft, `open_source` uses a transient `generated://<artifact_id>` buffer

Required visible actions when applicable:
- `Continue Planning`
- `Open in Editor`
- `Execute`
- `Execute with Crew`
- `Queue Execution` (only when another run is active in the same thread)
- `Save As`
- `Use Chain Wizard` / `Add a new Feature or Enhancement` when recommended

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
