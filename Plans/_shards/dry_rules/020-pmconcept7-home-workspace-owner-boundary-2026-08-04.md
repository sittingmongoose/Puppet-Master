# Shard 020: PMConcept7 Home Workspace owner boundary — 2026-08-04

Source: `Plans/DRY_Rules.md`

Source lines: L2052-L2070

Source SHA256: `bb7f0b4926c02076c8cf9533a63992240935bfd24bd10f290bbb2ff1dfcf410f`

---

## PMConcept7 Home Workspace owner boundary — 2026-08-04

`Plans/FinalGUISpec.md` owns Home shell composition, hosts, visible movement and
resize behavior, and web/native capability disclosure. `Plans/home_workspace_layout.schema.json`
and `Plans/storage-plan.md` own the layout record, persistence scope, revisions,
migration, validation, and off-screen recovery. `Plans/UI_Command_Catalog.md`,
`Plans/Contracts_V0.md`, `Plans/event_family_registry.json`,
`Plans/UI_Wiring_Rules.md`, and `Plans/Wiring_Matrix.production.json` own command,
event, and wiring contracts. `Plans/FileManager.md` owns editor/file routing;
`Plans/Section15_MVP_Promoted_Features_Spec.md` owns terminal section/workgroup
identity and limits; `Plans/Widget_System.md` owns Dashboard widget hostability and
widget layout. Consumers cite these owners and do not re-declare the layout field
shape or create a second Home state machine.

U10 interaction behavior is a reusable interaction vocabulary only. It does not
transfer widget commands, widget hostability, DOM FLIP/order, or Dashboard widget
state into the Home workspace. A Home command/contract change must update the owner,
its consumer references, the production wiring row, and the traceability artifact
in one change set.
