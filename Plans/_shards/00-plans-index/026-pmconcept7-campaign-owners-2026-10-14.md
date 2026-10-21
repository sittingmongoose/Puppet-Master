# Shard 026: PMConcept7 campaign owners — 2026-10-14

Source: `Plans/00-plans-index.md`

Source lines: L6082-L6100

Source SHA256: `b983b5368138bb45d17a28229e981387b9a13308f3d8291f30fdb07df464fa68`

---

## PMConcept7 campaign owners — 2026-10-14

The campaign decisions are DL-189 through DL-202. FinalGUISpec F3-650/F3-651 own the shared Customize screen and editor behavior; F3-652/F3-653 own Liquid Glass and wallpapers (concept publication completed 2026-10-15); F3-654 owns settled contrast; F3-655/F3-656 own Wizard/Orchestrator and onboarding presentation; F3-657/F3-658 own resize feedback and shared glyphs. Existing notification, hover and panel owners are amended in place.

Settings_System SSYS-052 through SSYS-054 own the admitted editor settings, Settings placement/update behavior and Wallpaper. storage-plan SP-333 owns their storage boundary. UI_Command_Catalog UCC-204, Commands_System CS-102, UI_Wiring_Rules UIW-043 and Wiring_Matrix WM-093 bind the controls. The finite table is `Plans/pm7_control_bindings.json`; static checks are `python3 scripts/pm7-canon-check.py`; ATS-077 and GRRC-041 track acceptance and the remaining native evidence. F3-656 records GLY-4 option B; F3-652 and F3-644 carry the settled Glass Light hover-light and font-range decisions. Native implementation evidence remains required; the Glass/wallpaper publication hold is closed.

This live map registers the following companions as machine inputs for the native Slint application:

- `Plans/appearance_quick_sets.json`, owned by `Plans/FinalGUISpec.md#F3-650`, supplies exact quick-set patches and reset field sets.
- `Plans/appearance_quick_sets.schema.json`, owned by `Plans/FinalGUISpec.md#F3-650`, validates that registry.
- `Plans/editor_appearance.schema.json`, owned by `Plans/UI_Command_Catalog.md#UCC-204` and `Plans/Commands_System.md#CS-102`, defines editor appearance requests and results.
- `Plans/glyph_catalog.json`, owned by `Plans/FinalGUISpec.md#F3-658`, supplies the shared glyph vocabulary and mappings.
- `Plans/pm7_canon.fixtures.json`, owned by `Plans/Automated_Testing_System.md#ATS-077`, supplies static appearance and shell acceptance fixtures.
- `Plans/pm7_control_bindings.schema.json`, owned by `Plans/Wiring_Matrix.md#WM-093`, validates the finite control-binding table.
- `Plans/wallpaper_catalog.json`, owned by `Plans/FinalGUISpec.md#F3-653`, supplies the wallpaper catalog and look defaults.

The HTML concept remains a look-and-behavior reference only. Paths under `Concepts/` in these companions identify concept reference art or source lineage, not native assets. Registration grants no runtime, handler, native, or readiness authority. Native implementation evidence remains required.

ContractRef: ContractName:Plans/Decision_Log.md#DL-189, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/Settings_System.md#SSYS-052, ContractName:Plans/Wiring_Matrix.md#WM-093, ContractName:Plans/Automated_Testing_System.md#ATS-077
