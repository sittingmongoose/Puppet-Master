# Shard 019: DL-180 to DL-185 — Who Owns The Home Panels, Tabs And Terminal Now (2026-10-09)

Source: `Plans/Crosswalk.md`

Source lines: L3547-L3568

Source SHA256: `8828021b9b39d038cc0465d5dff5817a3d374afbe0bba5e83a0406be43f245f7`

---

## DL-180 to DL-185 — Who Owns The Home Panels, Tabs And Terminal Now (2026-10-09)

Jared's home redesign of 2026-10-09 (DL-180 to DL-185) replaces the Home model of the 2026-08-04 reconciliation: four fixed editor panels, one Dashboard surface, terminal sections in a bottom zone and a movable chat. Route any question about one of those old surfaces to its new owner below. The old units stay readable as lineage, each with its own dated note from its owner; this table names owners only and restates no rule. Section 3.13 and C-019 are amended for the terminal in the same change.

| Old Home surface or rule | Where it was | New owner |
|---|---|---|
| Four fixed editor panels (`editor_panel_1` to `editor_panel_4`, Panels 1 and 2 open at start) | F3-HOME-001, F3-501, F-080, `Plans/home_workspace_layout.schema.json` | Panels of one split tree (`Plans/FinalGUISpec.md#F3-630`); the editor tab kind (`#F3-635`, `#F3-639`); opening files from the file tree (`Plans/FileManager.md#F-090`) |
| The singleton Dashboard surface, its four-widget catalogue and its one `widget_layout:v1:dashboard` namespace | section 7.2, F3-279, WS-009, WS-013, WS-020 | Dashboard tabs (`Plans/FinalGUISpec.md#F3-638` for presentation; `Plans/Widget_System.md#WS-030` for boards, hosting and one namespace per board) |
| The movable chat (grab handle, docks, floating inside the window, Dock back) | F3-HOME-003, F3-504, F3-516 where they move the chat | The fixed chat column (`Plans/FinalGUISpec.md#F3-637`); what the chat opens and where (`Plans/assistant-chat-design.md#ACD-500`); Pop out and its return (`Plans/UI_Command_Catalog.md#UCC-203`) |
| The fixed bottom runtime zone (the bottom panel, Collapse Bottom Terminal, Output, Problems, Ports and Debug Console as bottom tabs) | sections 3.1, 3.2, 5 and 7.20, F3-034, F3-035, F3-060, F3-061, F3-151 | The Home named layout's bottom row, an ordinary panel row, and collapse for every panel (`Plans/FinalGUISpec.md#F3-630`); the tool kinds (`#F3-635`) |
| Terminal sections, workgroups, sub-tabs, panes, the Quadrant layout and the four-section and four-pane caps | Section15 section 1.6, SMPFS-014, SMPFS-138, F3-062 to F3-065, F3-450 | One session per terminal tab (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`); the tab's chrome (`Plans/FinalGUISpec.md#F3-640`); the old records as read-only migration inputs (`Plans/storage-plan.md#SP-332`); four terminals side by side as the Terminals 2x2 named layout (`Plans/FinalGUISpec.md#F3-630`) |
| Terminal themes, fonts and effects, and the rows that asked for a restart | F3-083, F3-120, F3-121, the `code.terminal.*` appearance rows | One appearance model (`Plans/FinalGUISpec.md#F3-642` to `#F3-644`, `Plans/DRY_Rules.md#DR-068`); its storage (`Plans/storage-plan.md#SP-331`) and Settings rows (`Plans/Settings_System.md#SSYS-051`) |
| The Home layout record and the Home part of `layout:v1` | `home_workspace_layout.v1` (SP-245, F3-HOME-004), section 15.1, F3-217 | The `home_workspace_layout.v2` record (`Plans/storage-plan.md#SP-330`, with the v2 schema); v1 is a read-only migration input, converted on first read and never reset |
| Placement chosen per caller (editor panel and group targets on `OpenFile`, per-surface open rules) | F-034, F-080, CV-055, UCC-025 | One opening module (`Plans/FinalGUISpec.md#F3-634`, `Plans/DRY_Rules.md#DR-071`) with one placement field set (`Plans/Contracts_V0.md#CV-360`) |
| Home commands, events and wiring | UCC-144, CV-323, the Home rows of Wiring_Matrix and UI_Wiring_Rules | `Plans/UI_Command_Catalog.md#UCC-200` to `#UCC-203`, `Plans/Commands_System.md#CS-100` and `#CS-101`; `workspace.layout_changed` with its v2 payload (`Plans/Contracts_V0.md#CV-361`); `Plans/Wiring_Matrix.md#WM-090` to `#WM-092`, `Plans/UI_Wiring_Rules.md#UIW-040` to `#UIW-042` |
| Home settings rows built on the old model (panel dock, chat layout mode, terminal layout style) | `Plans/settings_inventory.json` | `Plans/Settings_System.md#SSYS-050` and `#SSYS-051` |
| The Guided Tour's step that moves or docks the chat | PWIZ-023, F3-521 | The tour's workspace chapter (`Plans/Planning_Wizard.md#PWIZ-035`) |
| Home certification built on four editor panels | ATS-029 | `Plans/Automated_Testing_System.md#ATS-075` (panels) and `#ATS-076` (terminal tab) |
| One panel and tab grammar, gesture kit, overlay root, terminal appearance model, bans, Demo Studio and opening module | the 2026-08-04 Home owner boundary in `Plans/DRY_Rules.md` | `Plans/DRY_Rules.md#DR-065` to `#DR-071` |
| The words: terminal section, terminal tab, terminal pane, panel, tab | G-010 | `Plans/Glossary.md#G-030`, with G-010 amended |

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/Glossary.md#G-030
