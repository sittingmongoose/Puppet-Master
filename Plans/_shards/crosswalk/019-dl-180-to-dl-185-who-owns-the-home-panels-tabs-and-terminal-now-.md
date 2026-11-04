# Shard 019: DL-180 to DL-185 — Who Owns The Home Panels, Tabs And Terminal Now (2026-10-09)

Source: `Plans/Crosswalk.md`

Source lines: L3535-L3640

Source SHA256: `25f675b7dad895fdd9f75c13c1b5f6dcd76d07b2f2217f8069c20106c00f1918`

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
| One panel and tab grammar, gesture kit, overlay root, terminal appearance model, bans and opening module | the 2026-08-04 Home owner boundary in `Plans/DRY_Rules.md` | `Plans/DRY_Rules.md#DR-065` to `#DR-069` and `#DR-071` |
| The words: terminal section, terminal tab, terminal pane, panel, tab | G-010 | `Plans/Glossary.md#G-030`, with G-010 amended |

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/Glossary.md#G-030


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

### C-053 - Pass Two Settings App Workflow And Projects Owner Routing

```yaml
plan_unit_id: C-053
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: |-
  Current ownership routes are: SSYS-002/059–065 and DR-084/085 for Settings classification/resolution, writers, detached copy and presentation; SRV-016/017 for same-owner settings follow and app work Computer custody, RAS for existing routes; MA-074/MACS-006 for destination readiness/protected app auth; Models MS-005/099/100 for its accepted scoped-owner tier edition with explicit no-Persona/no-stage Conservative rule. q-035 is resolved in live canon and source-memory ledgers remain unchanged.

  ACD-508–511 owns No project/place/folder, explicit reads/requests and conversion; T-185/186/187 and PS-145 own access, roots and computer use. GRS-086/087, CWR-045 and OSI-439/440 own app Goal/Crew/continuity/coordination and immutable conversion. APR-073/074, PLS-024, PDS-023 and SQR-019/020 own app Plan/Deep Plan, exact scheduled targets and independent operational pause; ordinary Assistant scoped bundles do not create product Plans or WorkNodes. Only Planning Wizard, PRD Builder and Orchestrator retain no-project workflow gates; real Project-target/capability checks remain distinct.

  PJCT-009/PWIZ-037 owns shared reviewed setup/FO-22 and N15 Later; PJCT-010/FGI-023/024 owns admitted per-service create/recovery/contribution; SCS-025/JJI-023 owns inspection/native backend/Settings-only format; PJCT-011 owns Starters separately from Saved setups; PJCT-012 owns Split Project metadata/actions and BRS-032/033 owns Standard backup/archive/app restore lineage. PS-144–148, RM-053, CRAU-104 and HITL-038 own human/mode/build-grant admission; OSI-441 is the narrower child consumer, not a grant issuer.

  CV-365–368 and SP-348–353 own the shared explicit scope/selected-version/hash/key/source/custody graphs; SP-353 is the dedicated permission snapshot/build-grant/manifest/revocation owner. The finite Plans/projects_refresh_command_bindings.json (pm.projects_refresh_command_bindings.v1) is a static packaged/import input owned by UCC-214, not native dispatch or runtime authority. Commands/Catalog/Matrix retain sole existing/new routes; UIW-048–052 and exact touch sources bind consumers, F3-668–674 renders them, WS-031 supplies app boards without hostability expansion, ATS-080–085 and TCME-007/008 define acceptance/evidence. DL-280–299 records approval and precise supersession; G-032–034 owns vocabulary. Preserve DL-270 substrate and exact historical bytes, DL-273 retirement/token deferral, current FO-22/Glass/return guards and every native NOT_RUN boundary. Canonical acceptance and generated indexes never create native handlers, Event Authority, executable queues, WorkNodes, readiness or governance seal.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-084
- DR-085
- DR-086
- DR-087
- DR-088
- DR-089
- DR-090
- DR-091
- DR-092
unblocks: []
acceptance_criteria:
- Every approved card/default and request is routed to one semantic owner; shared consumers never implement peer engines.
- Latest no-project rulings, resolved q-035, precise historical supersession and admitted service limits are coherent.
- This is owner routing and indexability only, not runtime/readiness/governance or a ledger compile.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-settings-layering-check.py
- scripts/pm-plans-verify.py
risk_class: owner_route_or_supersession_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Crosswalk.md
- Plans/Settings_System.md
- Plans/assistant-chat-design.md
- Plans/Goal_Runtime_System.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Project_System.md
- Plans/Permissions_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#C-053
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- q-035
- No project
- Starters
- Saved setups
- DL-280–299
negative_constraints:
- Do not revive retired services, older no-project workflow bans, duplicate writers/registries, source-memory authority
  or native proof from routing.
owner_hints:
- Plans/Settings_System.md#SSYS-059
- Plans/assistant-chat-design.md#ACD-508
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
- Plans/Project_System.md#PJCT-009
- Plans/Permissions_System.md#PS-147
- Plans/Contracts_V0.md#CV-365
- Plans/storage-plan.md#SP-348
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/assistant-chat-design.md#ACD-508, ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Assistant_Plan_Runtime.md#APR-073, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Permissions_System.md#PS-147, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/storage-plan.md#SP-348
