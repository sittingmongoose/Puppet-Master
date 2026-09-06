# Shard 028: Appendix B: Locked Decisions Summary

Source: `Plans/FinalGUISpec.md`

Source lines: L4013-L4033

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## Appendix B: Locked Decisions Summary

These decisions are final and must not be revisited during implementation:

1. **Rust stable 1.96.1 verified 2026-07-02; Slint 1.17.1 selected/currentness decision 2026-07-07** -- no other native UI framework; reverify official stable releases before coding/build work
2. **winit + Skia** default, **winit + FemtoVG-wgpu** fallback
3. **No React/Tauri/DOM-rendered product UI or HTML/CSS/JS product shell** -- native desktop is Rust + Slint `.slint` markup; Slint/WASM web may use only minimal HTML/canvas bootstrap and generated/minimal JavaScript glue needed to load the WASM canvas client
4. **IDE shell layout** -- Activity Bar + Primary Content + Side Panel + Bottom Panel
5. **Four theme families / eight built-in themes** -- Friendly Dark, Friendly Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, Basic Light (built-in variants + custom themes via TOML). The untouched first-open/fresh-project factory default is Basic Dark; explicit saved project theme/layout customization survives, and a copied project receives a detached snapshot. This supersedes the Friendly Dark default and the earlier three-family lock while preserving both as historical lineage.
6. **Settings and presentation ownership** -- `Plans/Settings_System.md` owns the Settings shell and ordinary-setting semantics; `Plans/newtools.md` N2-151 owns the Doctor registry/router/projection; auth/account owners retain Login; Final GUI owns their K3-shell presentation, chrome, theme, layout, and motion rather than a unified semantic Settings + Login + Doctor owner.
7. **Event-driven updates** via `invoke_from_event_loop`, not polling
8. **redb for layout persistence**, seglog for events, Tantivy for search
9. **Model/platform selection via dropdowns**, not text entry
10. **Product name: `Puppet Master`**
11. **All 12 former future considerations are MVP** -- browser, instant project switch, sound effects, hot reload, instructions editor, custom themes, language detection, catalog, sync, SSH, Debug Mode workflows, and terminal tab management
12. **Bottom runtime zone includes the classical debugger surface** -- Terminal, Problems, Output, Ports, and Debugger / DAP Debugger remain runtime-zone occupants; browser-capable preview/browsing is not a bottom-panel debug substitute
13. **Browser runtime contract is capability-first, not crate-name-first** -- implementation must satisfy the promoted browser/session model rather than hard-locking the spec to stale `wry` wording
14. **Classical debugger uses DAP** -- the integrated debugger surface is DAP-based and distinct from Assistant Debug Mode
15. **SSH uses system keychain / agent flows** -- credentials stay in OS-managed stores, never in config files

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md
