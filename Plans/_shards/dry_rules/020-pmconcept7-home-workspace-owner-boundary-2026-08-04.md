# Shard 020: PMConcept7 Home Workspace owner boundary — 2026-08-04

Source: `Plans/DRY_Rules.md`

Source lines: L2052-L2093

Source SHA256: `11109edad77de99e5435ec7d13cd33654af0587b6a16f26eba546597831321c0`

---

## PMConcept7 Home Workspace owner boundary — 2026-08-04

Amended 2026-10-09 (DL-180, DL-181): Home is now one universal panel system and the
terminal one session per tab, so the owners below are restated for panels and tabs.
The per-surface owners of 2026-08-04 (four editor panels, the Dashboard surface,
terminal sections and workgroups, the movable chat) retire with that model. The
2026-08-04 sentence "U10 interaction behavior is a reusable interaction vocabulary
only" is replaced by DR-066: the panels and the Usage widget board share one gesture
kit. The panel and tab grammar is DR-065's, the overlay root DR-067's and the opening
module DR-071's. The ban on a second Home state machine and the one-change-set rule
stand.

`Plans/FinalGUISpec.md` owns Home shell composition, the panel model and its tab
kinds (F3-630 to F3-639, the terminal tab F3-640 to F3-646), visible movement and
resize behavior, and web/native capability disclosure.
`Plans/home_workspace_layout_v2.schema.json` and `Plans/storage-plan.md` (SP-330) own
the layout record, persistence scope, revisions, migration, validation, and
off-screen recovery; the v1 schema `Plans/home_workspace_layout.schema.json` is a
read-only migration input. `Plans/UI_Command_Catalog.md`,
`Plans/Contracts_V0.md`, `Plans/event_family_registry.json`,
`Plans/UI_Wiring_Rules.md`, and `Plans/Wiring_Matrix.production.json` own command,
event, and wiring contracts. `Plans/FileManager.md` owns file-path realization and
the file tree's opens (F-090), which go through the one opening module (F3-634,
DR-071); `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the terminal session,
its identity and its life, one session per terminal tab (SMPFS-180), while a
terminal tab's place among the panels and every panel limit belong to the panel
model (F3-630, F3-635); `Plans/Widget_System.md` owns Dashboard widget hostability
and widget layout, each dashboard tab's board in its own namespace (WS-030).
Consumers cite these owners and do not re-declare the layout field shape or create
a second Home state machine.

U10 interaction behavior is shared, not only borrowed: since DL-180 the panels and
the Usage widget board move with one gesture kit, owned by DR-066. The kit carries no
layout model. It does not transfer widget commands, widget hostability, the widget
grid's order or geometry, or Dashboard widget state into the Home workspace, and the
snapping widget grid lays out widgets only, inside dashboard tabs in the home centre.
A Home command/contract change must update the owner, its consumer references, the
production wiring row, and the traceability artifact in one change set.

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/DRY_Rules.md#DR-066, ContractName:Plans/DRY_Rules.md#DR-071, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Widget_System.md#WS-030

<a id="shared-runtime-service-registry"></a>
