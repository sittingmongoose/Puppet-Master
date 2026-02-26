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

---

<a id="appendix-c-widget-grid"></a>
