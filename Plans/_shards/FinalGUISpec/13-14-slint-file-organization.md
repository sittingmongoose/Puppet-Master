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

