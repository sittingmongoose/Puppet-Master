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

