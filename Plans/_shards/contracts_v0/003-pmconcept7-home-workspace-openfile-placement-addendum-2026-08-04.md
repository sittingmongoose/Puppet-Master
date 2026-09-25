# Shard 003: PMConcept7 Home Workspace OpenFile placement addendum (2026-08-04)

Source: `Plans/Contracts_V0.md`

Source lines: L305-L314

Source SHA256: `56742a9c78668b4856133be6179aa1e3e162a7a9d28cbeacd6c78f88c7dae6c9`

---

## PMConcept7 Home Workspace OpenFile placement addendum (2026-08-04)

Home Workspace consumers use the canonical workspace-file shape
`OpenFile { path, line?, range?, target_editor_panel_id?, target_editor_group_id?, target_group? }`.
`target_editor_panel_id` selects `editor_panel_1` through `editor_panel_4`;
`target_editor_group_id` selects an explicit group within that panel; and
`target_group` remains a compatibility alias that normalizes to
`target_editor_group_id`. These fields are placement selectors only and never
replace route identity, OpenSubject, buffer ownership, or dirty-state authority.
`cmd.file.open_with` and `cmd.panel.switch` do not gain Panel 1..4 values.
