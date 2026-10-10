# Shard 028: Appendix B: Locked Decisions Summary

Source: `Plans/FinalGUISpec.md`

Source lines: L4293-L4315

Source SHA256: `cf498d16d8ec3cf08792900c526af3abe56cf49b137a19142400f978c0bbbed1`

---

## Appendix B: Locked Decisions Summary

These decisions are final and must not be revisited during implementation:

1. **Rust stable 1.96.1 verified 2026-07-02; Slint 1.17.1 selected/currentness decision 2026-07-07** -- no other native UI framework: Slint owns layout, input, focus, text editing, clipboard, drag and drop and windows, and replacing it needs a new owner decision (DL-139; a GPUI fork was considered and rejected on 2026-10-02); reverify official stable releases before coding/build work
2. **winit + Skia only** -- Skia on the GPU by default, Skia's own CPU raster as the only fallback, extended by Puppet Master's Skia renderer extensions (F3-582); FemtoVG and Slint's separate software renderer are retired (DL-139); on a software GPU adapter the CPU raster is always used, even over an explicit GPU choice, with a warning that no GPU was detected
3. **No React/Tauri product UI** -- native desktop is Rust + Slint `.slint` markup; the web GUI is a Rust Leptos client drawn with browser elements and CSS, with JavaScript limited to generated or minimal glue (DL-139, F3-583)
4. **IDE shell layout** -- Activity Bar + Side Panel (left) + Primary Content + chat column (right); Home's primary content is one universal panel system (amended 2026-10-09, DL-180: the Bottom Panel is no longer a zone; F3-630, F3-637)
5. **Four theme families / eight built-in themes** -- Friendly Dark, Friendly Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, Basic Light (built-in variants + custom themes via TOML). The untouched first-open/fresh-project factory default is Basic Dark; explicit saved project theme/layout customization survives, and a copied project receives a detached snapshot. This supersedes the Friendly Dark default and the earlier three-family lock while preserving both as historical lineage.
6. **Settings and presentation ownership** -- `Plans/Settings_System.md` owns the Settings shell and ordinary-setting semantics; `Plans/newtools.md` N2-151 owns the Doctor registry/router/projection; auth/account owners retain Login; Final GUI owns their K3-shell presentation, chrome, theme, layout, and motion rather than a unified semantic Settings + Login + Doctor owner.
7. **Event-driven updates** via `invoke_from_event_loop`, not polling
8. **redb for layout persistence**, seglog for events, Tantivy for search
9. **Model/platform selection via dropdowns**, not text entry
10. **Product name: `Puppet Master`**
11. **All 12 former future considerations are MVP** -- browser, instant project switch, sound effects, hot reload, instructions editor, custom themes, language detection, catalog, sync, SSH, Debug Mode workflows, and terminal tab management
12. **Bottom runtime zone includes the classical debugger surface** -- Superseded 2026-10-09 (DL-180, DL-181): there is no fixed bottom runtime zone. Terminal, Output, Problems, Ports and Debug Console are tab kinds that open in any panel, the tools landing beside the terminals by kind affinity, and the default Home layout's full-width bottom row is an ordinary panel row (F3-630, F3-634, F3-635); each terminal tab holds one session (F3-640, SMPFS-180). What stands: the Debugger / DAP Debugger stays part of the product (decision 14), and browser-capable preview/browsing is not a debug substitute. Earlier text, kept for lineage: "Terminal, Problems, Output, Ports, and Debugger / DAP Debugger remain runtime-zone occupants; browser-capable preview/browsing is not a bottom-panel debug substitute"
13. **Browser runtime contract is capability-first, not crate-name-first** -- implementation must satisfy the promoted browser/session model rather than hard-locking the spec to stale `wry` wording
14. **Classical debugger uses DAP** -- the integrated debugger surface is DAP-based and distinct from Assistant Debug Mode
15. **SSH uses system keychain / agent flows** -- credentials stay in OS-managed stores, never in config files

Amended 2026-10-10 (Addendum 2 D28, DL-180), decision 12: Output is one tab with its channel switched inside it (F3-635).

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md
